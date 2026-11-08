---
sidebar_position: 1
---

# Adding Values

The info display is the big number in the bar: the speed, out of the box. Your car probably knows
more numbers worth a glance, the engine speed, the range left in the tank, the oil temperature.
Each of those is an `InfoDisplayValue`, and you add them with `InfoDisplayConfig`.

The display shows one big value with an optional small one under it. Tapping it moves on to the
next pair, and holding it opens a window where the driver picks which pairs there are. Each pair
is an `InfoDisplayView`.

## Adding a value

Add the values your car can show, and the pairs a tap goes through, in `lib/main.dart`:

```dart title="lib/main.dart"
await SmartifyOs().init(
  infoDisplay: const InfoDisplayConfig(
    values: [
      InfoDisplayValue(id: 'rpm', label: 'Engine speed', unit: 'RPM'),
      InfoDisplayValue(id: 'range', label: 'Range', unit: 'km'),
    ],
    views: [
      InfoDisplayView(big: InfoDisplayValues.speed, small: 'rpm'),
      InfoDisplayView(big: 'rpm', small: InfoDisplayValues.speed),
      InfoDisplayView(big: 'range'),
    ],
  ),
);
```

The Info display page under Setup in the [editor](../editor/setting-up-your-car.md) adds and
orders them for you, and the preview follows along while you do. From the terminal, `config` does
the same, see [Changing Settings](../cli/changing-settings.md):

```bash
smartify-os config --add 'infoDisplay.values={"id":"rpm","label":"Engine speed","unit":"RPM"}'
```

### InfoDisplayValue

| Parameters   |                                                                      |
| ------------ | -------------------------------------------------------------------- |
| **id**       | A short name, unique among the values, for example `'rpm'`. Views and `reportReading` use it |
| **label**    | What the driver reads when picking values, for example `'Engine speed'` |
| **unit**     | Optional, written after the number, for example `'RPM'` or `'km'`, defaults to nothing |
| **decimals** | Optional, how many digits after the decimal point, for example `1` for a battery at `12.6` volts, defaults to `0`. The number is rounded |
| **value**    | Optional, reads the number itself, see [Reading the number yourself](#reading-the-number-yourself). Leave it out to report the number with `reportReading` |
| **order**    | Optional, where it sits in the list the driver picks from, lower is earlier, defaults to `100` (the speed is `10`) |

### InfoDisplayConfig

| Parameters       |                                                                  |
| ---------------- | ---------------------------------------------------------------- |
| **values**       | Optional, your own values. The speed is already there as `InfoDisplayValues.speed` |
| **views**        | Optional, the pairs a tap goes through, in order. Leave it empty for just the speed |
| **hiddenValues** | Optional, built-in values to leave out, for example `{InfoDisplayValues.speed}` in a car that shows its speed in mph with a value of its own |

`views` is only where the car starts. Once the driver changes the pairs by holding the display,
theirs win, even over a new list here, until they press Reset to default in that window.

An `InfoDisplayView` has a `big` value and an optional `small` one, both by id. A view naming a
value that doesn't exist (or is hidden) is skipped.

## Feeding it the number

Tell SmartifyOS the latest number wherever your code learns it, as often as it changes:

```dart
SmartifyOsInfoDisplay.reportReading('rpm', 3450);
```

Report `null` when nothing knows the number right now, and the display shows `--`. Wherever your
number comes from (the [CAN bus](../can-bus/sending-and-listening.md), a
[board on USB](../usb-boards/adding-a-board.md), a slider while you're testing), this is the one
line that puts it on screen. The display only redraws the number that changed, so reporting the
engine speed many times a second is fine.

```dart
SmartifyOsInfoDisplay.reading('rpm'); // the last number reported
```

### Reading the number yourself

If the number already lives in a value of your own (a `ValueNotifier` or a `SavedValue`, see
[Values That Change](../saved-values.md)), give the `InfoDisplayValue` a `value` that reads it
instead:

```dart
final rangeKm = ValueNotifier<double?>(null);

InfoDisplayValue(
  id: 'range',
  label: 'Range',
  unit: 'km',
  value: (info) => info.ref.watchValue(rangeKm),
)
```

`value` runs whenever the display redraws, and `ref.watchValue` makes it redraw whenever `rangeKm`
changes. A value with a `value` of its own ignores `reportReading`.

## More than one display

Every layout already has an info display in its bar. A layout can put another one anywhere, and
there's a home widget for one too (`HomeWidgets.infoDisplay`), so the driver can keep the engine
speed in a widget while the bar shows the speed. Each of those keeps its own place among the
views. See [Making a Layout](../layouts/making-a-layout.md#infodisplay).

## Changing it from your code

Everything the driver does with the display, your code can do too, for a button on the steering
wheel say:

```dart
SmartifyOsInfoDisplay.selectNextView();    // what a tap does
SmartifyOsInfoDisplay.openEditor(context); // what holding it does
SmartifyOsInfoDisplay.selectView(const InfoDisplayView(big: 'rpm'));
```

Values can be added and taken away while the car runs, for a value only some trips have:

```dart
SmartifyOsInfoDisplay.addValue(
  const InfoDisplayValue(id: 'boost', label: 'Boost', unit: 'bar', decimals: 1),
);
SmartifyOsInfoDisplay.hideValue('boost');
SmartifyOsInfoDisplay.showValue('boost');
SmartifyOsInfoDisplay.removeValue('boost');
```

`addView`, `removeView` and `resetViews` change the list a tap goes through, exactly as the driver
does in the window. None of these throw, and they all work on a value you haven't added yet, so the
order you set things up in never matters.
