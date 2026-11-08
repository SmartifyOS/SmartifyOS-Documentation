---
sidebar_position: 3
---

# Writing the Firmware

Every board on the bus runs a small program of its own, its **firmware**. You write it like any
Arduino program, with a `setup()` and a `loop()`, and the SmartifyOS-ESP32 library does the CAN
part for you. The `smartify-os` CLI does everything else: it makes the project, builds it for
your board and puts it on the board.

The building is done by a tool called PlatformIO. You never have to install or learn it, the CLI
sets it up by itself (with everything it needs) the first time you build a device. The very first
build also downloads the ESP32 tools, which takes a few minutes.

## What you need

- **An ESP32 board** for every device. The common ESP32 dev board, an ESP32-S3 or an ESP32-C3 all
  work. Not the ESP32-C2, it has no CAN.
- **A CAN transceiver** for every board, which turns two of the ESP32's pins into the two bus
  wires. Get one with an **SN65HVD230** chip on it: it runs on 3.3 V like the ESP32 and connects
  straight to it. Skip the cheap TJA1050 boards, they need 5 V and send 5 V back into the ESP32,
  which it isn't made for. An ESP32 board with the transceiver built in works too, and saves you
  the wires between the two.
- **A CANable** (or CANable Pro) on USB, for the car's computer. SmartifyOS finds it by itself.
- **Wire**: a twisted pair for CANH and CANL, and a ground wire next to it.

## Wiring

```
ESP32 GPIO 5 ── TX  (CTX / TXD)  transceiver  CANH ── CANH of the bus
ESP32 GPIO 4 ── RX  (CRX / RXD)               CANL ── CANL of the bus
3.3 V ──────── VCC                            GND  ── GND of the bus
```

Any two free pins work for TX and RX, you name them in your code. Twist CANH and CANL around each
other all the way, and connect the grounds of every board. A CANable Pro keeps the bus apart from
the computer's USB, so connect its GND pin to the bus's ground too.

### The bus is one line

A CAN bus is one long pair of wires with every board hanging on it, like stops on a bus route. It
isn't a star: the pair goes in at one board and on to the next.

```
 Lights ─────── Buttons ─────── GPS ─────── Computer
   ▲                                           ▲
 one end                                   other end
```

At both ends of the line the signal runs out of wire and bounces back like an echo, so the two
boards at the very ends each get a **120 ohm resistor** between CANH and CANL, which swallows it.
Every other board gets none. Above, that's Lights and Computer: switch on the CANable's resistor
and keep the one on the Lights' transceiver, and make sure Buttons and GPS have theirs off.

On most SN65HVD230 boards the resistor is a tiny part marked `121` (labelled R2) next to the CANH
and CANL pins, with no switch. Leave it on the boards at the ends, and take it off every other
board, by heating it with a soldering iron or snapping it off with small pliers. (The other tiny
part, marked `103`, belongs there, leave it alone.)

With everything switched off, measure between CANH and CANL anywhere on the bus: about 60 ohms is
right (two 120 ohm resistors side by side). 40 ohms means a third one is still on somewhere, 120
ohms means one is missing.

A board can also hang off the line on a short branch of a metre or two. Never give a branch a
resistor of its own.

## Making the project

Run this in your car's app folder:

```bash
smartify-os device create
```

It asks which device it's for and which board you have, then makes a folder for it inside your
car's app, `devices/lights/` for a device called `lights`. If the device isn't in `lib/can.dart`
yet, pick "A new device": the CLI adds it to your app with the next free node number, and you
write its messages afterwards (see [Defining Devices and Messages](./defining-devices.md)).

To answer everything up front instead:

```bash
smartify-os device create headlights --board esp32-s3
```

`--board` takes `esp32`, `esp32-s3`, `esp32-c3`, or any ESP32 board PlatformIO knows by name.
`--title "Pop-up headlights"` names a new device for the driver.

The folder has three things in it:

| File                | What it is                                                       |
| ------------------- | ---------------------------------------------------------------- |
| `src/main.cpp`      | The device's program. The only file you normally touch           |
| `platformio.ini`    | Which board it is for. Only touch it to add an Arduino library under `lib_deps` |
| `smartify-os.json`  | What the CLI remembers about it, like its version. Leave it alone |

Because the folder lives inside your car's app, it goes wherever the app goes, its git repository
included.

## Writing the program

`src/main.cpp` is a normal Arduino program. This is the example app's lights board, which
switches a relay when the screen asks and says whether the lights are on:

```cpp title="devices/lights/src/main.cpp"
#include <Arduino.h>
#include <SmartifyOsCan.h>
#include <smartify_os_network.h>

// The pins the CAN transceiver's TX and RX are wired to.
constexpr gpio_num_t canTx = GPIO_NUM_5;
constexpr gpio_num_t canRx = GPIO_NUM_4;

// The pin the headlight relay is wired to.
constexpr int relayPin = 23;

bool lightsOn = false;
unsigned long lastSent = 0;

// Tells the screen whether the headlights are on.
void sendState() {
  network::LightsState state;
  state.on = lightsOn;
  SmartifyOsCan.send(state);
  lastSent = millis();
}

void setup() {
  // Always the first thing in setup().
  SmartifyOsCan.begin(network::nodes::lights, canTx, canRx);

  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);

  // The screen asking for the headlights to go on or off.
  SmartifyOsCan.on<network::HeadlightsRequest>(
      [](const network::HeadlightsRequest& request) {
        lightsOn = request.on;
        digitalWrite(relayPin, lightsOn ? HIGH : LOW);
        sendState();
      });
}

void loop() {
  // Always in loop(), and keep loop() quick.
  SmartifyOsCan.update();

  if (millis() - lastSent >= 1000) sendState();
}
```

