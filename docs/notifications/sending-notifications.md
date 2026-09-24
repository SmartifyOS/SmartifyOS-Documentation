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
| **actions**         | Optional, up to three `NotificationAction` buttons shown on the popup and its row in the shade |
| **ongoing**         | Optional, whether this stands for something still running rather than something that happened, defaults to `false`, see [Ongoing notifications](#ongoing-notifications) |
| **showInStatusBar** | Optional, whether its icon shows in the status bar while it's in the shade, defaults to `true`, set to `false` for one that should only be in the shade |

Use this for anything worth coming back to. Something the driver can safely miss and that isn't
worth keeping is a `ThemedToast`, something that needs an answer is a `ThemedDialog`.

## Adding buttons

Give a notification up to three `NotificationAction`s through `actions`, for something the driver
can do about it right there without opening anything first:

```dart
SmartifyOsNotifications.showNotification(
  SmartifyOsNotification(
    title: 'Missed call from Anna',
    actions: [
      NotificationAction(
        label: 'Call back',
        icon: const Icon(Icons.call),
        onTap: (context) => Phone.call('Anna'),
      ),
    ],
  ),
);
```

| Parameters      |                                                                            |
| ------------------- | -------------------------------------------------------------------------- |
| **label**           | The word on the button, for example `'Stop'`, keep it to one or two words |
| **onTap**           | Runs when the driver taps the button                                      |
| **icon**            | Optional, an icon in front of `label`                                     |

Tapping a button does what tapping the notification itself does: it puts the shade away and takes
the notification out of the list, unless it's `ongoing`.

## Ongoing notifications

Something that keeps running in the background after its window is closed, Android Auto or a
dashcam recording, sets `ongoing: true` instead of relying on `keep`:

```dart
SmartifyOsNotifications.showNotification(
  SmartifyOsNotification(
    id: 'android_auto',
    title: 'Android Auto is running',
    icon: const Icon(Icons.directions_car),
    ongoing: true,
    onTap: (context) => SmartifyOsNavigator.push(context, const AndroidAutoWindow()),
    actions: [
      NotificationAction(label: 'Stop', onTap: (context) => AndroidAuto.stop()),
    ],
  ),
);

// Once it has stopped, from wherever it stopped:
SmartifyOsNotifications.dismissNotification('android_auto');
```

An ongoing notification:

- doesn't pop up when it arrives (give it a `showFor` if it should),
- sits above the others in the shade,
- can't be swiped away and stays when "Clear all" is pressed, so only `dismissNotification` takes
  it away,
- stays when tapped, since tapping it is how the driver gets back to it,
- shows its icon at the right end of the status bar, with the other icons for how the car is right
  now, rather than next to the clock,
- is always kept, whatever `keep` says.

Showing it again with the same `id` updates it where it is, so you can change its text while it
runs without it jumping to the top or losing its place.

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
SmartifyOsNotifications.notifications; // ongoing first, then the rest, each newest first
SmartifyOsNotifications.openShade();
SmartifyOsNotifications.closeShade();
SmartifyOsNotifications.toggleShade();
SmartifyOsNotifications.isShadeOpen;
```

`clearNotifications` leaves the `ongoing` ones in place, since they stand for something still
running and aren't the driver's to clear.

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
plays. `ongoing` notifications never drop off and don't count towards the limit:

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
