---
sidebar_position: 1
---

# Picking a Layout

A layout is how the whole screen is arranged: where the car is, where the home widgets go, and
where the bar with the speed and the apps sits. SmartifyOS ships with several, and you pick the
one your car starts with in `LayoutsConfig`. The driver can switch to any other in Settings,
Appearance, and SmartifyOS remembers their pick.

## The built-in layouts

| Layout              |                                                                         |
| ------------------- | ----------------------------------------------------------------------- |
| `Layouts.classic`   | The car fills the screen, cards slide in along the top and push it down, and the speed sits in the corner by the driver. The default |
| `Layouts.split`     | The car in a panel on the driver's side, the quick settings and cards next to it, and a bar along the bottom |
| `Layouts.sidebar`   | A bar down the driver's side that stays next to open apps, with the car and a column of widgets beside it |
| `Layouts.tiles`     | A grid of widgets like a phone's home screen, the car in one of them    |
| `Layouts.focus`     | The speed, big, and very little else, for keeping your eyes on the road |
| `Layouts.portrait`  | For a screen standing upright: the car on top, widgets under it          |

Each one comes with the [theme](../theme/picking-a-theme.md) it was designed with, so picking a
layout also picks its look until the driver chooses a theme of their own.

## Choosing one

The easiest way is to let the CLI or the editor change it for you. `smartify-os create` already
asked when you made your car, and you can change your mind any time:

```bash
smartify-os appearance --layout split --driver-side right
```

Run `smartify-os appearance` with no flags and it asks instead. In the
[editor](../editor/setting-up-your-car.md), the Screen page under Setup in the car panel does the
same, and the preview changes as you click.

Both write it into `lib/main.dart`, where it looks like this:

```dart title="lib/main.dart"
await SmartifyOs().init(
  layouts: const LayoutsConfig(
    layout: Layouts.split,
    driverSide: DriverSide.right,
  ),
);
```

| Parameters        |                                                                     |
| ----------------- | ------------------------------------------------------------------- |
| **layout**        | Optional, the layout the car starts with, defaults to `Layouts.classic` |
| **driverSide**    | Optional, `DriverSide.left` or `DriverSide.right`, defaults to `.left`. Every built-in layout puts what the driver reaches for (the speed, the apps) on this side, so a right-hand drive car only says so here |
| **layouts**       | Optional, layouts of your own, offered next to the built-in ones, see [Making a Layout](./making-a-layout.md) |
| **hiddenLayouts** | Optional, layouts to leave out of the ones the driver can pick, for example `{Layouts.portrait}` on a screen that lies flat. Hide all but one and the driver isn't offered a choice at all |

`layout` is only where the car starts. Once the driver picks another one in Settings, Appearance,
theirs wins from then on.

## Changing it while the car runs

`SmartifyOsLayouts` changes the layout from your own code, exactly as the driver would in
Settings:

```dart
SmartifyOsLayouts.selectLayout(Layouts.focus);
SmartifyOsLayouts.resetLayout(); // back to the one from LayoutsConfig
```

Say your car has a sport mode button, and in sport mode you only want the speed on screen:
`selectLayout(Layouts.focus)` when it's pressed, `resetLayout()` when it's pressed again.

```dart
SmartifyOsLayouts.currentLayout; // the layout on screen now
SmartifyOsLayouts.layouts;       // the ones the driver can pick from
SmartifyOsLayouts.hideLayout(Layouts.tiles);
SmartifyOsLayouts.showLayout(Layouts.tiles);
SmartifyOsLayouts.setDriverSide(DriverSide.right);
```

None of these throw. A layout name that doesn't exist is logged and worked around, a typo should
never stop a car.

## What else goes with a layout

- What sits in the bar (the speed, a dock of apps, or both) is the same in every layout, and set
  up separately, see [The Bar](./the-bar.md).
- The car the layout shows is set up once with `CarConfig`, see
  [Showing the Car](../car/showing-the-car.md).
- Which widgets sit in each area of the home screen is up to the driver (they hold an area to
  change it), see [Home Widgets](../home-widgets/adding-widgets.md).
