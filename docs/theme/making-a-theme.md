---
sidebar_position: 2
---

# Making a Theme

To give your car a look of its own, make a class that extends `SmartifyOsTheme` and change only
the parts you care about. Everything you leave out stays as SmartifyOS's default.

## A worked example

The example app (see [Example Project](../example-project/example-project.md)) has a warm,
frosted theme in `lib/theme.dart`. Create a file like it, `lib/theme.dart` in your own app:

```dart title="lib/theme.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/theme.dart';

class SunsetTheme extends SmartifyOsTheme {
  const SunsetTheme();

  // Every theme needs these two, so the driver can pick it in Settings.
  @override
  String get id => 'sunset';

  @override
  String get title => 'Sunset';

  // The accent colour buttons, sliders and switches are drawn in.
  @override
  ThemeData get materialTheme => ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    colorSchemeSeed: Colors.deepOrange,
  );

  @override
  String? get fontFamily => 'Poppins';

  @override
  Color get surfaceColor => const Color(0xFF3A1B1B);

  @override
  double? get blurSigma => 14;

  @override
  double? get surfaceOpacity => 0.4;

  @override
  Color get borderColor => Colors.orangeAccent;

  @override
  SmartifyOsCornerStyle get cornerStyle => SmartifyOsCornerStyle.rounded;

  @override
  double get cornerRadius => 28;
}
```

Each `@override ... get ... =>` line replaces one part of the default look. Then hand the theme to
SmartifyOS in `lib/main.dart`, and the driver can pick it in Settings, Appearance:

```dart title="lib/main.dart"
await SmartifyOs().init(
  themes: const ThemesConfig(themes: [SunsetTheme()]),
);
```

Add `theme: 'sunset'` to the same `ThemesConfig` to make it the one the car starts with in every
layout, or pass it as the `theme` of a [layout of your own](../layouts/making-a-layout.md) to make
it that layout's look. A theme a layout brings is offered in Settings even if it isn't in
`themes`.

### Using your own font

A font other than the one SmartifyOS ships (Roboto) has to be in your app first:

1. Put the font file in your project, for example `assets/fonts/Poppins-Regular.ttf`.
2. List it in your `pubspec.yaml`:
   ```yaml
   flutter:
     fonts:
       - family: Poppins
         fonts:
           - asset: assets/fonts/Poppins-Regular.ttf
           - asset: assets/fonts/Poppins-Bold.ttf
             weight: 700
   ```
3. Name the `family` in `fontFamily`.

Pick carefully for a car: a screen this size has about one pixel to draw the stem of a letter with,
so fonts with fine detail turn to mush. And include the bold file, since bold text drawn from a
regular-only font comes out smeared.

## What a theme can change

### Colours and font

