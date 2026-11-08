---
sidebar_position: 2
---

# The 3D Model

A 3D model is the most impressive way to show your car: the driver can spin it round with a finger,
the wheels roll, the doors swing open and the lights come on. You give it as a `.glb` file in
`CarModel3DConfig`, inside the `CarConfig` from [Showing the Car](./showing-the-car.md).

```dart title="lib/main.dart"
await SmartifyOs().init(
  car: const CarConfig(
    model3D: CarModel3DConfig(
      path: 'assets/golf.glb',
      scale: 0.7,
      rotation: Offset3D(0, 180, 0),
    ),
  ),
);
```

It's also the most work for the computer. On a small board like a Raspberry Pi, a
[2D drawing](./2d-drawing.md) looks just as much like your car for a fraction of the effort, and you
can give both and let the driver pick.

## The easy way

Most of this page can be done without writing code:

- `smartify-os appearance --model-3d ~/Downloads/golf.glb` copies the model into your app and sets
  it up.
- `smartify-os config` changes everything else on this page by name, for example
  `smartify-os config car.model3D.scale 0.8`, see [Changing Settings](../cli/changing-settings.md).
- In the editor, the **The car on the screen** page of the Setup group has sliders for the size,
  position, turn and lighting that move the car in the preview as you drag, and lets you pick the
  wheels and steering wheel from a list of the objects in your model. See
  [Setting Up Your Car](../editor/setting-up-your-car.md).

Everything below is what those write into `lib/main.dart`, for when you want to know what a setting
does or change it by hand.

## Preparing the model

Any program that exports `.glb` works, the example car was made in Blender. A few things make the
difference between a model that just sits there and one that moves:

1. **Every part that moves is its own object, with a name.** A door, a headlight, a wheel. A model
   that is one solid lump can still be shown, but nothing on it can move. You'll refer to parts by
   these names in your code, so pick plain ones without spaces, like `LeftDoor` or
   `RightFrontWheel`.
2. **A part turns around its own origin.** In Blender that's the object's origin point, so put it
   on the hinge of a door, or the middle of a wheel (Object, Set Origin).
3. **A front wheel sits inside a holder.** To steer and roll at the same time, put each front wheel
   inside an object of its own (the knuckle, an empty works fine). The holder turns with the
   steering, the wheel inside it keeps rolling.
4. **Export as glTF Binary (`.glb`).** Blender's default export settings are fine. Blender's "up"
   (Z) comes out as `y` in the file, which is why most settings below talk about turning around `y`
   to steer.

Angles in SmartifyOS are always counted from how a part sits in the file, so `0` means "as it was
modelled". Model the doors shut and the headlights down, and opening them is a positive number.

TODO: a step by step Blender guide with screenshots, including which export options matter.

## Placing it

