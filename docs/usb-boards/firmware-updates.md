---
sidebar_position: 2
---

# Firmware Updates

A board on USB gets new firmware from a USB stick too, just like the boards on the CAN bus. The
car writes it onto the board over its USB cable, so you never have to take the board out of the
car or bring a laptop.

## Putting it on a stick

Run this in your car's app folder:

```bash
smartify-os device export
```

It builds the firmware of every device that has a program in `devices/` (or only the ones you
name), boards on USB and boards on the CAN bus alike, and puts it on the USB stick you pick. The
same stick can also carry an update of SmartifyOS itself, see
[Updating Your Car](../putting-it-on-your-car/updating.md).

## Updating in the car

Plug the stick into the car with the board plugged in, and tap **Update** on the notification
that comes up. SmartifyOS lets go of the board, writes the firmware onto it over its USB cable,
and opens it again. Nothing has to be installed on the car for it (the tools that write to an
ESP32 or an Arduino come with SmartifyOS), and the car never needs the Arduino IDE.

A sketch has no version number, so SmartifyOS remembers exactly what it wrote onto each board and
doesn't offer the same stick again. A board that isn't connected is left alone. If writing doesn't
work, the board keeps running what it had: unplug it, plug it back in, and tap **Try again**.

:::tip[Tip]

With two boards or more, give every sketch its name line (see
[Which port is which](./adding-a-board.md#which-port-is-which)). A board whose sketch doesn't say
which device it is can only be guessed at, so the car never offers it new firmware: it could end
up on the wrong board.

:::

## Boards that don't say which device they are yet

A board already built into the car with an older sketch, one without the name line, can still get
the new one without taking the dashboard apart. Put the firmware on a stick with `smartify-os
device export` and plug it in, then turn on developer options (the switch on **Settings, System**)
and open **Settings, System, Developer options, Serial ports**. Every port plugged in is listed,
with the board on it, an Arduino Mega 2560 or an Arduino Uno say. Tap one:

- **Ask the board** tells clones apart. Most Nano and Uno clones and most ESP32 boards only show
  their USB chip (a CH340 say), so this asks the board itself. It changes nothing on it, but
  restarts it.
- **Serial monitor** shows what the board prints, at the speed you pick, like the Arduino IDE's.
  What its sketch prints usually tells you which board it is.
- **Write firmware** writes one of the firmwares on the stick onto that board.

Once a board runs the new sketch it says which device it is, and SmartifyOS moves the device to it
on its own. The device that had the port is disconnected while you use it, and comes back when
you're done.
