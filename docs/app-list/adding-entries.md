---
sidebar_position: 1
---

# Adding App List Entries

The app list is the grid of apps the driver opens from the bar. Every window you want the driver
to reach has an icon there, an `AppListEntry`, and `SmartifyOsAppList` is how you manage them.

## The quick way

You rarely write an entry by hand. When you make a window with the CLI or the
[editor](../editor/setting-up-your-car.md), its entry comes with it:

```bash
smartify-os window create "Trip computer"
```

This makes `lib/windows/trip_computer_window.dart` and hands its entry to SmartifyOS in
`lib/main.dart`. See [Windows, Tiles, Widgets and Settings](../cli/making-parts.md) for the
other options, like changing its icon or order later.

## What an entry looks like

The window file the CLI makes keeps its entry right next to the window, as a `static` field called
`appListEntry`:

```dart title="lib/windows/trip_computer_window.dart"
class TripComputerWindow extends StatelessWidget {
  const TripComputerWindow({super.key});

  static const title = 'Trip computer';

  static final appListEntry = AppListEntry(
    id: 'trip_computer',
    title: title,
    icon: const Icon(Icons.speed),
    order: 10,
    onOpen: (context) =>
        SmartifyOsNavigator.push(context, const TripComputerWindow()),
  );

  // ... build() draws the window, see Creating Windows
}
```

And `lib/main.dart` hands it to SmartifyOS when the car starts:

```dart title="lib/main.dart"
await SmartifyOs().init(
  appList: AppListConfig(entries: [TripComputerWindow.appListEntry]),
);
```

| Parameters             |                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **id**                 | A short name that's unique across the app list, like `'trip_computer'`. The dock and everything below use it |
| **title**              | The name under the icon                                                                 |
| **icon**               | The icon, usually `const Icon(Icons.something)`, though an `Image.asset` works too       |
| **onOpen**             | What tapping it does. Almost always opens your window with `SmartifyOsNavigator.push` (see [Opening Windows](../windows/opening-windows.md)) |
| **order**              | Optional, where it sits in the grid, smaller comes first. Defaults to `100`. The built-in apps use 700 and up, so yours come first unless you say otherwise |
| **visible**            | Optional, decides whether the icon is there at all right now, see [Showing it only sometimes](#showing-it-only-sometimes). Leave it out and the icon is always there |
| **closeAppListOnOpen** | Optional, defaults to `true`, so the app list closes before your window opens and closing the window brings the driver back to the home screen. Set it to `false` to come back to the app list instead |

## Showing it only sometimes

`visible` is for an app that only makes sense some of the time, a dashcam that's only there while
it's plugged in, say. It gets an `AppListContext`, which carries a `ref` for following a value that
changes while the car runs. Point it at a `ValueNotifier` or a `SavedValue` with `ref.watchValue`
and the icon comes and goes on its own (see [Values That Change](../saved-values.md)):

```dart
final dashcamPluggedIn = ValueNotifier(false);

AppListEntry(
  id: 'dashcam',
  title: 'Dashcam',
  icon: const Icon(Icons.videocam),
  visible: (apps) => apps.ref.watchValue(dashcamPluggedIn),
  onOpen: (context) => SmartifyOsNavigator.push(context, const DashcamWindow()),
)
```

Now `dashcamPluggedIn.value = true;` from anywhere in your app puts the icon in the grid.

## Opening an entry from code

To open an app from somewhere else (a button of your own, a physical button on the dashboard),
open its entry rather than pushing the window yourself:

```dart
SmartifyOsAppList.openEntry(context, 'trip_computer');
```

This does exactly what tapping the icon does. If that window is already open, under some other
window say, it's brought back to the front instead of a second copy opening on top. It works on a
hidden entry too.

```dart
SmartifyOsAppList.isEntryOpen('trip_computer');    // open somewhere among the windows
SmartifyOsAppList.isEntryInFront('trip_computer'); // the window the driver is looking at
```

## The dock

If the layout has a dock in its bar (see [The Bar](../layouts/the-bar.md)), the driver can hold an
app in the app list to put it in the dock or take it out again. Which apps start out there is up to
you, by their `id`, in `BarConfig.dockApps`.

## Adding and removing entries while the car runs

Entries don't have to be known when the car starts. Everything here works at any time, and the
app list updates right away, even while it's open:

```dart
SmartifyOsAppList.addEntry(myEntry);
SmartifyOsAppList.addEntries([firstEntry, secondEntry]);
SmartifyOsAppList.removeEntry('trip_computer');
SmartifyOsAppList.hideEntry('trip_computer'); // out of the grid, still there
SmartifyOsAppList.showEntry('trip_computer');
SmartifyOsAppList.hasEntry('trip_computer');
SmartifyOsAppList.entries; // every entry there is
```

None of these throw. An `id` that isn't registered is logged and skipped, since a typo should never
stop a car from starting. You can even hide an entry before it's added, so the order you set
things up in doesn't matter.

## Leaving built-in apps out

`AppListEntries` names the apps SmartifyOS brings along:

| Entry                           |                                                                             |
| ------------------------------- | --------------------------------------------------------------------------- |
| `AppListEntries.settings`       | Settings                                                                    |
| `AppListEntries.homeWidgets`    | Straight to picking which widgets sit where on the home screen              |
| `AppListEntries.filePlayer`     | Music from USB sticks, only there on a car that can play it (see [The File Player](../music/file-player.md)) |
| `AppListEntries.reverseCamera`  | The reverse camera, only there on a car that has one (see [Using the Reverse Camera](../reverse-camera/using-the-reverse-camera.md)) |

Leave any of them out with `hiddenEntries`:

```dart
await SmartifyOs().init(
  appList: const AppListConfig(hiddenEntries: {AppListEntries.homeWidgets}),
);
```

Hiding Settings leaves the driver no way into it, so only do that if you open it from somewhere
else yourself.

## Opening and closing the app list

```dart
SmartifyOsAppList.open(context); // closes it again if it's already open
SmartifyOsAppList.close();
```

This is what the app list button in the bar does, and what a physical button for it should call
(see [Using Focus](../focus/using-focus.md)).
