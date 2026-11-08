---
sidebar_position: 3
---

# Trying Devices Without the Car

Most cars have a few small boards around them doing the car's own jobs: an ESP32 switching the
headlights, an Arduino reading the oil temperature. SmartifyOS talks to them over the car's
[CAN bus](../can-bus/defining-devices.md), or for a car with only one or two, over a plain
[USB cable](../usb-boards/adding-a-board.md). The editor lets you build their programs, put them on
the boards, and try your car's app against them while the boards are nowhere near your computer.

## The Devices group

The **Devices** group in the car panel lists every board your car's app knows about:

- the devices on the CAN bus that have a program in your app's `devices/` folder, with the
  version of their firmware,
- the ones your app defines but that have no program yet (shown faint),
- boards on USB, marked USB.

While your app runs, a dot next to each one says whether it's there right now.

**Make a device** at the bottom makes the program for a new board, ready to build. Pick a device
your app already defines, or a new one, which the editor adds to your app for you.

Pick a device to see what you can do with it:

| Action                          |                                                            |
| ------------------------------- | ---------------------------------------------------------- |
| **Make its program**            | For a device without one yet                               |
| **Open its program in VS Code** | Where you write what the board does                        |
| **Put it on its board**         | Builds it and writes it onto the board, plugged into this computer with a USB cable |
| **Export its firmware**         | Puts it on a USB stick, so the car updates the board itself |

A new board on the CAN bus has to get its first program over USB. After that the car can update
it from a stick (see [Firmware Updates](../can-bus/firmware-updates.md)). A board on USB always
gets it from the car, over its own cable.

Putting a program on a board stops your running app while it works, since your app might have the
board's port open.

For a board on USB the inspector also changes what the driver reads it as, and how fast it talks
(the same number as `Serial.begin` in its program, which the editor changes there too). Which port
it's plugged into is never a setting: the car finds it on its own.

## Trying the CAN bus

While your app runs, pick a device on the CAN bus and its inspector has a **Try it out** section:

- **Pretend it is connected** makes your app see the device as there, the way it would in the car.
  Switch it off to see what your app does when the device goes missing.
- **What it sends** lists the messages that device sends (the ones with `from:` set to it in your
  app's `lib/can.dart`), each with a field for every value in it. Send one and your app gets it
  exactly as if the board had sent it. Messages from other devices are a click further down.
- A log underneath shows everything that went each way: what you sent, and what your app sent on
  the bus.

So you can, say, send the headlight board's "lights are on" message and watch the status bar icon
come on, or flip a switch in your app and see the message it sends to the board.

## Trying a board on USB

A board on USB has the same **Try it out** section:

- **Pretend it is plugged in** makes your app see the board as connected, and what your app sends
  it shows up in the log.
- A field for every value your app reads from the board. A board sends values as lines like
  `oil:92`, and **Send** puts that line into your app as if the board had printed it. You can also
  type any line by hand.
- The log shows what went each way.

If the board is plugged into your computer for real, the switch stays off and the log shows the
real thing.
