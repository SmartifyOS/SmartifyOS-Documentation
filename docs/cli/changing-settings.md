---
sidebar_position: 3
---

# Changing Settings

Almost everything about your car is a setting your app hands SmartifyOS in `lib/main.dart`: how
the 3D model sits, which of its parts move, what the info display shows, Bluetooth, the reverse
camera and the rest. `smartify-os config` reads and changes any of them by name, so you don't
have to find the right line yourself.

## Seeing what's set

```bash
smartify-os config
```

This lists everything your app sets, each by its **key**. Anything not listed is SmartifyOS's own
default. To see every setting there is, with its default:

```bash
smartify-os config --list
```

A key is the path of names from `SmartifyOs().init` down to the setting. `car.model3D.scale` is
`scale` inside `model3D` inside `car`, which in `lib/main.dart` looks like this:

```dart
await SmartifyOs().init(
  car: const CarConfig(
    model3D: CarModel3DConfig(path: 'assets/my_car.glb', scale: 0.8),
  ),
);
```

Every page of these docs that covers a config shows its parameters, and those are the same names.

## Changing a setting

Give the key and the new value:

```bash
smartify-os config car.model3D.scale 0.8
```

Change several at once with `--set`, again for each:

```bash
smartify-os config --set bluetooth.autoConnect=off --set reverseCamera.guides.carWidth=1.68
```

Take a setting out again, so SmartifyOS's default is used:

```bash
smartify-os config --unset car.model3D.scale
```

Any config that isn't in `lib/main.dart` yet is added for you, with whatever it needs on the way.

## Writing values

Type values plainly:

| Value                    |                                                       |
| ------------------------ | ----------------------------------------------------- |
| On and off               | `on`, `off`                                           |
| Numbers                  | `0.8`, `270`                                          |
| A length of time         | `3s`, `500ms`                                         |
| A colour                 | `#F5C542`                                             |
| Three numbers (x, y, z)  | `0,180,0`                                             |
| A size                   | `1024x600`                                            |
| A list                   | `a,b,c`                                               |
| Nothing                  | `none`                                                |
| Anything bigger          | JSON, like `'{"id":"rpm","label":"Engine speed"}'`    |

Put a value with spaces or symbols in quotes, as in the JSON example.

## Changing a list

Some settings are lists, like the info display's values or the wheels that roll. Add something to
the end of one:

```bash
smartify-os config --add layouts.hiddenLayouts=portrait
```

```bash
smartify-os config --add 'infoDisplay.values={"id":"rpm","label":"Engine speed","unit":"RPM"}'
```

Items in a list are named by their place, counting from 0. Take the fourth wheel out, or move the
third view to the front:

```bash
smartify-os config --remove 'car.model3D.parts.rollingWheels[3]'
```

```bash
smartify-os config --move 'infoDisplay.views[2]=0'
```

## Settings written as code

If you wrote a setting yourself as code the CLI can't read (a variable, or a list built somewhere
else in your app), it shows it as "set in code" and never guesses. A change that would have to go
inside it is printed for you to make by hand.

## How it looks, and the About page

The layout, theme, driver's side, bar and the picture of the car have their own command,
`smartify-os appearance`, and so does the About page, `smartify-os about`. See
[Your Car](./your-car.md#changing-how-it-looks).

An extension's own settings work much like `config`, with `smartify-os extension settings`, see
[Using Extensions](../extensions/using-extensions.md).
