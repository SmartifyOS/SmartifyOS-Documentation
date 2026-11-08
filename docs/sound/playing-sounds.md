---
sidebar_position: 1
---

# Playing Sounds

SmartifyOS makes a few short sounds on its own: a chime for a notification, another when a phone
connects. You can swap any of them for your own, and play sounds of your own with
`SmartifyOsSound`, from `package:smartify_os_core/sound.dart`.

This is only for short sounds the car makes itself. Music belongs to the phone, the
[file player](../music/file-player.md), or whatever else plays it.

## Adding a sound file to your app

A sound that ships with your app is an "asset", a file Flutter packs into the app when it's built.
To add one:

1. Put the file in your app's folder, for example `assets/sounds/door_open.wav`.
2. List it under `flutter:` `assets:` in your app's `pubspec.yaml`:

   ```yaml
   flutter:
     assets:
       - assets/sounds/door_open.wav
   ```

3. Use that same path, `'assets/sounds/door_open.wav'`, wherever SmartifyOS asks for a sound.

Short `.wav` files work best, they start playing straight away.

## Playing a sound

```dart
SmartifyOsSound.playSoundAsset('assets/sounds/door_open.wav');
```

Starting another sound this way cuts off the one before, which is what you want for chimes: two
doors opening at once is one chime, not two on top of each other. Pass `volume:` (from `0` to `1`)
to play it quieter.

None of these throw. A car with no working speakers still has to get on with what it was doing.

## A warning that keeps sounding

For a warning that should keep going for as long as its reason does (a door open while driving, a
parking sensor), loop it, and stop it once the reason is gone:

```dart
final warning = SmartifyOsSound.loopSoundAsset(SoundAssets.warningLoop);

// Once the door is shut:
warning.stop();
```

`SoundAssets.warningLoop` is a warning tone SmartifyOS comes with, made for exactly this, or pass
the path of your own. A looping sound plays on its own, so a chime in between doesn't cut it off.

## Playing a file made while the car runs

`playSoundAsset` only plays files that were packed into the app. For a file your code makes while
the car runs, a spoken answer from a voice assistant say, use `playSoundFile` with its path on
disk:

```dart
final answer = SmartifyOsSound.playSoundFile('/tmp/answer.wav');
await answer.done; // finishes once it has played to the end, or was stopped
```

Several files can play at once, and none of them cuts off a chime. Call `answer.stop()` to cut it
short.

On an Android tablet, other apps playing music turn down by themselves while the file plays. On a
Linux car, hold a duck while it plays to do the same, see
[Turning everything else down](../volume/using-volume.md#turning-everything-else-down).

## Changing SmartifyOS's own sounds

Every sound SmartifyOS plays by itself comes from a config, where you can point it at a file of
your own or set it to `null` for silence:

| Sound                              | Where to change it                                                     |
| ---------------------------------- | ---------------------------------------------------------------------- |
| A notification, info               | `NotificationsConfig.infoSound`, see [Notifications](../notifications/sending-notifications.md#changing-the-defaults) |
| A notification, warning            | `NotificationsConfig.warningSound`                                     |
| A notification, error              | `NotificationsConfig.errorSound`                                       |
| A phone connecting                 | `BluetoothConfig.connectedSound`, see [Bluetooth](../bluetooth/using-bluetooth.md#changing-how-it-behaves) |
| A phone disconnecting              | `BluetoothConfig.disconnectedSound`                                    |

```dart
await SmartifyOs().init(
  notifications: const NotificationsConfig(
    warningSound: 'assets/sounds/my_chime.wav',
  ),
  bluetooth: const BluetoothConfig(
    name: 'Miata',
    disconnectedSound: null, // no sound when the phone leaves
  ),
);
```

`SoundAssets` names the files SmartifyOS comes with: `notificationInfo`, `notificationWarning`,
`notificationError`, `bluetoothConnected`, `bluetoothDisconnected` and `warningLoop`. Use them to
play one of SmartifyOS's own sounds yourself, `SmartifyOsSound.playSoundAsset(SoundAssets.notificationInfo)`,
or to put one back after you changed it.

The editor's Notifications and Bluetooth setup pages let you pick these sounds too.
