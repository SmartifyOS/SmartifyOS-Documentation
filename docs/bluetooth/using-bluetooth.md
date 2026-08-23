---
sidebar_position: 1
---

# Using Bluetooth

Bluetooth in SmartifyOS covers pairing, auto-connect, and phone music and calls. **Most of this
page is not something you need to do.** Once you turn Bluetooth on with `BluetoothConfig`,
SmartifyOS already pairs, reconnects and shows what's playing on its own, through the built-in
Bluetooth status icon, quick settings tile and home widget covered elsewhere in these docs. All
you actually need for a normal car is this, at startup:

```dart
await SmartifyOs().init(
  bluetooth: const BluetoothConfig(name: 'Miata'),
);
```

Everything below is for the parts SmartifyOS can't decide for you: your own pairing screen, your
own media controls, or reacting to a call coming in. Reach for the `Bluetooth` facade only when
you're building one of those yourself.

**None of the `Bluetooth` methods throw.** If a phone walks out of range halfway through a
command, the problem is reported on `Bluetooth.errors` and the app carries on, a car screen
should never crash over a Bluetooth hiccup.

## Reading state

Bluetooth state (what's playing, whether a phone is connected) changes on its own, from the phone
side, not because your code changed it. To have your own widget update the moment that happens,
watch one of the riverpod providers exported alongside `Bluetooth` instead of reading a value
once. If you've never used riverpod before, read [Riverpod Basics](../riverpod-basics.md) first,
this is the same idea, just with providers SmartifyOS already made for you instead of ones you
declare yourself.

```dart
class NowPlaying extends ConsumerWidget {
  const NowPlaying({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final track = ref.watch(bluetoothTrackProvider).value;

    return Text(track == null ? 'Nothing playing' : '${track.title ?? 'Unknown'} by ${track.artist ?? 'Unknown'}');
  }
}
```

This text updates on its own whenever the song changes, no extra code needed. The full list:
`bluetoothCapabilitiesProvider`, `bluetoothAdapterProvider`, `bluetoothDevicesProvider`,
`bluetoothConnectedDeviceProvider`, `bluetoothTrackProvider`, `bluetoothPlaybackProvider`,
`bluetoothPositionProvider`, `bluetoothCallsProvider`, `bluetoothActiveCallProvider`. The same
values are also available as plain, one-off getters on `Bluetooth` itself
(`Bluetooth.isReady`, `Bluetooth.capabilities`, `Bluetooth.adapter`, `Bluetooth.devices`,
`Bluetooth.connectedDevice`, `Bluetooth.track`, `Bluetooth.playback`, `Bluetooth.calls`), useful
inside a one-off function that isn't building UI, but reading one of those directly won't redraw
anything when it later changes.

Always check `Bluetooth.capabilities` before offering a control, Bluetooth support differs a lot
between platforms and phones:

```dart
if (Bluetooth.capabilities.has(BluetoothCapability.seek)) {
  // show a draggable progress bar
} else {
  // show a plain progress bar you cannot drag
}
```

When `Bluetooth.capabilities.isEmpty`, hide your Bluetooth UI entirely, that's what a platform
with no Bluetooth support at all (macOS, Windows) reports.

## Adapter

```dart
Bluetooth.turnOn();
Bluetooth.turnOff();          // connected devices drop
Bluetooth.setDiscoverable(true);
Bluetooth.setPairable(true);
Bluetooth.setName('Miata');
```

## Discovery

```dart
Bluetooth.startDiscovery();
Bluetooth.stopDiscovery();    // call this as soon as the user leaves the pairing screen
```

Searching and connecting compete for the same radio, don't leave discovery running longer than
you need it.

## Pairing

```dart
Bluetooth.pair(device);
Bluetooth.cancelPairing(device);
Bluetooth.forget(device);     // device has to be paired again to reconnect
```

Watch `Bluetooth.pairingRequests` to show the user the code they need to confirm.

## Connection

```dart
Bluetooth.connect(device);
Bluetooth.disconnect(device); // does not forget the device
```

## Media

```dart
Bluetooth.play();
Bluetooth.pause();
Bluetooth.playPause();        // what a single play/pause button wants
Bluetooth.next();
Bluetooth.previous();
Bluetooth.startFastForward(); // call endSeek() when the button is released
Bluetooth.startRewind();      // call endSeek() when the button is released
Bluetooth.endSeek();
Bluetooth.setRepeat(BluetoothRepeatMode.all);
Bluetooth.setShuffle(BluetoothShuffleMode.on);
Bluetooth.setPhoneVolume(0.8); // the phone's volume, not the car's
```

## Calls

```dart
Bluetooth.answerCall();  // or pass a specific call
Bluetooth.rejectCall();
Bluetooth.hangUp();      // ends every call if none is given
Bluetooth.dial('555-0100');
```

## Custom backends

`BluetoothConfig.backend` lets you swap the whole Bluetooth implementation, mainly useful for
designing your UI on a machine with no SmartifyOS Bluetooth support (macOS, say), by passing
`FakeBluetoothBackend.new`.

TODO: a full guide on implementing a `BluetoothBackend` for a new platform.
