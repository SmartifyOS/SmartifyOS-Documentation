---
sidebar_position: 2
---

# Putting It Together

A complete example with both kinds of tile, in the exact files `smartify-os tile create` makes, as
the [example app](../example-project/example-project.md) has them: a headlights switch that follows
the real headlights, and a button that locks the doors and says so.

`smartify_os_my_car_app` below stands for your own app's name, the `name:` at the top of its `pubspec.yaml`.

## Something to switch

The headlights live in a file of your own. A `ValueNotifier` holds whether they're on, so the tile
can follow it (see [Values That Change](../saved-values.md)):

```dart title="lib/lights.dart"
import 'package:flutter/foundation.dart';

/// Whether the headlights are on, as far as the screen knows.
final headlightsOn = ValueNotifier(false);

/// Switches the headlights on or off.
void setHeadlights({required bool on}) {
  // A real car would ask the lights to switch here, over the CAN bus say,
  // and set headlightsOn once they answer.
  headlightsOn.value = on;
}
```

## The switch

```dart title="lib/quick_settings/headlights_tile.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/lights.dart';
import 'package:smartify_os_core/quick_settings.dart';
import 'package:smartify_os_core/saved_values.dart';

/// Switches the headlights on and off, and follows them when they're
/// switched some other way.
final headlightsTile = QuickSettingsTile.toggle(
  id: 'headlights',
  label: 'Headlights',
  icon: const Icon(Icons.lightbulb),
  // Where it sits among the tiles, smaller first.
  order: 10,
  isOn: (qs) => qs.ref.watchValue(headlightsOn),
  onChanged: _switched,
);

/// Runs every time the tile is switched, with whether it is on now.
void _switched(QuickSettingsContext qs, bool on) {
  setHeadlights(on: on);
}
```

## The button

```dart title="lib/quick_settings/lock_doors_tile.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/notifications.dart';
import 'package:smartify_os_core/quick_settings.dart';

/// Locks the doors and says so, every time it's tapped.
const lockDoorsTile = QuickSettingsTile.button(
  id: 'lock_doors',
  label: 'Lock doors',
  icon: Icon(Icons.lock),
  order: 20,
  onTap: _tapped,
);

/// Runs every time the tile is tapped.
void _tapped(QuickSettingsContext qs) {
  // A real car would ask the door locks to close here.
  SmartifyOsNotifications.showNotification(
    const SmartifyOsNotification(title: 'Doors locked', icon: Icon(Icons.lock)),
  );
}
```

## Handing both to SmartifyOS

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/quick_settings/headlights_tile.dart';
import 'package:smartify_os_my_car_app/quick_settings/lock_doors_tile.dart';
import 'package:smartify_os_core/core.dart';
import 'package:smartify_os_core/quick_settings.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SmartifyOs().init(
    // Your own tiles in the quick settings, the shade pulled down from the top.
    quickSettings: QuickSettingsConfig(tiles: [headlightsTile, lockDoorsTile]),
  );

  runApp(const SmartifyOsApp());
}
```

Because the switch follows `headlightsOn`, anything else that switches the headlights (a page in
Settings, a voice command, the real light switch reported over the CAN bus) only has to call
`setHeadlights`, and the tile catches up by itself. Notifications are covered on
[Sending Notifications](../notifications/sending-notifications.md).
