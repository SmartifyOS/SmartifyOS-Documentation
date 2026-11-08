---
sidebar_position: 2
---

# Putting It Together

A complete example with one of each kind, in the exact files `smartify-os widget create` makes: a
card that turns up while a door is open and opens the doors window when tapped, and a pinned gauge
that's always there. The [example app](../example-project/example-project.md) has the same pair (a
tap counter card and an engine gauge).

`smartify_os_my_car_app` below stands for your own app's name, the `name:` at the top of its `pubspec.yaml`.

## Something to show

Both widgets show something the car knows. Here that's two plain values in a file of your own,
which whatever reads the car's sensors sets (see [Values That Change](../saved-values.md)):

```dart title="lib/car_state.dart"
import 'package:flutter/foundation.dart';

/// Whether any door is open. Set it from whatever reads the door sensors.
final doorOpen = ValueNotifier(false);

/// The oil temperature in °C, or null before the first reading.
final oilTemperature = ValueNotifier<double?>(null);
```

## The card

```dart title="lib/home_widgets/door_open_widget.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/car_state.dart';
import 'package:smartify_os_my_car_app/windows/doors_window.dart';
import 'package:smartify_os_core/home_widgets.dart';
import 'package:smartify_os_core/navigator.dart';
import 'package:smartify_os_core/saved_values.dart';
import 'package:smartify_os_core/theme.dart';

/// A card that shows up by itself while a door is open, and opens the doors
/// window when tapped.
final doorOpenWidget = HomeWidget(
  id: 'door_open',
  title: 'Door open',
  icon: const Icon(Icons.sensor_door),
  // Where it sits among the cards, smaller first. A warning goes early.
  order: 10,
  visible: (home) => home.ref.watchValue(doorOpen),
  onTap: (context) => SmartifyOsNavigator.push(context, const DoorsWindow()),
  builder: (home) => const _DoorOpenView(),
);

class _DoorOpenView extends StatelessWidget {
  const _DoorOpenView();

  @override
  Widget build(BuildContext context) {
    final text = context.smartifyOsText;

    return Row(
      spacing: 12,
      children: [
        const Icon(Icons.sensor_door),
        Text('A door is open', style: text.title),
      ],
    );
  }
}
```

`DoorsWindow` is the window from the [App List example](../app-list/putting-it-together.md).

## The pinned widget

```dart title="lib/home_widgets/oil_temperature_widget.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/car_state.dart';
import 'package:smartify_os_core/home_widgets.dart';
import 'package:smartify_os_core/saved_values.dart';
import 'package:smartify_os_core/theme.dart';

/// A gauge that stays where the driver puts it.
final oilTemperatureWidget = HomeWidget.pinned(
  id: 'oil_temperature',
  title: 'Oil temperature',
  icon: const Icon(Icons.oil_barrel),
  builder: (home) => _OilTemperatureView(
    temperature: home.ref.watchValue(oilTemperature),
    shape: home.shape,
  ),
);

/// The number, with a label under it unless the box is a thin strip.
class _OilTemperatureView extends StatelessWidget {
  final double? temperature;
  final HomeWidgetShape shape;

  const _OilTemperatureView({required this.temperature, required this.shape});

  @override
  Widget build(BuildContext context) {
    final text = context.smartifyOsText;
    final value = temperature == null ? '--' : '${temperature!.round()} °C';

    if (shape == HomeWidgetShape.strip) {
      return Center(child: Text('Oil $value', style: text.title));
    }
    return FittedBox(
      fit: BoxFit.scaleDown,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(value, style: text.display),
          Text('Oil temperature', style: text.dim(text.small)),
        ],
      ),
    );
  }
}
```

## Handing both to SmartifyOS

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/home_widgets/door_open_widget.dart';
import 'package:smartify_os_my_car_app/home_widgets/oil_temperature_widget.dart';
import 'package:smartify_os_core/core.dart';
import 'package:smartify_os_core/home_widgets.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SmartifyOs().init(
    // Your own widgets and cards on the home screen.
    homeWidgets: HomeWidgetsConfig(
      widgets: [doorOpenWidget, oilTemperatureWidget],
    ),
  );

  runApp(const SmartifyOsApp());
}
```

The card now looks after itself: `doorOpen.value = true;` from anywhere puts it on screen, and
`false` takes it away. The gauge waits until the driver holds an area of the home screen and adds
it, or until a layout of yours names it for one of its areas (see
[Making a Layout](../layouts/making-a-layout.md)).
