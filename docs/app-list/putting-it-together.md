---
sidebar_position: 2
---

# Putting It Together

A complete example of one window in the app list, in the exact files `smartify-os window create`
makes. The [example app](../example-project/example-project.md) is laid out the same way, so
anything you find there fits into your own car's app the same way too.

`smartify_os_my_car_app` below stands for your own app's name, the `name:` at the top of its `pubspec.yaml`.

Every window gets a file of its own in `lib/windows/`, with its app list entry kept next to it:

```dart title="lib/windows/doors_window.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/app_list.dart';
import 'package:smartify_os_core/navigator.dart';
import 'package:smartify_os_core/widgets.dart';

/// Shows which doors are open.
class DoorsWindow extends StatelessWidget {
  const DoorsWindow({super.key});

  /// What it's called, at the top of the window and under its icon.
  static const title = 'Doors';

  /// Its icon in the app list. lib/main.dart hands it to SmartifyOS.
  static final appListEntry = AppListEntry(
    id: 'doors',
    title: title,
    icon: const Icon(Icons.sensor_door),
    order: 10,
    onOpen: (context) => SmartifyOsNavigator.push(context, const DoorsWindow()),
  );

  @override
  Widget build(BuildContext context) {
    return const SmartifyOsWindow(
      title: title,
      child: Center(child: Text('All doors closed')),
    );
  }
}
```

`lib/main.dart` imports the window and hands its entry to SmartifyOS. Everything else your app sets
up stays as it was:

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/windows/doors_window.dart';
import 'package:smartify_os_core/app_list.dart';
import 'package:smartify_os_core/core.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SmartifyOs().init(
    // Your own windows, each with its icon in the app list.
    appList: AppListConfig(entries: [DoorsWindow.appListEntry]),
  );

  runApp(const SmartifyOsApp());
}
```

That's the whole pattern. `main.dart` never needs to know what the doors window looks like, only
that it has an entry. The next window is one more file in `lib/windows/` and one more item in the
`entries` list, which is exactly what the CLI does for you each time you run
`smartify-os window create`.

To have the doors window start in the dock as well, add its `id` to the dock apps (see
[The Bar](../layouts/the-bar.md)):

```dart title="lib/main.dart"
bar: const BarConfig(
  content: BarContent.infoDisplayAndDock(),
  dockApps: ['doors', AppListEntries.settings],
),
```
