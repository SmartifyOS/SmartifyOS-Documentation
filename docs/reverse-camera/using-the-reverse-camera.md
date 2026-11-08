---
sidebar_position: 1
---

# Using the Reverse Camera

SmartifyOS can show a reverse camera full screen while the car is in reverse, with guide lines that
show where the car will end up and bend as you turn the wheel. Any USB camera works: a plain webcam,
or a cheap USB grabber for the analogue camera most reverse cameras are. You set it up once with
`ReverseCameraConfig`, then tell `SmartifyOsReverseCamera` when the car goes into reverse.

## Setting it up

`smartify-os create` asks whether the car has a reverse camera, and adds it for you if it does. To
add it later, or by hand, add `reverseCamera` to `SmartifyOs().init` in `lib/main.dart`:

```dart title="lib/main.dart"
await SmartifyOs().init(
  reverseCamera: const ReverseCameraConfig(),
);
```

That's all it takes with one camera plugged in. `ReverseCameraConfig` comes from
`package:smartify_os_core/reverse_camera.dart`. Every setting on this page is also a setting of
`smartify-os config` (`reverseCamera.mirror`, `reverseCamera.guides.carWidth`, ...), see
[Changing Settings](../cli/changing-settings.md), and on the **Reverse camera** page of the editor's
Setup group.

