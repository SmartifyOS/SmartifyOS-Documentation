---
sidebar_position: 1
---

# Adding Quick Settings Tiles

The quick settings sit at the top of the shade the driver pulls down from the top of the screen.
They're for the handful of things you reach for while driving, without hunting through Settings:
the headlights, the doors, do not disturb. Each one is a `QuickSettingsTile`, and
`SmartifyOsQuickSettings` is how you manage them while the car runs.

Every tile is drawn from the one definition in a few places: as a round button in the strip at the
top of the shade, as a wider tile with its label once the shade is pulled further down, and on the
home screen if the layout or driver puts the quick settings widget there.

## The quick way

The CLI and the [editor](../editor/setting-up-your-car.md) make the file for you:

```bash
smartify-os tile create "Headlights" --kind switch
```

`--kind button` makes a tile that does the same thing every time instead. Either way you get
`lib/quick_settings/headlights_tile.dart`, already handed to SmartifyOS in `lib/main.dart`, and
you only fill in what it does. See [Windows, Tiles, Widgets and Settings](../cli/making-parts.md)
for renaming it or changing its icon later.

## A switch

A tile that turns something on and off:

```dart title="lib/quick_settings/headlights_tile.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/quick_settings.dart';

const headlightsTile = QuickSettingsTile.toggle(
  id: 'headlights',
  label: 'Headlights',
  icon: Icon(Icons.lightbulb),
  order: 10,
  onChanged: _switched,
);

/// Runs every time the tile is switched, with whether it is on now.
void _switched(QuickSettingsContext qs, bool on) {
  setHeadlights(on: on);
}
```

And in `lib/main.dart`:

```dart title="lib/main.dart"
await SmartifyOs().init(
  quickSettings: QuickSettingsConfig(tiles: [headlightsTile]),
);
```

`setHeadlights` stands for whatever your code does to talk to the car. The tile keeps track of
whether it's on by itself, so all you do is react in `onChanged`. It only remembers that for the
current drive, though, and it doesn't know if the headlights are switched some other way. For
either of those, see [Following the real thing](#following-the-real-thing).

## A button

A tile that does the same thing every time it's tapped:

```dart title="lib/quick_settings/lock_doors_tile.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/quick_settings.dart';

const lockDoorsTile = QuickSettingsTile.button(
  id: 'lock_doors',
  label: 'Lock doors',
  icon: Icon(Icons.lock),
  order: 20,
  onTap: _tapped,
);

/// Runs every time the tile is tapped.
void _tapped(QuickSettingsContext qs) {
  lockDoors();
}
```

## Following the real thing

If something else already knows whether the thing is on (your own code, a sensor, a `SavedValue`
the driver also changes in Settings), give the switch `isOn`. The tile then always shows what that
says instead of keeping track itself, even when it's changed from somewhere else. `isOn` gets a
`QuickSettingsContext`, whose `ref` follows a value of your own with `ref.watchValue` (see
[Values That Change](../saved-values.md)):

```dart
final headlightsOn = ValueNotifier(false);

final headlightsTile = QuickSettingsTile.toggle(
  id: 'headlights',
  label: 'Headlights',
  icon: const Icon(Icons.lightbulb),
  isOn: (qs) => qs.ref.watchValue(headlightsOn),
  onChanged: (qs, on) => setHeadlights(on: on),
);
```

Here `setHeadlights` switches the real lights, and whatever hears back from them sets
`headlightsOn.value`. Use a `SavedValue` instead of the `ValueNotifier` and the tile also keeps its
position between drives.

## Every option

| Parameters      |                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| **id**          | A short name that's unique across the quick settings, like `'headlights'`                |
| **label**       | The name under the tile, keep it to a word or two, tiles aren't wide                     |
| **icon**        | The glyph, usually `Icon(Icons.something)`. SmartifyOS sizes and colours it              |
| **onChanged**   | Switches only: runs every time it's switched, with whether it's on now                   |
| **onTap**       | Buttons only: runs every time it's tapped                                                |
| **isOn**        | Optional, switches only: whether it's on right now, see above. Leave it out and the tile keeps track itself |
| **iconOn**      | Optional, switches only: a different glyph while it's on. Leave it out and `icon` is used either way |
| **status**      | Optional, the small second line under the label, like `'Unlocked'`. Leave it out and a switch says On or Off, and a button says nothing |
| **onHold**      | Optional, what holding the tile does. This is where the fuller version of the same thing goes, the way holding Wi-Fi on a phone opens the Wi-Fi settings. Leave it out and holding does nothing |
| **visible**     | Optional, decides whether the tile is there right now. Leave it out and it shows until something hides it |
| **enabled**     | Optional, decides whether the tile can be used right now. A tile that says no is still there, greyed out and ignoring taps |
| **order**       | Optional, where it sits among the others, smaller comes first, defaults to `100`         |

`status`, `visible` and `enabled` get the same `QuickSettingsContext` as `isOn`, so they can follow a
value too. `onHold` is handy for opening a window: `qs.context` is the `BuildContext` it needs.

```dart
onHold: (qs) => SmartifyOsNavigator.push(qs.context, const LightsWindow()),
```

## Managing tiles while the car runs

Everything here works at any time, and the shade updates right away:

```dart
SmartifyOsQuickSettings.addTile(myTile);
SmartifyOsQuickSettings.addTiles([firstTile, secondTile]);
SmartifyOsQuickSettings.removeTile('headlights');
SmartifyOsQuickSettings.showTile('headlights');
SmartifyOsQuickSettings.hideTile('headlights');
SmartifyOsQuickSettings.hasTile('headlights');
SmartifyOsQuickSettings.isTileActive('headlights'); // registered and not hidden
SmartifyOsQuickSettings.tiles; // every tile there is
```

For a switch that keeps track itself, you can also move it from your own code, for when the thing
it controls changed some other way. This only moves the switch, it doesn't run `onChanged`:

```dart
SmartifyOsQuickSettings.setTileOn('headlights', true);
SmartifyOsQuickSettings.toggleTile('headlights');
SmartifyOsQuickSettings.isTileOn('headlights');
```

None of these throw. An `id` that isn't registered is logged and skipped, and hiding, showing or
switching a tile before it's added still works, so the order you set things up in doesn't matter.

## Leaving built-in tiles out

`QuickSettingsTiles` names the tiles SmartifyOS brings along: `QuickSettingsTiles.doNotDisturb`
(silences pop-ups and their sounds, see [Do not disturb](../notifications/sending-notifications.md#do-not-disturb))
and `QuickSettingsTiles.bluetooth` (only shown where the car can switch its Bluetooth itself).
Leave either out with `hiddenTiles`:

```dart
await SmartifyOs().init(
  quickSettings: const QuickSettingsConfig(
    hiddenTiles: {QuickSettingsTiles.bluetooth},
  ),
);
```

The volume bar and the power button at the top of the shade aren't tiles, see
[Using Volume](../volume/using-volume.md) and [Switching Off](../power/switching-off.md).
