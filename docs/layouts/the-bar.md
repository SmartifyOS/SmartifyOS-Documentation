---
sidebar_position: 2
---

# The Bar

The bar is the strip along the edge of the screen that stays put while windows open and close. It
holds the info display (the speed, and whatever else you show there), the button that opens the
app list, and a dock of the driver's favourite apps. Where the bar sits and what it looks like is
up to the [layout](./picking-a-layout.md). **What** is in it is up to you, with `BarConfig`, and
it's the same in every layout.

## Choosing what's in it

There are three choices, plus one for building your own:

| Content                              |                                                         |
| ------------------------------------ | ------------------------------------------------------- |
| `BarContent.infoDisplay()`           | The info display and the app list button. The default    |
| `BarContent.dock()`                  | The app list button and a row of apps, like the dock on a computer, with no info display |
| `BarContent.infoDisplayAndDock()`    | All of it                                               |
| `BarContent.custom(builder: ...)`    | Something you build yourself, see below                 |

The CLI asked about it when you made your car, and changes it any time:

```bash
smartify-os appearance --bar both
```

`--bar` takes `info-display`, `dock` or `both`. The Screen page of the
[editor](../editor/setting-up-your-car.md) has the same choice. In `lib/main.dart` it looks like
this:

```dart title="lib/main.dart"
await SmartifyOs().init(
  bar: const BarConfig(
    content: BarContent.infoDisplayAndDock(),
    dockApps: ['trip_computer', AppListEntries.settings],
  ),
);
```

| Parameters                |                                                                  |
| ------------------------- | ---------------------------------------------------------------- |
| **content**               | Optional, what sits in the bar, defaults to `BarContent.infoDisplay()` |
| **dockApps**              | Optional, the apps the dock starts with, by the `id` of their app list entry, in order. Up to six, defaults to none |
| **reachableWithoutTouch** | Optional, defaults to `true`. Whether a [physical control](../focus/using-focus.md) can reach the bar: on the home screen, the highlight goes on into the bar after the home widgets. Turn it off if your car has its own button for the app list and you'd rather the knob stayed with the widgets |

What the info display shows is set up separately, see
[Info Display](../info-display/adding-values.md).

## The dock

`dockApps` is only where the dock starts. The driver changes it themselves: holding an app in the
app list adds it to the dock, and holding one in the dock picks it up, to drag it somewhere else
along the dock or off it to take it out. Their pick is remembered between drives.

An app in the dock opens just like tapping it in the app list, and if its window is already open,
it comes back to the front instead of opening twice.

You can change the dock from your own code too:

```dart
SmartifyOsBar.addDockApp('trip_computer');
SmartifyOsBar.removeDockApp('trip_computer');
SmartifyOsBar.setDockApps(['trip_computer', 'stopwatch']);
SmartifyOsBar.resetDockApps(); // back to BarConfig.dockApps
SmartifyOsBar.hasDockApp('trip_computer');
```

`addDockApp` returns `false` when the dock is already full (`SmartifyOsBar.maxDockApps`). An app
that isn't in the app list is simply not drawn, so the order you set things up in never matters.

## Changing it while the car runs

```dart
SmartifyOsBar.setContent(const BarContent.dock());
SmartifyOsBar.content; // what's in the bar now
```

## A bar of your own

`BarContent.custom` puts whatever you build into the bar instead. The layout still puts it in
place, draws the panel around it and slides it away under fullscreen windows, the rest is yours:

```dart
await SmartifyOs().init(
  bar: BarConfig(
    content: BarContent.custom(
      builder: (bar) => Row(
        children: [
          const AppListButton(),
          // oilTemperature is a ValueNotifier of your own.
          Text('Oil ${bar.ref.watchValue(oilTemperature)} °C'),
        ],
      ),
    ),
  ),
);
```

`builder` receives a `BarContext` with a `context`, a `ref` (see
[Values That Change](../saved-values.md) for `ref.watchValue`) and an `axis`, which says whether
the bar runs across the bottom (`Axis.horizontal`) or down the side (`Axis.vertical`), so you can
lay yours out along it.

There's no app list button in a custom bar unless you add one, so don't forget the
`AppListButton`, it's the way to every app. Keep it under 100 pixels deep, that's about what every
layout has room for.

## Windows and the bar

Most layouts slide the bar away when a fullscreen window opens, and bring it back when the last one
closes. A sidebar layout keeps it next to the window instead. A window can overrule its layout with
`hideBar`, see [Creating Windows](../windows/creating-windows.md#fullscreen-windows).
