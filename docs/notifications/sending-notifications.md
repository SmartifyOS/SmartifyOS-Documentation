---
sidebar_position: 1
---

# Sending Notifications

A notification is how the car tells the driver that something happened: a phone connected, a door
is open, an update is ready. To send one you use `SmartifyOsNotifications`, from
`package:smartify_os_core/notifications.dart`.

When you send one, it slides down under the status bar, stays for a few seconds, and then waits in
the shade (the panel the driver pulls down from the top of the screen) with a small icon in the
status bar, until it's read or cleared.

```dart
SmartifyOsNotifications.showNotification(
  const SmartifyOsNotification(title: 'Bluetooth Connected'),
);
```

That's all a simple one needs. Most of the time the only other thing worth setting is `style`,
which picks the icon, the sound and the colour in one go:

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
```

Giving it an `id` lets you take it away again later, once the door is shut:

```dart
SmartifyOsNotifications.dismissNotification('doors');
```

| Parameters          |                                                                            |
| ------------------- | -------------------------------------------------------------------------- |
| **title**           | The one line the driver reads first, keep it short                        |
| **id**              | Optional, a short name like `'doors'`. Sending another notification with the same `id` replaces the old one and moves it back to the top instead of adding a second row. Leave it out and SmartifyOS makes one up, which is fine for anything you never touch again |
| **body**            | Optional, a sentence or two under the title for whatever doesn't fit in it |
| **style**           | Optional, `NotificationStyle.info` (the default), `.warning` or `.error`. Picks the icon, sound and colour, unless you set those yourself below |
| **icon**            | Optional, your own icon instead of the one `style` picks, for example `const Icon(Icons.door_front_door)` |
| **sound**           | Optional, a different sound than the one `style` picks: `NotificationSound.info`, `.warning`, `.error`, or `.none` for silence |
| **keep**            | Optional, defaults to `true`. Set it to `false` for something that only matters in the moment, like "Saved": it pops up and is gone, with no status bar icon and no row in the shade |
| **showFor**         | Optional, how long it stays on screen when it arrives, five seconds unless you changed that in `NotificationsConfig`. `Duration.zero` skips the popup and puts it straight into the shade |
| **onTap**           | Optional, runs when the driver taps it, on the popup or in the shade. A good place to open the window with the full story. Tapping also takes the notification away, since it has now been read |
| **actions**         | Optional, up to three buttons, see [Adding buttons](#adding-buttons) |
| **ongoing**         | Optional, defaults to `false`. Turn it on for something that's still running rather than something that happened, see [Ongoing notifications](#ongoing-notifications) |
| **showInStatusBar** | Optional, defaults to `true`. Set it to `false` for one that should only wait in the shade, with no icon in the status bar |

`showNotification` hands back the `id` the notification ended up with, handy when you let
SmartifyOS make one up but still want to dismiss it later.

:::tip[Tip]

A notification is for something worth coming back to. For a quick "Saved" that the driver can
safely miss, a `ThemedToast` is lighter, and for something that needs an answer, use a
`ThemedDialog`. Both are covered in [Building Blocks](../windows/building-blocks.md).

:::

## Adding buttons

Give a notification up to three `NotificationAction`s, for something the driver can do about it
right away without opening anything first:

```dart
SmartifyOsNotifications.showNotification(
  SmartifyOsNotification(
    title: 'Missed call from Anna',
    actions: [
      NotificationAction(
        label: 'Call back',
        icon: const Icon(Icons.call),
        onTap: (context) => Bluetooth.dial('555-0100'),
      ),
    ],
  ),
);
```

| Parameters | |
| ---------- | ------------------------------------------------------------------------ |
| **label**  | The word on the button, for example `'Stop'`. Keep it to one or two words |
| **onTap**  | Runs when the driver taps the button                                      |
| **icon**   | Optional, an icon in front of `label`. Leave it out for a button that's only the word |

The buttons show on the popup and on the notification's row in the shade. Tapping one works like
tapping the notification itself: the shade closes and the notification goes away (unless it's
`ongoing`). Any buttons past the third are left off.

## Ongoing notifications

Some things keep running after their window is closed, Android Auto or a dashcam that's recording.
For those, set `ongoing: true`. The notification then stands for "this is still going on", and
stays until your code says it has stopped:

```dart
SmartifyOsNotifications.showNotification(
  SmartifyOsNotification(
    id: 'dashcam',
    title: 'Dashcam is recording',
    icon: const Icon(Icons.videocam),
    ongoing: true,
    onTap: (context) => SmartifyOsNavigator.push(context, const DashcamWindow()),
    actions: [
      NotificationAction(label: 'Stop', onTap: (context) => Dashcam.stop()),
    ],
  ),
);

