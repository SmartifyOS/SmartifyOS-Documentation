---
sidebar_position: 2
---

# Putting It Together

A short, complete example of adding a status bar icon in a real project, spread across a few
files the way `smartify_os_miata_app` (see [Example Project](../example-project/example-project.md))
does it: one file per concern, directly under `lib/`.

This one uses `lightsProvider` from [Riverpod Basics](../riverpod-basics.md), so the icon comes
and goes on its own whenever the lights are switched, nothing to call by hand. `my_car_app` below stands for your own project's name, whatever you gave
it in its `pubspec.yaml`.

```dart title="lib/providers.dart"
import 'package:flutter_riverpod/flutter_riverpod.dart';

final lightsProvider = StateProvider<bool>((ref) => false);
```

```dart title="lib/status_icons.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/status_bar.dart';
import 'package:my_car_app/providers.dart';

/// The status bar icons this car adds.
final myStatusIcons = <StatusIcon>[
  StatusIcon.builder(
    id: 'lights',
    side: StatusBarSide.end,
    visible: (status) => status.ref.watch(lightsProvider),
    builder: (status) => const Icon(Icons.lightbulb),
  ),
];
```

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/backgrounds.dart';
import 'package:smartify_os_core/core.dart';
import 'package:smartify_os_core/status_bar.dart';
import 'package:my_car_app/status_icons.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SmartifyOs().init(
    statusBar: StatusBarConfig(icons: myStatusIcons),
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

Whatever in your own code actually knows when the lights are on just has to set
`ref.read(lightsProvider.notifier).state = true;`, from wherever that happens, the icon takes
care of the rest.
