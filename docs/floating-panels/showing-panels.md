---
sidebar_position: 1
---

# Showing Panels

A floating panel is for something the driver should see whatever they're doing, but that isn't a
window of its own: the parking sensors while reversing, a voice assistant listening, a timer
counting down. It floats over everything, windows included, until your code takes it away. The
screen underneath keeps working, only the panel itself takes touches. To show one you use
`SmartifyOsFloatingPanels`.

```dart
SmartifyOsFloatingPanels.showPanel(
  FloatingPanel(
    id: 'parking',
    position: FloatingPanelPosition.top,
    builder: (panel) => const ThemedPanel(
      padding: EdgeInsets.all(16),
      child: Text('Front: 40 cm'),
    ),
  ),
);

// Once the car is out of reverse:
SmartifyOsFloatingPanels.dismissPanel('parking');
```

| Parameters   |                                                                       |
| ------------ | --------------------------------------------------------------------- |
| **id**       | A short name, unique among the panels on screen, for example `'parking'` |
| **builder**  | Draws the panel. SmartifyOS only places it and slides it in and out, so draw the background too, a `ThemedPanel` matches the rest of the car |
| **position** | Optional, `FloatingPanelPosition.top` (under the status bar, where notifications pop up), `.center` or `.bottom` (above the bar), defaults to `.bottom` |
| **width**    | Optional, how wide it is, defaults to `600`, the width of a home screen card. It's as tall as what you draw |

Panels stay clear of the status bar and the layout's bar on their own, and notifications still pop
up above them.

## Changing what it says

Show it again with the same `id` and the panel already on screen is redrawn in place, without
sliding out and back in. So for something that changes, like the distance to a wall, just call
`showPanel` again every time the number changes:

```dart
sensor.distances.listen((cm) {
  SmartifyOsFloatingPanels.showPanel(
    FloatingPanel(
      id: 'parking',
      builder: (panel) => ThemedPanel(
        padding: const EdgeInsets.all(16),
        child: Text('Front: $cm cm'),
      ),
    ),
  );
});
```

Or have the panel follow a value of yours: `builder` receives a `FloatingPanelContext` with a
`context` and a `ref`, so `panel.ref.watchValue(distance)` redraws it on its own whenever
`distance` (a `ValueNotifier` of yours) changes, see [Values That Change](../saved-values.md).

## Taking it away

```dart
SmartifyOsFloatingPanels.dismissPanel('parking');
SmartifyOsFloatingPanels.hasPanel('parking'); // whether it's on screen
```

A panel can also take itself away, from a button inside it:

```dart
FloatingPanel(
  id: 'timer',
  builder: (panel) => ThemedPanel(
    padding: const EdgeInsets.all(16),
    child: ThemedButton(
      onTap: panel.dismiss,
      child: const Text('Done'),
    ),
  ),
)
```

None of these throw: showing one that's already up redraws it, and dismissing one that isn't there
does nothing.

:::tip[Tip]

A floating panel is for something that lasts as long as its reason does. Something that happened
and is worth coming back to is a [notification](../notifications/sending-notifications.md), and
something the driver opens on purpose is a [window](../windows/creating-windows.md).

:::
