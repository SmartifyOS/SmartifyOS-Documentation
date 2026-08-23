---
sidebar_position: 1
---

# Sounds

SmartifyOS plays a handful of short sounds itself, a notification chime, a phone connecting.
Every one of them can be replaced from a config, `SoundAssets` names the ones that ship with the
package, for when you only want to change some of them and keep the rest.

```dart
await SmartifyOs().init(
  notifications: const NotificationsConfig(
    warningSound: 'assets/sounds/my_chime.wav',
    errorSound: SoundAssets.notificationError, // unchanged
  ),
);
```

A sound path can also be `null`, which means silence.

## What plays where

`NotificationsConfig` controls the three notification sounds
(`infoSound`/`warningSound`/`errorSound`, see [Notifications](../notifications/sending-notifications.md)),
and `BluetoothConfig` controls the two Bluetooth chimes (`connectedSound`/`disconnectedSound`,
see [Bluetooth](../bluetooth/using-bluetooth.md)). `SoundAssets` lists the built-in file each one
plays unless you override it: `notificationInfo`, `notificationWarning`, `notificationError`,
`bluetoothConnected`, `bluetoothDisconnected`.

:::tip[Tip]

This is only for SmartifyOS's own short sounds. Music always belongs to the phone or whatever
plays it, never to a config here.

:::
