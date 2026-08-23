---
sidebar_position: 4
---

# Putting It Together

A short, complete example of adding a settings page in a real project, spread across a few files
the way `smartify_os_miata_app` (see [Example Project](../example-project/example-project.md))
does it: one file per concern, directly under `lib/`. `my_car_app` below stands for your own
project's name, whatever you gave it in its `pubspec.yaml`.

```dart title="lib/settings_pages.dart"
import 'package:smartify_os_core/settings.dart';

/// The settings pages this car adds on top of the ones SmartifyOS ships with.
final mySettingsPages = <SettingsPage>[
  // Because its parent is Vehicle, a "Seat Heating" row appears on the
  // Vehicle page on its own, nothing else to register.
  SettingsPage(
    id: 'seat_heating',
    parent: SettingsPages.vehicle,
    title: 'Seat Heating',
    entries: [
      SettingsEntry.toggle(
        title: 'Driver Seat',
        initialValue: false,
        onChanged: (on) => myCar.setSeatHeater(on),
      ),
    ],
  ),
];

/// Rows added straight onto a page that already exists, without a page of
/// their own. Call this once from `main.dart`, after `SmartifyOs.init`.
void registerMySettingsEntries() {
  SmartifyOsSettings.addEntry(
    SettingsEntry.action(
      title: 'Reset Trip Meter',
      onTap: () => myCar.resetTripMeter(),
    ),
    to: SettingsPages.vehicle,
    section: 'Maintenance',
  );
}
```

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/backgrounds.dart';
import 'package:smartify_os_core/core.dart';
import 'package:smartify_os_core/settings.dart';
import 'package:my_car_app/settings_pages.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SmartifyOs().init(
    settings: SettingsConfig(pages: mySettingsPages),
  );

  // Rows can also be added after startup, from anywhere. They show up right
  // away, even while Settings is already open.
  registerMySettingsEntries();

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
service, whatever you already have. Add another page later by adding one more `SettingsPage` to
the list in `settings_pages.dart`, `main.dart` never has to change.