| Parameters       |                                                                                  |
| ---------------- | -------------------------------------------------------------------------------- |
| **path**         | Optional, the `.glb` file, as listed under `assets` in your `pubspec.yaml`. Leave it out to get a plain red box, handy while you set up the rest |
| **scale**        | Optional, defaults to `1`. Grows or shrinks the car. Adjust it until the car fills a comfortable part of the screen when it has all of it. That's the biggest it's ever drawn, wherever a layout gives it less room it's shrunk to fit |
| **rotation**     | Optional, turns the model, in degrees around `x`, `y` and `z`. Most models need `Offset3D(0, 180, 0)` to face the right way |
| **offset**       | Optional, moves the model away from the middle of the scene, in the model's own units. For a model that wasn't centred in the file |
| **lookAtHeight** | Optional, defaults to `0.5`. How high the camera aims, in the model's units. Raise it for a taller car (an SUV, a van), the car then sits lower in its space |
| **parts**        | Optional, which parts move on their own, see [Wheels and steering](#wheels-and-steering) |
| **render**       | Optional, how sharply the car is drawn and how it's lit, see [Sharpness and lighting](#sharpness-and-lighting) |
| **cameras**      | Optional, other places to look at the car from, see [Cameras](#cameras)            |
| **lights**       | Optional, lamps in the car you can switch on, see [Lights](#lights)                |

The driver turns the car by dragging across it, sideways to walk round it, up and down to look from
higher or lower. While the model loads a spinner shows, and a car in the background keeps the boot
screen up a little longer instead, so it's already there when the screen first appears.

## Wheels and steering

Tell SmartifyOS which objects are the wheels and the steering wheel, and they move on their own,
with no code: the wheels roll at the car's speed, the front wheels and the steering wheel turn with
`SmartifyOsCar.setSteering` (see [Showing the Car](./showing-the-car.md#what-the-car-is-doing)).

```dart
CarModel3DConfig(
  path: 'assets/golf.glb',
  parts: CarModel3DPartsConfig(
    rollingWheels: [
      WheelConfig(objectName: 'LeftFrontWheel'),
      WheelConfig(objectName: 'RightFrontWheel'),
      WheelConfig(objectName: 'LeftBackWheel'),
      WheelConfig(objectName: 'RightBackWheel'),
    ],
    steerableWheels: [
      SteerableWheelConfig(holderObjectName: 'FLWheelHolder'),
      SteerableWheelConfig(holderObjectName: 'FRWheelHolder'),
    ],
    steeringWheel: SteeringWheelConfig(objectName: 'SteeringWheel'),
    wheelCircumference: 1.86,
  ),
)
```

| Parameters             |                                                                           |
| ---------------------- | ------------------------------------------------------------------------- |
| **rollingWheels**      | Optional, every wheel that rolls, front ones included, a `WheelConfig` each |
| **steerableWheels**    | Optional, the holders of the front wheels, a `SteerableWheelConfig` each  |
| **steeringWheel**      | Optional, the steering wheel inside the car                              |
| **wheelCircumference** | Optional, defaults to `1.9`. How far the car travels in one turn of a wheel, in metres, which is what turns the speed into a wheel spin. Multiply the tyre's diameter by pi: a 195/50R15 is about 0.59 m across, so 1.86 |

Anything you leave out simply doesn't move on its own.

`WheelConfig` takes the wheel's `objectName`, the `spinAxis` it rolls around (optional, defaults to
`RotationAxis.x`) and `invertSpin` (optional, defaults to `false`) for a wheel that rolls backwards
while the car drives forwards.

`SteerableWheelConfig` takes the holder's `holderObjectName` and the `steerAxis` it turns around
(optional, defaults to `RotationAxis.y`).

`SteeringWheelConfig` takes its `objectName`, the `rotationAxis` it turns around (optional, defaults
to `RotationAxis.z`) and `maxRotation` (optional, defaults to `450`), how many degrees it turns with
the front wheels all the way over.

If a wheel spins or steers the wrong way, try `invertSpin`, or another axis.

## Moving parts

Every other part moves when you tell it to, with `SmartifyOsCarModel3D` and the part's name in the
model. Call it from wherever your car tells you something changed, a door sensor on the CAN bus,
say:

```dart
// Swing the driver's door open.
SmartifyOsCarModel3D.rotatePart('LeftDoor', -40, axis: RotationAxis.y);

// Raise the pop-up headlights.
SmartifyOsCarModel3D.rotatePart('LeftLight', 45, axis: RotationAxis.x);
```

`rotatePart` eases the part to that angle. Pass a `speed` (in degrees a second) to move it at a
steady pace instead, or use `snapPart` to put it there at once:

```dart
SmartifyOsCarModel3D.rotatePart('Trunk', 60, axis: RotationAxis.x, speed: 30);
SmartifyOsCarModel3D.snapPart('Trunk', 0, axis: RotationAxis.x);
```

| Parameters  |                                                                              |
| ----------- | ---------------------------------------------------------------------------- |
| **name**    | The part's name in the model                                                 |
| **degrees** | Where to turn it to, counted from how it sits in the model                    |
| **axis**    | Which of the part's own axes to turn around, `RotationAxis.x`, `.y` or `.z`   |
| **speed**   | Optional, `rotatePart` only. Degrees a second. Leave it out and it eases there |

A few more for showing and hiding things:

```dart
SmartifyOsCarModel3D.hidePart('Roof'); // the roof is off
SmartifyOsCarModel3D.showPart('Roof');
SmartifyOsCarModel3D.resetPart('LeftDoor'); // back as modelled, shown and not glowing
```

None of these throw. A name the model doesn't have is simply ignored, and anything you ask for
before the model is on screen is already in place when it gets there.

### Warning glow

`highlightPart` makes a part glow in one of the theme's warning colours:

```dart
SmartifyOsCarModel3D.highlightPart('LeftDoor', CarHighlight.danger);
SmartifyOsCarModel3D.clearHighlight('LeftDoor');
SmartifyOsCarModel3D.clearHighlights(); // every part
```

`CarHighlight.good` is green, `.warning` amber and `.danger` red, in whatever shades the theme uses.
Pass `color:` for a colour of your own. Keep it for something the driver must know about while
driving, a door that came open say. A parked car doesn't need its open door glowing at it.

## Cameras

Normally the driver walks round the car. A camera is another fixed spot to look from, inside the
cabin say, for a window of your own. Give it a name:

```dart
CarModel3DConfig(
  path: 'assets/golf.glb',
  cameras: [
    CarModel3DCameraConfig(
      name: 'interior',
      position: Offset3D(0.05, 1.9, 1.3),
      lookAt: Offset3D(0.05, 0.75, -0.7),
    ),
  ],
)
```

Then put a `CarView` that asks for it in your window:

```dart
const SmartifyOsWindow(
  title: 'Ambient light',
  child: CarView(camera: 'interior'),
)
```

While the window is open the camera glides to that spot, and back out when it closes. The car can't
be turned meanwhile.

| Parameters      |                                                                     |
| --------------- | ------------------------------------------------------------------- |
| **name**        | What a `CarView` asks for it by, different for every camera        |
| **position**    | Where the camera is                                                 |
| **lookAt**      | The point it looks at                                               |
| **fieldOfView** | Optional, defaults to `60`. How wide it sees, top to bottom, in degrees. Wider shows more of a cramped cabin |

Both points are in the model's own units, as it sits in the file before `scale`, `rotation` and
`offset`. They're the numbers Blender shows you, except that Blender's Z (up) is `y` here.

## Lights

Lamps let the 3D car show a light the real one has: the interior light, LEDs in the footwell in the
colour the driver picked. They're off until you switch them on:

```dart
CarModel3DConfig(
  path: 'assets/golf.glb',
  lights: [
    CarModel3DLightConfig(
      name: 'leftFootwell',
      position: Offset3D(-0.6, 0.55, -0.85),
    ),
  ],
)
```

```dart
SmartifyOsCarModel3D.turnOnLight('leftFootwell', color: Colors.purple);
SmartifyOsCarModel3D.turnOffLight('leftFootwell');
SmartifyOsCarModel3D.turnOffLights(); // every lamp
```

Calling `turnOnLight` again on a lamp that's already on changes its colour. It also takes an
optional `brightness`, for that one time.

| Parameters     |                                                                    |
| -------------- | ------------------------------------------------------------------ |
| **name**       | What `turnOnLight` switches it by, different for every lamp        |
| **position**   | Where the lamp is, in the model's own units like a camera's        |
| **reach**      | Optional, defaults to `1.2`. How far its light reaches, in model units |
| **brightness** | Optional, defaults to `3`. How bright it is when switched on without a brightness of its own |

The lamps are part of the scene from the start, so switching one costs nothing. They don't cast
shadows, the shadow under the car is worked out from the car's own shape.

## Sharpness and lighting

`CarModel3DRenderConfig` decides how many pixels the car is drawn with and how it's lit. The
defaults look good on most screens, come here when the car moves less smoothly than you'd like:

```dart
CarModel3DConfig(
  path: 'assets/golf.glb',
  render: CarModel3DRenderConfig(scale: 0.5, exposure: 1.3),
)
```

| Parameters               |                                                                        |
| ------------------------ | ---------------------------------------------------------------------- |
| **scale**                | Optional, defaults to `1`. How many pixels the car is drawn with, next to the screen's. `0.5` is a quarter of the work, and on a small, sharp screen (a phone, a small display in the dash) it looks the same. On a big screen the car goes soft below about `0.75`. Turn this down first if the car stutters. Kept between `0.25` and `2` |
| **exposure**             | Optional, defaults to `1.15`. How bright the picture is overall. Raise it for a brighter, more open look, lower it for a moodier one |
| **environmentIntensity** | Optional, defaults to `0.55`. How strongly the paint, chrome and rims reflect the soft studio lights around the car. Too much washes the colour out, `0` turns the reflections off entirely, which is cheapest and flattest |
| **shadowMapSize**        | Optional, defaults to `512`. How finely the shadow under the car is drawn. It's only worked out while loading and after a part moved, so this costs memory, not smoothness |
| **vignette**             | Optional, defaults to `true`. Darkens the corners of the car's picture slightly, the way a camera lens does, to draw the eye to the car |

The car is only drawn while something moves (a part, the camera, the speed, the steering), so a car
standing still costs nothing at all.

The colours around the car (the background, the floor and the glow under it) come from the theme,
see [Making a Theme](../theme/making-a-theme.md).
