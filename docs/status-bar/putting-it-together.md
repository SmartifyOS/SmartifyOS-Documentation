---
sidebar_position: 2
---

# Putting It Together

A complete example of a status bar icon in a real app, the way the
[example app](../example-project/example-project.md) does it: a headlights icon that's only there
while the headlights are on.

`smartify_os_my_car_app` below stands for your own app's name, the `name:` at the top of its `pubspec.yaml`.

All of your own icons go in one file:

```dart title="lib/status_icons.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/status_bar.dart';

/// The id of the icon that shows while the headlights are on.
const headlightsStatusIcon = 'headlights';

/// This car's own icons in the status bar, next to the ones SmartifyOS puts
/// there by itself.
final myStatusIcons = <StatusIcon>[
  StatusIcon(id: headlightsStatusIcon, icon: const Icon(Icons.highlight)),
];
```

Whatever knows about the headlights shows and hides the icon:

```dart title="lib/lights.dart"
import 'package:smartify_os_my_car_app/status_icons.dart';
import 'package:smartify_os_core/status_bar.dart';

/// Call this whenever the headlights are switched, from a sensor, a switch
/// or a quick settings tile.
void headlightsChanged({required bool on}) {
  if (on) {
    SmartifyOsStatusBar.showIcon(headlightsStatusIcon);
  } else {
    SmartifyOsStatusBar.hideIcon(headlightsStatusIcon);
  }
}
```

And `lib/main.dart` hands the icons to SmartifyOS, with the headlights one hidden until they're on:

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/status_icons.dart';
import 'package:smartify_os_core/core.dart';
import 'package:smartify_os_core/status_bar.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SmartifyOs().init(
    statusBar: StatusBarConfig(
      icons: myStatusIcons,
      hiddenIcons: {headlightsStatusIcon},
    ),
  );

  runApp(const SmartifyOsApp());
}
```

The next icon is one more `StatusIcon` in the list in `status_icons.dart`. If your car already keeps
the headlights in a `ValueNotifier`, you can skip `lights.dart` and give the icon a `visible` instead,
see [Adding Status Bar Icons](./adding-icons.md#showing-it-only-sometimes).
