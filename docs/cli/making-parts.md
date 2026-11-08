---
sidebar_position: 2
---

# Windows, Tiles, Widgets and Settings

Your own windows, quick settings tiles, home screen widgets and settings pages each start as a
file the CLI makes for you, already handed to SmartifyOS in `lib/main.dart`. You only fill in what
it shows or does.

## Adding a window

```bash
smartify-os window create "Trip computer"
```

It asks what kind (fullscreen, or floating: smaller, over the home screen) and which icon, or take
them as flags:

```bash
smartify-os window create "Trip computer" --kind floating --icon speed
```

The window ends up in `lib/windows/trip_computer_window.dart`, with its icon in the app list. The
CLI says which line to change to fill in what it shows. See
[Creating Windows](../windows/creating-windows.md) for what goes there.

`--icon` takes the name of any of Flutter's built-in icons, the part after `Icons.` in
[Flutter's icon list](https://api.flutter.dev/flutter/material/Icons-class.html), like `speed`,
`lightbulb` or `event_seat`.

## Adding a quick settings tile

```bash
smartify-os tile create "Interior light"
```

A tile is either a switch (`--kind switch`, turns something on and off) or a button
(`--kind button`, does the same thing every time). It goes in `lib/quick_settings/`. See
[Quick Settings](../quick-settings/adding-tiles.md).

## Adding a home screen widget

```bash
smartify-os widget create "Oil temperature"
```

A widget is either a card (`--kind card`, shows up on its own, the driver can swipe it away) or
always there (`--kind pinned`, stays where the driver puts it). It goes in `lib/home_widgets/`. See
[Home Widgets](../home-widgets/adding-widgets.md).

## Changing or removing one

The same commands work for all three kinds, just swap `window` for `tile` or `widget`. List the
ones your app has:

```bash
smartify-os window list
```

Rename one, give it another icon, or change where it sits among the others (smaller numbers come
first):

```bash
smartify-os window edit "Trip computer" --name "Trip" --icon timer --order 10
```

A window your own code opens some other way (from a button, say) doesn't need an icon in the app
list:

```bash
smartify-os window edit "Trip computer" --app-list off
```

Take one out of your app again. This deletes its file, with everything you wrote in it:

```bash
smartify-os window remove "Trip computer"
```

`list` also finds the ones you wrote yourself some other way, several in a list of your own say.
Those are listed, but the CLI leaves changing them to you.

## Adding a settings page

A settings page opens from its row on another page of Settings. Make one and say where it goes
(`vehicle`, `display`, `sound`, `root` for Settings itself, or one of your own pages):

```bash
smartify-os settings create "Seat heating" --in vehicle
```

It ends up in `lib/settings/seat_heating_page.dart`. Then add rows to it, one at a time:

```bash
smartify-os settings add-row "Seat heating" "Driver seat" --kind switch
```

```bash
smartify-os settings add-row "Seat heating" Level --kind choice --option Low --option Medium --option High
```

```bash
smartify-os settings add-row "Seat heating" "Reset" --kind button
```

| Kind          |                                                                       |
| ------------- | --------------------------------------------------------------------- |
| **switch**    | Turns something on and off                                            |
| **choice**    | Picks one of the `--option`s you give it                              |
| **button**    | Runs a function of yours, which starts out further down the page's file |
| **info**      | Shows a value (`--value`) and does nothing                            |

A switch or a choice keeps its value between drives in a `SavedValue`, and the CLI tells you its
name, so the rest of your app can read it, like `seatHeatingDriverSeat.value` (see
[Values That Change](../saved-values.md)). Pass `--remember off` if it shouldn't. To also run
code of yours whenever it changes:

```bash
smartify-os settings edit-row "Seat heating" driver_seat --code on
```

Rows are named by the id the CLI gave them (`driver_seat` for "Driver seat"). `settings list`
shows every page with its rows and their ids:

```bash
smartify-os settings list
```

The other row flags: `--title`, `--subtitle` (the line under it), `--section` (the heading it
goes under), and `--default` (what it is until the driver changes it). `settings remove-row` and
`settings move-row` take a row off or move it up and down, and `settings edit` and
`settings remove` change or remove the page itself. See [Settings](../settings/adding-pages.md)
for the code behind it.
