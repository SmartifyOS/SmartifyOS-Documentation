---
sidebar_position: 2
---

# Settings Entries

A `SettingsEntry` is one row on a settings page. Each kind of row has its own named constructor:
a switch, a choice, a button, a line of information, or one you draw yourself. The CLI's
`settings add-row` makes the first four (`--kind switch`, `choice`, `button` or `info`).

## Switch

A row with an on/off switch on the right. Give it a `SavedValue` and it remembers its position
between drives, and the rest of your app can read it (see [Values That Change](../saved-values.md)):

```dart
const sportMode = SavedValue('sport_mode', defaultValue: false);

SettingsEntry.toggle(
  id: 'sport_mode',
  title: 'Sport mode',
  saved: sportMode,
)
```

Anywhere else in your app, `sportMode.value` is now whatever the driver picked, and anything showing
it updates when they change it.

To also do something the moment it's switched, add `onChanged`. It runs after the saved value has
changed:

```dart
SettingsEntry.toggle(
  id: 'sport_mode',
  title: 'Sport mode',
  saved: sportMode,
  onChanged: (on) => setSportMode(on),
)
```

You can also leave `saved` out, and give `initialValue` (where the switch starts when the page
opens, defaults to `false`) with `onChanged`. The switch then only remembers its position while the
page is open, which is fine for something your own code keeps track of anyway.

## Choice

A row that opens a list to pick one option from. What's picked is shown on the right of the row.
`SettingsChoice` takes the value your code gets, then the label the driver reads:

```dart
const seatLevel = SavedValue('seat_level', defaultValue: 'medium');

SettingsEntry.choice(
  id: 'seat_level',
  title: 'Seat heating',
  options: const [
    SettingsChoice('low', 'Low'),
    SettingsChoice('medium', 'Medium'),
    SettingsChoice('high', 'High'),
  ],
  saved: seatLevel,
  onSelected: (level) => setSeatHeater(level),
)
```

`onSelected` is optional, and runs with the picked value. A `SettingsChoice` can also take a
`subtitle:` for a second line under its label in the list. Without a `SavedValue`, pass `selected:`
for what's picked when the page opens, and react in `onSelected`.

## Button

Runs your code when tapped:

```dart
SettingsEntry.action(
  id: 'reset_trip',
  title: 'Reset trip meter',
  onTap: resetTripMeter,
)
```

Add `destructive: true` for anything that deletes or resets something. It paints the row in the
theme's warning colour, so the driver thinks twice.

## Information

Shows a value and does nothing when tapped:

```dart
SettingsEntry.info(title: 'Bulbs', value: 'LED')
```

## Custom

A row you build yourself, for anything the other kinds can't do:

```dart
SettingsEntry.custom(
  title: 'Odometer',
  builder: (settings) => const OdometerRow(),
)
```

`OdometerRow` stands for a widget of your own. `title` isn't drawn on a custom row, but set it
anyway, it's what shows up in the log if something goes wrong with the row.

## Common fields

Every kind of row takes these:

| Parameters      |                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| **title**       | The row's label                                                                          |
| **id**          | Optional, a fixed name for the row that's unique on its page, like `'sport_mode'`. Only matters on a page where rows come and go with `visible`: it's how a switch keeps its position when a row above it disappears. The CLI gives every row one |
| **subtitle**    | Optional, a dimmer second line, for a short explanation. Not on a custom row             |
| **icon**        | Optional, an icon on the left. Not on a custom row                                       |
| **section**     | Optional, puts the row under a heading. Rows with the same section text end up together  |
| **order**       | Optional, where the row sits on its page, smaller comes first, defaults to `100`. Rows with the same order stay in the order you listed them |
| **enabled**     | Optional, defaults to `true`. Set it to `false` to grey the row out, so the driver can see the option exists but can't use it right now. Not on information or custom rows |
| **visible**     | Optional, decides whether the row is there right now. Leave it out and it always is      |

`visible` gets a `SettingsContext`, so it can follow a value of your own with `ref.watchValue`. For
example, a row that only shows while another switch is on:

```dart
SettingsEntry.choice(
  id: 'seat_level',
  title: 'Level',
  options: const [SettingsChoice('low', 'Low'), SettingsChoice('high', 'High')],
  saved: seatLevel,
  visible: (settings) => settings.ref.watchValue(seatHeatingOn),
)
```