| Getter              |                                                                        |
| ------------------- | ---------------------------------------------------------------------- |
| **id**              | A short name, unique among all themes, for example `'sunset'`. The driver's pick is saved under it |
| **title**           | The name the driver reads in Settings                                   |
| **materialTheme**   | Optional, Flutter's own `ThemeData`. Its colour scheme gives the accent colour (`colorSchemeSeed` is the easy way), and whether it's a dark or light theme. Defaults to a dark Material 3 theme |
| **fontFamily**      | Optional, the font the whole car is drawn in, defaults to the bundled Roboto. `null` uses the system's own font |
| **typography**      | Optional, the text sizes, see [Text sizes](#text-sizes)                 |
| **accentGradient**  | Optional, a gradient to fill accent coloured controls with (a button, a tile that's on) instead of the flat accent colour. Keep both ends close to the accent colour, so text on top still reads |
| **screenColor**     | Optional, the colour behind everything where a layout has no background (no car, no picture) |

### Panels

Panels are every surface in SmartifyOS: the status bar, windows, buttons, cards.

| Getter              |                                                                        |
| ------------------- | ---------------------------------------------------------------------- |
| **surfaceColor**    | Optional, the colour panels are filled with                             |
| **surfaceOpacity**  | Optional, how much of `surfaceColor` covers what's behind it, from `0` to `1`, defaults to `0.5`. `null` makes panels solid |
| **blurSigma**       | Optional, how strongly what's behind a panel is blurred, for frosted glass, defaults to `15`. `null` turns blur off |
| **borderColor**     | Optional, the colour of panel borders                                   |
| **borderWidth**     | Optional, how thick borders are, defaults to `1`. `0` removes them       |
| **cornerStyle**     | Optional, `SmartifyOsCornerStyle.rounded` (the default), `.beveled` (cut off at 45°), `.continuous` (smooth like an iPhone's corners) or `.sharp` |
| **cornerRadius**    | Optional, how big the corners are (or the cut for `.beveled`), defaults to `16`, ignored for `.sharp` |

Blur and see-through panels are the most expensive thing SmartifyOS draws. On an older computer
or a Raspberry Pi, a theme with `blurSigma` and `surfaceOpacity` set to `null` runs noticeably
smoother.

### Spacing in layouts

| Getter              |                                                                        |
| ------------------- | ---------------------------------------------------------------------- |
| **layoutPadding**   | Optional, the space between the edge of the screen and the panels a layout puts on it, defaults to `12` |
| **layoutGap**       | Optional, the space between two panels, defaults to `12`                 |

Every layout reads its spacing from here, so a theme with big round corners can give its panels
room to breathe and a dense one can pack them tight, in every layout at once.

### The car

These colour the [car](../car/showing-the-car.md) and what's around it.

| Getter                 |                                                                     |
| ---------------------- | ------------------------------------------------------------------- |
| **carBackgroundColor** | Optional, what the 3D car stands in front of, which the floor fades into in the distance. Defaults to `screenColor` |
| **carFloorColor**      | Optional, the floor the 3D car stands on. Defaults to a shade lighter than the background on a dark theme and darker on a light one, so there's a soft horizon |
| **carFloorGlowColor**  | Optional, the floor right under the 3D car, which eases out into `carFloorColor`, so the car stands in a pool of light. Make it the same as the floor for none |
| **carLineColor**       | Optional, the lines of the 2D drawing, defaults to the accent colour |
| **carFillColor**       | Optional, the filled shapes of the 2D drawing, defaults to `carLineColor`, faint |
| **carGoodColor**       | Optional, a part lit up as `CarHighlight.good` (on, all is well), green by default |
| **carWarningColor**    | Optional, a part lit up as `CarHighlight.warning` (worth a look), orange by default |
| **carDangerColor**     | Optional, a part lit up as `CarHighlight.danger` (needs doing something about), red by default |

A light theme usually wants a light studio for the car too:

```dart
@override
Color get carBackgroundColor => const Color(0xFFE6E9F1);

@override
Color get carFloorColor => const Color(0xFFD5DAE4);

@override
Color get carFloorGlowColor => const Color(0xFFF8F9FC);
```

## Text sizes

`typography` sets the five text sizes used across the car, all at once. You only override it to
change them, using them in your own widgets is `context.smartifyOsText` (see
[Building Blocks](../windows/building-blocks.md#text)).

```dart
@override
SmartifyOsTypography get typography =>
    const SmartifyOsTypography(body: 17, title: 19);
```

| Parameters         |                                                                     |
| ------------------ | ------------------------------------------------------------------- |
| **small**          | Optional, a subtitle, the time left on a song, defaults to `13`      |
| **body**           | Optional, normal text, defaults to `15`                              |
| **title**          | Optional, a row's title, a button's label, defaults to `17`          |
| **heading**        | Optional, the heading of a page or card, defaults to `22`            |
| **display**        | Optional, the one number read at a glance, like the speed, defaults to `30` |
| **weight**         | Optional, the weight everything is drawn at, defaults to `FontWeight.w400`. Leave it, heavier text looks muddier on a car screen, not stronger |
| **emphasisWeight** | Optional, the weight of `text.strong(...)`, defaults to `FontWeight.w700`. Your font has to have this weight, or set it the same as `weight` |
| **lineHeight**     | Optional, line spacing as a multiple of the text size, defaults to `1.25` |

## A red accent

A destructive button (the red confirm button of `ThemedDialog.confirm(destructive: true)`) uses
the theme's error colour. If your accent colour is itself a red, set the colour scheme's `error`
and `onError` to something clearly different in `materialTheme`, or the destructive button ends up
the paler of the two.
