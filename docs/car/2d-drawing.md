---
sidebar_position: 3
---

# The 2D Drawing

A 2D drawing shows your car from above as clean outlines, the way the display in a 90s dashboard
does. Doors swing open, lights light up in green, amber or red, and the front wheels turn with the
steering. It takes next to no work to draw, which makes it the one to pick on a small board like a
Raspberry Pi. You give it as an `.svg` file in `CarDrawing2DConfig`, inside the `CarConfig` from
[Showing the Car](./showing-the-car.md).

```dart title="lib/main.dart"
await SmartifyOs().init(
  car: const CarConfig(
    drawing2D: CarDrawing2DConfig(
      path: 'assets/golf.svg',
      parts: CarDrawing2DPartsConfig(
        steerableWheels: ['FrontLeftWheel', 'FrontRightWheel'],
      ),
    ),
  ),
);
```

`smartify-os appearance --drawing ~/Downloads/golf.svg` copies the file into your app and writes
this for you, and the editor's **The car on the screen** setup page lets you pick the front wheels
from the names in your drawing.

## Drawing it

Use any program that saves SVG files. The example car was drawn in Affinity Designer, Inkscape
works too. Keep these in mind:

1. **The front of the car points up.**
2. **Draw everything in white.** SmartifyOS ignores the colours in the file and colours the drawing
   in from the theme, so it matches whichever theme is on. What it does keep is whether a shape is
   filled or just outlined, and how see-through it is, so a fill at half opacity stays that way.
3. **Put every part that moves or lights up in a group of its own, and name the group.** A door, a
   headlight, a front wheel. Your code calls parts by these names, so pick plain ones without
   spaces, like `LeftDoor`. In Affinity, the layer name is used. In Inkscape, set the group's ID
   (Object Properties), not its label.
4. **Mark where a part turns.** A part turns around its own middle, which is right for a wheel. A
   door turns around its hinge instead, so put a small shape (a dot will do) on the hinge inside the
   door's group and name it `pivot`, or anything ending in `_pivot` (`LeftDoor_pivot`). It's never
   drawn, only used as the point to turn around.

Plain vector art is what's read: groups, paths, the basic shapes and their line styles. Text,
pictures, gradients and clipping are left out.

| Parameters    |                                                                            |
| ------------- | -------------------------------------------------------------------------- |
| **path**      | Optional, the `.svg` file, as listed under `assets` in your `pubspec.yaml` |
| **svg**       | Optional, the drawing itself as the text of an SVG file, instead of `path` |
| **parts**     | Optional, which parts move on their own, see below                        |
| **lineWidth** | Optional, how thick every line is on screen, in logical pixels, however big the drawing is shown. Leave it out and the lines keep the thickness they have in the file, growing and shrinking with the drawing |
| **margin**    | Optional, defaults to `24`. Room kept clear around the drawing inside its space, in logical pixels |

## Front wheels

`CarDrawing2DPartsConfig.steerableWheels` lists the names of the front wheels' groups. They then
turn on their own with `SmartifyOsCar.setSteering` (see
[Showing the Car](./showing-the-car.md#what-the-car-is-doing)), around their middle or their pivot.
The drawing has no rolling wheels, from above there's nothing to see of that.

## Moving and lighting up parts

Everything else moves when you tell it to, with `SmartifyOsCarDrawing2D` and the group's name:

```dart
// The driver's door is open: swing it out and light it up in red.
SmartifyOsCarDrawing2D.rotatePart('LeftDoor', 40);
SmartifyOsCarDrawing2D.highlightPart('LeftDoor', CarHighlight.danger);

// The headlights are on.
SmartifyOsCarDrawing2D.highlightPart('LeftLight', CarHighlight.good);
```

Turns are in degrees, clockwise as you look at the screen, counted from how the part is drawn, so
`0` is always "as it was drawn". `rotatePart` eases there, or moves at a steady `speed` (degrees a
second) if you give one. `snapPart` puts it there at once.

| Parameters  |                                                                       |
| ----------- | --------------------------------------------------------------------- |
| **name**    | The group's name in the drawing                                       |
| **degrees** | Where to turn it to, clockwise, counted from how it's drawn           |
| **speed**   | Optional, `rotatePart` only. Degrees a second. Leave it out and it eases there |

`highlightPart` draws a part in one of the theme's colours: `CarHighlight.good` (green, a light
that's on), `.warning` (amber, a light left on) or `.danger` (red, a door open). Pass `color:` for a
colour of your own. Unlike the 3D model's glow, lighting up is the normal way the drawing shows
something, use it as freely as a real dashboard would.

```dart
SmartifyOsCarDrawing2D.clearHighlight('LeftDoor');
SmartifyOsCarDrawing2D.clearHighlights(); // every part
SmartifyOsCarDrawing2D.hidePart('Roof');
SmartifyOsCarDrawing2D.showPart('Roof');
SmartifyOsCarDrawing2D.resetPart('LeftDoor'); // back as drawn, shown and not lit
```

None of these throw. A name the drawing doesn't have is simply ignored, and anything you ask for
before the drawing is on screen is already in place when it gets there.

## Colours

The lines and fills come from the theme's car colours, and the lit up parts from its good, warning
and danger colours, see [Making a Theme](../theme/making-a-theme.md).
