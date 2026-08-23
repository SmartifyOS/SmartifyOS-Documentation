---
sidebar_position: 3
---

# The About Page

The built-in About page shows the app version, operating system and screen size on its own,
everything else you fill in with `AboutConfig`, passed to `SettingsConfig` at startup.

```dart
await SmartifyOs().init(
  settings: SettingsConfig(
    about: const AboutConfig(
      deviceName: 'Miata',
      model: 'Mazda MX-5 NB 1.8',
      extra: {'VIN': 'JMZNB18C200123456'},
    ),
  ),
);
```

| Parameters      |                                                                |
| ------------------ | ------------------------------------------------------------------ |
| **deviceName**     | Optional, what you call this car, defaults to `'SmartifyOS'`      |
| **model**           | Optional, the car itself, left out of the page entirely when not given |
| **extra**           | Optional, anything else worth showing, as label/value pairs, shown at the bottom of the page in the order given |
