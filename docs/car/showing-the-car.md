---
sidebar_position: 1
---

# Showing the Car

SmartifyOS can show your own car on the screen, set up once with `CarConfig` and drawn wherever
the layout puts it. Its wheels roll with the speed, the front wheels turn with the steering, and
you can open doors or light up parts from your own code, so the car on screen always looks like
the real one parked outside.

## Picking how it's drawn

There are three ways to draw the car. Give whichever one you have:

| Look            | What it is                                                                 | Good for                                   |
| --------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| **3D model**    | A `.glb` file, the driver can turn it with a finger                        | The most to look at, needs a decent graphics chip, see [The 3D Model](./3d-model.md) |
| **2D drawing**  | An `.svg` file of outlines seen from above, like an old dashboard display | Next to no work for the computer, great on a Raspberry Pi, see [The 2D Drawing](./2d-drawing.md) |
| **Picture**     | A plain `.png` or `.jpg`, a photo of your car say                          | The quickest way to get started            |

You don't need to write any code for this. `smartify-os create` asks whether you have a 3D model,
a drawing or a picture of the car, and you can add or swap one any time:

```bash
smartify-os appearance --model-3d ~/Downloads/golf.glb
```

```bash
smartify-os appearance --drawing ~/Downloads/golf.svg
```

```bash
smartify-os appearance --picture ~/Downloads/golf.jpg
```

The CLI copies the file into your app's `assets` folder, lists it in `pubspec.yaml` and writes the
code for you. In the editor, the same is on the **The car on the screen** page of the Setup group,
see [Setting Up Your Car](../editor/setting-up-your-car.md).

This is what ends up in `lib/main.dart`, in case you'd rather write it yourself:

```dart title="lib/main.dart"
await SmartifyOs().init(
  car: const CarConfig(
    model3D: CarModel3DConfig(path: 'assets/golf.glb'),
    drawing2D: CarDrawing2DConfig(path: 'assets/golf.svg'),
  ),
);
```

`CarConfig` comes from `package:smartify_os_core/car.dart`. Every file you name in it has to be
listed under `flutter: assets:` in your `pubspec.yaml`, the CLI does that for you, by hand it's:

```yaml
flutter:
  assets:
    - assets/golf.glb
    - assets/golf.svg
```

