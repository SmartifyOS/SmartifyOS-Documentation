---
sidebar_position: 2
---

# Putting It Together

A short, complete example of adding one window to the app list in a real project, spread across
a few files the way `smartify_os_miata_app` (see [Example Project](../example-project/example-project.md))
does it: one file per concern, directly under `lib/`. `my_car_app` below stands for your own
project's name, whatever you gave it in its `pubspec.yaml`.

```dart title="lib/windows/doors_window.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/widgets.dart';

class DoorsWindow extends StatelessWidget {
  const DoorsWindow({super.key});

  @override
  Widget build(BuildContext context) {
    return const SmartifyOsWindow(
      title: 'Doors',
      child: Center(child: Text('All doors closed')),
    );
  }
}
```

```dart title="lib/app_list.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/app_list.dart';
import 'package:smartify_os_core/navigator.dart';
import 'package:my_car_app/windows/doors_window.dart';

/// The entries this car adds to the app list.
final myAppListEntries = <AppListEntry>[
  AppListEntry(
    id: 'doors',
    title: 'Doors',
    icon: const Icon(Icons.sensor_door),
    onOpen: (context) => SmartifyOsNavigator.push(context, const DoorsWindow()),
  ),
];
```

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/app_list.dart';
import 'package:smartify_os_core/backgrounds.dart';
import 'package:smartify_os_core/core.dart';
import 'package:my_car_app/app_list.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SmartifyOs().init(
    appList: AppListConfig(entries: myAppListEntries),
  );
  runApp(
    SmartifyOsApp(
      // See Backgrounds for the other options.
      background: ImageBackground(
        imageAssetPath: 'packages/smartify_os_core/assets/background.png',
      ),
    ),
  );
}
```

`main.dart` never has to know what a `DoorsWindow` looks like, only `app_list.dart` imports it.
Add another window later by writing its file, adding one `AppListEntry` to the list in
`app_list.dart`, and nothing in `main.dart` changes at all.

If a window needs its own settings page or home widget too, add those the same way, in
`settings_pages.dart` or `home_widgets.dart` alongside `app_list.dart`, each importing whatever
window files it needs. See their own "Putting It Together" pages for the same pattern.
