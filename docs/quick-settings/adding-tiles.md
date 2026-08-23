---
sidebar_position: 1
---

# Adding Quick Settings Tiles

Quick settings live at the top of the shade you pull down from the edge of the screen. They're
for the handful of things you reach for while driving without hunting through Settings: the
interior light, the doors, do not disturb. To add a tile you use `SmartifyOsQuickSettings`. Every
tile is drawn twice from one definition: as a round glyph in the strip at the top of the shade,
and as a wide tile with its label and status once the shade is expanded.

## Buttons

A tile that does the same thing every time it's tapped.

```dart
SmartifyOsQuickSettings.addTile(
  QuickSettingsTile.button(
    id: 'trunk',
    label: 'Open Trunk',
    icon: const Icon(Icons.directions_car),
    onTap: (qs) => openTrunk(),
  ),
);
```

## Toggles

A tile that switches something on and off. It remembers its own position, so there's nothing
else to wire up.

```dart
QuickSettingsTile.toggle(
  id: 'interior_light',
  label: 'Interior Light',
  icon: const Icon(Icons.lightbulb),
  onChanged: (qs, on) => setInteriorLight(on),
)
```

If the thing being switched already knows whether it's on, say so with `isOn` and the tile
follows that instead of remembering:

```dart
QuickSettingsTile.toggle(
  id: 'lights',
  label: 'Lights',
  icon: const Icon(Icons.lightbulb),
  isOn: (qs) => qs.ref.watch(lightsProvider),
  onChanged: (qs, on) => setLights(on),
  onHold: (qs) => SmartifyOsNavigator.push(qs.context, const LightsWindow()),
)
```

`onHold` is for the fuller version of the same thing, the way holding Wi-Fi on a phone opens the
Wi-Fi settings. `isOn`, like `visible` below, receives a `QuickSettingsContext` with a `context`
and a `ref`, so it can watch a value that changes while the car is running, see
[Riverpod Basics](../riverpod-basics.md) if you haven't used that before.

## Common fields

| Parameters      |                                                                          |
| ------------------- | ------------------------------------------------------------------------- |
| **id**              | Unique id for the tile                                                    |
| **label**           | Shown under the glyph once the shade is expanded, keep it to a word or two |
| **icon**            | The glyph, SmartifyOS sizes and colors it for you                         |
| **iconOn**          | Optional, toggle only, a different glyph to show while on, leave it out and `icon` is used either way |
| **status**          | Optional, the small second line under the label, a toggle without one says On/Off, a button without one says nothing |
| **onHold**          | Optional, runs when the tile is held down                                 |
| **visible**         | Optional, return `false` to hide the tile depending on app state          |
| **enabled**         | Optional, return `false` to grey the tile out and ignore taps             |
| **order**           | Optional, where it sits among the others, lower is earlier, defaults to `100` |

## Managing existing tiles

```dart
SmartifyOsQuickSettings.removeTile('interior_light');
SmartifyOsQuickSettings.showTile('interior_light');
SmartifyOsQuickSettings.hideTile('interior_light');
SmartifyOsQuickSettings.hasTile('interior_light');
SmartifyOsQuickSettings.isTileActive('interior_light');
```

For a toggle, you can also move the switch from your own code, for when the thing it controls
changed some other way. This only moves the switch, it doesn't run the tile's `onChanged`:

```dart
SmartifyOsQuickSettings.setTileOn('interior_light', true);
SmartifyOsQuickSettings.toggleTile('interior_light');
SmartifyOsQuickSettings.isTileOn('interior_light');
```

None of these throw, an id that isn't registered is logged and worked around. You can also add
several tiles at once with `SmartifyOsQuickSettings.addTiles(...)`, and read the current list
with `SmartifyOsQuickSettings.tiles`.

## Hiding built-in tiles

`QuickSettingsTiles` names the tiles SmartifyOS ships with: `doNotDisturb` and `bluetooth`.
Leave one out at startup with `QuickSettingsConfig.hiddenTiles`:

```dart
await SmartifyOs().init(
  quickSettings: const QuickSettingsConfig(hiddenTiles: {QuickSettingsTiles.bluetooth}),
);
```
