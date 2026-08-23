---
sidebar_position: 2
---

# Settings Entries

`SettingsEntry` is one row on a settings page. Build one with a named constructor, each one is a
different kind of row.

## Toggle

A row with a switch on the right. The switch remembers its own position, you only react to
`onChanged`.

```dart
SettingsEntry.toggle(
  title: 'Sport Mode',
  initialValue: false,
  onChanged: (on) => myCar.sportMode(on),
)
```

If the value can also change from somewhere else, build the page with `SettingsPage.builder` and
pass the current value in each time instead.

## Action

Runs your code when tapped.

```dart
SettingsEntry.action(
  title: 'Reset Trip Meter',
  onTap: myCar.resetTrip,
  destructive: true,
)
```

`destructive` paints the row in the theme's error color, use it for anything that removes or
resets something.

## Info

Shows a value and does nothing.

```dart
SettingsEntry.info(title: 'Software', value: '1.4.2')
```

## Choice

Opens a list to pick one option from. The picked option is shown on the row, no need to repeat
it in `subtitle`.

```dart
SettingsEntry.choice<int>(
  title: 'Seat Heating',
  selected: 2,
  options: const [
    SettingsChoice(1, 'Low'),
    SettingsChoice(2, 'Medium'),
    SettingsChoice(3, 'High'),
  ],
  onSelected: (level) => myCar.seatHeaterLevel(level),
)
```

## Custom

A row you build yourself, for anything the other kinds can't do.

```dart
SettingsEntry.custom(
  title: 'Odometer',
  builder: (settings) => MyOdometerRow(ref: settings.ref),
)
```

`title` isn't drawn for a custom row, but it's still worth setting, since it's what shows up in
logs if something goes wrong with the row.

## Common fields

Every kind shares these:

| Parameters     |                                                                       |
| ----------------- | ----------------------------------------------------------------------- |
| **title**         | The row's label                                                       |
| **subtitle**       | Optional dimmer second line                                          |
| **icon**           | Optional icon on the left                                             |
| **section**        | Optional, groups the row under a heading, use the same text to join an existing group |
| **order**          | Optional, where the row sits, lower is earlier, defaults to `100`     |
| **enabled**        | Optional, set to `false` to dim the row and make it untappable, defaults to `true` |
| **visible**        | Optional, return `false` to hide the row depending on app state       |