| Parameters       |                                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| **model3D**      | Optional, the car as a 3D model, see [The 3D Model](./3d-model.md)                |
| **drawing2D**    | Optional, the car as a 2D drawing, see [The 2D Drawing](./2d-drawing.md)          |
| **image**        | Optional, the car as a picture, see [A picture](#a-picture) below                 |
| **look**         | Optional, which of the three the car starts out as (`CarLook.model3D`, `.drawing2D` or `.image`). Leave it out for the first one you gave, in the order of this table |
| **speedFromGps** | Optional, defaults to `true`. Rolls the wheels at the speed [GPS](../gps/using-gps.md) reports. Turn it off to set the speed yourself, see [What the car is doing](#what-the-car-is-doing) |

Give more than one and the driver can switch between them in Settings, Appearance. One that isn't
on screen costs nothing, a 3D model nobody picks is never even loaded. If the 3D model can't be
drawn on the machine, SmartifyOS quietly draws the car the next way you gave instead.

Leave `car` out of `SmartifyOs().init` altogether and there's simply no car, the space the layout
keeps for it stays empty.

### A picture

A picture is the simplest of the three, it's just drawn where the car would be:

```dart
CarConfig(
  image: CarImageConfig(path: 'assets/golf.jpg'),
)
```

| Parameters      |                                                                         |
| --------------- | ----------------------------------------------------------------------- |
| **path**        | The picture, as listed under `assets` in your `pubspec.yaml`            |
| **fit**         | Optional, defaults to `BoxFit.cover`, which fills all of the space, right for a photo behind everything. Use `BoxFit.contain` for a picture of just the car, which then sits in the middle of its space like the model and the drawing do |
| **alignment**   | Optional, defaults to `Alignment.center`. Which part of the picture stays in view when it doesn't fit exactly |

## Where the car shows up

You don't put the car on screen yourself, the layout does. Every built-in layout already has a
spot for it, some behind everything, some in a panel of their own (see
[Picking a Layout](../layouts/picking-a-layout.md)). The driver can also drop the car onto the home
screen as a widget (`HomeWidgets.car`).

The piece a layout uses for this is `CarView`. You only need it yourself when you build a layout of
your own (see [Making a Layout](../layouts/making-a-layout.md)), or want the car inside one of your
own windows:

```dart
const SmartifyOsWindow(
  title: 'Doors',
  child: CarView(),
)
```

| Parameters      |                                                                         |
| --------------- | ----------------------------------------------------------------------- |
| **interactive** | Optional, defaults to `true`. Whether dragging across it turns the 3D car. Turn it off when something else already turns it, a `CarSpace` (below) say |
| **camera**      | Optional, shows the 3D car from one of your own camera spots by name, inside the cabin say, see [Cameras](./3d-model.md#cameras). The drawing and the picture ignore it |

There's only one car, so only one `CarView` on screen shows it. A second one says the car is
already on the screen instead of drawing it twice. A `CarView` in a window borrows the car from the
home screen while the window is open and hands it back when it closes.

### Keeping the car clear of cards

A car drawn behind everything fills the whole screen, but it shouldn't sit behind a card or a
panel. A layout leaves a `CarSpace` where the car should be, and the background car shrinks to fit
it and moves into its middle. That's how the classic layout pushes the car down while a card is
showing. Dragging across a `CarSpace` turns the car, and holding it lets the driver change the
home screen's widgets. See [Making a Layout](../layouts/making-a-layout.md) for how to use it.

## What the car is doing

Speed and steering are the same however the car is drawn, so they live in `SmartifyOsCar`.

The wheels already roll at the speed the car is doing, as soon as [GPS](../gps/using-gps.md)
reports one, nothing to wire up. The steering is up to you, from whatever your car knows it by (a
steering angle sensor on the CAN bus, say):

```dart
SmartifyOsCar.setSteering(20); // degrees, positive is right
```

This turns the front wheels in the 3D model and the drawing alike, the steering wheel inside the 3D
car, and the guide lines of the [reverse camera](../reverse-camera/using-the-reverse-camera.md).

If you set `speedFromGps: false`, roll the wheels yourself instead:

```dart
SmartifyOsCar.setSpeed(22.8); // metres per second
```

None of the `SmartifyOsCar` methods throw, and calling them before the car is on screen is fine,
it's already in place when it gets there.

## Switching looks from code

The driver picks the look in Settings, Appearance. To do the same from your own code:

```dart
SmartifyOsCar.looks; // every look you gave, in the order the driver sees them
SmartifyOsCar.look; // the one on screen now, or null when there's no car
SmartifyOsCar.selectLook(CarLook.drawing2D); // switch, and remember it
SmartifyOsCar.resetLook(); // forget the pick, back to CarConfig.look
```

To redraw a widget of your own when the look changes, watch `carLookProvider`, see
[Riverpod Basics](../riverpod-basics.md) if you haven't used that before.

## Moving single parts

Opening a door or lighting up a headlight works differently for each look, since what makes sense
to show differs: the 3D model's pop-up headlights tip up, while the drawing, seen from above, lights
them up instead. So each has its own: `SmartifyOsCarModel3D` (see
[The 3D Model](./3d-model.md#moving-parts)) and `SmartifyOsCarDrawing2D` (see
[The 2D Drawing](./2d-drawing.md#moving-and-lighting-up-parts)). If your car has both looks, call
both, the example app's `lib/lights.dart` does exactly that:

```dart
void showHeadlights({required bool on}) {
  for (final light in ['LeftLight', 'RightLight']) {
    SmartifyOsCarModel3D.rotatePart(light, on ? 45 : 0, axis: RotationAxis.x);
    if (on) {
      SmartifyOsCarDrawing2D.highlightPart(light, CarHighlight.good);
    } else {
      SmartifyOsCarDrawing2D.clearHighlight(light);
    }
  }
}
```

## Colours

What's around the car (the background behind it, the floor under the 3D model) and the colours of
the drawing come from the theme, so the car matches whichever theme is on. See
[Making a Theme](../theme/making-a-theme.md) to change them.
