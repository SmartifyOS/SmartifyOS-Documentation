---
sidebar_position: 4
---

# Putting It Together

A complete settings page, in the exact shape `smartify-os settings create` and `add-row` write it,
and the [example app](../example-project/example-project.md) has it. It's a Lights page under
Vehicle with one of each kind of row, plus one row added to a page that already exists.

`smartify_os_my_car_app` below stands for your own app's name, the `name:` at the top of its `pubspec.yaml`.

## The page

Every page gets a file of its own in `lib/settings/`. Rows that remember something keep it in a
`SavedValue` further down the same file, and a button calls a function that's also in there:

```dart title="lib/settings/lights_page.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/lights.dart';
import 'package:smartify_os_core/settings.dart';

/// A settings page of your own. Because its parent is Vehicle, a "Lights"
/// row appears on the Vehicle page by itself.
final lightsPage = SettingsPage(
  id: 'lights',
  parent: SettingsPages.vehicle,
  title: 'Lights',
  icon: const Icon(Icons.lightbulb),
  entries: [
    SettingsEntry.toggle(
      id: 'welcome_light',
      title: 'Welcome light',
      subtitle: 'Lights up the car when it is unlocked',
      saved: lightsWelcomeLight,
    ),
    SettingsEntry.choice(
      id: 'headlights_stay_on',
      title: 'Headlights stay on',
      options: const [
        SettingsChoice('off', 'Off'),
        SettingsChoice('short', 'Short'),
        SettingsChoice('long', 'Long'),
      ],
      saved: lightsHeadlightsStayOn,
    ),
    SettingsEntry.action(
      id: 'flash_the_headlights',
      title: 'Flash the headlights',
      onTap: _flashTheHeadlightsTapped,
    ),
    SettingsEntry.info(
      id: 'bulbs',
      title: 'Bulbs',
      value: 'LED',
      section: 'About the lights',
    ),
  ],
);

/// What the `welcome_light` row is set to, kept between drives. Read and
/// change it anywhere in your app with `lightsWelcomeLight.value`.
const lightsWelcomeLight = SavedValue(
  'lights.welcome_light',
  defaultValue: true,
);

/// What the `headlights_stay_on` row is set to, kept between drives.
const lightsHeadlightsStayOn = SavedValue(
  'lights.headlights_stay_on',
  defaultValue: 'short',
);

/// Runs every time the `flash_the_headlights` row is tapped.
void _flashTheHeadlightsTapped() {
  flashHeadlights();
}
```

`flashHeadlights` stands for whatever your own code does to talk to the car, here a function in
`lib/lights.dart`.

## A row on a page that already exists

The CLI only makes and changes pages of your own. A row you want on one of SmartifyOS's pages goes
in a file of your own, by the page's `id`:

```dart title="lib/settings_entries.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/settings.dart';

/// Rows added straight onto pages that already exist.
final mySettingsEntries = <String, List<SettingsEntry>>{
  SettingsPages.vehicle: [
    SettingsEntry.action(
      title: 'Reset trip meter',
      icon: const Icon(Icons.restart_alt),
      section: 'Maintenance',
      onTap: resetTripMeter,
    ),
  ],
};
```

## Handing both to SmartifyOS

```dart title="lib/main.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/settings/lights_page.dart';
import 'package:smartify_os_my_car_app/settings_entries.dart';
import 'package:smartify_os_core/core.dart';
import 'package:smartify_os_core/settings.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SmartifyOs().init(
    settings: SettingsConfig(
      about: const AboutConfig(deviceName: 'My car'),
      pages: [lightsPage],
      entries: mySettingsEntries,
    ),
  );

  runApp(const SmartifyOsApp());
}
```

## Using what the driver picked

The saved values work anywhere in your app, not just on the page. For example, when the car is
unlocked:

```dart title="lib/lights.dart"
import 'package:smartify_os_my_car_app/settings/lights_page.dart';

void carUnlocked() {
  if (lightsWelcomeLight.value) {
    turnOnInteriorLight();
  }
}
```

The driver flips the switch in Settings, and the next time the car is unlocked your code already
sees the new value, even after a restart. See [Values That Change](../saved-values.md) for following
a value while it changes, to redraw something say.
