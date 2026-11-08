---
sidebar_position: 3
---

# Making a Layout

If none of the built-in layouts fit your car, you can make your own. A layout is a
`SmartifyOsLayout`, and it's mostly deciding what goes where: SmartifyOS gives you ready-made
blocks (the car, an area of home widgets, the info display, the dock), and you arrange them with
Flutter's own `Row`, `Column` and `Expanded`. What each block looks like (colours, glass, corners,
the gaps between panels) comes from the [theme](../theme/picking-a-theme.md), so one layout works
with every theme.

## The parts of a layout

A layout draws the screen in three layers, back to front:

| Layer          |                                                                         |
| -------------- | ----------------------------------------------------------------------- |
| **background** | Optional, behind everything, the status bar and every window included. A `CarView` for a car filling the screen, an `ImageBackground` for a picture, or nothing for the theme's plain screen colour |
| **home**       | The home screen, under the status bar. Windows open on top of it        |
| **bar**        | Optional, a `LayoutBar` along one edge that stays on screen above the home screen, see [The Bar](./the-bar.md) |

## A worked example

The example app (see [Example Project](../example-project/example-project.md)) has a layout of its
own in `lib/layouts.dart`: the car in a big panel on the driver's side, and two areas of widgets
next to it, with the bar along the bottom. Here it is, a little shortened:

```dart title="lib/layouts.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/layouts.dart';
import 'package:smartify_os_example_app/theme.dart';

final exampleLayouts = <SmartifyOsLayout>[
  SmartifyOsLayout(
    id: 'example_side_by_side',
    title: 'Side by side',
    description: 'The car and the engine gauge side by side',
    theme: const SunsetTheme(),
    statusBar: StatusBarStyle.floating,

    home: (layout) => Padding(
      padding: EdgeInsets.fromLTRB(layout.padding, 0, layout.padding, layout.gap),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        // Written the way it looks with the driver on the left.
        // `mirror` swaps it round for a right-hand drive car.
        children: layout.mirror([
          const Expanded(flex: 3, child: LayoutPanel(child: CarView())),
          layout.gapBox,
          Expanded(
            flex: 2,
            child: Column(
              children: [
                const Expanded(
                  child: HomeWidgetArea(
                    id: 'engine',
                    title: 'Engine',
                    widgets: ['engine'],
                  ),
                ),
                layout.gapBox,
                const Expanded(
                  child: HomeWidgetArea(
                    id: 'cards',
                    title: 'Cards',
                    cards: true,
                    widgets: [HomeWidgets.clock],
                  ),
                ),
              ],
            ),
          ),
        ]),
      ),
    ),

    bar: LayoutBar(
      edge: BarEdge.bottom,
      builder: (layout) => Padding(
        padding: EdgeInsets.fromLTRB(layout.padding, 0, layout.padding, layout.padding),
        child: const LayoutPanel(
          padding: EdgeInsets.all(8),
          child: BarContents(),
        ),
      ),
    ),
  ),
];
```

Then hand it to SmartifyOS in `lib/main.dart`. It shows up in Settings, Appearance next to the
built-in ones, and `layout` makes it the one the car starts with:

```dart title="lib/main.dart"
await SmartifyOs().init(
  layouts: LayoutsConfig(
    layout: 'example_side_by_side',
    layouts: exampleLayouts,
  ),
);
```

You can also add one later with `SmartifyOsLayouts.addLayout(...)`. The full version in the
example app also stacks everything in a `Column` when the screen stands upright
(`layout.isPortrait`), have a look at it once this one makes sense.

## SmartifyOsLayout

