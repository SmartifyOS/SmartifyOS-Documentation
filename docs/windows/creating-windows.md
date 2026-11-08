---
sidebar_position: 1
---

# Creating Windows

A window is what SmartifyOS calls a page: a trip computer, a screen for the seat heating, a
stopwatch. You build one by wrapping your content in `SmartifyOsWindow` (fills the screen) or
`SmartifyOsFloatingWindow` (smaller, over the home screen). Both draw the themed panel, the title
bar and the close button for you, so all you write is what goes inside.

## Letting the CLI make one

The quickest way to a new window is to let the CLI write it. Run this in your car's app folder:

```bash
smartify-os window create "Trip computer"
```

It asks whether the window should fill the screen or float, and which icon it gets (or take
`--kind fullscreen`/`--kind floating` and `--icon speed`). Then it writes
`lib/windows/trip_computer_window.dart`, puts the window's icon in the app list and hands it to
SmartifyOS in `lib/main.dart`. In the [editor](../editor/setting-up-your-car.md) the same thing
is the "New" row under Windows in the car panel.

The file it writes looks like this:

```dart title="lib/windows/trip_computer_window.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/app_list.dart';
import 'package:smartify_os_core/navigator.dart';
import 'package:smartify_os_core/widgets.dart';

class TripComputerWindow extends StatelessWidget {
  const TripComputerWindow({super.key});

  /// What it is called, at the top of the window and under its icon.
  static const title = 'Trip computer';

  /// Its icon in the app list. lib/main.dart hands it to SmartifyOS.
  static final appListEntry = AppListEntry(
    id: 'trip_computer',
    title: title,
    icon: const Icon(Icons.speed),
    onOpen: (context) =>
        SmartifyOsNavigator.push(context, const TripComputerWindow()),
  );

  @override
  Widget build(BuildContext context) {
    return const SmartifyOsWindow(
      title: title,
      child: Center(child: Text('Change what it shows in lib/windows/trip_computer_window.dart')),
    );
  }
}
```

From here on, what you change is what `build` returns, the `child` in particular. The
`appListEntry` at the top is what puts the window in the app list, see
[Adding App List Entries](../app-list/adding-entries.md) for what else it can do.

`smartify-os window list` shows the windows your app has, `smartify-os window edit` renames one,
gives it another icon or takes it out of the app list, and `smartify-os window remove` deletes it
again.

## Fullscreen windows

`SmartifyOsWindow` covers everything under the status bar. Use it for anything that needs room,
which is most windows.

```dart
SmartifyOsWindow(
  title: 'Trip computer',
  child: Center(child: Text('412 km since the last fill-up')),
)
```

| Parameters            |                                                                          |
| --------------------- | ------------------------------------------------------------------------ |
| **title**             | The name in the title bar                                                |
| **child**             | What the window shows                                                    |
| **leading**           | Optional, a widget in front of the title, usually a back button for a window with pages of its own |
| **actions**           | Optional, widgets at the right end of the title bar, next to the close button |
| **hideBar**           | Optional, whether the layout's bar (the info display, the dock) slides away while the window is open. Leave it out and the layout decides: most give the window the whole screen, a sidebar stays. `true` always hides it, `false` always keeps it, for a window where the driver should still see the speed |
| **hiddenStatusIcons** | Optional, status bar icons to leave out while this window is in front, by id, for example `{StatusIcons.clock}` in a window with a big clock of its own. They come back when it closes |

While the bar stays on screen, the window keeps its content clear of it on its own, you never
have to pad around it.

### Without a title bar

A window that needs every last pixel (a camera, Android Auto) can drop the title bar with
`SmartifyOsWindow.withoutTitleBar`. There's no close button then, so the status bar shows a home
button at its left end while the window is in front, and a physical back button closes it too.

```dart
SmartifyOsWindow.withoutTitleBar(
  hiddenStatusIcons: const {StatusIcons.clock},
  child: const MyCameraView(),
)
```

It hides the bar unless you pass `hideBar: false`.

## Floating windows

`SmartifyOsFloatingWindow` sits in the middle of the screen with the home screen still showing
around it, dimmed. Tapping outside it closes it. Good for something small that doesn't need the
whole screen, like a stopwatch or a quick question.

```dart
SmartifyOsFloatingWindow(
  title: 'Stopwatch',
  widthFactor: 0.5,
  heightFactor: 0.5,
  child: Center(child: Text('00:42.3')),
)
```

It takes the same `title`, `child`, `leading` and `actions` as `SmartifyOsWindow`, plus:

| Parameters       |                                                                    |
| ---------------- | ------------------------------------------------------------------ |
| **widthFactor**  | Optional, how much of the screen's width it takes, from `0` to `1`, defaults to `0.8` |
| **heightFactor** | Optional, how much of the screen's height it takes, defaults to `0.7` |

The sizes are measured in the space the layout's bar leaves, so a floating window never ends up
under the dock.

## What to put inside

A window's `child` is plain Flutter, so anything goes. To make it look like the rest of the car
and work with a knob as well as a finger, build it out of SmartifyOS's own controls
(`ThemedButton`, `ThemedListTile`, `ThemedSlider` and friends), see
[Building Blocks](./building-blocks.md). A raw Material button works on the touchscreen, but the
highlight of a [physical control](../focus/using-focus.md) can't land on it.

A window can show the car too: put a `CarView` in it and the car moves over from the home screen
while the window is open, see [Showing the Car](../car/showing-the-car.md).

The next page is about opening and closing windows.
