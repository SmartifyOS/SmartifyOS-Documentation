---
sidebar_position: 35
---

# Riverpod Basics

Riverpod is the library SmartifyOS itself uses to keep track of values that change. For your own
values you don't need it, a `SavedValue` or a `ValueNotifier` with `ref.watchValue` does the job (see
[Values That Change](./saved-values.md)). This page is for the one case where you do: showing one of
SmartifyOS's own values (the song that's playing, the volume, whether it's night) in a widget you
built yourself, so it updates the moment that value changes.

## When you need this

SmartifyOS keeps its values in **providers**, named after what they hold: `bluetoothTrackProvider`,
`volumeProvider`, `nightModeProvider`, `gpsSpeedProvider` and so on. Each section of these docs
lists its own.

Inside anything you hand to SmartifyOS (a home widget's `builder`, a tile's `isOn`, an icon's
`visible`) you already have a `ref`, so you can read a provider right there with `ref.watch`,
nothing to set up:

```dart
HomeWidget.pinned(
  id: 'speed',
  title: 'Speed',
  icon: const Icon(Icons.speed),
  builder: (home) {
    final speed = home.ref.watch(gpsSpeedProvider) ?? 0; // metres per second
    return Text('${(speed * 3.6).round()} km/h');
  },
)
```

Only a widget class of your own, a window say, doesn't get a `ref` handed to it. That's what the
rest of this page is about.

## Adding riverpod to your app

Your app needs `flutter_riverpod` as a dependency of its own to build such a widget. Open
`pubspec.yaml` in your app's folder and add it under `dependencies:`, with `any` as its version:

```yaml title="pubspec.yaml"
dependencies:
  flutter_riverpod: any
```

`any` means "whichever version SmartifyOS uses", which is the one that works with it. The next
`smartify-os run` picks it up.

## Reading a provider in your own widget

A normal widget extends `StatelessWidget` and can't read providers. Extend `ConsumerWidget`
instead. It works exactly the same, except that `build` also hands you a `ref`:

```dart title="lib/windows/now_playing_window.dart"
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:smartify_os_core/bluetooth.dart';
import 'package:smartify_os_core/widgets.dart';

class NowPlayingWindow extends ConsumerWidget {
  const NowPlayingWindow({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final track = ref.watch(bluetoothTrackProvider).value;

    return SmartifyOsWindow(
      title: 'Now playing',
      child: Center(
        child: Text(track?.title ?? 'Nothing playing'),
      ),
    );
  }
}
```

`ref.watch(...)` gives you the value now, and rebuilds the widget every time it changes. The text
above updates on its own whenever the song does.

If your widget already has to be a `StatefulWidget`, use `ConsumerStatefulWidget` and
`ConsumerState` instead. The `ref` is then a field of the state, there's nothing to pass around.

`ref.watchValue(...)` works on this `ref` too, so a `ConsumerWidget` can follow your own values and
SmartifyOS's in the same place.

## Values that arrive over time

Many providers hold something that comes in from outside: the phone, the car's sensors, the
system. Those give you an `AsyncValue` rather than the value itself, because at the very start
there may be nothing yet. Add `.value` to get what's there, which is `null` until the first value
arrives:

```dart
final night = ref.watch(nightModeProvider).value ?? false;
```

To show something sensible from the very first frame, fall back to the facade's own getter, which
always has an answer:

```dart
final volume = ref.watch(volumeProvider).value?.volume ?? SmartifyOsVolume.volume;
```

Each section's page says what its providers hold.

## watch or read

Use `ref.watch(...)` while building something, so it redraws when the value changes. Inside a
button's `onTap` or any other code that runs once, use `ref.read(...)` instead: it gives you the
value now without redrawing anything later.

```dart
ThemedButton(
  onTap: () {
    final track = ref.read(bluetoothTrackProvider).value;
    debugPrint('Skipping ${track?.title}');
    Bluetooth.next();
  },
  child: const Text('Next'),
)
```

## Your own providers

You can declare providers of your own too, riverpod is a full library. For a car's app there's
rarely a reason to: a `ValueNotifier` or `SavedValue` does the same job with less to learn, and
works with everything SmartifyOS hands you. You'll also see SmartifyOS's own code use `@riverpod`
with generated code. That's there because SmartifyOS has hundreds of providers, not because it can
do anything yours couldn't, so leave it out of your app.
