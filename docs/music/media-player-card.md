---
sidebar_position: 2
---

# Your Own Player

If something in your car plays music that SmartifyOS doesn't know about, a radio module or a player
in an extension of yours, show it on the home screen with `MediaPlayerCard`, from
`package:smartify_os_core/media.dart`. It's the same card the phone's music and the
[file player](./file-player.md) use, so every player in the car looks and works alike, and you
don't have to design one yourself.

You hand it three things: what's playing (`MediaPlayerInfo`), what the buttons do
(`MediaPlayerControls`), and where the music comes from. The card arranges itself to fit, one row
in a narrow strip, or the cover above the buttons in a taller box.

## Showing it on the home screen

A player goes on the home screen as a [home widget](../home-widgets/adding-widgets.md) whose
`builder` returns the card. This one is a radio with its own code in `lib/radio.dart`, keeping
what's playing in a `ValueNotifier` (a value that tells whoever is watching when it changes, see
[Values That Change](../saved-values.md)):

```dart title="lib/radio.dart"
import 'package:flutter/foundation.dart';
import 'package:smartify_os_core/media.dart';

/// What the radio is playing right now. Your radio code sets this whenever
/// the station or the song changes.
final radioNowPlaying = ValueNotifier(MediaPlayerInfo.nothing);

void radioPlayPause() {
  // Tell your radio module to play or pause here.
}

void radioNextStation() {}
void radioPreviousStation() {}
```

```dart title="lib/home_widgets/radio_widget.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/home_widgets.dart';
import 'package:smartify_os_core/media.dart';
import 'package:smartify_os_core/saved_values.dart';
import 'package:smartify_os_my_car_app/radio.dart';

final radioWidget = HomeWidget(
  id: 'radio',
  title: 'Radio',
  icon: const Icon(Icons.radio),
  // Only on screen while the radio has something to show.
  visible: (home) => home.ref.watchValue(radioNowPlaying).hasTrack,
  // The driver listens to one thing at a time, so the phone's card makes way.
  replaces: const {HomeWidgets.bluetoothPlayer},
  builder: (home) => MediaPlayerCard(
    info: home.ref.watchValue(radioNowPlaying),
    controls: const MediaPlayerControls(
      onPlayPause: radioPlayPause,
      onNext: radioNextStation,
      onPrevious: radioPreviousStation,
    ),
    sourceIcon: const Icon(Icons.radio),
    sourceName: 'FM radio',
  ),
);
```

Then hand `radioWidget` to `HomeWidgetsConfig(widgets: [...])` in `lib/main.dart`, like any other
home widget. `ref.watchValue` is what makes the card redraw whenever your radio code changes
`radioNowPlaying`. (`smartify_os_my_car_app` stands for your own app's name, the `name:` at the top
of its `pubspec.yaml`.)

## Making way for each other

`replaces` is how players share the home screen. While your card is visible, the cards named in
`replaces` stay off it. Almost every player wants `{HomeWidgets.bluetoothPlayer}` here: the driver
listens to one thing at a time, and something like Android Auto even reports the same song over
Bluetooth, which would show it twice.

A card the driver swiped away still keeps the others off screen, so the song they just sent away
doesn't pop straight back up on another card.

## What's playing

`MediaPlayerInfo` holds what your player knows about the song. Fill in what you have and leave the
rest out, the card leaves out whatever is missing: no cover without `artwork`, no progress bar
without `duration` and `position`, no shuffle button without `shuffle`.

```dart
radioNowPlaying.value = MediaPlayerInfo(
  title: 'Midnight Drive',
  artist: 'The Coastliners',
  isPlaying: true,
  duration: const Duration(minutes: 3, seconds: 42),
  position: const Duration(seconds: 61),
  positionReportedAt: DateTime.now(),
);
```

| Parameters             |                                                                            |
| ---------------------- | -------------------------------------------------------------------------- |
| **title**              | Optional, the song's name                                                  |
| **artist**             | Optional                                                                   |
| **album**              | Optional                                                                   |
| **artwork**            | Optional, the cover, `MemoryImage(bytes)` for one you got as bytes or `FileImage(file)` for one on disk. Keep handing over the same object for the same cover, or it's loaded again on every update |
| **isPlaying**          | Optional, defaults to `false`. Picks between the play and the pause button  |
| **duration**           | Optional, how long the song is. Leave it out for something without an end, like live radio |
| **position**           | Optional, how far into the song it was when your player last said so       |
| **positionReportedAt** | Optional, when `position` was true. With it, the card counts on by itself while `isPlaying`, so you don't have to update `position` every second |
| **shuffle**            | Optional, whether shuffle is on. Leave it out for a player that can't shuffle, and the button is left out too |
| **repeat**             | Optional, `MediaRepeatMode.off`, `.all` or `.one`. Leave it out for a player that can't repeat |

`MediaPlayerInfo.nothing` is the empty one, and `hasTrack` says whether there's a title, artist or
album to show.

## What the buttons do

`MediaPlayerControls` holds what happens when a button is pressed. A button only shows up when you
give it something to do, so leave out whatever your player can't do:

| Parameters             |                                                                            |
| ---------------------- | -------------------------------------------------------------------------- |
| **onPlayPause**        | Optional, plays when paused and pauses when playing. Without it the card has no buttons at all |
| **onNext**             | Optional, the next song or station                                         |
| **onPrevious**         | Optional, the one before                                                   |
| **onStartFastForward** | Optional, starts scrubbing forwards while the next button is held down     |
| **onStartRewind**      | Optional, starts scrubbing backwards while the previous button is held down |
| **onEndSeek**          | Optional, stops scrubbing once the button is let go                        |
| **onSeek**             | Optional, jumps to a point in the song. With it, the progress bar can be dragged, tapped and turned with a knob. Without it, the bar is only something to look at |
| **onShuffle**          | Optional, turns shuffle on or off, shown only when `info.shuffle` is set too |
| **onRepeat**           | Optional, picks how to repeat, shown only when `info.repeat` is set too    |

`MediaPlayerControls.none` has no buttons at all, for something that can only be watched.

## The card itself

| Parameters     |                                                                            |
| -------------- | -------------------------------------------------------------------------- |
| **info**       | What's playing, a `MediaPlayerInfo`                                         |
| **controls**   | Optional, what the buttons do, defaults to no buttons                       |
| **sourceIcon** | Optional, a small icon for where the music comes from, like `Icon(Icons.radio)` |
| **sourceName** | Optional, where the music comes from, like the phone's name or `'FM radio'` |

`MediaPlayerCard` is a normal widget, so it also works outside the home screen, at the top of a
window for your player say.
