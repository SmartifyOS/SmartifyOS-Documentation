---
sidebar_position: 2
---

# Car Orbit Background

`CarOrbitBackground` renders a 3D model of your own car behind everything else on screen. Drag
anywhere on the home screen to orbit around it, and drive it from anywhere with
`CarAnimationController.instance`, the wheels roll, the front wheels steer, and any named part of
your model can be rotated (handy for doors, headlights, wing mirrors).

This needs a `.glb` 3D model of your car with its parts (wheels, doors, ...) set up as separate,
named objects inside it, a single solid model with no separate parts won't animate. If you don't
have one yet, use [Image Background](./image-background.md) for now and switch later, nothing
else in SmartifyOS depends on which background you pick.

```dart
runApp(
  SmartifyOsApp(
    background: CarOrbitBackground(
      modelPath: 'assets/miata_model.glb',
      scale: 0.7,
      offsetRotation: Offset3D(0, 180, 0),
      config: const CarSceneConfig(
        rollingWheels: [
          WheelConfig(objectName: 'LeftFrontWheel', invertSpin: true),
          WheelConfig(objectName: 'RightFrontWheel', invertSpin: true),
        ],
        steerableWheels: [
          SteerableWheelConfig(holderObjectName: 'FLWheelHolder'),
        ],
        steeringWheel: SteeringWheelConfig(objectName: 'SteeringWheel'),
      ),
    ),
  ),
);
```

| Parameters      |                                                                            |
| ------------------- | ---------------------------------------------------------------------------- |
| **modelPath**       | Optional, the `.glb` file to load, as an asset path from your own app       |
| **scale**           | Optional, shrinks or grows the model, `1.0` is the model's own size, defaults to `1.0` |
| **offsetRotation**  | Optional, turns the whole model to face the way you want, in degrees around each axis, most models need `Offset3D(0, 180, 0)` to face forward |
| **config**          | Which named parts move, and how, see below                                  |

`CarSceneConfig` is where you tell SmartifyOS which named objects inside the model are wheels
and a steering wheel:

| Parameters              |                                                                    |
| -------------------------- | ---------------------------------------------------------------------- |
| **rollingWheels**           | Optional, every wheel that should spin while driving, `WheelConfig(objectName: ...)` for each, `invertSpin: true` if one spins the wrong way |
| **steerableWheels**         | Optional, the front wheels' steering parts, `SteerableWheelConfig(holderObjectName: ...)` for each |
| **steeringWheel**           | Optional, the interior steering wheel, `SteeringWheelConfig(objectName: ...)` |

Leave any of them out and SmartifyOS simply doesn't animate that part.

Once it's running, drive the rig from anywhere in your own code:

```dart
CarAnimationController.instance.speed = 180;      // degrees/s wheel spin
CarAnimationController.instance.steerAngle = 25;  // degrees
CarAnimationController.instance.rotateY('Door_FL', 45); // rotate any named part
```

TODO: a full guide on preparing and rigging a `.glb` model for `CarOrbitBackground`.
