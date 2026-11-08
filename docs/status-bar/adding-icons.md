---
sidebar_position: 1
---

# Adding Status Bar Icons

The status bar runs along the top of the screen. It's where the car says something in a single
glyph: the headlights are on, a door is unlocked, the phone is connected. Each icon is a
`StatusIcon`, and `SmartifyOsStatusBar` is how you manage them while the car runs.

There's no CLI command for these, they're short enough to write by hand.

## Adding an icon

```dart
StatusIcon(id: 'headlights', icon: const Icon(Icons.highlight))
```

Hand your icons to SmartifyOS in `lib/main.dart`:

```dart title="lib/main.dart"
await SmartifyOs().init(
  statusBar: StatusBarConfig(
    icons: [StatusIcon(id: 'headlights', icon: const Icon(Icons.highlight))],
  ),
);
```

| Parameters      |                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| **id**          | A short name that's unique across the status bar, like `'headlights'`                    |
| **icon**        | The glyph, usually `const Icon(Icons.something)`. SmartifyOS sizes it and lays the bar out around it |
| **visible**     | Optional, decides whether the icon is there right now, see below. Leave it out and it shows until something hides it |
| **side**        | Optional, `StatusBarSide.end` (the right, with Bluetooth, the default) or `StatusBarSide.start` (the left, next to the clock and the notifications) |
| **order**       | Optional, where it sits among the others on its side, smaller comes first (left to right on both sides), defaults to `100` |
| **onTap**       | Optional, what tapping it does. Leave it out and taps go through to whatever is under the bar, which is what nearly every icon wants |

## Showing it only sometimes

Most icons stand for something that's only sometimes true. There are two ways to make an icon come
and go, pick whichever fits your code better.

**From your own code.** Start the icon hidden with `hiddenIcons`, then show and hide it wherever you
find out about the change:

```dart title="lib/main.dart"
statusBar: StatusBarConfig(
  icons: [StatusIcon(id: 'headlights', icon: const Icon(Icons.highlight))],
  hiddenIcons: {'headlights'},
),
```

```dart
SmartifyOsStatusBar.showIcon('headlights');
SmartifyOsStatusBar.hideIcon('headlights');
```

**By following a value.** Give it `visible`, which gets a `StatusBarContext` whose `ref` follows a
value of your own with `ref.watchValue` (see [Values That Change](../saved-values.md)):

```dart
final headlightsOn = ValueNotifier(false);

StatusIcon(
  id: 'headlights',
  icon: const Icon(Icons.highlight),
  visible: (status) => status.ref.watchValue(headlightsOn),
)
```

Now the icon is there whenever `headlightsOn.value` is `true`, with nothing else to call.

## Icons that change

For an icon that changes with the car rather than only coming and going, a battery level say, use
`StatusIcon.builder`. It draws the icon fresh every time something it reads changes:

```dart
final batteryLevel = ValueNotifier(100);

StatusIcon.builder(
  id: 'battery',
  builder: (status) {
    final level = status.ref.watchValue(batteryLevel);
    return Icon(level < 20 ? Icons.battery_alert : Icons.battery_full);
  },
)
```

It takes the same `visible`, `side`, `order` and `onTap` as a plain icon.

## Managing icons while the car runs

Everything here works at any time, and the bar updates right away:

```dart
SmartifyOsStatusBar.addIcon(myIcon);
SmartifyOsStatusBar.addIcons([firstIcon, secondIcon]);
SmartifyOsStatusBar.removeIcon('headlights');
SmartifyOsStatusBar.showIcon('headlights');
SmartifyOsStatusBar.hideIcon('headlights');
SmartifyOsStatusBar.hasIcon('headlights');
SmartifyOsStatusBar.isIconActive('headlights'); // registered and not hidden
SmartifyOsStatusBar.icons; // every icon there is
```

None of these throw. An `id` that isn't registered is logged and skipped, and hiding or showing an
icon before it's added still works, so the order you set things up in doesn't matter.

## Leaving built-in icons out

`StatusIcons` names the icons SmartifyOS puts there by itself:

| Icon                               |                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `StatusIcons.home`                 | A home button, only shown over a window without a title bar, since that's the one window with no close button |
| `StatusIcons.clock`                | The time, on the left                                                    |
| `StatusIcons.notifications`        | The icons of the notifications waiting in the shade, next to the clock   |
| `StatusIcons.ongoingNotifications` | The icons of whatever is running in the background, on the right, see [Ongoing notifications](../notifications/sending-notifications.md) |
| `StatusIcons.doNotDisturb`         | Shows while do not disturb is on                                         |
| `StatusIcons.bluetooth`            | Shows while a phone is connected                                         |

Leave any of them out with `hiddenIcons`, a car with a clock in its dashboard say:

```dart
await SmartifyOs().init(
  statusBar: const StatusBarConfig(hiddenIcons: {StatusIcons.clock}),
);
```

Only leave out `StatusIcons.home` if your car has a physical way back to the home screen, or a
window without a title bar can't be closed from the touchscreen anymore.
