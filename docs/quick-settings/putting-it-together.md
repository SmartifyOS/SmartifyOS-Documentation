---
sidebar_position: 2
---

# Putting It Together

A short, complete example of adding a quick settings tile in a real project, spread across a few
files the way `smartify_os_miata_app` (see [Example Project](../example-project/example-project.md))
does it: one file per concern, directly under `lib/`. `my_car_app` below stands for your own
project's name, whatever you gave it in its `pubspec.yaml`.

```dart title="lib/quick_settings.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/quick_settings.dart';

/// The quick settings tiles this car adds.
final myQuickSettingsTiles = <QuickSettingsTile>[
  QuickSettingsTile.button(
    id: 'trunk',
    label: 'Open Trunk',
    icon: const Icon(Icons.directions_car),
    onTap: (qs) => myCar.openTrunk(),
  ),
];
```

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/backgrounds.dart';
import 'package:smartify_os_core/core.dart';
import 'package:smartify_os_core/quick_settings.dart';
import 'package:my_car_app/quick_settings.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SmartifyOs().init(
    quickSettings: QuickSettingsConfig(tiles: myQuickSettingsTiles),
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

`myCar` above stands in for however your own code talks to the car, a class of your own, a
service, whatever you already have. Add another tile later by adding one more `QuickSettingsTile`
to the list in `quick_settings.dart`, `main.dart` never has to change.
