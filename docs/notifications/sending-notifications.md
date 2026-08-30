---
sidebar_position: 1
---

# Sending Notifications

A notification slides down under the status bar, stays for a few seconds, and then waits in the
shade (swipe down from the top of the screen) with an icon in the status bar until it's read or
cleared. To send one you use `SmartifyOsNotifications`.

```dart
SmartifyOsNotifications.showNotification(
  SmartifyOsNotification(title: 'Bluetooth Connected'),
);
```

`style` is the one thing worth setting, it picks the icon, the sound and the color together.

```dart
SmartifyOsNotifications.showNotification(
  SmartifyOsNotification(
    id: 'doors',
    title: 'A Door Is Open',
    body: 'The passenger door is not closed.',
    style: NotificationStyle.warning,
    onTap: (context) => SmartifyOsNavigator.push(context, const DoorsWindow()),
  ),
);

// Once the door is shut again:
SmartifyOsNotifications.dismissNotification('doors');
```

| Parameters      |                                                                            |
| ------------------- | -------------------------------------------------------------------------- |
| **title**           | The one line the driver reads first, keep it short                        |
| **id**              | Optional, showing one whose id is already waiting replaces it and brings it back to the top instead of adding a second, leave it out and SmartifyOS makes one up |
| **body**            | Optional second line, for anything that doesn't fit in `title`             |
| **style**           | Optional, `NotificationStyle.info` (default), `.warning` or `.error`, picks the icon, sound and color unless you override them |
| **icon**            | Optional, your own icon instead of the one `style` would pick             |
| **sound**           | Optional, the sound to play instead of the one `style` would pick, pass `NotificationSound.none` for silence |
| **keep**            | Optional, whether it stays around as a status bar icon and shade row after showing, defaults to `true`, set to `false` for something like "Saved" that only matters in the moment |
| **showFor**         | Optional, how long it sits on screen when it arrives, defaults to five seconds, pass `Duration.zero` to skip the popup and go straight into the shade |
| **onTap**           | Optional, runs when tapped on the popup or its row in the shade           |

Use this for anything worth coming back to. Something the driver can safely miss and that isn't
worth keeping is a `ThemedToast`, something that needs an answer is a `ThemedDialog`.

## Do not disturb

While do not disturb is on, notifications still arrive and still wait in the shade with their
icon in the status bar, they just don't pop up or make a sound.

```dart
SettingsEntry.toggle(
  title: 'Do Not Disturb',
  initialValue: SmartifyOsNotifications.isDoNotDisturbOn,
  onChanged: SmartifyOsNotifications.setDoNotDisturb,
)
```

To silence notification sounds for good instead, without a switch at all, use
`NotificationsConfig(soundsEnabled: false)` at startup.

## Managing the shade

```dart
SmartifyOsNotifications.clearNotifications();
SmartifyOsNotifications.hasNotification('doors');
SmartifyOsNotifications.notifications; // newest first
SmartifyOsNotifications.openShade();
SmartifyOsNotifications.closeShade();
SmartifyOsNotifications.toggleShade();
SmartifyOsNotifications.isShadeOpen;
```

None of these throw, an id that isn't waiting is logged and worked around.

Pulling the shade down a second time gives the quick settings the whole panel instead of the strip
at the top, which is what a swipe further up on an already-open shade does:

```dart
SmartifyOsNotifications.expandShade();
SmartifyOsNotifications.collapseShade(); // back to the strip, shade stays down
SmartifyOsNotifications.isShadeExpanded;
```

`expandShade` does nothing on a shade that isn't down yet, there's nothing there to expand.
`closeShade` always comes back collapsed, so pulling the shade down means the same thing every
time.

## Configuring sounds and defaults

`NotificationsConfig`, passed to `SmartifyOs.init`, controls how many notifications the shade
keeps, how long they sit on screen by default, and which sound asset each `NotificationSound`
plays:

```dart
await SmartifyOs().init(
  notifications: const NotificationsConfig(
    defaultShowFor: Duration(seconds: 8),
    warningSound: 'assets/sounds/my_chime.wav',
  ),
);
```

Leave a sound out and SmartifyOS plays its own, set one to `null` for silence. See
[Sound](../sound/playing-sounds.md) for how sounds actually get played.
