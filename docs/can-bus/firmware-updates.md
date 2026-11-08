---
sidebar_position: 4
---

# Firmware Updates

Once a board has had its first program over USB (see
[Writing the Firmware](./writing-firmware.md#putting-it-on-the-board)), you never need to reach it
with a cable again. New firmware goes onto a USB stick on your computer, and the car sends it to
the board over the CAN bus, even to one hidden behind the dashboard.

## Putting it on a stick

Run this in your car's app folder:

```bash
smartify-os device export
```

It builds the firmware of every device (or only the ones you name, `smartify-os device export
lights buttons`), asks which USB stick to use, and puts it in the stick's `smartify-os` folder.
`--to` names the stick, or any folder you'll copy onto one later. Like `flash`, it asks whether to
raise the version of a program that changed, or takes `--raise`.

The same stick can also carry an update of SmartifyOS itself, made with `smartify-os export
update` (see [Updating Your Car](../putting-it-on-your-car/updating.md)), and the firmware for
[boards on USB](../usb-boards/firmware-updates.md). Do them in either order, neither one removes
the other.

## Updating in the car

Plug the stick into the car while SmartifyOS runs. One notification says what's on it, and
**Update** (or **Update all**) starts. With more than one thing on the stick, **Choose** lists them
to pick from. They're done one at a time, with SmartifyOS itself always last, since the car
restarts into it.

**Settings, Vehicle, Devices in the car** also has an **Update** button on each device's page
while a stick with new firmware for it is plugged in.

An update takes about a minute. The board keeps doing its job while the new firmware goes over,
then restarts into it. Keep the car switched on until it's done.

## When something goes wrong

Every update is made so the board can't end up broken. The new firmware runs on trial at first,
and only stays once the car has confirmed it starts and can be reached over the bus.

| What happens | What the board does |
| --- | --- |
| The power goes off, or the stick is pulled, halfway through | Keeps its old firmware. Try again |
| The new firmware crashes or hangs before it's confirmed | Goes back to its old firmware by itself, and the screen says so |
| The new firmware starts but can't be reached over the bus (a wrong pin, a wrong node number) | Is never confirmed, so it goes back to its old firmware after a minute |
| The new firmware works for a while, then keeps crashing | After three crashes in a row it starts in **safe mode**: only the bus and the updater run, so you can give it fixed firmware. **Restart** on its page tries its program again |

The only things that need the USB cable again are a program that doesn't use the SmartifyOS-ESP32
library, and a board flashed with a partition table that has no room for updates (the CLI never
makes one of those).

## Updating from your own code

The driver does all of this from the notification and Settings, so most cars never need to. If
you're building your own screen for it, `SmartifyOsCan.firmwareFileFor(device)` gives you the
newest firmware for a device on the sticks plugged in (or `null`), and
`SmartifyOsCan.updateFirmwareFromFile` sends it:

```dart
final file = SmartifyOsCan.firmwareFileFor(ExampleLights.device);
if (file != null) {
  await SmartifyOsCan.updateFirmwareFromFile(ExampleLights.device, file);
}
```

Watch `SmartifyOsCan.firmwareUpdateChanges` (or `canFirmwareUpdateProvider` in a widget) to follow
its progress. `SmartifyOsCan.restartDevice(device)` restarts a board, which also takes it out of
safe mode.