| Parameters            |                                                                         |
| --------------------- | ----------------------------------------------------------------------- |
| **device**            | Optional, which camera, for a car with more than one, for example `'/dev/video2'`. Leave it out for the first one plugged in |
| **mirror**            | Optional, defaults to `false`. Flips the picture left to right. Set it so what's behind the car's left side shows on the left of the screen, the way a rear-view mirror shows it. Most reverse cameras already send it that way, a plain webcam pointing backwards doesn't |
| **openWhenReversing** | Optional, defaults to `true`. Fills the screen with the camera whenever the car goes into reverse. Turn it off if you only ever want to open it yourself |
| **guides**            | Optional, the guide lines over the picture, see [Guide lines](#guide-lines). Leave it out for none |
| **backend**           | Optional, for a camera SmartifyOS can't read itself, see [Other cameras](#other-cameras) |

The camera works on a car running Linux. On other systems the camera screen says it isn't
supported there.

## Telling it you're reversing

SmartifyOS can't know when the car is in reverse, so tell it from whatever your car knows it by: the
reverse light, a switch on the gearbox, a message on the
[CAN bus](../can-bus/sending-and-listening.md):

```dart
myCar.reverseLight.listen(SmartifyOsReverseCamera.setReversing);
```

`myCar.reverseLight` stands for however your own code reads the car. Going into reverse fills the
screen with the camera, coming out of it closes it again. Calling it with what's already the case
does nothing, so it's fine to call on every reading of a sensor.

The example app has no car, so it uses a key instead: `F2` in its `lib/input.dart` toggles reverse.

```dart
SmartifyOsReverseCamera.setReversing(!SmartifyOsReverseCamera.isReversing);
```

## Where the camera shows up

Besides filling the screen while reversing, the camera is in the app list (`AppListEntries.reverseCamera`)
for the driver to open any time, and the driver can put it on the home screen like a rear-view
mirror (`HomeWidgets.reverseCamera`). Both only show up on a car with a camera.

To open it from a button of your own:

```dart
ThemedButton(
  onTap: () => SmartifyOsReverseCamera.openWindow(context),
  child: const Text('Look behind'),
)
```

To put the picture anywhere else, a window or a layout of your own, use `ReverseCameraView`. It fills
whatever box it's given:

```dart
const SizedBox(
  width: 320,
  height: 180,
  child: ReverseCameraView(),
)
```

| Parameters     |                                                                     |
| -------------- | ------------------------------------------------------------------- |
| **fit**        | Optional, defaults to `BoxFit.cover`, which crops the picture to fill the box. `BoxFit.contain` shows all of it with black around it |
| **showGuides** | Optional, defaults to `true`. Draws the guide lines, if the car has them set up |

The camera is only switched on while at least one view of it is on screen, and every view shows the
same picture, so two cost no more than one.

## Guide lines

Guide lines are the two lines the width of the car, with a red one across just behind it. Add
`guides` to draw them. With the steering reported through `SmartifyOsCar.setSteering` (see
[Showing the Car](../car/showing-the-car.md#what-the-car-is-doing)) they bend as you turn the wheel.
Without it they stay straight, like the fixed lines most cars have.

```dart
ReverseCameraConfig(
  guides: ReverseCameraGuidesConfig(
    carWidth: 1.68,
    wheelbase: 2.27,
    rearOverhang: 0.89,
    cameraHeight: 0.75,
    cameraTilt: 30,
    fieldOfView: 120,
  ),
)
```

To draw them in the right place SmartifyOS needs your car's size and how the camera sits. Measure
what you can, then park a little in front of something with straight edges (a parking space works
well), open the camera and adjust the camera's angles and `fieldOfView` until the lines match.

All lengths are in metres, all angles in degrees, and every one is optional:

| Parameters           |                                                                        |
| -------------------- | ---------------------------------------------------------------------- |
| **carWidth**         | Optional, defaults to `1.75`. How wide the car is, without the mirrors |
| **wheelbase**        | Optional, defaults to `2.6`. From the middle of the front wheels to the middle of the back ones. Only used for bending the lines |
| **rearOverhang**     | Optional, defaults to `0.9`. From the middle of the back wheels to the back of the car, where the camera is |
| **cameraSideOffset** | Optional, defaults to `0`. How far the camera is from the middle of the car, positive towards the right. Many sit next to the number plate rather than over it |
| **cameraHeight**     | Optional, defaults to `0.9`. How high the camera is above the road     |
| **cameraTilt**       | Optional, defaults to `30`. How far the camera looks down, from `0` for straight back to `90` for straight down |
| **cameraYaw**        | Optional, defaults to `0`. How far the camera looks to the side, positive towards the right, for one that sits a little skewed |
| **cameraRoll**       | Optional, defaults to `0`. How far the camera is turned around its own middle, positive clockwise, for one mounted a little crooked |
| **fieldOfView**      | Optional, defaults to `120`. How wide the camera sees, left edge to right edge. It's often on the box, usually 120 to 170. A wide lens bends straight lines near the edges, the guide lines don't, so pick what matches best near the middle |
| **length**           | Optional, defaults to `4`. How far back from the car the lines go, they fade out towards the end |
| **color**            | Optional, defaults to yellow. The colour of the two lines              |
| **stopLineColor**    | Optional, defaults to red. The colour of the line across, `null` leaves it out |
| **stopLineDistance** | Optional, defaults to `0.3`. How far behind the car the line across is |

For two plain white lines instead:

```dart
ReverseCameraGuidesConfig(color: Color(0xFFFFFFFF), stopLineColor: null)
```

## Reading what it's doing

```dart
SmartifyOsReverseCamera.isSetUp; // whether the car has a camera at all
SmartifyOsReverseCamera.isReversing; // as last told with setReversing
SmartifyOsReverseCamera.status; // what the camera is doing right now
```

`status` is a `ReverseCameraStatus`: `.notSetUp`, `.unsupported` (this system can't show a camera),
`.off` (nothing is showing it), `.starting`, `.live`, or `.noPicture` (unplugged, or it stopped
sending pictures, SmartifyOS keeps trying again every few seconds while it's on screen).

To follow them, listen to `SmartifyOsReverseCamera.reversingChanges` and `.statusChanges`, or watch
`reversingProvider` and `reverseCameraStatusProvider` in a widget, see
[Riverpod Basics](../riverpod-basics.md):

```dart
final reversing =
    ref.watch(reversingProvider).value ?? SmartifyOsReverseCamera.isReversing;
```

None of the `SmartifyOsReverseCamera` methods throw. On a car without a camera they do nothing.

## Other cameras

For a camera SmartifyOS can't read itself, one on the network say, implement `ReverseCameraBackend`
and pass it as `backend`:

```dart title="lib/network_camera.dart"
class NetworkCamera implements ReverseCameraBackend {
  final _frames = StreamController<ReverseCameraFrame>.broadcast();
  final _failures = StreamController<String>.broadcast();

  @override
  bool get isSupported => true;

  @override
  Future<void> open(ReverseCameraConfig config) async {
    myCamera.onPicture = (rgba, width, height) => _frames.add(
      ReverseCameraFrame(pixels: rgba, width: width, height: height),
    );
    myCamera.onLost = () => _failures.add('The camera went away');
    await myCamera.connect();
  }

  @override
  Future<void> close() => myCamera.disconnect();

  @override
  Stream<ReverseCameraFrame> get frames => _frames.stream;

  @override
  Stream<String> get failures => _failures.stream;
}
```

```dart title="lib/main.dart"
await SmartifyOs().init(
  reverseCamera: ReverseCameraConfig(backend: NetworkCamera.new),
);
```

`myCamera` stands for whatever library talks to your camera. The camera is only open while something
shows it, so `open` and `close` are called again and again over a drive. Send pictures as fast as the
camera makes them, SmartifyOS skips the ones that arrive while the screen is still busy. Nothing in
it should throw: a camera that won't open or stops working says so on `failures`, and SmartifyOS
closes it and tries again a moment later.
