---
sidebar_position: 1
---

# Using Developer Options

Developer options is a hidden page in Settings with everything that's only there for testing and
building: faking where the car is, forcing night mode, watching the CAN bus, talking to a board by
hand. The driver never sees it unless they go looking.

## Turning them on

Open **Settings, System** and turn on **Developer options**. A **Developer options** page appears
under System, and stays until you turn the switch off again. Whether they're on is remembered
between drives.

Turning them off also stops everything they were faking, so nothing fake is ever left running
where nobody can see it.

## What's on the page

| Section          | What it's for                                                   |
| ---------------- | --------------------------------------------------------------- |
| **Night mode**   | Follow the car, or force it to always day or always night, to see how your screens look both ways. See [Night Mode](../night-mode/using-night-mode.md) |
| **GPS**          | Fake where the car is: paste a latitude and longitude straight from a map. See [GPS](../gps/using-gps.md) |
| **Updates**      | **Try the update screen** goes through a whole SmartifyOS update without changing anything, on any computer |
| **CAN bus**      | Whether the CAN adapter is connected, and **CAN monitor**, every frame on the bus as it happens, with the names and values of your messages. Only there when your car has a [CAN bus](../can-bus/defining-devices.md) |
| **Serial ports** | Every serial port plugged in and the board on it, with its name under `/dev/serial/by-id/`, a serial monitor, and writing firmware onto a board by hand. See [Boards on USB](../usb-boards/firmware-updates.md#boards-that-dont-say-which-device-they-are-yet) |

Extensions add their own pages or sections here too, the [voice assistant](../extensions/using-extensions.md)
for example.

Anything faked from here is remembered between restarts while developer options stay on, so you
don't have to set your fake position again every time you restart the app.

## Adding your own

Anything only for testing your own car belongs on this page too, never on a page of its own
somewhere else, so it's hidden along with the rest. Give a settings page this page as its
`parent` (see [Adding Settings Pages](../settings/adding-pages.md)):

```dart
SettingsPage(
  id: 'lights.developer',
  parent: SettingsPages.developer,
  title: 'Lights',
  entries: [
    SettingsEntry.action(
      title: 'Flash the headlights',
      onTap: flashHeadlights,
    ),
  ],
)
```

It only shows while developer options are on, there's nothing else to check.

For something that isn't in Settings, a debug overlay on your own window say, ask
`SmartifyOsDeveloperOptions.enabled`:

```dart
if (SmartifyOsDeveloperOptions.enabled) {
  // draw the frame counter
}
```

`SmartifyOsDeveloperOptions.enabledChanges` fires every time they're turned on or off, and
`developerOptionsEnabledProvider` does the same in a widget. If you let yourself fake something
from here, listen for them being turned off and stop faking it there.

## Faking things from code

The fakes on this page are also there for your own code, and only work while developer options
are on:

```dart
SmartifyOsNightMode.setNightModeOverride(true); // always night, null follows the car again
SmartifyOsGps.setFakePosition(latitude: 48.137, longitude: 11.575);
SmartifyOsGps.clearFakePosition();
```

See [Night Mode](../night-mode/using-night-mode.md) and [GPS](../gps/using-gps.md) for more.
