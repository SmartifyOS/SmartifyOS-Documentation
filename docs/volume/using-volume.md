---
sidebar_position: 1
---

# Using Volume

`SmartifyOsVolume`, from `package:smartify_os_core/volume.dart`, is how loud the car is. The volume
bar in the quick settings, the bar that flashes up when the volume changes, and anything you call
here all move the same volume, so you only need this page to wire up a physical volume knob or to
show the volume somewhere of your own.

On a car running Linux this is the car's real volume: it turns up and down whatever the speakers are
plugged into, and a change made somewhere else (a button on a USB sound card, say) shows up on the
screen too. On an Android tablet, a Mac or a Windows computer it's only a number SmartifyOS
remembers, so the bars still work while you try things out, but nothing gets louder.

## Turning it from a knob

```dart
myKnob.turns.listen((clicks) {
  SmartifyOsVolume.changeVolume(clicks > 0 ? 0.05 : -0.05);
});
myKnob.presses.listen((_) => SmartifyOsVolume.toggleMute());
```

`changeVolume` moves the volume up or down from wherever it is, which is what one notch of a knob
does. The bar flashes up on screen by itself, even when the knob is turned against the end and the
volume can't go any further, so the driver always sees that the knob did something.

You don't have to wait for anything or worry about turning too fast. The bars move at once, and if
the driver turns faster than the speakers can keep up, the steps in between are skipped rather than
queued.

See [Physical Controls](../focus/using-focus.md) for a knob that means volume on the home screen
and something else everywhere else.

## Reading and setting it

```dart
SmartifyOsVolume.volume;          // 0 (silent) to 1 (100%)
SmartifyOsVolume.setVolume(0.8);
SmartifyOsVolume.changeVolume(-0.05);

SmartifyOsVolume.muted;           // true while silenced
SmartifyOsVolume.setMuted(true);
SmartifyOsVolume.toggleMute();    // what pressing a volume knob usually does
```

`setVolume` keeps whatever you give it within range, so there's no need to check the number first.
Changing the volume of a muted car brings the sound back, which is what a driver expects from
turning the knob. While muted, `volume` stays where it was, so a bar can still show where unmuting
will bring it back to.

None of these throw.

## Louder than 100%

Some speakers are too quiet even at full volume. For those, the driver can switch on "Louder than
100%" in Settings, Sound. The volume can then go up to 150%. It's off until the driver chooses it,
since very loud makes the sound rough.

Because of that, the loudest the volume can go isn't always 1. Anything that draws a volume bar of
its own should go from 0 to `maxVolume`, not to a fixed 1:

```dart
final state = SmartifyOsVolume.state;
final filled = state.volume / state.maxVolume; // how full the bar is
```

To let it go to something other than 150%, or to leave the setting out entirely, use
`VolumeConfig(boostedMaxVolume: ...)`, see [Changing how it works](#changing-how-it-works).

## Showing it yourself

To have your own widget redraw whenever the volume changes, watch `volumeProvider` instead of
reading `SmartifyOsVolume` once (see [Riverpod Basics](../riverpod-basics.md)):

```dart
final state = ref.watch(volumeProvider).value ?? SmartifyOsVolume.state;
Text('${(state.volume * 100).round()}%');
```

`state` is a `VolumeState` with `volume`, `maxVolume`, `muted` and `capabilities`. It changes every
time the volume is set, even when the number stays the same (a knob turned against the end), which
is what lets the bar flash up then too. `SmartifyOsVolume.volumes` is a plain stream of the same
thing, for code that isn't drawing anything.

Not every car lets SmartifyOS do everything with its volume. Check before you show a control:

```dart
if (SmartifyOsVolume.capabilities.has(VolumeCapability.mute)) {
  // show a mute button
}
```

The capabilities are `VolumeCapability.change`, `.mute`, `.duck` (see below) and `.boost` (louder
than 100%).

## Turning everything else down

When the car has something to say, a voice assistant answering or a navigation voice, the music
should get quieter for a moment, the way a phone does. Ask for that with `duckAudio`, and release
it once you're done:

```dart
final duck = SmartifyOsVolume.duckAudio();
await sayWhatYouHaveToSay();
duck.release();
```

While you hold the duck, everything else playing (the phone's music, the
[file player](../music/file-player.md)) turns down to a quarter of how loud it was. Pass a `level`
to pick another amount, `duckAudio(level: 0.5)` keeps it at half. The volume itself doesn't move,
and SmartifyOS's own sounds ([`SmartifyOsSound`](../sound/playing-sounds.md)) are never turned
down, so what you're saying stays clear.

Several ducks can be held at once, and the music only comes back once every one of them has been
released, so always release yours, even when something went wrong. This only works on a car running
Linux so far, elsewhere it does nothing.

## Changing how it works

`VolumeConfig`, passed to `SmartifyOs.init` in `lib/main.dart`, is one you can almost always leave
out:

| Parameters           |                                                                            |
| -------------------- | -------------------------------------------------------------------------- |
| **enabled**          | Optional, defaults to `true`. Set it to `false` and SmartifyOS never touches the volume, and the volume bar is left out of the quick settings |
| **boostedMaxVolume** | Optional, defaults to `1.5` (150%). How loud the car can go once the driver allows louder than 100%. `1` leaves that setting out of Settings entirely |
| **backend**          | Optional, replaces the whole volume part, for an amplifier of your own, see below |

You can change these with the CLI too, or on the System setup page in
[the editor](../editor/setting-up-your-car.md):

```bash
smartify-os config volume.boostedMaxVolume 1.2
```

## An amplifier of your own

If the car's volume lives somewhere SmartifyOS doesn't know about, an amplifier you talk to over a
serial port say, the quickest way is to keep SmartifyOS's volume as it is and send every change on
to your amplifier:

```dart
SmartifyOsVolume.volumes.listen(myAmplifier.writeVolume);
```

Once your amplifier can also change by itself (it has its own knob), write a `VolumeBackend` and
pass it as `VolumeConfig(backend: MyAmplifierVolume.new)`, so SmartifyOS hears about those changes
too. Its doc comment in `smartify_os_core` has a complete example.

TODO: a full guide on writing a `VolumeBackend`.
