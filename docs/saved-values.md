---
sidebar_position: 34
---

# Values That Change

A car is full of things that change while it runs: is a door open, are the headlights on, how warm
should the seats be. Your app needs somewhere to keep each of those, and the screen has to update
when they change. This page covers the two ways SmartifyOS gives you for that, `SavedValue` and
Flutter's own `ValueNotifier`, and how to make anything on screen follow them.

Which one to use comes down to one question: should the value still be there after the car is
switched off and on again?

- **Yes**, it's something the driver picked (a setting) or something worth keeping (a trip
  counter): use a `SavedValue`.
- **No**, it's what the car is doing right now (a door that's open, the oil temperature): use a
  `ValueNotifier`.

## SavedValue

A `SavedValue` is a value SmartifyOS keeps between drives. Declare it once, outside any class or
function, with a name of its own and what it is until something changes it:

```dart title="lib/settings/seat_heating_page.dart"
import 'package:smartify_os_core/saved_values.dart';

const seatHeating = SavedValue('seat_heating', defaultValue: false);
const tripKm = SavedValue('trip_km', defaultValue: 0.0);
```

The CLI writes these for you whenever you add a switch or a choice to a settings page (see
[Adding Settings Pages](./settings/adding-pages.md)), so you'll find them at the bottom of the files
in `lib/settings/`.

Then use it like a variable, from anywhere in your app. A change is saved straight away:

```dart
if (seatHeating.value) {
  startSeatHeater();
}

tripKm.value += 1.5;

seatHeating.reset(); // back to its defaultValue, and forgets what was saved
```

A few things worth knowing:

- It holds a `bool`, an `int`, a `double` or a `String`, whichever type its `defaultValue` is. Use
  `0.0` rather than `0` for a number with decimals, or it becomes an `int`.
- The name (`'seat_heating'`) has to be unique in your app. Changing it later starts the value over
  from `defaultValue`, since it's how the saved value is found again.
- Saved values are loaded while `SmartifyOs().init` runs. Read them after that, before it every
  value is its `defaultValue`.

Give one to a switch or a choice in Settings with `saved:` and the driver changes it from there,
see [Settings Entries](./settings/settings-entries.md).

## ValueNotifier

A `ValueNotifier` is Flutter's own box for a value that changes. It works the same way, it just
isn't kept when the car switches off. Declare it the same way, in a file of your own:

```dart title="lib/car_state.dart"
import 'package:flutter/foundation.dart';

final doorOpen = ValueNotifier(false);
final oilTemperature = ValueNotifier<double?>(null);
```

`ValueNotifier<double?>` says what it holds, here a number that can also be `null` (before the
first reading). Without it Dart works the type out from the starting value, like `bool` for `false`.

Whatever finds out about a change sets it:

```dart
doorOpen.value = true;
```

## Following a value on screen

Changing a value is only half of it, the screen has to show the new one too. How depends on where
you are.

### Where SmartifyOS hands you a ref

Almost everything you add to SmartifyOS (a home widget, a quick settings tile, a status bar icon, an
app list entry, a settings page) gets a small context object, and each of those carries a `ref`.
Call `ref.watchValue(...)` on it with a `SavedValue` or a `ValueNotifier`: it gives you the value
now, and SmartifyOS redraws that piece again every time it changes.

```dart
import 'package:smartify_os_core/saved_values.dart';

HomeWidget(
  id: 'door_open',
  title: 'Door open',
  icon: const Icon(Icons.sensor_door),
  visible: (home) => home.ref.watchValue(doorOpen),
  builder: (home) => const Text('A door is open'),
)
```

This card is now on screen whenever `doorOpen.value` is `true` and gone again when it's `false`.
Nothing else to call. The same works for a tile's `isOn`, an icon's `visible`, the rows of a
`SettingsPage.builder`, and every other callback that gets a context with a `ref`.

`watchValue` comes from `package:smartify_os_core/saved_values.dart`, so import that wherever you use it.

### In a widget of your own

Inside a window or any other widget you build yourself, wrap the part that shows the value in a
`ValueListenableBuilder`. It rebuilds just that part whenever the value changes:

```dart
ValueListenableBuilder(
  valueListenable: seatHeating,
  builder: (context, on, _) => Text(on ? 'Seat heating on' : 'Seat heating off'),
)
```

### In plain code

To run some code every time a value changes, rather than redraw something, listen to it. A
`SavedValue` has a `changes` stream:

```dart
seatHeating.changes.listen((on) {
  if (on) startSeatHeater(); else stopSeatHeater();
});
```

A `ValueNotifier` takes a listener:

```dart
doorOpen.addListener(() => debugPrint('door open: ${doorOpen.value}'));
```

## Values SmartifyOS keeps

SmartifyOS keeps plenty of values of its own, like what's playing over Bluetooth or how fast the car
is going. Most of them can be read once from their facade (`SmartifyOsVolume.volume`, say), and
followed with a riverpod provider. That's the one place you'll need a little riverpod, see
[Riverpod Basics](./riverpod-basics.md).
