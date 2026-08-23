---
sidebar_position: 2
---

# Putting It Together

A short, complete example of adding a home widget in a real project, spread across a few files
the way `smartify_os_miata_app` (see [Example Project](../example-project/example-project.md))
does it: one file per concern, directly under `lib/`.

This one uses `doorsOpenProvider` from [Riverpod Basics](../riverpod-basics.md), so the card
appears on its own whenever a door opens, and goes away on its own once every door is shut,
nothing to call by hand. `my_car_app` below stands for your own project's name, whatever you gave
it in its `pubspec.yaml`.

```dart title="lib/providers.dart"
import 'package:flutter_riverpod/flutter_riverpod.dart';

final doorsOpenProvider = StateProvider<bool>((ref) => false);
```

```dart title="lib/windows/doors_window.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/widgets.dart';

class DoorsWindow extends StatelessWidget {
  const DoorsWindow({super.key});

  @override
  Widget build(BuildContext context) {
    return const SmartifyOsWindow(
      title: 'Doors',
      child: Center(child: Text('A door is open')),
    );
  }
}
```

```dart title="lib/home_widgets.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/home_widgets.dart';
import 'package:smartify_os_core/navigator.dart';
import 'package:my_car_app/providers.dart';
import 'package:my_car_app/windows/doors_window.dart';

/// The home widgets this car adds.
final myHomeWidgets = <HomeWidget>[
  HomeWidget(
    id: 'doors',
    visible: (home) => home.ref.watch(doorsOpenProvider),
    onTap: (context) => SmartifyOsNavigator.push(context, const DoorsWindow()),
    builder: (home) => const Text('A door is open'),
  ),
];
```

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/backgrounds.dart';
import 'package:smartify_os_core/core.dart';
import 'package:smartify_os_core/home_widgets.dart';
import 'package:my_car_app/home_widgets.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SmartifyOs().init(
    homeWidgets: HomeWidgetsConfig(widgets: myHomeWidgets),
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

Whatever in your own code actually knows when a door opens (reading a sensor, say) just has to
set `ref.read(doorsOpenProvider.notifier).state = true;`, from wherever that happens, the card
takes care of the rest.
