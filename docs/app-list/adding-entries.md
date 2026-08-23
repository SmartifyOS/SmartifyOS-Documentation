---
sidebar_position: 1
---

# Adding App List Entries

The app list is the drawer of apps the user can open. To add your window to it you need to use
`SmartifyOsAppList`.

```dart
SmartifyOsAppList.addEntry(
  AppListEntry(
    id: 'my_window',
    title: 'My Window',
    icon: const Icon(Icons.crop_square),
    order: 10,
    onOpen: (context) => SmartifyOsNavigator.push(context, const MyWindow()),
  ),
);
```

| Parameters              |                                                                        |
| -------------------------- | ------------------------------------------------------------------------ |
| **id**                     | Unique id for the entry                                                  |
| **title**                  | Shown under the icon                                                     |
| **icon**                   | The entry's icon widget                                                  |
| **onOpen**                 | Called when the user taps the entry, this is where you push your window |
| **order**                  | Optional, where it sits relative to other entries, lower is earlier, defaults to `100` |
| **visible**                | Optional, return `false` to hide the entry depending on app state        |
| **closeAppListOnOpen**     | Optional, whether opening the entry closes the app list, defaults to `true` |

`visible` receives an `AppListContext` with a `context` and a `ref`, so you can gate an entry on
a value that changes while the car is running, see [Riverpod Basics](../riverpod-basics.md) if
you haven't used that before.

## Managing existing entries

```dart
SmartifyOsAppList.removeEntry('my_window');
SmartifyOsAppList.hideEntry('my_window');
SmartifyOsAppList.showEntry('my_window');
SmartifyOsAppList.hasEntry('my_window');
```

None of these throw, an id that isn't registered is logged and worked around.

You can also add several entries at once with `SmartifyOsAppList.addEntries(...)`, and read the
current list with `SmartifyOsAppList.entries`.

## Hiding built-in entries

`AppListEntries` names the entries SmartifyOS ships with (just `settings` for now). Leave one
out at startup with `AppListConfig.hiddenEntries`:

```dart
await SmartifyOs().init(
  appList: const AppListConfig(hiddenEntries: {AppListEntries.settings}),
);
```

Hiding Settings leaves no way into it, so only do that if you open it yourself from somewhere
else.

## Opening and closing the app list

```dart
SmartifyOsAppList.open(context);
SmartifyOsAppList.close();
```

`open` toggles it closed again if it's already open.