// Wherever the recording actually stops:
SmartifyOsNotifications.dismissNotification('dashcam');
```

An ongoing notification behaves differently from a normal one:

- it doesn't pop up when it arrives (give it a `showFor` if it should),
- it sits above the others in the shade,
- the driver can't swipe it away, and "Clear all" leaves it alone, so only `dismissNotification`
  removes it,
- tapping it doesn't remove it, since tapping is how the driver gets back to whatever is running,
- its icon sits at the right end of the status bar, with the icons that say how the car is right
  now, instead of next to the clock,
- it's always kept, whatever `keep` says.

Sending it again with the same `id` updates it in place, so you can change its text while it runs
("Recording, 12 minutes") without it jumping around.

## Do not disturb

While do not disturb is on, notifications still arrive and still wait in the shade, they just
don't pop up or make a sound. The driver already has a tile for it in the quick settings, so you
only need this to switch it from your own code:

```dart
SmartifyOsNotifications.setDoNotDisturb(true);
SmartifyOsNotifications.isDoNotDisturbOn; // true
```

To start every drive with it on, use `NotificationsConfig(doNotDisturb: true)`, see
[Changing the defaults](#changing-the-defaults) below.

## Managing the shade

```dart
SmartifyOsNotifications.hasNotification('doors'); // is it waiting in the shade?
SmartifyOsNotifications.notifications;           // everything in the shade
SmartifyOsNotifications.clearNotifications();    // what "Clear all" does

SmartifyOsNotifications.openShade();
SmartifyOsNotifications.closeShade();
SmartifyOsNotifications.toggleShade();
SmartifyOsNotifications.isShadeOpen;
```

`notifications` lists the ongoing ones first, then the rest, each newest first, which is the order
the shade draws them in. `clearNotifications` leaves the ongoing ones where they are.

Pulling an open shade down a second time gives the quick settings the whole panel instead of just
the strip at the top. You can do the same from code, which is handy for a physical button (see
[Physical Controls](../focus/using-focus.md)):

```dart
SmartifyOsNotifications.expandShade();   // only does something while the shade is down
SmartifyOsNotifications.collapseShade(); // back to the strip, shade stays down
SmartifyOsNotifications.isShadeExpanded;
```

None of these throw. Dismissing an `id` that isn't there is logged and ignored, a notification
about a problem should never turn into a second problem.

## Changing the defaults

`NotificationsConfig`, passed to `SmartifyOs.init` in `lib/main.dart`, changes how notifications
behave for the whole car. The defaults suit most cars, so leave it out unless you want something
different:

```dart
await SmartifyOs().init(
  notifications: const NotificationsConfig(
    defaultShowFor: Duration(seconds: 8),
    warningSound: 'assets/sounds/my_chime.wav',
  ),
);
```

| Parameters          |                                                                            |
| ------------------- | -------------------------------------------------------------------------- |
| **maxKept**         | Optional, defaults to `50`. How many the shade keeps before the oldest drops off. Ongoing ones never drop off and don't count |
| **defaultShowFor**  | Optional, defaults to five seconds. How long a notification stays on screen when it arrives, unless it sets its own `showFor` |
| **soundsEnabled**   | Optional, defaults to `true`. Set it to `false` to never play a notification sound, for a car that has chimes of its own |
| **soundVolume**     | Optional, defaults to `1`. How loud notification sounds are, from `0` (silent) to `1` |
| **doNotDisturb**    | Optional, defaults to `false`. Starts the car with do not disturb already on |
| **infoSound**       | Optional, the sound file `NotificationSound.info` plays. Leave it out for SmartifyOS's own, set it to `null` for silence |
| **warningSound**    | Optional, the same for `NotificationSound.warning`                          |
| **errorSound**      | Optional, the same for `NotificationSound.error`                            |

You can also change these without opening `lib/main.dart`, with the CLI or on the Notifications
setup page in [the editor](../editor/setting-up-your-car.md):

```bash
smartify-os config notifications.maxKept 20
```

See [Sounds](../sound/playing-sounds.md) for how to add a sound file of your own to your app.
