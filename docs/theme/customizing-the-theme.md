---
sidebar_position: 1
---

# Customizing the Theme

`SmartifyOsTheme` defines the entire look of SmartifyOS. Colors, typography and other general
Flutter styling come from `materialTheme`, so there's only one theming system to learn.
Everything else on it covers what Flutter's `ThemeData` doesn't: how surfaces (the status bar,
windows, buttons, panels) render their background blur, transparency, border and corner shape.

Create a custom look by extending `SmartifyOsTheme` and overriding only the getters you care
about, for example a fully opaque, hard-edged, neon theme with no blur:

```dart
class NeonTheme extends SmartifyOsTheme {
  const NeonTheme();

  // Custom font and accent color, applied app-wide.
  @override
  ThemeData get materialTheme => ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    fontFamily: 'Orbitron', // declare this font in your app's pubspec.yaml
    colorSchemeSeed: Colors.greenAccent, // drives buttons, sliders, etc.
  );

  @override
  Color get surfaceColor => Colors.black;

  @override
  double? get blurSigma => null; // no blur at all

  @override
  double? get surfaceOpacity => null; // fully opaque

  @override
  Color get borderColor => Colors.greenAccent;

  @override
  double get borderWidth => 4;

  @override
  SmartifyOsCornerStyle get cornerStyle => SmartifyOsCornerStyle.beveled;
}
```

Pass an instance to `SmartifyOsApp(theme: const NeonTheme())`. Anything further down the widget
tree can read the active theme with `context.smartifyOsTheme`.

| Parameters          |                                                                          |
| ---------------------- | ---------------------------------------------------------------------------- |
| **materialTheme**       | Optional, the underlying Flutter `ThemeData`, defaults to a dark Material 3 theme |
| **fontFamily**          | Optional, the font the whole OS is drawn in, `null` falls back to the system font, defaults to the bundled Roboto |
| **typography**          | Optional, text sizes across the OS, see below                              |
| **surfaceColor**        | Optional, fill color for surfaces such as the status bar, windows and buttons |
| **borderColor**         | Optional, border color for surfaces                                        |
| **borderWidth**         | Optional, border thickness in logical pixels, `0` removes borders          |
| **blurSigma**           | Optional, Gaussian blur behind surfaces for a frosted-glass effect, `null` disables it and also improves performance on older hardware |
| **surfaceOpacity**      | Optional, opacity applied to `surfaceColor`, from `0` to `1`, `null` makes surfaces fully opaque |
| **cornerStyle**         | Optional, `SmartifyOsCornerStyle.rounded`, `.beveled`, `.continuous` or `.sharp` |
| **cornerRadius**        | Optional, corner radius (or cut size for `.beveled`) in logical pixels, ignored for `.sharp` |

Pick a font carefully for a car: a screen this size has about one pixel to draw the stem of a
letter with, so fonts with fine detail turn to mush.

## Text sizes

`typography` returns a `SmartifyOsTypography` with the sizes used across the OS (`small`,
`body`, `title`, `heading`, `display`, plus `weight`, `emphasisWeight` and `lineHeight`), applied
on top of whatever `materialTheme` returns. You don't need this to *use* the text styles, that's
`context.smartifyOsText`, this is what you override on a theme to change them all at once:

```dart
class BigTextTheme extends SmartifyOsTheme {
  const BigTextTheme();

  @override
  SmartifyOsTypography get typography =>
      const SmartifyOsTypography(body: 17, title: 19);
}
```

Then in your widgets, reach for the resolved styles instead of Flutter's own `TextTheme`, whose
names (`bodyMedium`, `titleLarge`, `headlineSmall`) say nothing about how big anything actually
is:

```dart
final text = context.smartifyOsText;

Column(
  children: [
    Text('Now Playing', style: text.heading),
    Text('Binary', style: text.strong(text.title)),
    Text('LONOWN', style: text.dim(text.small)),
  ],
)
```
