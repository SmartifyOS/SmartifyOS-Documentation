---
sidebar_position: 1
---

# Using Night Mode

`SmartifyOsNightMode` is where SmartifyOS keeps whether it's dark outside. SmartifyOS never works
that out by itself, your car already knows: the headlight switch, a light sensor, whatever you have.
Tell it, and everything with a day and a night look switches together, at the same moment the car
does. Until you tell it, it's day.

```dart
myCar.headlights.listen((on) => SmartifyOsNightMode.setNightMode(on));
```

`myCar.headlights` stands for however your own code reads the car, a message on the
[CAN bus](../can-bus/sending-and-listening.md) say. Call `setNightMode` whenever it changes, as
often as you like, telling it what it already is does nothing. `SmartifyOsNightMode` comes from
`package:smartify_os_core/night_mode.dart`.

## What uses it

The Android Auto extension tells the phone, so its maps switch to their dark colours (see
[Using Extensions](../extensions/using-extensions.md)). Anything of your own with a night look can
follow it too.

TODO: themes switching to a night look of their own, once that exists.

## Reading it

```dart
if (SmartifyOsNightMode.nightMode) {
  // it's dark outside
}

SmartifyOsNightMode.nightModeChanges.listen((night) {
  // runs with the current value first, then on every change
});
```

To redraw a widget of your own when it changes, watch `nightModeProvider` in a `ConsumerWidget`, see
[Riverpod Basics](../riverpod-basics.md) if you haven't used that before:

```dart
final night = ref.watch(nightModeProvider).value ?? SmartifyOsNightMode.nightMode;
```

## Trying both looks

While developer options are on, the developer options page can force it to day or night, so you can
try both looks without waiting for the sun. From code that's:

```dart
SmartifyOsNightMode.setNightModeOverride(true); // always night
SmartifyOsNightMode.setNightModeOverride(null); // follow the car again
```

It only works while developer options are on, and goes away when they're turned off, see
[Using Developer Options](../developer-options/using-developer-options.md).
