---
sidebar_position: 1
---

# Adding Home Widgets

A home widget is a card that appears at the top of the home screen. They're how the car tells
you something without taking over the screen, what's playing, that a door is open, how far you
have left to go. Only one is on screen at a time, swipe sideways to reach the others, swipe up or
down to send one away. To add one you use `SmartifyOsHomeWidgets`.

```dart
SmartifyOsHomeWidgets.addWidget(
  HomeWidget(
    id: 'doors',
    onTap: (context) => SmartifyOsNavigator.push(context, const DoorsWindow()),
    builder: (home) => const Text('A door is open'),
  ),
);
```

| Parameters      |                                                                          |
| ------------------- | ---------------------------------------------------------------------------- |
| **id**              | Unique id for the widget                                                     |
| **builder**         | Builds what's inside the card, SmartifyOS draws the background and border    |
| **visible**         | Optional, return `false` to hide the card depending on app state, and it can come back on its own once true again |
| **onTap**           | Optional, a good place to open a window with the full version of what's showing |
| **order**           | Optional, where it sits relative to other widgets, lower is earlier, defaults to `100` |
| **height**          | Optional fixed height, leave it out for the standard height so cards line up while swiping |
| **dismissible**     | Optional, whether swiping the card away sends it off for the rest of the drive, defaults to `true`, set to `false` for something like a warning light |

`visible` and `builder` both receive a `HomeWidgetContext` with a `context` and a `ref`, so a
card can watch a value that changes while the car is running and come and go on its own, see
[Riverpod Basics](../riverpod-basics.md) if you haven't used that before.

## Managing existing widgets

```dart
SmartifyOsHomeWidgets.removeWidget('doors');
SmartifyOsHomeWidgets.showWidget('doors');
SmartifyOsHomeWidgets.hideWidget('doors');
SmartifyOsHomeWidgets.dismissWidget('doors');
SmartifyOsHomeWidgets.hasWidget('doors');
SmartifyOsHomeWidgets.isWidgetActive('doors');
```

`showWidget` also brings back a card the driver swiped away, `dismissWidget` sends one away
exactly as a swipe up or down does. None of these throw, an id that isn't registered is logged
and worked around.

You can also add several widgets at once with `SmartifyOsHomeWidgets.addWidgets(...)`, and read
the current list with `SmartifyOsHomeWidgets.widgets`.

## Hiding built-in widgets

`HomeWidgets` names the cards SmartifyOS ships with (just `bluetoothPlayer` for now). Leave one
out at startup with `HomeWidgetsConfig.hiddenWidgets`:

```dart
await SmartifyOs().init(
  homeWidgets: const HomeWidgetsConfig(hiddenWidgets: {HomeWidgets.bluetoothPlayer}),
);
```
