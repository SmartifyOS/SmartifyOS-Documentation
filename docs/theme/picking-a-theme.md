---
sidebar_position: 1
---

# Picking a Theme

A theme is how everything on screen looks: the colours, the font, whether panels are frosted glass
or solid, how thick their borders are and what shape their corners have. Every part of
SmartifyOS, and every `Themed...` control in your own windows, follows it.

## The built-in themes

| Theme              | Class                    |                                                       |
| ------------------ | ------------------------ | ----------------------------------------------------- |
| `Themes.glass`     | `SmartifyOsDefaultTheme` | Dark, rounded frosted glass, the look SmartifyOS has out of the box. Made for the classic layout |
| `Themes.slate`     | `SlateTheme`             | Solid dark panels on near black. Made for the split layout |
| `Themes.carbon`    | `CarbonTheme`            | Flat grey on black with a blue accent. Made for the sidebar layout |
| `Themes.frost`     | `FrostTheme`             | Light, frosted white panels. Made for the tiles layout |
| `Themes.midnight`  | `MidnightTheme`          | Pure black with hairline outlines. Made for the focus layout |
| `Themes.horizon`   | `HorizonTheme`           | Deep blue frosted glass. Made for the portrait layout |
| `Themes.retro`     | `RetroTheme`             | Teal lines on black, like a 90s dashboard. Made for a car shown as a 2D drawing |

## Which theme is on screen

Out of the box you don't pick a theme at all: every [layout](../layouts/picking-a-layout.md)
comes with the theme it was designed with, and wears it. Switch to the split layout and you get
Slate, switch to tiles and you get Frost.

Once the driver picks a theme in Settings, Appearance, it stays, whatever layout they switch to.
When they switch layouts after that, SmartifyOS asks whether to keep their theme or go back to the
new layout's own.

To have every layout wear the same theme from the start instead, pick one for your car. The CLI
does it for you:

```bash
smartify-os appearance --theme slate
```

`--theme none` goes back to each layout wearing its own. In the
[editor](../editor/setting-up-your-car.md) it's on the Screen page under Setup. In `lib/main.dart`
it looks like this:

```dart title="lib/main.dart"
await SmartifyOs().init(
  themes: const ThemesConfig(theme: Themes.slate),
);
```

| Parameters       |                                                                    |
| ---------------- | ------------------------------------------------------------------ |
| **theme**        | Optional, the theme every layout wears until the driver picks one. Leave it out for each layout to wear its own |
| **themes**       | Optional, themes of your own, offered in Settings next to the built-in ones, see [Making a Theme](./making-a-theme.md) |
| **hiddenThemes** | Optional, built-in themes to leave out of the ones the driver can pick, for example `{Themes.frost}` if a light theme is too bright in your car at night. A layout made for one still wears it |

## Changing it while the car runs

`SmartifyOsThemes` does from your own code what the driver does in Settings:

```dart
SmartifyOsThemes.selectTheme(Themes.midnight);
SmartifyOsThemes.resetTheme(); // back to each layout wearing its own
SmartifyOsThemes.currentTheme; // the theme on screen now
SmartifyOsThemes.themes;       // the ones the driver can pick from
```

`hideTheme`, `showTheme`, `hasTheme`, `addTheme` and `removeTheme` work like their layout
counterparts. None of them throw, a name that doesn't exist is logged and worked around.

## Using the theme in your own widgets

The `Themed...` controls (see [Building Blocks](../windows/building-blocks.md)) already follow the
theme. For anything you draw yourself, read the theme on screen with `context.smartifyOsTheme`, and
its text styles with `context.smartifyOsText`:

```dart
final theme = context.smartifyOsTheme;

Container(
  color: theme.surfaceColor,
  child: Text('Oil 92 °C', style: context.smartifyOsText.title),
)
```

The accent colour, the one buttons and switches are filled with, is Flutter's
`Theme.of(context).colorScheme.primary`.
