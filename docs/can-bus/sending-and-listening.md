---
sidebar_position: 2
---

# Sending and Listening

Once your boards and messages are defined (see
[Defining Devices and Messages](./defining-devices.md)), you use the bus from your app with
`SmartifyOsCan`. Everything goes by the names you defined, you never touch raw bytes.

**Nothing on `SmartifyOsCan` throws, and nothing has to be awaited.** Sending while no adapter is
plugged in, or a value that doesn't fit its field, is logged and the car carries on.

## Listening for a message

Call `SmartifyOsCan.messages` with the message you want, and you get every one that arrives.
Read each value with `get` and the field it belongs to:

```dart
SmartifyOsCan.messages(ExampleLights.state).listen((message) {
  final bool on = message.get(ExampleLights.on);
  showHeadlights(on: on);
});
```

`get` hands the value back as the kind its field holds: a `bool` for a `CanBoolField`, an `int`
for a `CanIntField`, your own `enum` value for a `CanChoiceField`.

Put this in a function of your own, for example `startExampleLights()` in `lib/lights.dart`, and
call that once from `main` right after `SmartifyOs().init`. The example app does exactly that:

```dart title="lib/main.dart"
await SmartifyOs().init(/* ... */);

// Listening to the lights on the CAN bus (lights.dart).
startExampleLights();

runApp(const SmartifyOsApp());
```

It doesn't matter whether the board is connected yet, or whether the message was even put in
`CanConfig`: listening works from the start, and frames simply start arriving once they do.

`SmartifyOsCan.lastMessage(ExampleLights.state)` gives you the last one that came in, or `null`
when none has since the car started.

## Sending a message

```dart
SmartifyOsCan.sendMessage(ExampleScreen.headlights, {ExampleScreen.on: true});
```

Give the message and a map of field to value. A field you leave out is sent as its default
(`false`, `0`, or the first choice).

`sendMessage` returns whether an adapter took the message, which is `false` while none is
plugged in. It can't tell you whether a board actually did anything about it. When that matters,
have the board send its new state back and listen for that, which is how the example's lights
work: the screen asks with `headlightsRequest`, and only shows the lights as on once the board
answers with `lightsState`.

The screen never hears its own messages, like every device on a CAN bus it only hears what the
others send.

## Is a board there?

```dart
if (SmartifyOsCan.isDeviceOnline(ExampleLights.device)) {
  SmartifyOsCan.sendMessage(ExampleScreen.headlights, {ExampleScreen.on: on});
} else {
  // No lights board (say, while you work on your computer), so only change the screen.
  showHeadlights(on: on);
}
```

`SmartifyOsCan.deviceStatus(device)` tells you more: its `state` (`online`, `lost`, `stuck`,
`safeMode`, `updating` or `unseen`), the `firmware` version it runs, and when it was `lastSeen`.
`SmartifyOsCan.devices` lists every board, and `SmartifyOsCan.deviceChanges` fires whenever one
comes or goes. You don't need any of this just to show the driver which boards are there,
**Settings, Vehicle, Devices in the car** already does.

## In your own widgets

To have a widget redraw whenever a message arrives, watch `canMessageProvider` instead of
listening yourself. It needs a `ConsumerWidget`, see [Riverpod Basics](../riverpod-basics.md) if
you haven't used one before:

```dart
class LightsIndicator extends ConsumerWidget {
  const LightsIndicator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(canMessageProvider(ExampleLights.state)).value;
    final on = state?.get(ExampleLights.on) ?? false;

    return Icon(on ? Icons.highlight : Icons.highlight_off);
  }
}
```

It starts with the last message that came in, if there was one. `canDevicesProvider` does the same
for the list of boards and how each is doing.

## Showing a value from the bus

A number a board sends, an oil temperature or the engine speed, usually belongs in the info
display rather than a widget of your own. Hand each reading to it as it arrives:

```dart
SmartifyOsCan.messages(Engine.state).listen((message) {
  SmartifyOsInfoDisplay.reportReading('rpm', message.get(Engine.rpm));
});
```

See [Info Display](../info-display/adding-values.md) for setting up the `rpm` value it reports
to.

## Raw frames

For listening to a car's own factory bus, where you don't know yet what each frame means,
`SmartifyOsCan.frames` hands you every frame that comes in, whatever it is, and
`SmartifyOsCan.sendFrame` sends one as it is:

```dart
SmartifyOsCan.frames.listen((frame) {
  SmartifyOsLog.debug('Can', '${frame.id.toRadixString(16)}: ${frame.data}');
});

SmartifyOsCan.sendFrame(const CanFrame(id: 0x123, data: [1, 2, 3]));
```

Once you've worked out what a frame means, define a `CanMessage` for it and use `messages`
instead. Set `listenOnly: true` in `CanConfig` while you explore a car's own bus, so SmartifyOS
never puts anything on it that could confuse the car.

**Developer options, CAN monitor** in Settings shows every frame on the bus as it happens, with
the names and values of every message you defined. It's the quickest way to see who sends what,
see [Developer Options](../developer-options/using-developer-options.md).

## Trying it without the hardware

You don't need a single board to work on the screens that use them. While your app runs in the
editor, its bus panel lists every board, can pretend one is connected, and sends any message into
the app as if that board had sent it, see
[Trying Devices Without the Car](../editor/trying-devices.md).

To do the same from code, a test or a pretend car say, give SmartifyOS a `ManualCanAdapter` and
keep hold of it:

```dart
final bus = ManualCanAdapter();

await SmartifyOs().init(
  can: CanConfig(
    adapters: [() => bus],
    devices: [ExampleLights.device],
    messages: [ExampleLights.state, ExampleScreen.headlights],
  ),
);

// As if the lights board said the lights are on:
bus.receiveMessage(ExampleLights.state, {ExampleLights.on: true});

// Everything the app sends:
bus.sentFrames.listen((frame) => SmartifyOsLog.debug('Can', '$frame'));
```

`bus.receiveHeartbeat(ExampleLights.device)` makes the board count as connected. Call it at least
once a second, the way a real board does, or it counts as gone again.
