---
sidebar_position: 1
---

# The File Player

SmartifyOS comes with a music player for songs on USB sticks, so the car plays music even without a
phone. It's already there, there's nothing to set up: plug in a stick with songs on it, open
**Music** in the app list, and pick one. While a song plays, a music card shows on the home screen,
just like the phone's music does.

If you want to start music from your own code (a button on the steering wheel, say), that's
`SmartifyOsFilePlayer`, from `package:smartify_os_core/file_player.dart`.

## What it plays

Every stick that's plugged in is looked through for songs, folder by folder. It plays `mp3`, `m4a`,
`aac`, `flac`, `ogg`, `oga`, `opus` and `wav` files, and shows each song's title, artist, album and
cover when the file has them. A picture next to the songs in their folder (`cover.jpg` and the
like) works as the cover too.

It also looks in the `Music` folder in the home folder of whoever runs SmartifyOS. That's handy
while you work on your own computer, and it's the place for songs you copy onto the car itself.

The file player gets along with everything else that makes a sound:

- it pauses the phone's music when it starts playing, and pauses itself when the phone starts,
- it goes quiet during a phone call,
- it turns itself down while the car is speaking (a voice assistant answering, say),
- it stops when its stick is pulled out.

## Changing where it looks

Pass `FilePlayerConfig` to `SmartifyOs.init` in `lib/main.dart` to add folders on the car, or to
turn the whole thing off:

```dart
await SmartifyOs().init(
  filePlayer: const FilePlayerConfig(
    folders: ['/home/car/Songs'],
  ),
);
```

| Parameters             |                                                                            |
| ---------------------- | -------------------------------------------------------------------------- |
| **enabled**            | Optional, defaults to `true`. Set it to `false` for no Music in the app list, no music card, and no stick ever looked through for songs |
| **includeMusicFolder** | Optional, defaults to `true`. Whether to also look in the `Music` folder in the home folder |
| **folders**            | Optional, more folders on the car to look for songs in, as full paths       |

## Playing from your own code

```dart
SmartifyOsFilePlayer.togglePlayback();     // what a single play/pause button wants
SmartifyOsFilePlayer.pausePlayback();
SmartifyOsFilePlayer.resumePlayback();
SmartifyOsFilePlayer.playNextTrack();
SmartifyOsFilePlayer.playPreviousTrack();  // back to the start of the song if it's been playing a while
SmartifyOsFilePlayer.seekPlayback(const Duration(minutes: 1));
SmartifyOsFilePlayer.setShuffle(true);
SmartifyOsFilePlayer.setRepeat(MediaRepeatMode.all);
SmartifyOsFilePlayer.stopPlayback();       // also takes the music card off the home screen
```

To play something of your own choosing, hand it a list of songs from `SmartifyOsFilePlayer.library`,
which holds every song it found, stick by stick (`sources`) and folder by folder (`folders`):

```dart
// Every song on the first stick, mixed up.
final stick = SmartifyOsFilePlayer.library.sources.first;
SmartifyOsFilePlayer.setShuffle(true);
SmartifyOsFilePlayer.playFiles(stick.files.toList());
```

`playFiles` also takes a `startAt`, the place in the list to start from. To play just one file you
already know the path of, use `SmartifyOsFilePlayer.playFile('/media/stick/song.mp3')`.

None of these throw. A file that won't play is skipped.

## Showing what's playing

`SmartifyOsFilePlayer.state` says what's playing right now: `title`, `artist`, `album`, `artwork`,
`isPlaying`, `position`, `duration`, `shuffle`, `repeat` and `sourceName` (the stick it's on).
`hasTrack` says whether a song is loaded at all.

To have your own widget redraw as the song changes or a stick comes and goes, watch
`filePlayerStateProvider` and `musicLibraryProvider` instead (see
[Riverpod Basics](../riverpod-basics.md)):

```dart
final state = ref.watch(filePlayerStateProvider).value ?? SmartifyOsFilePlayer.state;
Text(state.title ?? 'Nothing playing');
```

Outside a widget, `SmartifyOsFilePlayer.stateChanges` and `SmartifyOsFilePlayer.libraryChanges` are
plain streams of the same thing.

## Leaving it out

The Music entry in the app list is `AppListEntries.filePlayer`, and the music card on the home
screen is `HomeWidgets.filePlayer`. To leave out just one of them, hide it like any other built-in
(see [App List](../app-list/adding-entries.md) and [Home Widgets](../home-widgets/adding-widgets.md)).
To turn the whole player off, use `FilePlayerConfig(enabled: false)`.
