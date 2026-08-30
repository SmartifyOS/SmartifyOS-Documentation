---
sidebar_position: 1
---

# Using Focus

`SmartifyOsFocus` moves a highlight around whatever is on screen and presses what it lands on. It's
how the driver uses the car without touching the screen, a rotary knob, a touchpad, arrow keys,
whatever hardware the car has. SmartifyOS has no opinion about what that hardware is or what each
control of it means, you read it however you like and call `SmartifyOsFocus`.

A rotary encoder with a push, the least you can build, is three lines:

```dart
myKnob.turns.listen((clicks) {
  for (var i = 0; i < clicks.abs(); i++) {
    clicks > 0 ? SmartifyOsFocus.moveNext() : SmartifyOsFocus.movePrevious();
  }
});
myKnob.clicks.listen((_) => SmartifyOsFocus.press());
```

Nothing else to set up, `SmartifyOsFocus` works the moment `SmartifyOs().init` has run. Every
control SmartifyOS ships already has a highlight built in, so this alone is already enough to drive
Settings, the app list, and anything else built out of the `Themed*` widgets.

## Reading your hardware

`moveNext`, `movePrevious`, `moveUp`, `moveDown` and `press` are the whole of it for most cars.
They already handle the fiddly parts: showing the highlight, and knowing that a turn means "change
the value being held" rather than "go on to the next thing" while a slider is engaged.

| Method            |                                                                        |
| -------------------- | ------------------------------------------------------------------ |
| **moveNext**          | One step on towards the end, a knob turned clockwise, a right arrow key, a stick pushed over |
| **movePrevious**       | One step back, the opposite of `moveNext`                          |
| **moveDown**           | A row down, for hardware with a second axis, a touchpad or a stick say. In a list it's the same as `moveNext`, in a grid it's the tile below |
| **moveUp**             | A row up, the opposite of `moveDown`                                |
| **press**              | Pushing the knob in, or a select button. Presses what's highlighted, takes hold of it if it's a slider, and lets go again if it's a slider already held, one button doing all three in the order a driver expects |

Put your car's own meaning in front of them and let everything else fall through. For example, a
knob that means volume on the bare home screen and nothing else is:

```dart
if (!SmartifyOsNavigator.canGoBack) {
  SmartifyOsVolume.changeVolume(clockwise ? 0.05 : -0.05);
  return;
}
SmartifyOsFocus.moveNext();
```

None of `SmartifyOsFocus`'s methods throw. A knob turned on a screen with nothing on it, or pressed
while nothing is highlighted, is simply quiet, they return `false` when there was nothing to do.

## Showing the highlight

Nothing is ever highlighted just because hardware is plugged in, on purpose, a car with a knob
sitting untouched all drive shouldn't have a ring parked on screen the whole time. `moveNext` and
the rest above show it for you. Call `SmartifyOsFocus.showHighlight()` yourself before anything
that goes around them, like the volume example above, so the driver still sees that the car heard
them.

Touching the screen takes the highlight away again on its own, you don't need to call anything for
that.

```dart
SmartifyOsFocus.isHighlightVisible; // whether anything is highlighted right now
SmartifyOsFocus.hideHighlight(); // rarely needed, touching the screen already does this
```

Opening a window from your own code, a button that jumps straight to the app list say, needs one
more call so the window starts with its first control already picked out:

```dart
SmartifyOsFocus.highlightNextWindow();
SmartifyOsAppList.open(context);
```

`press` does this for you already when it opens something, you only need it when you open a window
from your own code without going through `press`. It lapses after a moment, so opening nothing
leaves nothing behind.

## Doing it yourself

Everything underneath `moveNext` and `press` is public too, for a car that wants to decide for
itself exactly what happens. Unlike the calls above, none of these show the highlight or
second-guess what a move means, you have to call `showHighlight` yourself and know whether
something is engaged.

```dart
SmartifyOsFocus.focusNext(); // moves the highlight on, wraps around at the end
SmartifyOsFocus.focusPrevious();
SmartifyOsFocus.focusUp();
SmartifyOsFocus.focusDown();
SmartifyOsFocus.focusFirst(); // the first thing on screen

SmartifyOsFocus.activate(); // presses what's highlighted, or takes hold of a slider
SmartifyOsFocus.isEngaged; // whether something is being held right now
SmartifyOsFocus.adjustNext(); // moves the value of whatever is engaged
SmartifyOsFocus.adjustPrevious();
SmartifyOsFocus.release(); // lets go, leaving it highlighted
```

`SmartifyOsFocus.restore()` puts the highlight back where it was left on whatever is on screen now.
SmartifyOS already calls this on its own whenever the screen changes under a highlight that's up,
so the driver is never left looking at nothing picked out, you'll rarely need it yourself.

