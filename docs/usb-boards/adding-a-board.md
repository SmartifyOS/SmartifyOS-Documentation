---
sidebar_position: 1
---

# Adding a Board

A car with only one or two boards of its own can skip the [CAN bus](../can-bus/defining-devices.md)
entirely: plug the board into the car's computer with its USB cable, and it talks to SmartifyOS
over serial, exactly the way it talks to the Arduino IDE's Serial Monitor. Any board works, an
Arduino Uno, Nano or Mega as well as an ESP32, and it needs no library at all.

What you give up compared to the CAN bus: two boards can only talk to each other through the
screen, and a firmware update has no safety net that undoes a broken one (see
[Firmware Updates](./firmware-updates.md)).

To talk to a board you use `SmartifyOsSerial`.

## Adding it with the CLI

Run this in your car's app folder:

```bash
smartify-os device create --usb
```

It asks what the board is called and which board it is, then does two things for you: adds the
board to your car's app (in `lib/serial.dart`, handed to `SmartifyOs().init` in `lib/main.dart`),
and makes a sketch to start from in `devices/<name>/src/main.cpp`. To answer everything up front:

```bash
smartify-os device create dashboard --usb --title "Dashboard Arduino" --board uno
```

`--board` takes `uno`, `nano`, `nano-old` (a Nano with the old bootloader, most clones), `mega`, or
any ESP32 like `esp32`. `--baud-rate` sets how fast it talks, 115200 unless you say.

Then put the sketch on the board, plugged into your computer, from the device's folder:

```bash
smartify-os device flash
```

Quit your car's app on your computer first if it's running: while it runs it has the board's port
open, and the upload fails. `--monitor` shows what the board prints afterwards.

`smartify-os device edit dashboard --title "Dashboard" --baud-rate 9600` changes either later, in
your app and in the sketch.

## What the CLI writes

You can also write this by hand. A board is a `SerialDevice`:

```dart title="lib/serial.dart"
import 'package:smartify_os_core/serial.dart';

/// The Arduino behind the dashboard.
const dashboard = SerialDevice(
  name: 'dashboard',
  title: 'Dashboard Arduino',
  baudRate: 9600, // the same number as Serial.begin in its sketch
);
```

```dart title="lib/main.dart"
await SmartifyOs().init(
  serial: const SerialConfig(devices: [dashboard]),
);
```

