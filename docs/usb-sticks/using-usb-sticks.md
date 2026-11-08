---
sidebar_position: 1
---

# Using USB Sticks

A car has no desktop that opens a USB stick when it's plugged in, so SmartifyOS does it itself.
Every stick (or SD card, or anything else that plugs in) is opened the moment it goes in, and
listed in `SmartifyOsDrives` once its files can be read.

**Most of this page is not something you need to do.** SmartifyOS already uses sticks on its own:
the [file player](../music/file-player.md) plays the music on them, and one notification offers
whatever updates are on them, for SmartifyOS itself ([Updating Your Car](../putting-it-on-your-car/updating.md))
and for your boards ([CAN bus](../can-bus/firmware-updates.md), [USB](../usb-boards/firmware-updates.md)).
Reach for `SmartifyOsDrives` only when your own code wants to read something off a stick,
pictures, a log file, a settings backup.

**Nothing on `SmartifyOsDrives` throws.** A stick that can't be read simply isn't listed.

## Reading what's plugged in

```dart
for (final drive in SmartifyOsDrives.drives) {
  final pictures = Directory('${drive.path}/Pictures');
  if (pictures.existsSync()) {
    SmartifyOsLog.info('Pictures', '${drive.name} has pictures on it');
  }
}
```

Each `RemovableDrive` has:

| Field         |                                                                      |
| ------------- | -------------------------------------------------------------------- |
| **id**        | Stays the same for as long as it's plugged in, what `ejectDrive` takes |
| **name**      | What to call it on screen: the name it was given when it was formatted, or the maker's name |
| **path**      | The folder its files are in, read them with Dart's normal `File` and `Directory` |
| **sizeBytes** | How big it is, in bytes, or `null` when the system doesn't say       |

Always go through `SmartifyOsDrives`, never look in `/media` yourself: where a stick ends up
differs from car to car.

## Hearing about a stick being plugged in

`SmartifyOsDrives.driveChanges` fires every time a stick comes or goes, starting with the ones
already there:

```dart
SmartifyOsDrives.driveChanges.listen((drives) {
  for (final drive in drives) {
    // look for something on it
  }
});
```

In your own widget, watch `drivesStateProvider` so it redraws on its own, see
[Riverpod Basics](../riverpod-basics.md):

```dart
final drives = ref.watch(drivesStateProvider).value?.drives ?? SmartifyOsDrives.drives;
```

## Ejecting a stick

```dart
if (SmartifyOsDrives.capabilities.has(DriveCapability.eject)) {
  final ok = await SmartifyOsDrives.ejectDrive(drive.id);
  if (!ok) {
    // tell the driver it can't be pulled out yet
  }
}
```

`ejectDrive` returns `false` when the stick couldn't be ejected, most often because a file on it
is still open. Check `capabilities` before you show an Eject button, not every system can.

## Where it works

On a Linux car everything works. On a Mac, sticks in `/Volumes` are listed, so you can try your
code while you develop, but ejecting isn't offered. Android and Windows don't see sticks yet.

TODO: USB sticks on an Android tablet.

## Setting it up

There's nothing to set up, the defaults suit every car. `DrivesConfig` is only for turning it off:

```dart
await SmartifyOs().init(
  drives: const DrivesConfig(mountAutomatically: false),
);
```

| Parameters             |                                                                  |
| ---------------------- | ---------------------------------------------------------------- |
| **enabled**            | Optional, defaults to `true`. Turn it off and SmartifyOS never looks for sticks, which also means it never offers an update from one |
| **mountAutomatically** | Optional, defaults to `true`. Open a stick as soon as it's plugged in. Only turn it off when something else on the car already does that |
| **backend**            | Optional, replaces how sticks are found, for a system SmartifyOS doesn't know how to read them on |
