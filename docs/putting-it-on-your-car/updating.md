---
sidebar_position: 3
---

# Updating Your Car

Once a car runs SmartifyOS, every change after that goes onto it from a USB stick too: a newer
SmartifyOS, a new extension, or just a window you added. You don't need a new installer, and you
don't need to touch the car's computer at all, SmartifyOS updates itself.

## Making the update stick

In the editor pick **Export update** in the Export menu. With the CLI, run this in your car's app
folder:

```bash
smartify-os export update
```

It puts your car's app as it is right now on the stick, and asks the same questions as the
installer: which stick, and whether SmartifyOS is built on the car or on your computer (see
[Installing SmartifyOS](./installing-smartify-os.md#making-the-installer-stick)).

Export again whenever you change something. A new export replaces the one on the stick, and an
export that fails halfway leaves the one that was there before untouched.

:::tip[Tip]

`smartify-os update` and **Update SmartifyOS** in the editor only move your car's app on your
computer to a newer SmartifyOS. Export an update afterwards to get it into the car.

:::

## Updating on the car

Plug the stick into the car while SmartifyOS runs. A notification comes up, **Update ready**,
with an **Update** button. Tap it, and SmartifyOS:

1. copies the update off the stick,
2. installs anything new it needs on Linux,
3. builds the new version, if the car builds SmartifyOS itself,
4. checks the new version,
5. starts the new version.

It shows how far along it is and roughly how long is left. Keep the car switched on until it's
done. Your car keeps running the version it has the whole time, the new one only takes its place
in the very last step, so pulling the stick or losing power halfway leaves the car as it was. The
old version is kept until the new one has been running for a minute.

Once it's back, a notification says **SmartifyOS was updated**.

The car only needs the internet for an update when there's something new to download: a new
package on Linux, or, for a car that builds itself, a newer Flutter.

## Firmware on the same stick

New firmware for the boards around your car can go on the same stick (see
[Firmware Updates](../can-bus/firmware-updates.md) and
[Boards on USB](../usb-boards/firmware-updates.md)). The car then shows one notification for
everything on the stick, **Updates on** the stick, with **Update all** and **Choose** to pick what
to update. It updates one thing at a time, the boards first and SmartifyOS last, since the car
starts again into it.

If you swipe the notification away, it only comes back once there's something new on a stick.

## When an update can't be installed

The notification says why, and what to do:

| It says                                   |                                                             |
| ----------------------------------------- | ----------------------------------------------------------- |
| It was built for another kind of car      | You built it for `x64` and the car is `arm64` (or the other way around). Export it again, built for this car |
| It has to be built on the car             | The car can't build SmartifyOS. Export it again, built on your computer |
| It was made by a newer smartify-os        | The car is too old for the stick. Set it up again with a new installer |
| Something is missing, or it's damaged     | Export it again                                             |

## Switching updates off

Only a car set up with the SmartifyOS installer is ever offered an update. To switch it off even
there, for a car that shouldn't update from any stick someone plugs in:

```dart
await SmartifyOs().init(
  updates: const UpdatesConfig(enabled: false),
);
```

Or with the CLI:

```bash
smartify-os config updates.enabled off
```

Anyone who can plug a stick into the car can update it, since updates aren't signed. SmartifyOS
only checks that what's on the stick is complete.

:::tip[Tip]

To see what the update screen looks like without a car, turn on the developer options and use
"Try the update screen" there, see [Developer Options](../developer-options/using-developer-options.md).

:::
