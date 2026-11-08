---
sidebar_position: 3
---

# The About Page

Settings, About tells the driver what they're looking at. SmartifyOS fills in everything it can
find out on its own: the SmartifyOS and app versions, the operating system, the processor, the
screen and the extensions your car runs. The rest is up to you, with `AboutConfig`.

## The quick way

The CLI changes it for you, without opening `lib/main.dart`:

```bash
smartify-os about
```

```bash
smartify-os about --extra "VIN=JMZNB18C200123456"
```

The first one asks for the car's name and what car it is, the second adds a row of your own. The
[editor](../editor/setting-up-your-car.md) has the same on its About page, and shows the change in the
running app straight away.

## In code

Both write `AboutConfig` into `SettingsConfig` in `lib/main.dart`, which you can also change by hand:

```dart title="lib/main.dart"
await SmartifyOs().init(
  settings: const SettingsConfig(
    about: AboutConfig(
      deviceName: 'Miata',
      model: 'Mazda MX-5 NB 1.8',
      extra: {'VIN': 'JMZNB18C200123456'},
    ),
  ),
);
```

| Parameters      |                                                                              |
| --------------- | ---------------------------------------------------------------------------- |
| **deviceName**  | Optional, what you call this car, defaults to `'SmartifyOS'`                 |
| **model**       | Optional, what car it is. Leave it out and the row isn't shown at all        |
| **extra**       | Optional, anything else worth showing, as label and value. Shown at the bottom of the page, in the order you wrote them |

`deviceName` is only what the About page says. The name phones see when they pair with the car is
set separately, in `BluetoothConfig` (see [Using Bluetooth](../bluetooth/using-bluetooth.md)).