| Parameters      |                                                                    |
| --------------- | ------------------------------------------------------------------ |
| **id**          | A short name, unique among all layouts, for example `'my_layout'`. `LayoutsConfig.layout` and the driver's pick use it |
| **title**       | The name the driver reads in Settings, Appearance                  |
| **home**        | Builds the home screen                                             |
| **description** | Optional, a short line under the title in Settings saying what the layout is for |
| **order**       | Optional, where it sits among the layouts in Settings, lower is earlier, defaults to `100` (the built-in ones are below that) |
| **theme**       | Optional, the theme the layout was designed with. The car wears it while the driver hasn't picked a theme of their own. Leave it out and SmartifyOS's default look is used |
| **statusBar**   | Optional, `StatusBarStyle.panel` (a panel across the whole width, the default) or `StatusBarStyle.floating` (only the clock and icons, straight on what's behind them, which suits panels with gaps between them) |
| **background**  | Optional, builds what's drawn behind everything                     |
| **bar**         | Optional, the `LayoutBar`, leave it out for a layout with no bar    |

`home`, `background` and the bar's `builder` all receive a `LayoutContext`, called `layout` in the
examples, with what a layout needs while it's being built:

| Member                 |                                                                |
| ---------------------- | -------------------------------------------------------------- |
| **layout.padding**     | The space between the edge of the screen and the panels, from the theme |
| **layout.gap**         | The space between two panels, from the theme                   |
| **layout.gapBox**      | An empty box the size of `gap`, to put between the panels of a `Row` or `Column` |
| **layout.mirror(...)** | Gives a list of widgets back as it is for a left-hand drive car, and back to front for a right-hand drive one |
| **layout.driverSide**  | Which side the driver sits on, if you need more than `mirror`  |
| **layout.isPortrait**  | Whether the screen is taller than it is wide                    |
| **layout.context**     | The normal Flutter `BuildContext`                               |

Always use `padding` and `gap` rather than numbers of your own, so a theme with roomy corners and
a dense theme both look right. And always write a `Row` with `mirror`, so the layout works for a
right-hand drive car without a second version.

### LayoutBar

| Parameters           |                                                               |
| -------------------- | ------------------------------------------------------------- |
| **builder**          | Builds the bar. Draw its background too, with a `LayoutPanel`, SmartifyOS draws nothing around it |
| **edge**             | Optional, `BarEdge.bottom` (the default), `.left`, `.right`, or `.driverSide` for down whichever side the driver sits on |
| **staysOverWindows** | Optional, defaults to `false`, which slides the bar away when a window opens. Turn it on for a sidebar that stays next to whatever app is open |
| **overlapsHome**     | Optional, defaults to `false`, which lays the home screen out in the space the bar leaves. Turn it on for a bar that only takes a corner, over a car that fills the background |

The bar is offered the whole length of its edge. One that should only take a corner lines itself
up there with an `Align`. Whatever room it ends up taking, the home screen, windows, dialogs and
toasts all keep clear of it on their own.

## The blocks

Everything below comes from `package:smartify_os_core/layouts.dart`.

### CarView

The car, in 3D, as a 2D drawing or as a picture, whichever your `CarConfig` gives and the driver
picked. Put it in a `LayoutPanel` for a car in a panel, or in `background` for a car behind
everything. The car itself is set up once, see [Showing the Car](../car/showing-the-car.md).

```dart
const LayoutPanel(child: CarView())
```

`interactive: false` stops dragging across it from turning the 3D car, which is what you want for
a car in the background, where a `CarSpace` does the turning instead.

### CarSpace

Marks where a car drawn in the background should sit. A background `CarView` fills the whole
screen, but the car itself shouldn't end up behind a card. Leave a `CarSpace` where it should be,
and the car shrinks to fit it and moves into its middle. This is how the classic layout works:

```dart
SmartifyOsLayout(
  id: 'my_classic',
  title: 'My classic',
  background: (layout) => const CarView(interactive: false),
  home: (layout) => const Column(
    children: [
      HomeWidgetArea(id: 'top', cards: true, collapsible: true),
      // Grows while the cards are away, and the car moves with it.
      Expanded(child: CarSpace()),
    ],
  ),
)
```

Dragging across a `CarSpace` turns the car, and holding it lets the driver change the home
screen's widgets.

### HomeWidgetArea

A place that shows [home widgets](../home-widgets/adding-widgets.md), one at a time. The driver
swipes sideways through them and holds the area to choose which widgets sit in it.

```dart
const HomeWidgetArea(
  id: 'cards',
  title: 'Cards',
  cards: true,
  widgets: [HomeWidgets.clock],
)
```

| Parameters      |                                                                  |
| --------------- | ---------------------------------------------------------------- |
| **id**          | A short name, unique within this layout. The driver's choice of widgets is saved under it |
| **title**       | Optional, what the driver reads for this area in Settings, Appearance, for example `'Top right'`. Leave it out and they read the `id` |
| **widgets**     | Optional, the widgets that sit here until the driver changes them, by id. `HomeWidgets` has the ones SmartifyOS ships (`clock`, `quickSettings`, `infoDisplay`, `car`, ...) |
| **cards**       | Optional, whether this is where cards show up (what's playing, a door that's open). Give exactly one area in each layout this, defaults to `false` |
| **collapsible** | Optional, whether the area is only as tall as its cards and slides away when it has nothing to show, rather than filling its box. Put it in a `Column` next to a `CarSpace` and the car moves into the room it leaves. Defaults to `false` |
| **padding**     | Optional, room around the cards, which goes away with them in a collapsible area |
| **editable**    | Optional, whether holding the area lets the driver pick its widgets, defaults to `true` |

### InfoDisplay

The speed and friends: one big number, a small one under it, and a tap to move on to the next
pair, see [Info Display](../info-display/adding-values.md). It sizes its text to whatever box it's
given and draws no panel, so put it in a `LayoutPanel`. You rarely need it on its own, since
`BarContents` already has one.

```dart
const LayoutPanel(child: InfoDisplay())
```

Give it a `display` name (`InfoDisplay(display: 'passenger')`) for a second display that keeps its
own place, showing the engine speed while the one in the bar shows the speed, say.

### BarContents

Whatever `BarConfig` says belongs in the bar (the info display, the app list button, the dock),
laid out along it. Use this inside your `LayoutBar` and your layout works with every bar choice
without caring which one the car picked. Pass `axis: Axis.vertical` in a bar down the side.

### Dock and AppListButton

The two halves of a dock, for a layout that arranges the bar itself rather than using
`BarContents`. `Dock` is the driver's apps in a row (or a column with `axis: Axis.vertical`), and
`AppListButton` opens the app list. Every layout needs an `AppListButton` somewhere, since it's
the way to everything else. `BarContents` has both already.

```dart
Row(
  mainAxisSize: MainAxisSize.min,
  children: layout.mirror([
    const AppListButton(),
    const Dock(padding: EdgeInsets.only(left: 8)),
  ]),
)
```

### LayoutPanel

The theme's surface, border and corners around whatever you put in it. Most blocks draw no
background of their own, so wrap them in one.

```dart
// Pushed into the bottom left corner: no border and no rounding against the screen's edges.
const LayoutPanel(
  attachedTo: {ScreenEdge.left, ScreenEdge.bottom},
  child: InfoDisplay(),
)
```

| Parameters        |                                                                  |
| ----------------- | ---------------------------------------------------------------- |
| **child**         | What's in the panel, clipped to its shape                        |
| **padding**       | Optional, room between the panel's edge and `child`              |
| **attachedTo**    | Optional, the edges of the screen it's pushed up against. Those sides lose their border and the corners touching them their rounding, so the panel looks like it grows out of the edge |
| **radius**        | Optional, how round the free corners are, defaults to the theme's own |
| **width**/**height** | Optional, a fixed size. Leave them out and it's as big as the box it's given (an `Expanded`, say), or as its child |

### BarSafeArea

Keeps what's inside it clear of the bar while the bar is on screen, the way Flutter's `SafeArea`
keeps clear of a phone's notch. Windows, dialogs and toasts already do this on their own, so you
only need it for something of your own that floats over the screen.

```dart
BarSafeArea(child: Center(child: MyPopup()))
```

### ImageBackground

A picture behind everything, for `background`:

```dart
background: (layout) => const ImageBackground(imageAssetPath: 'assets/background.png'),
```

The picture has to be listed under `flutter: assets:` in your `pubspec.yaml`.

## Checking it

Before you settle on a layout, try it every way a car could use it: both driver sides
(`smartify-os appearance --driver-side right`), every bar choice (`--bar info-display`, `dock` and
`both`), a few themes, and a screen standing upright if yours ever could. Nothing should overflow or
end up under the bar in any of them.
