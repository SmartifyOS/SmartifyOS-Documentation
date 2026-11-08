---
sidebar_position: 1
---

# Defining Devices and Messages

A CAN bus is how SmartifyOS talks to the little boards around your car: one behind the
dashboard reading buttons, one in the nose switching the headlights, one under a seat reading a
sensor. They all hang on one pair of wires together with the car's computer, so every board
hears every other. A button on one board can move a motor on another without the screen being
involved at all, and the screen hears about it too.

Every board is an ESP32 running a small Arduino program that uses the SmartifyOS-ESP32 library.
You describe each board and what it says once, in your car's app, with `CanDevice` and
`CanMessage`. SmartifyOS uses that description on the screen, and also writes it out as a C++
file for the boards' programs, so both sides always agree on what every message means.

:::tip[Tip]

Only one or two boards? You can skip the CAN bus and plug a board into the car's computer by
its USB cable instead, see [Boards on USB](../usb-boards/adding-a-board.md). It is simpler to
wire, but two boards can then only talk to each other through the screen.

:::

## Where it goes

Put everything about the bus in its own file, `lib/can.dart`, in your car's app. `smartify-os
device create` (see [Writing the Firmware](./writing-firmware.md)) can add a new device to it for
you, but the messages are yours to write.

Give each board a class of its own that lists what it sends. This is the example app's, a board
that switches the headlights:

```dart title="lib/can.dart"
import 'package:smartify_os_core/can.dart';

/// The ESP32 that switches the headlights. Its firmware is in devices/lights.
abstract final class ExampleLights {
  static const device = CanDevice(node: 1, name: 'lights', title: 'Lights');

  /// Whether the headlights are on.
  static const on = CanBoolField('on');

  /// Sent whenever the lights change, and once a second besides.
  static const state = CanMessage(
    id: 0x100,
    name: 'lightsState',
    from: device,
    fields: [on],
  );
}

/// What the screen itself sends.
abstract final class ExampleScreen {
  static const on = CanBoolField('on');

  /// Asks the lights to switch on or off.
  static const headlights = CanMessage(
    id: 0x200,
    name: 'headlightsRequest',
    fields: [on],
  );
}
```

`abstract final class` just means "a box of names", you never make one of these with `()`. You
use what's inside it directly: `ExampleLights.device`, `ExampleLights.state`.

Then hand every device and every message to `SmartifyOs.init` in `lib/main.dart`:

```dart title="lib/main.dart"
await SmartifyOs().init(
  can: const CanConfig(
    devices: [ExampleLights.device],
    messages: [ExampleLights.state, ExampleScreen.headlights],
  ),
);
```

Leave `can` out entirely for a car without a CAN bus, and SmartifyOS never even looks for the
hardware.

## Devices

```dart
static const device = CanDevice(node: 2, name: 'headlights', title: 'Pop-up headlights');
```

| Parameters    |                                                                            |
| ------------- | -------------------------------------------------------------------------- |
| **node**      | The board's number on the bus, from 1 to 127. Every board needs its own, and its program uses the same number |
| **name**      | What the board is called in its program, written like a variable: `headlights`, not `Pop-up headlights` |
| **title**     | What the driver reads in Settings, Vehicle, Devices in the car             |

Each board says it is there about once a second. That's how **Settings, Vehicle, Devices in the
car** knows which boards are connected, which went quiet, which firmware they run, and offers to
update them (see [Firmware Updates](./firmware-updates.md)).

## Messages

A message is one thing a board has to say: "the headlights moved", "a button was pressed",
"switch the lights on".

| Parameters    |                                                                            |
| ------------- | -------------------------------------------------------------------------- |
| **id**        | The number it goes out under, from `0x001` to `0x57F`. Every message needs its own |
| **name**      | What it is called in the boards' programs, written like a variable: `headlightsState`. In C++ it becomes a struct called `HeadlightsState` |
| **fields**    | Optional, the values it carries, in order, see below. At most 64 bits together, which is all one CAN frame holds. Leave it out for a message that carries nothing, where arriving is the whole point |
| **from**      | Optional, the device that sends it. It changes nothing on the bus, but the [editor](../editor/trying-devices.md) lists the message under that device, so you can pretend to be it. Leave it out for a message the screen sends |
| **extended**  | Optional, defaults to `false`. Only for reading a car's own factory bus that uses longer 29 bit ids. Your own boards never need it |

`0x` in front of a number means it's written in hexadecimal, which is how CAN ids are usually
written. You don't have to understand it: just give each board its own block, `0x100` to `0x1FF`
for the first, `0x200` to `0x2FF` for the next, and count up inside it.

Three rules keep a bus working:

- **Only one board sends each message.** Two boards sending the same id at the same moment garble
  each other. When both the screen and a button can ask the lights to switch, that's two
  messages, one from each, like `ExampleLights.state` and `ExampleScreen.headlights` above.
- **Lower ids win.** When two boards send at the same instant, the lower id goes first, so give
  urgent messages the lower numbers in a block.
- **Add new fields at the end, and never reuse an id for something else.** A board still running
  older firmware reads a message the old way. Fields added at the end read as their default on
  older boards, anything else reads as garbage.

Ids from `0x580` up belong to SmartifyOS itself, for the "I'm here" signals and firmware updates.

## Fields

A field is one value inside a message. Fields are packed one after the other, each taking only as
many bits as it needs, so eight on/off switches fit in a single byte. Name each like a variable
(`leftUp`), unique within its message. Pick the kind that says what the value is:

| Kind                                      | Holds                                          |
| ----------------------------------------- | ---------------------------------------------- |
| `CanBoolField('up')`                      | `true` or `false`, in one bit                  |
| `CanIntField.uint8('angle')`              | A whole number from 0 to 255                   |
| `CanIntField.uint16('rpm')`               | 0 to 65535 (also `.uint32`, and `.int8`, `.int16`, `.int32` for numbers below zero) |
| `CanIntField('gear', bits: 3)`            | Exactly as many bits as you say, 0 to 7 here. Add `signed: true` to go below zero |
| `CanNumberField('voltage', scale: 0.01)`  | A number with decimals, sent as a whole number, see below |
| `CanFloatField('temperature')`            | A full decimal number, like C++'s `float`. Takes 32 bits, a `CanNumberField` usually says the same in 16 |
| `CanChoiceField('side', WinkSide.values)` | One of the values of an `enum` of yours        |

A number too big for its field is sent as the nearest one that fits, and the log says so.

### Numbers with decimals

`CanNumberField` sends a number with a fixed number of decimals as a whole number, which saves a
lot of room. `scale` is how much one step is worth, `offset` is where it starts, `bits` how big it
is (16 by default):

```dart
// 0.00 to 655.35 volts, in two bytes.
static const voltage = CanNumberField('voltage', scale: 0.01);

