---
sidebar_position: 1
---

# Adding Status Bar Icons

The status bar runs along the top of the screen, it's how the car says something in a single
glyph: the lights are on, a door is unlocked, the phone is connected. To add an icon you use
`SmartifyOsStatusBar`.

```dart
SmartifyOsStatusBar.addIcon(
  StatusIcon(id: 'lights', icon: const Icon(Icons.lightbulb)),
);
```

| Parameters      |                                                                       |
| ------------------- | ------------------------------------------------------------------------- |
| **id**              | Unique id for the icon                                                    |
| **icon**            | The icon widget                                                           |
| **visible**         | Optional, return `false` to hide the icon depending on app state          |
| **onTap**           | Optional, leave it out and taps fall through, which is what most icons want |
| **side**            | Optional, `StatusBarSide.start` (left, next to the clock, where notifications go) or `.end` (right, where Wi-Fi/Bluetooth/battery go), defaults to `.end` |
| **order**           | Optional, where it sits among the others on its side, lower is earlier, left to right on both sides, defaults to `100` |

## Icons that change

If an icon has to change with the car rather than only come and go, like a battery level, use
`StatusIcon.builder` instead:

```dart
StatusIcon.builder(
  id: 'battery',
  builder: (status) => Icon(batteryIcon(status.ref.watch(batteryProvider))),
)
```

`builder` and `visible` both receive a `StatusBarContext` with a `context` and a `ref`, so an
icon can watch a value that changes while the car is running and update on its own, see
[Riverpod Basics](../riverpod-basics.md) if you haven't used that before.

## Managing existing icons

```dart
SmartifyOsStatusBar.removeIcon('lights');
SmartifyOsStatusBar.showIcon('lights');
SmartifyOsStatusBar.hideIcon('lights');
SmartifyOsStatusBar.hasIcon('lights');
SmartifyOsStatusBar.isIconActive('lights');
```

None of these throw, an id that isn't registered is logged and worked around.

You can also add several icons at once with `SmartifyOsStatusBar.addIcons(...)`, and read the
current list with `SmartifyOsStatusBar.icons`.

## Hiding built-in icons

`StatusIcons` names the icons SmartifyOS ships with: `clock`, `notifications`,
`ongoingNotifications`, `doNotDisturb` and `bluetooth`. `notifications` is the ordinary
notifications next to the clock, `ongoingNotifications` is the `ongoing` ones (see
[Ongoing notifications](../notifications/sending-notifications.md#ongoing-notifications)) at the
other end of the bar. Leave one out at startup with `StatusBarConfig.hiddenIcons`:

```dart
await SmartifyOs().init(
  statusBar: const StatusBarConfig(hiddenIcons: {StatusIcons.clock}),
);
```
