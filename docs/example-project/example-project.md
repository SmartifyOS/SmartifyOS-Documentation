---
sidebar_position: 1
---

# Example Project

`smartify_os_miata_app` in the SmartifyOS repository is a full worked example, one real car
(a Mazda MX-5 NB 1.8) set up with everything covered in these docs. It's the best place to see
how all the pieces fit together in one app.

```dart title="lib/main.dart"
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SmartifyOs().init(
    bluetooth: const BluetoothConfig(name: 'Miata'),
    settings: SettingsConfig(
      pages: miataSettingsPages,
      about: const AboutConfig(deviceName: 'Miata', model: 'Mazda MX-5 NB 1.8'),
    ),
    appList: AppListConfig(entries: miataAppListEntries),
    statusBar: StatusBarConfig(icons: miataStatusIcons),
    quickSettings: QuickSettingsConfig(tiles: miataQuickSettingsTiles),
  );

  // The knob on the centre console and the two buttons next to it. What each
  // of them does is entirely this car's own business, see input.dart.
  startMiataInput();

  // Pages and rows can also be added later, from anywhere. They show up
  // right away, even while Settings is open.
  registerMiataSettingsEntries();

  // Same for home screen cards. This one could just as well have been
  // passed to `init` as a HomeWidgetsConfig.
  registerMiataHomeWidgets();

  runApp(
    SmartifyOsApp(
      background: CarOrbitBackground(
        modelPath: 'assets/miata_model.glb',
        scale: 0.7,
        offsetRotation: Offset3D(0, 180, 0),
        config: const CarSceneConfig(/* ... */),
      ),
    ),
  );
}
```

Everything else lives in its own small file, following the same layout worth copying for your
own car:

| File                   |                                                                       |
| ------------------------- | ----------------------------------------------------------------------- |
| `settings_pages.dart`     | A "Seat heating" page under the built-in Vehicle page, a custom "Gauges" page, and rows like "Reset trip meter" added after startup |
| `app_list.dart`           | The app list entries, including the test windows below                |
| `home_widgets.dart`       | A home screen card                                                      |
| `status_icons.dart`       | Extra status bar icons                                                  |
| `quick_settings.dart`     | A "Popups" toggle for the pop-up headlights                            |
| `theme.dart`               | Six alternate themes to try, swap the one passed to `SmartifyOsApp`    |
| `input.dart`               | The rotary knob and two buttons on the centre console, see [Using Focus](../focus/using-focus.md) |
| `windows/`                 | A minimal fullscreen window, a floating window, and a debug window with buttons for every notification variant |

## Test windows

`lib/windows/test_window.dart` and `lib/windows/test_floating_window.dart` are the smallest
possible `SmartifyOsWindow` and `SmartifyOsFloatingWindow` you can build, worth a look before
[Creating Windows](../windows/creating-windows.md). `lib/windows/debug_window.dart` is a bigger
example: sliders driving `CarAnimationController.instance.speed`/`.steerAngle`, a door-open
toggle, and buttons exercising every `SmartifyOsNotifications.showNotification` variant.
