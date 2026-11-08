---
sidebar_position: 1
---

# Using Bluetooth

Bluetooth is how the driver's phone talks to the car: music, calls, and reconnecting by itself
when they get in. It works out of the box. You turn it on with `BluetoothConfig` (from
`package:smartify_os_core/bluetooth.dart`), and only reach for the `Bluetooth` class when you build
something of your own on top of it.

## Turning it on

Every car made with `smartify-os create` already has this in `lib/main.dart`:

```dart
await SmartifyOs().init(
  bluetooth: const BluetoothConfig(name: 'Miata'),
);
```

`name` is what phones see when they look for the car. That's the whole setup for a normal car.
From there SmartifyOS takes care of the rest on its own:

- the Bluetooth page in Settings, where the driver pairs and forgets phones,
- the pairing dialog that pops up with the code to confirm,
- reconnecting to a known phone as soon as it's in range,
- the Bluetooth icon in the status bar and the tile in the quick settings,
- the music card on the home screen while the phone plays something,
- a chime when a phone connects or disconnects.

So most cars never need anything else on this page.

:::tip[Tip]

Bluetooth only works on a car running Linux for now. On an Android tablet, a Mac or a Windows
computer there's no Bluetooth, and the built-in Bluetooth parts stay out of sight. To work on a
screen of your own there anyway, use the pretend Bluetooth described in
[Trying it without a car](#trying-it-without-a-car).

:::

## Changing how it behaves

Everything else on `BluetoothConfig` is optional, the defaults are what a car wants.

| Parameters             |                                                                            |
| ---------------------- | -------------------------------------------------------------------------- |
| **name**               | Optional, the name phones see, for example `'Miata'`. Leave it out to keep whatever the computer is already called |
| **enabled**            | Optional, defaults to `true`. Set it to `false` and SmartifyOS leaves Bluetooth completely alone |
| **powerOn**            | Optional, defaults to `true`. Turns Bluetooth on when the car starts |
| **discoverable**       | Optional, defaults to `true`. Whether new phones can find the car. Set it to `false` if the car should only be findable while you call `Bluetooth.setDiscoverable(true)`, from a pairing screen of your own say |
| **pairable**           | Optional, defaults to `true`. Whether new phones may pair at all |
| **autoConnect**        | Optional, defaults to `true`. Reconnects to phones the car already knows as soon as they're in range, which is what makes the music start by itself when you get in |
| **reconnectMinDelay**  | Optional, defaults to 3 seconds. How long to wait before the first try at reconnecting |
| **reconnectMaxDelay**  | Optional, defaults to 60 seconds. The longest wait between tries. The car tries less and less often up to this, so a phone that isn't there doesn't keep the radio busy |
| **autoAcceptServices** | Optional, defaults to `true`. Lets a phone the car already trusts use music and calls without asking every time |
| **pairingMode**        | Optional, how a new phone pairs. `BluetoothPairingMode.confirmCode` (the default) shows the same code on both screens to confirm. `.showCode` shows a code to type on the phone, for a screen without reliable touch. `.none` pairs without any code, the least safe |
| **pairingTimeout**     | Optional, defaults to 45 seconds. How long a pairing question waits for an answer |
| **connectedSound**     | Optional, the sound file played when a phone connects. Leave it out for SmartifyOS's own, set it to `null` for silence |
| **disconnectedSound**  | Optional, the same for when a phone disconnects                            |
| **soundVolume**        | Optional, defaults to `1`. How loud those two sounds are, from `0` to `1`   |
| **adapter**            | Optional, which Bluetooth adapter to use, for example `'hci0'`. Only needed when the car has more than one |
| **backend**            | Optional, replaces the whole Bluetooth part, see [Trying it without a car](#trying-it-without-a-car) |

All of these can also be changed without touching code, on the Bluetooth setup page in
[the editor](../editor/setting-up-your-car.md), or with the CLI:

```bash
smartify-os config bluetooth.autoConnect off
```

:::tip[Tip]

What tells a phone it's talking to a car stereo (and not a laptop) is the computer's "class of
device". It decides the icon the phone shows, and on some phones whether music and calls are
offered at all. SmartifyOS can't set it from inside the app, it's set on the car with
`sudo btmgmt --index 0 class 4 8` after Bluetooth has started.

TODO: whether the installer sets the class of device on its own, or how an owner makes it stick
across reboots.

:::

## Building your own Bluetooth screens

Everything below is for when you build something yourself: your own music controls, a pairing
screen, or reacting to a phone call. It all goes through the `Bluetooth` class.

**None of the `Bluetooth` methods throw.** If the phone walks out of range halfway through a
command, the problem is reported on `Bluetooth.errors` and the app carries on, a car screen should
never crash over a Bluetooth hiccup.

### Reading what's going on

What's playing and whether a phone is connected change on their own, from the phone's side. To have
your own widget update the moment that happens, watch one of the providers SmartifyOS already made
for this, instead of reading a value once. This is riverpod, see
[Riverpod Basics](../riverpod-basics.md) if you haven't used it before.

```dart
class NowPlaying extends ConsumerWidget {
  const NowPlaying({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final track = ref.watch(bluetoothTrackProvider).value;

    if (track == null) return const Text('Nothing playing');
    return Text('${track.title ?? 'Unknown'} by ${track.artist ?? 'Unknown'}');
  }
}
```

This text updates by itself whenever the song changes. These are all the providers there are:

| Provider                           |                                                         |
| ---------------------------------- | ------------------------------------------------------- |
| `bluetoothConnectedDeviceProvider` | The phone that's connected right now, or `null`         |
| `bluetoothDevicesProvider`         | Every phone the car knows or can see                    |
| `bluetoothAdapterProvider`         | Whether Bluetooth is on, the car's name, whether it's findable |
| `bluetoothTrackProvider`           | The song playing: `title`, `artist`, `album`, `duration` |
| `bluetoothPlaybackProvider`        | Whether it's playing, paused or stopped, repeat and shuffle |
| `bluetoothPositionProvider`        | How far into the song it is, counting along while it plays |
| `bluetoothCallsProvider`           | Every call going on right now                           |
| `bluetoothActiveCallProvider`      | The call the driver is talking on, or `null`            |
| `bluetoothCapabilitiesProvider`    | What this car's Bluetooth can do, see below             |

The same values are also plain getters on `Bluetooth` (`Bluetooth.connectedDevice`,
`Bluetooth.devices`, `Bluetooth.adapter`, `Bluetooth.track`, `Bluetooth.playback`,
`Bluetooth.calls`, `Bluetooth.capabilities`, and `Bluetooth.isReady`). Use those inside a function
that doesn't draw anything, since reading one won't redraw anything later.

### Checking what's possible first

What Bluetooth can do differs a lot between phones and computers. Before you show a button, check
that it will actually do something:

```dart
if (Bluetooth.capabilities.has(BluetoothCapability.mediaControl)) {
  // show play, pause, next and previous
}
```

When `Bluetooth.capabilities.isEmpty`, there's no Bluetooth at all (an Android tablet, a Mac or a
Windows computer), so hide your Bluetooth screens entirely.

A few things phones simply don't offer over Bluetooth on Linux, so no car will ever report them:
jumping straight to a point in the song (`BluetoothCapability.seek`), cover art
(`BluetoothCapability.artwork`), and liking a song (`BluetoothCapability.favoriteToggle`). Holding a
button to scrub forwards and backwards (`fastForwardRewind`) works instead of jumping.

### Music

```dart
Bluetooth.playPause();        // what a single play/pause button wants
Bluetooth.play();
Bluetooth.pause();
Bluetooth.next();
Bluetooth.previous();

Bluetooth.startFastForward(); // while a button is held down...
Bluetooth.startRewind();
Bluetooth.endSeek();          // ...and once it's let go

Bluetooth.setRepeat(BluetoothRepeatMode.all);
Bluetooth.setShuffle(BluetoothShuffleMode.on);
Bluetooth.setPhoneVolume(0.8); // the phone's own volume, not the car's
```

To show the phone's music on a screen of your own, the easiest way is the same card the home screen
uses, see [Your Own Player](../music/media-player-card.md).

### Calls

```dart
Bluetooth.answerCall();   // the call that's ringing
Bluetooth.rejectCall();
Bluetooth.hangUp();       // every call, or pass the one to end
Bluetooth.dial('555-0100');
```

`answerCall`, `rejectCall` and `hangUp` also take a specific `BluetoothCall` from
`bluetoothCallsProvider`, for when there's more than one.

### Pairing and connecting

The Bluetooth page in Settings already does all of this. You only need it for a pairing screen of
your own.

```dart
Bluetooth.startDiscovery();       // look for phones nearby
Bluetooth.stopDiscovery();        // stop as soon as the driver leaves your screen
Bluetooth.pair(device);
Bluetooth.cancelPairing(device);
Bluetooth.connect(device);
Bluetooth.disconnect(device);     // the car still knows the phone
Bluetooth.forget(device);         // the phone has to be paired again
```

`device` is a `BluetoothDevice` from `bluetoothDevicesProvider`. Looking for phones and connecting
to one share the same radio, so don't leave discovery running longer than you need it.

The car itself can be switched from code too:

```dart
Bluetooth.turnOn();
Bluetooth.turnOff();              // connected phones drop
Bluetooth.setDiscoverable(true);
Bluetooth.setPairable(true);
Bluetooth.setName('Miata');
```

## Trying it without a car

On a Mac or Windows computer there's no Bluetooth. To build and try your own Bluetooth screens there
anyway, swap in the pretend Bluetooth SmartifyOS comes with:

```dart
await SmartifyOs().init(
  bluetooth: const BluetoothConfig(backend: FakeBluetoothBackend.new),
);
```

Take it out again before you put the app on the car.

TODO: a guide on writing a `BluetoothBackend` of your own for a new platform.

## Leaving the built-in parts out

If your car has its own way of showing the phone's music, or no use for Bluetooth on the home
screen, leave the built-in parts out one by one. They're named in `HomeWidgets.bluetoothPlayer`
(see [Home Widgets](../home-widgets/adding-widgets.md)), `StatusIcons.bluetooth`
(see [Status Bar](../status-bar/adding-icons.md)), `QuickSettingsTiles.bluetooth`
(see [Quick Settings](../quick-settings/adding-tiles.md)) and `SettingsPages.bluetooth`
(see [Settings](../settings/adding-pages.md)).
