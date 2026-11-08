---
sidebar_position: 3
---

# Building Blocks

SmartifyOS comes with its own set of controls for building windows: buttons, rows, switches,
sliders, dialogs. They're all named `Themed...`, and you should reach for them instead of
Flutter's Material widgets for two reasons:

- They follow the [theme](../theme/picking-a-theme.md). Colours, glass, borders and corner shapes
  change with whatever theme the driver picks, so your window always matches the rest of the car.
- They work without the touchscreen. Every one of them can be picked out and pressed with a knob
  or buttons, see [Physical Controls](../focus/using-focus.md). A plain Material button can't.

The controls come from `package:smartify_os_core/widgets.dart`, the dialogs and pop-ups from
`package:smartify_os_core/modals.dart`.

## Text

Use the theme's text styles rather than picking font sizes yourself, so text is the same size
everywhere and changes with the theme:

```dart
final text = context.smartifyOsText;

Column(
  children: [
    Text('Now Playing', style: text.heading),
    Text('Binary', style: text.strong(text.title)),
    Text('LONOWN', style: text.dim(text.small)),
  ],
)
```

There are five sizes, smallest first: `small`, `body` (most text), `title` (a row's title, a
button's label), `heading` (the heading of a page or card) and `display` (the one big number, like
the speed). `text.dim(...)` makes any of them quieter, for a subtitle or a unit, and
`text.strong(...)` makes one bolder, for the one thing on screen that has to stand out.

## Controls

### Buttons

```dart
ThemedButton(
  onTap: () => startTimer(),
  child: const Text('Start'),
)

ThemedIconButton(
  icon: Icons.refresh,
  onTap: () => reload(),
)
```

`ThemedButton` is filled with the theme's accent colour, for the main action. `ThemedIconButton`
is a round button with only an icon, for small actions like refresh or back. Give it
`filled: true` to fill it with the accent colour too. `ThemedPanelButton` is a tappable panel, for
something bigger than a button, like a tile in a grid.

### Rows

`ThemedListTile` is one row in a list, the same row every Settings page is built from:

```dart
ThemedListTile(
  leading: const Icon(Icons.bluetooth),
  title: 'Bluetooth',
  subtitle: 'Phone connected',
  trailing: const Icon(Icons.chevron_right),
  onTap: () => openBluetooth(),
)
```

`ThemedSectionHeader(title: 'Paired devices')` puts a small heading over a group of rows, and
`ThemedDivider()` a thin line between them.

### Switches, sliders and checkboxes

```dart
ThemedSwitch(value: heating, onChanged: (on) => setState(() => heating = on))
ThemedCheckbox(value: agreed, onChanged: (on) => setState(() => agreed = on))
ThemedSlider(value: level, onChanged: (v) => setState(() => level = v))
ThemedFillSlider(value: brightness, icon: const Icon(Icons.light_mode), onChanged: setBrightness)
```

None of them remember their own value, you keep it (in your window's state, or a
[saved value](../saved-values.md)) and pass it back in. `ThemedSlider` is a normal slider with a
handle, for a number the driver actually reads. `ThemedFillSlider` is a fat bar that fills up, with
nothing small to aim at, for brightness or volume, where you just want to change it without looking.
Both go from `0` to `1` unless you give them a `min` and `max`.

### Everything else

| Widget               |                                                                     |
| -------------------- | ------------------------------------------------------------------- |
| `ThemedPanel`        | A themed surface (glass, border, corners) around anything you like  |
| `ThemedTextField`    | A text input. Typing needs a keyboard, a real one or the system's on-screen one |
| `ThemedKeypad`       | An on-screen number pad, for a PIN or code on a car with no keyboard |
| `ThemedColorPicker`  | Picks a colour with two bars, hue and brightness, made for ambient lights |
| `ThemedLineChart`    | Readings drawn as lines over time, like a live data screen          |

## Dialogs

A dialog is a small window that asks for something and waits for the answer. The two most common
kinds are one line each:

```dart
final sure = await ThemedDialog.confirm(
  context,
  title: 'Reset trip meter?',
  message: 'This cannot be undone.',
  destructive: true,
);
if (sure) resetTrip();

final name = await ThemedDialog.prompt(context, title: 'Rename your car');
```

`await` waits for the driver to answer before the next line runs. `confirm` gives back `true` or
`false` (`false` when cancelled too), `prompt` the text typed, or `null` when cancelled.
`destructive: true` turns the confirm button red, use it for anything that deletes or resets.
`ThemedDialog.prompt(..., numeric: true)` shows a number pad instead of a text field, which is
what you want on a car without a keyboard.

For anything else, build a `ThemedDialog` yourself and show it with `ThemedDialog.show`. Close it
with `Navigator.of(context).pop(...)`, and whatever you pass to `pop` is what `show` gives back:

```dart
final side = await ThemedDialog.show<String>(
  context,
  builder: (context) => ThemedDialog(
    title: 'Which side?',
    content: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final option in ['Left', 'Right'])
          ThemedListTile(
            title: option,
            onTap: () => Navigator.of(context).pop(option),
          ),
      ],
    ),
  ),
);
```

`ThemedDialog` takes a `title`, and optionally a `message` (a line or two under the title),
`content` (anything you like, it scrolls if it gets too tall) and `actions` (buttons along the
bottom).

### Picking a date or time

```dart
final day = await ThemedDatePicker.show(context, initial: SmartifyOsTime.now);
final time = await ThemedTimePicker.show(context, initial: TimeOfDay.now());
```

Both use wheels you spin rather than a keyboard, and give back `null` when cancelled. The time
picker shows 24 hours or AM/PM, whichever the driver picked in Settings.

## Toasts

A toast is a short message that slides up at the bottom of the screen and goes away on its own:

```dart
ThemedToast.show(context, 'Saved');
ThemedToast.show(context, 'Could not connect', icon: Icons.error_outline);
```

Use one for something the driver can safely miss, like "Saved". If it's worth coming back to
later, send a [notification](../notifications/sending-notifications.md) instead, and if it needs an
answer, use a dialog.