// -40 to 87.5 degrees in steps of half a degree, in one byte.
static const coolant = CanNumberField('coolant', bits: 8, scale: 0.5, offset: -40);
```

### Choices

For something that is one of a few things, write an `enum` and use `CanChoiceField`:

```dart
enum WinkSide { left, right, both }

static const side = CanChoiceField('side', WinkSide.values);
```

Each choice goes out as its place in the list (`left` is 0, `both` is 2), so only add new ones at
the end. The boards' programs get the same `enum`, with the same names.

## How SmartifyOS reaches the bus

The car's computer needs a USB adapter to be on the bus. A **CANable** (or CANable Pro) is what
SmartifyOS is made for, and it is found on its own the moment it's plugged in, nothing to set up.
See [Writing the Firmware](./writing-firmware.md#what-you-need) for the rest of the hardware.

Anything else goes in `adapters`:

```dart
can: CanConfig(
  adapters: [() => SocketCanAdapter(interface: 'can1')],
  devices: [...],
  messages: [...],
),
```

| Adapter              |                                                                  |
| -------------------- | ---------------------------------------------------------------- |
| `SlcanCanAdapter()`  | A CANable with its standard firmware, and most cheap USB CAN adapters. This is the one used when you name none. Pass `port:` for an adapter of another make, or to pick one of several |
| `SocketCanAdapter()` | A CAN interface Linux already knows, like `can0`: a CAN HAT on a Raspberry Pi, or a CANable flashed with the candleLight firmware. Linux only. Pass `interface:` to pick one of several |
| `ManualCanAdapter()` | No hardware at all, you hand it frames yourself. For trying your screens out before any board is built, see [Sending and Listening](./sending-and-listening.md#trying-it-without-the-hardware) |

The rest of `CanConfig`:

| Parameters        |                                                                        |
| ----------------- | ---------------------------------------------------------------------- |
| **devices**       | Optional, every board on the bus                                       |
| **messages**      | Optional, every message on the bus, whoever sends it                   |
| **adapters**      | Optional, see above. Leave it empty and the first CANable found is used |
| **bitrate**       | Optional, defaults to `CanBitrate.kbps500`. How fast the bus runs, every board has to use the same. Only change it for very long wires, or to listen to a car's own bus |
| **listenOnly**    | Optional, defaults to `false`. Never send anything, for listening to a car's factory bus where a stray frame could confuse the car |
| **deviceTimeout** | Optional, defaults to 3.5 seconds. How long a board can stay quiet before it counts as gone |
| **firmwareHeader** | Optional, where the C++ file for the boards is written, defaults to `firmware/smartify_os_network.h` in your app's folder. `null` never writes it |

## The file for the boards

Run your app on your computer once, from your car's app folder:

```bash
smartify-os run
```

SmartifyOS writes everything in `lib/can.dart` out as `firmware/smartify_os_network.h`, and
writes it again whenever you change a device or a message while the app runs. That file is what
every board's program includes, so a message called `lightsState` here is a
`network::LightsState` struct there, with an `on` field. Never change it by hand, it's
overwritten. It's only written on your computer, never on the car.

Next: [Sending and Listening](./sending-and-listening.md) to use the bus from your app, and
[Writing the Firmware](./writing-firmware.md) for the boards' side.