`smartify_os_network.h` is the file SmartifyOS writes from your car's app when you run it (see
[The file for the boards](./defining-devices.md#the-file-for-the-boards)). Every message is a
struct in it named after the message, with your fields in it: `lightsState` becomes
`network::LightsState`. Every device's node number is in `network::nodes`, and every `enum` you
used in a `CanChoiceField` is there with the same values.

What the library gives you:

| Call                                | What it does                                            |
| ----------------------------------- | ------------------------------------------------------- |
| `SmartifyOsCan.begin(node, tx, rx)` | Joins the bus as this device, on these two pins        |
| `SmartifyOsCan.update()`            | Hands what came in to your handlers. Call it every `loop()` |
| `SmartifyOsCan.send(message)`       | Sends one of the structs                                |
| `SmartifyOsCan.on<Message>(handler)` | Calls `handler` every time that message comes in      |
| `SmartifyOsCan.isBusOk()`           | `false` while the bus has a fault, until it recovers by itself |
| `SmartifyOsCan.isUpdating()`        | `true` while new firmware is coming in. The board restarts into it at the end, so finish anything that mustn't stop halfway |

Your handlers run inside `update()`, never at the same time as your own `loop()` code, so you
don't have to worry about two bits of your code running at once. Anything else you'd do in an
Arduino program (other libraries, pins, `Serial.println`) works as always.

Three rules keep a board working:

- **`begin` first in `setup()`.** A board that crashes again and again stops right there and waits
  for new firmware (its **safe mode**), and that only helps if nothing of yours ran before it.
- **`update()` in every `loop()`, and keep `loop()` quick.** A board whose `loop()` doesn't get
  back to `update()` for three seconds shows on the screen as stuck. Wait for things with
  `millis()`, like `lastSent` above, never with a long `delay()`.
- **Let the version go up** whenever you change the program, so the car can tell which one a
  board runs. You don't write it anywhere: the CLI notices the change when it builds and asks
  whether to raise it.

## Putting it on the board

A new ESP32 only knows how to be programmed over its USB cable, so the first time, plug it into
your computer and run this in the device's folder (or name the device from your car's app folder,
`smartify-os device flash lights`):

```bash
smartify-os device flash
```

It builds the program and puts it on the board, finding the board by itself when only one is
plugged in. If it can't tell which one, pass `--port`. If no board is found at all, try another
USB cable: plenty only charge and carry no data.

When the program changed, the CLI asks how to raise its version. Answer up front with
`--raise patch` (the default), `minor`, `major` or `no`.

To see what the board prints with `Serial.println` afterwards, add `--monitor`:

```bash
smartify-os device flash --monitor
```

It also shows what the library says about itself (the pins not working, a fault on the bus, safe
mode), and when the board crashes, the line of your code it happened on.

From now on the board can also be updated over the bus, from a USB stick in the car, see
[Firmware Updates](./firmware-updates.md). Install it in the car, and it shows up in **Settings,
Vehicle, Devices in the car** as Connected, with its firmware version.

`smartify-os device list` shows every device with a program, its board and its version, and the
ones your app defines that don't have one yet.

:::tip[Tip]

The [editor](../editor/trying-devices.md) does all of this with buttons, and also lets you try
your app against a pretend board while the real one is still on your desk.

:::

## When something doesn't work

| What you see | Why |
| --- | --- |
| Nothing shows up anywhere | Not exactly two 120 ohm resistors on the bus, CANH and CANL swapped, or a missing ground |
| A board alone on the bus sends nothing | CAN needs a second device to confirm every frame. Plug the CANable in |
| A board shows as **Not answering** | It lost power, or the wiring to it came loose |
| A board shows as **Its program is stuck** | Its `loop()` takes too long or doesn't call `SmartifyOsCan.update()`. It can still be updated |
| A board shows as **Node 5, not defined in the car's app** | The node number in its `begin()` isn't one of the devices in `lib/can.dart` |
| **Developer options, CAN bus** says the adapter is not working | The CANable isn't plugged in, or the car isn't allowed to open it (a car the installer set up always is) |

**Developer options, CAN monitor** shows every frame as it happens, which is the quickest way to
see who sends what, see [Developer Options](../developer-options/using-developer-options.md).

## Something other than an ESP32

Anything can join the bus as long as it speaks the same protocol, and the file SmartifyOS writes
is plain C++ with nothing ESP32 about it. The protocol is described in
[PROTOCOL.md](https://github.com/SmartifyOS/SmartifyOS-ESP32/blob/main/PROTOCOL.md) in the
SmartifyOS-ESP32 library. The library and the file SmartifyOS writes for your car are both MIT
licensed, so your firmware can be under any license you like.
