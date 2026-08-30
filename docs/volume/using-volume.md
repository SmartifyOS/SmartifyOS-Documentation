---
sidebar_position: 1
---

# Using Volume

`SmartifyOsVolume` is where the car's volume lives. The bar at the top of the quick settings (see
[Quick Settings](../quick-settings/adding-tiles.md)) already reads and writes it, so you only need
this yourself if you're wiring up a physical volume knob:

```dart
myKnob.turns.listen((clicks) {
  SmartifyOsVolume.changeVolume(clicks > 0 ? 0.05 : -0.05);
});
```

:::tip[Tip]

SmartifyOS doesn't own an amplifier yet, so this is just a number the OS remembers and shows,
turning it up doesn't make the car louder. It's here so a physical volume control has something to
turn, and a bar to flash up when it's turned. When there's a real audio service behind it,
everything written against `SmartifyOsVolume` keeps working.

:::

## Reading and setting the volume

```dart
final volume = SmartifyOsVolume.volume; // 0 (silent) to 1 (loudest)
SmartifyOsVolume.setVolume(0.8);
SmartifyOsVolume.changeVolume(-0.05); // one notch down from wherever it is
```

`setVolume` clamps anything outside 0 to 1, so there's no need to check the value yourself before
calling it. `changeVolume` moves it up or down from where it already is, which is what one notch of
a knob does.

To have your own widget redraw whenever the volume changes, watch `volumeProvider` instead of
reading `SmartifyOsVolume.volume` once. If you haven't used riverpod before, read
[Riverpod Basics](../riverpod-basics.md) first.

```dart
final volume = ref.watch(volumeProvider).value?.volume ?? SmartifyOsVolume.volume;
```

## Showing that a knob did something

Turning the knob against its end stop still leaves the volume exactly where it was, and the driver
still needs to see that the knob did something. `SmartifyOsVolume.volumes` (and `volumeProvider`)
fire every time the volume is *set*, whether or not the number actually changed, which is what the
bar that flashes up over the screen when a knob is turned listens to. Reach for `SmartifyOsVolume.volumes`
instead of comparing old and new values yourself if you're building something similar.