| Parameters       |                                                                            |
| ---------------- | -------------------------------------------------------------------------- |
| **name**         | What it's called, written like a variable: `dashboard`. Every board needs its own |
| **title**        | What the driver reads in Settings, Vehicle, Devices in the car             |
| **baudRate**     | Optional, defaults to `115200`. How fast it talks, the same number as `Serial.begin` in its sketch. A board with USB built into its chip (an ESP32-S3 on its USB port, a Leonardo, a Pico) ignores it |
| **port**         | Optional, ties it to one port, see [Which port is which](#which-port-is-which). Usually left out |
| **usbVendorId**  | Optional, finds it by its USB vendor number instead, like `0x2341` for an Arduino. Only used without a `port` |
| **usbProductId** | Optional, together with `usbVendorId`, to tell apart two boards of one maker |

That's all there is to set up. SmartifyOS finds the board on its own once it's plugged in (it
never takes a CANable by mistake), opens it again whenever it was unplugged and plugged back in,
and shows it in **Settings, Vehicle, Devices in the car**.

## Reading numbers

Have the sketch print numbers as `name:value` lines:

```cpp
void loop() {
  Serial.print("oil:");
  Serial.println(analogRead(A0) / 10.0);
  delay(500);
}
```

That's the same format the Arduino IDE's Serial Plotter draws, so you can try your sketch there
first. Several in one line work too: `rpm:3200,oil:92`.

In your app, `SmartifyOsSerial.values` hands you every value with that name, as a `double`:

```dart
SmartifyOsSerial.values(dashboard, 'oil').listen(
  (oil) => SmartifyOsInfoDisplay.reportReading('oil', oil),
);
```

Handing readings to the info display like this is usually what you want, see
[Info Display](../info-display/adding-values.md). `SmartifyOsSerial.lastValue(dashboard, 'oil')`
gives you the last one, or `null` when none has come in yet. In your own widget, watch
`serialValueProvider(dashboard, 'oil')` (see [Riverpod Basics](../riverpod-basics.md)).

Put these listeners in a function of your own and call it once from `main` after
`SmartifyOs().init`. They work before the board is plugged in, and keep working through every
unplug.

## Reading anything else

Every line that isn't `name:value` comes in as it is, for a button or anything else that isn't a
number:

```dart
// The sketch does Serial.println("next");
SmartifyOsSerial.lines(dashboard).listen((line) {
  if (line == 'next') Bluetooth.next();
});
```

Every line arrives, in order, the moment it comes in. Nothing is skipped and nothing waits in a
queue, so a door switch printing `door:1` once and a sensor printing many times a second use the
same calls. The screen only redraws once a frame however often a reading comes, so printing every
20 ms or so is plenty.

## Sending to the board

```dart
SmartifyOsSerial.sendLine(dashboard, 'lights on'); // sends "lights on"
SmartifyOsSerial.sendValue(dashboard, 'brightness', 80); // sends "brightness:80"
```

Both return `false` while the board isn't plugged in. The sketch reads one line at a time:

```cpp
void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line == "lights on") digitalWrite(LED_BUILTIN, HIGH);
    if (line.startsWith("brightness:")) analogWrite(9, line.substring(11).toInt());
  }
}
```

An Arduino Uno or Nano restarts whenever its port is opened and needs about two seconds before it
listens, so anything sent the moment it connects is lost. Have the sketch print a line like
`ready` at the end of `setup()`, and wait for that before sending.

`SmartifyOsSerial.isDeviceConnected(dashboard)` says whether it's plugged in right now.

## Which port is which

With two boards or more, have each sketch say which device it is: print `smartify-os:` and its
name at the end of `setup()`, and again whenever it reads the line `smartify-os?`. SmartifyOS asks
every board it isn't sure about, so two boards that look the same to the computer (two Arduino
clones) never swap places, whatever order they're plugged in. The sketch `device create --usb`
makes already does this:

```cpp
const char* const smartifyOsName = "smartify-os:dashboard";

void setup() {
  Serial.begin(9600);
  Serial.println(smartifyOsName);
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line == "smartify-os?") Serial.println(smartifyOsName);
  }
}
```

A board whose sketch doesn't say takes whichever USB serial port is left. To tie one to a port
anyway, give it `port:`. **Developer options, Serial ports** lists every port plugged in, with
its name under `/dev/serial/by-id/` to copy, which stays the same whatever order things are
plugged in (see [Developer Options](../developer-options/using-developer-options.md)).

## Things to know

- A board with USB built into its chip (an ESP32-S3 on its USB port, a Leonardo, a Pico) ignores
  the baud rate, so a `loop()` printing with no delay sends tens of thousands of lines a second.
  A slow car computer may not keep up, and the log says so: print less often, and wait with
  `millis()` rather than `delay()`.
- On Linux the car's user has to be allowed to open serial ports. A car the installer set up
  already is.
- Serial ports work on Linux and macOS, so you can try a board on a Mac too.

## Trying it without the board

While your app runs in the editor, it lists your boards next to the CAN bus ones, can make one
count as plugged in, and sends lines into your app as if the board had printed them, see
[Trying Devices Without the Car](../editor/trying-devices.md).

## Anything else on serial

For something that isn't a board of yours, a GPS module or an OBD2 reader say, open the port
yourself with `SmartifyOsSerial.openPort` and read it as it is:

```dart
final ports = await SmartifyOsSerial.listPorts();
final gps = ports.where((p) => p.isUsb(0x1546, 0x01a7)).firstOrNull;
if (gps != null) {
  final port = await SmartifyOsSerial.openPort(gps.path, baudRate: 9600);
  port?.lines.listen(SmartifyOsGps.reportNmea);
}
```

`openPort` comes back as `null` when the port can't be opened, with the reason in the log. Call
`close()` on the port when you're done with it. You don't need any of this for a CAN adapter,
`SmartifyOsCan` opens that itself.