## Making your own controls reachable

Every SmartifyOS control (`ThemedButton`, `ThemedSwitch`, `ThemedListTile`, and the rest) is
reachable already. Wrap one of your own in `SmartifyOsFocusable` to make it reachable too:

```dart
SmartifyOsFocusable(
  onActivate: _fire,
  child: GestureDetector(onTap: _fire, child: const MyOwnButton()),
)
```

| Parameters      |                                                                          |
| ------------------ | ---------------------------------------------------------------------- |
| **child**            | The control to wrap                                                   |
| **onActivate**       | Optional, what pressing this does. Leave it out on something only changed or only looked at, and the highlight walks straight past it |
| **onAdjust**         | Optional, what turning does once this is engaged. Setting it is what makes this something changed rather than pressed, see below |
| **order**            | Optional, defaults to `0`. Where this sits in the order the highlight walks through, only needed when the order on screen isn't the order things are drawn in |
| **enabled**          | Optional, defaults to `true`. A control that can't be used right now, the highlight walks past it to the next one that can |
| **showRing**         | Optional, defaults to `true`. Turn it off for something that shows it's picked out in its own way, it's still reachable, it just draws nothing |
| **borderRadius**     | Optional, the ring's corners when the child's own aren't the theme's default                                          |
| **ringColor**        | Optional, the ring's colour, when the theme's accent wouldn't show up. Set it on a control already filled with the accent colour, an on/off tile that's on say, `ColorScheme.onPrimary` is usually the right value |

For something the driver sets rather than presses, add `onAdjust`. `SmartifyOsFocus.activate` then
takes hold of it instead of pressing it, and turning changes its value until
`SmartifyOsFocus.release`:

```dart
SmartifyOsFocusable(
  onAdjust: (direction) => _set(
    _value + (direction == SmartifyOsFocusDirection.next ? 0.05 : -0.05),
  ),
  child: MyOwnDial(value: _value),
)
```

The ring is drawn on the control's own edge, in the theme's accent colour and corner style, so
nothing it sits inside can clip it and it changes nothing about how the control is laid out.

:::tip[Tip]

Wrap one control in one `SmartifyOsFocusable`, never one inside another. If your own widget already
has a tappable surface inside it (an `InkWell` say), give it `canRequestFocus: false`, and wrap any
control nested inside yours in Flutter's `ExcludeFocus`. Otherwise the highlight lands on the same
spot twice, and turning the knob looks like it's doing nothing.

:::

## Layers the knob can be in

Every SmartifyOS window is already a `SmartifyOsFocusSurface`, so you get this for free most of the
time. Wrap something in one yourself only when you build a layer of your own that covers what's
underneath, a panel that slides over the screen say, without it the knob would keep walking the
window behind it.

```dart
SmartifyOsFocusSurface(
  layer: SmartifyOsFocusSurface.dialog,
  child: MyOwnOverlay(),
)
```

| Parameters      |                                                                          |
| ------------------ | ---------------------------------------------------------------------- |
| **child**            | The layer's content                                                   |
| **layer**            | Optional, defaults to `SmartifyOsFocusSurface.window`. Which layer this is on, use one of the constants below, or a number of your own between them |
| **onBack**           | Optional, what the back button should do here before SmartifyOS closes anything. Return `true` if this layer stepped back inside itself, `false` to let the window close as usual. Leave it out unless your layer has steps of its own |

The layer with the highest `layer` on screen is the one the knob is in, where two are level, the
one that appeared last wins: `SmartifyOsFocusSurface.home` (the home screen, underneath
everything), `.window` (a normal fullscreen window), `.floatingWindow` (a floating window, which
sits over one), `.shade` (the notification shade, which covers any window), `.dialog` (a dialog,
which covers everything).

## Composing the rest

`SmartifyOsFocus` has no opinion about what your car's buttons mean, compose the rest out of what
the rest of the OS already exposes: `SmartifyOsNavigator.back`/`.goHome` (see
[Opening Windows](../windows/opening-windows.md)), `SmartifyOsNotifications.openShade`/
`.expandShade`/`.closeShade` (see [Sending Notifications](../notifications/sending-notifications.md)),
`SmartifyOsAppList.open`, and `SmartifyOsVolume.changeVolume` (see
[Using Volume](../volume/using-volume.md)).

`smartify_os_miata_app/lib/input.dart` is a complete worked example: one rotary knob and two
buttons, wired up so the knob means volume on the bare home screen and moves the highlight
everywhere else, one button is back, and the other is home. See
[Example Project](../example-project/example-project.md) for the full file.
