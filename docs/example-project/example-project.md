---
sidebar_position: 1
---

# Example Project

The example app is a pretend car with one of everything SmartifyOS lets you add: windows,
quick settings tiles, home widgets, a settings page, a theme, a layout, a device on the CAN
bus with its firmware, both official extensions, and keyboard controls standing in for a
knob. It's the best place to see how all the pieces fit together in one app, and to copy
from when you want something in your own car.

It's built exactly the way `smartify-os create` and the editor build a car's app, so you can
open it in the editor, change things there, and see where each change ends up in the code.

## Getting a copy

With the CLI, make your own copy of it:

```bash
smartify-os create --from example
```

It's copied as it is, so give it your car's name and the rest yourself, in its
`lib/main.dart` or with `smartify-os about` and `smartify-os appearance` (see
[Your Car](../cli/your-car.md)). Then try it on your computer, from its folder:

```bash
smartify-os run
```

Or open the folder in the editor and press Run, see [Using the Editor](../editor/using-the-editor.md).

It's also in the SmartifyOS repository, as `smartify_os_example_app/`.

## What's where

Everything is set up in `lib/main.dart`, in `SmartifyOs().init(...)`, with a comment on every
setting saying what it does. Each part has a file of its own, in the shape the CLI writes
them:

| File                                 |                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `lib/main.dart`                      | Everything handed to SmartifyOS: the car's name, layout, bar, 3D model and drawing, reverse camera, CAN bus, info display and extensions |
| `lib/windows/playground_window.dart` | A fullscreen window to drive the pretend car by hand: sliders for the speed, engine speed, range and steering, the doors, and a button for every kind of notification, see [Creating Windows](../windows/creating-windows.md) |
| `lib/windows/stopwatch_window.dart`  | A floating window, a stopwatch that keeps running while it's closed     |
| `lib/quick_settings/`                | A switch (the headlights) and a button (locking the doors), see [Quick Settings](../quick-settings/adding-tiles.md) |
| `lib/home_widgets/`                  | A card you can swipe away (a tap counter) and a pinned widget (the engine speed and range), see [Home Widgets](../home-widgets/adding-widgets.md) |
| `lib/settings/lights_page.dart`      | A settings page of your own under Vehicle, with rows that remember their value, see [Settings](../settings/adding-pages.md) |
| `lib/settings_entries.dart`          | A row added to a settings page SmartifyOS already has                    |
| `lib/status_icons.dart`              | A status bar icon that shows while the headlights are on, see [Status Bar](../status-bar/adding-icons.md) |
| `lib/theme.dart`                     | A theme of its own, warm colours and frosted glass, see [Making a Theme](../theme/making-a-theme.md) |
| `lib/layouts.dart`                   | A layout of its own, the car and the engine gauge side by side, see [Making a Layout](../layouts/making-a-layout.md) |
| `lib/info_display.dart`              | The ids of its own info display values, see [Info Display](../info-display/adding-values.md) |
| `lib/can.dart`                       | The CAN bus: the lights device and the messages it sends and gets, see [CAN Bus](../can-bus/defining-devices.md) |
| `lib/lights.dart`                    | The headlights, switched from the tile, the settings page and the voice assistant, and shown on the car and in the status bar |
| `devices/lights/`                    | The firmware of the ESP32 that switches the headlights, see [Writing the Firmware](../can-bus/writing-firmware.md) |
| `firmware/smartify_os_network.h`     | The CAN bus definitions from `lib/can.dart`, written for the firmware whenever the app runs |
| `lib/input.dart`                     | Driving everything from the keyboard, the way a knob and a few buttons would, see [Physical Controls](../focus/using-focus.md) |
| `lib/voice_commands.dart`            | What you can ask the voice assistant on top of what it knows already, see [Using Extensions](../extensions/using-extensions.md#voice-assistant) |
| `assets/`                            | The car's 3D model and 2D drawing, and the theme's font                  |

## The pretend car

It uses the 3D model and drawing of a Mazda MX-5, but there's no car behind it. Instead of
sensors, the playground window has sliders, and each one takes exactly the path a real sensor
would:

- the **speed** goes to `SmartifyOsGps.reportFix`, so the info display and the turning wheels
  both follow it, see [GPS](../gps/using-gps.md),
- the **engine speed** and **range** go to `SmartifyOsInfoDisplay.reportReading`,
- the **steering** goes to `SmartifyOsCar.setSteering`, which turns the front wheels and the
  steering wheel.

So the code is the same as in a real car, only where the numbers come from is different.

The headlights work with or without hardware. With the lights' ESP32 on the CAN bus,
switching them asks the board to, and the screen follows once the board says they changed.
Without it (on your computer, say), only the screen changes.

## Keyboard controls

`lib/input.dart` drives the whole screen from the keyboard, the way a car's own controls
would:

| Key         | Stands in for                 | Does                                    |
| ----------- | ----------------------------- | --------------------------------------- |
| Left, Right | turning a knob                | the previous or next control             |
| Up, Down    | a four-way pad                | the control above or below               |
| Enter       | pushing the knob              | presses it                               |
| Backspace   | a back button                 | one step back                            |
| Home        | a home button                 | goes home. On the home screen, opens the shade, then the quick settings, then closes it |
| F2          | the reverse light             | in and out of reverse, showing the reverse camera |
| F3          | the voice button on the wheel | starts the voice assistant               |

A real car writes its own version of this file, reading its knob or buttons however they're
connected and calling the same few functions.

## A real car

The example is a showcase, not a car. For one that's driven every day, see
[Smart Miata](https://github.com/Mauznemo/SmartMiata), the app and board firmware of the car
SmartifyOS was made for.
