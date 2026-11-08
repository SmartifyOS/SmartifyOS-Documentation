---
sidebar_position: 1
---

# Using Focus

`SmartifyOsFocus` lets the driver use the car without touching the screen. It moves a
highlight (a ring around one control) from control to control and presses whatever it lands
on. You decide what moves it: a rotary knob, a touchpad, buttons on the steering wheel, or
the arrow keys on your keyboard while you work on your computer.

SmartifyOS has no idea what hardware your car has, and that's on purpose. You read your knob
or buttons however you like (a [CAN message](../can-bus/sending-and-listening.md), a
[board on USB](../usb-boards/adding-a-board.md), a keyboard) and call a few
`SmartifyOsFocus` functions. That way a car with one knob and a car with five buttons never
have to fight a built-in idea of what each button means.

The smallest setup there is, a rotary knob you can push, is three lines:

```dart
myKnob.turns.listen((clicks) {
  for (var i = 0; i < clicks.abs(); i++) {
    clicks > 0 ? SmartifyOsFocus.moveNext() : SmartifyOsFocus.movePrevious();
  }
});
myKnob.clicks.listen((_) => SmartifyOsFocus.press());
```

`myKnob` stands for however your own code reads the knob. There is nothing else to set up.
`SmartifyOsFocus` works as soon as `SmartifyOs().init` has run, and every control SmartifyOS
ships (Settings, the app list, the quick settings, anything built from the `Themed*`
widgets) can already be reached this way.

## Moving and pressing

These five are all most cars ever need:

| Method           |                                                                         |
| ---------------- | ----------------------------------------------------------------------- |
| **moveNext**     | One step on. A knob turned clockwise, a right arrow key, a stick pushed right |
| **movePrevious** | One step back, the opposite of `moveNext`                                 |
| **moveDown**     | One row down, for hardware with a second direction like a touchpad or a four-way pad. In a list it does the same as `moveNext`, in a grid it goes to the tile below |
| **moveUp**       | One row up, the opposite of `moveDown`                                     |
| **press**        | Pushing the knob in, or a select button. Presses what's highlighted. On a slider it takes hold of it instead, and pressing again lets go |

They also take care of the fiddly parts. They show the highlight if it isn't showing yet,
and while a slider is held, `moveNext` and `movePrevious` change its value instead of walking
on to the next control.

None of them throw. A knob turned on a screen with nothing to highlight just does nothing,
and the function returns `false` so you can tell.

## Giving a button its own meaning

What each button means is up to your car. Put your own check in front of the calls above and
let everything else fall through to them. For example, a knob that changes the volume on the
home screen and moves the highlight everywhere else:

```dart
void onKnobTurned(bool clockwise) {
  if (!SmartifyOsNavigator.canGoBack && !SmartifyOsFocus.hasHighlight) {
    SmartifyOsFocus.showHighlight();
    SmartifyOsVolume.changeVolume(clockwise ? 0.05 : -0.05);
    return;
  }
  clockwise ? SmartifyOsFocus.moveNext() : SmartifyOsFocus.movePrevious();
}
```

`SmartifyOsNavigator.canGoBack` is `false` while no window is open, so on the home screen.
`SmartifyOsFocus.hasHighlight` says whether a control is highlighted right now. On the home
screen nothing is highlighted until the driver goes looking for it, so this is how you tell
"the driver wants the volume" apart from "the driver is moving through the home widgets".
Give some other button the job of getting into the home widgets, holding the knob down say:

```dart
void onKnobHeld() {
  if (SmartifyOsFocus.hasHighlight) {
    SmartifyOsFocus.hideHighlight(); // back out to the volume
  } else {
    SmartifyOsFocus.showHighlight();
    SmartifyOsFocus.focusFirst(); // into the home widgets
  }
}
```

Everything else a button usually does already exists somewhere in SmartifyOS, so put it
together however your car needs:

| To                                   | Call                                                                  |
| ------------------------------------ | --------------------------------------------------------------------- |
| Go back one step                     | `SmartifyOsNavigator.back()`, see [Opening Windows](../windows/opening-windows.md) |
| Go straight to the home screen       | `SmartifyOsNavigator.goHome()`                                         |
| Pull the shade down or put it away   | `SmartifyOsNotifications.openShade()`, `.expandShade()`, `.closeShade()`, see [Notifications](../notifications/sending-notifications.md) |
| Open the app list                    | `SmartifyOsAppList.open(context)`, see [App List](../app-list/adding-entries.md) |
| Change the volume                    | `SmartifyOsVolume.changeVolume(0.05)`, see [Volume](../volume/using-volume.md) |

`back()` knows what "back" means right now: it lets go of a slider being held first, then
steps back inside a window that has steps of its own (Settings going back a page), and only
then closes the window. It returns `false` when there was nothing to go back from, which is a
good moment to close the shade instead:

```dart
void onBackPressed() {
  SmartifyOsFocus.showHighlight();
  if (SmartifyOsNavigator.back()) return;
  SmartifyOsNotifications.closeShade();
}
```

`smartify_os_example_app/lib/input.dart` in the SmartifyOS repository is a complete example
to copy from. It drives the whole screen from the keyboard the way a knob and a few buttons
would: the arrow keys move, Enter presses, Backspace goes back, and Home goes home (and
pressed on the home screen, pulls down the shade). See
[Example Project](../example-project/example-project.md).

## When the highlight shows

Nothing is ever highlighted just because a knob is plugged in. A car whose knob sits untouched
all drive shouldn't have a ring parked on the screen the whole time. The highlight appears the
moment the driver uses a control, and touching the screen anywhere hides it again.

`moveNext`, `press` and the rest show it for you. If one of your buttons does something that
doesn't go through them, like the volume example above, call `showHighlight()` yourself
first, so the driver still sees that the car heard them.

```dart
SmartifyOsFocus.showHighlight();
SmartifyOsFocus.hideHighlight(); // rarely needed, touching the screen does this
SmartifyOsFocus.hasHighlight; // whether a control is highlighted right now
SmartifyOsFocus.isHighlightVisible; // whether the driver is using a physical control at all
```

`isHighlightVisible` can be `true` while nothing is highlighted yet (after the driver turned
the volume on the home screen, say). Ask `hasHighlight` when you want to know whether a
control is actually picked out.

While the highlight is showing, it looks after itself. Close a window and it goes back to
where the driver left it in the window underneath. Open a panel under it and it moves into
the panel. The driver is never left looking at a screen with nothing picked out. The home
screen is the one exception: nothing there is highlighted on its own, not when a window
closes onto it and not when a new card turns up, only when the driver reaches for a control.

### Opening a window from a button

When `press` opens a window, that window starts with its first control already highlighted,
since the driver clearly isn't using the touchscreen. If a button of yours opens a window
some other way, say so first with `highlightNextWindow()`:

```dart
SmartifyOsFocus.highlightNextWindow();
SmartifyOsAppList.open(context);
```

It only applies to the next window that opens, and runs out after a moment if none does.

## Doing it all yourself

Everything `moveNext` and `press` are built from is public too, for a car that wants full
control. Unlike the calls above, these never show the highlight on their own and never guess
whether a turn should change a slider. You call `showHighlight` and check `isEngaged`
yourself.

```dart
SmartifyOsFocus.focusNext(); // highlight the next control, wraps around at the end
SmartifyOsFocus.focusPrevious();
SmartifyOsFocus.focusDown(); // a row down
SmartifyOsFocus.focusUp();
SmartifyOsFocus.focusFirst(); // the first control on screen

SmartifyOsFocus.activate(); // press what's highlighted, or take hold of a slider
SmartifyOsFocus.isEngaged; // whether a slider (or similar) is being held
SmartifyOsFocus.adjustNext(); // change the held control's value
SmartifyOsFocus.adjustPrevious();
SmartifyOsFocus.release(); // let go of it, leaving it highlighted

SmartifyOsFocus.restore(); // put the highlight back where it was left
```

`release` returns `false` when nothing was held, which is handy for a back button: if it let
go of something, that was the step back. You'll rarely need `restore`, SmartifyOS already
does it whenever the screen changes under the highlight.

## Making your own controls reachable

Only SmartifyOS's own controls can be highlighted. A window built from plain Flutter widgets
(an `ElevatedButton`, a `GestureDetector`) can only be used by touch. So either build your
windows from the `Themed*` widgets (see [Building Blocks](../windows/building-blocks.md)),
which are all reachable already, or wrap your own control in a `SmartifyOsFocusable`:

```dart
SmartifyOsFocusable(
  onActivate: _honk,
  child: GestureDetector(onTap: _honk, child: const MyHornButton()),
)
```

| Parameters       |                                                                         |
| ---------------- | ----------------------------------------------------------------------- |
| **child**        | The control to make reachable                                            |
| **onActivate**   | Optional, what pressing it does. Leave it out on something that is only changed (see `onAdjust`) or only looked at, and the highlight skips it |
| **onAdjust**     | Optional, what turning the knob does once the driver has taken hold of it. Setting this makes it a control you change rather than press, see below |
| **order**        | Optional, defaults to `0`. Moves it earlier or later in the order the highlight walks through, lower comes first. Only needed when that order should differ from where things are on screen |
| **enabled**      | Optional, defaults to `true`. Set it to `false` while the control can't be used, and the highlight skips it |
| **filled**       | Optional, defaults to `false`. Set it to `true` on a control filled with the theme's accent colour (a main button, a tile that's switched on), so the ring stays visible on it, see below |
| **onlyIfEmpty**  | Optional, defaults to `false`. For a box that holds other controls: it's only a place to stop while there are no controls inside it to stop on instead |
| **showRing**     | Optional, defaults to `true`. Turn it off for a control that shows it's highlighted in its own way. It can still be reached, it just draws no ring |
| **borderRadius** | Optional, the ring's corners, when your control's corners aren't the theme's usual ones |

The ring is drawn on the control's own edge, in the theme's accent colour and corner style.
It doesn't move or resize anything, and nothing around the control can cut it off.

A ring in the accent colour would be invisible on a control that is itself the accent colour.
With `filled: true`, the control's background grows a little while it's highlighted and the
ring sits where its edge used to be, in a colour that shows up on the accent. Only the
background grows, the text and icon inside stay exactly where they were.

### Controls you turn

For something the driver sets rather than presses (a dial, your own slider), give it
`onAdjust` instead of `onActivate`. Pressing the knob then takes hold of it, turning changes
its value, and pressing again lets go:

```dart
SmartifyOsFocusable(
  onAdjust: (direction) => _setTemperature(
    _temperature + (direction == SmartifyOsFocusDirection.next ? 0.5 : -0.5),
  ),
  child: MyTemperatureDial(value: _temperature),
)
```

`direction` is `SmartifyOsFocusDirection.next` (clockwise, one step on) or `.previous`.

A switch doesn't need `onAdjust`. Taking hold of something with two positions just to turn
between them would be a step for nothing, pressing it should simply flip it.

:::tip[Tip]

One control is one place to stop. Wrap each control in one `SmartifyOsFocusable`, never one
inside another. If your widget already has something tappable inside it (an `InkWell`, say),
give that `canRequestFocus: false`, and wrap any control nested inside yours in Flutter's
`ExcludeFocus`. Otherwise the highlight stops twice in the same place, and turning the knob
looks like it did nothing.

:::

### Putting the important button first

The highlight walks a screen left to right, top to bottom. `ThemedButton` and
`ThemedIconButton` take a `focusOrder` (lower comes first) for when that isn't the best
order. Give the one button a window is mostly opened for a low number, so the driver starts
on it. Give a close or collapse button a high one, so the knob reaches what the window is for
before it reaches the way out:

```dart
ThemedIconButton(
  icon: Icons.close,
  onTap: () => Navigator.of(context).pop(),
  focusOrder: 1,
)
```

## Panels side by side

Left to right, top to bottom works for a list, but on a screen of two panels next to each
other the highlight would hop between them with every row. Wrap each panel in a
`SmartifyOsFocusGroup` and the highlight finishes everything in one before moving on to the
next:

```dart
Row(
  children: [
    Expanded(child: SmartifyOsFocusGroup(child: MyClimatePanel())),
    Expanded(child: SmartifyOsFocusGroup(child: MySeatPanel())),
  ],
)
```

| Parameters  |                                                                          |
| ----------- | ------------------------------------------------------------------------ |
| **child**   | Everything that belongs together                                          |
| **order**   | Optional, defaults to `0`. Where the whole group comes among what's next to it, lower first |
| **onLeave** | Optional, for a group that shows one page out of several, see below       |

Groups can sit inside other groups, and a control's `order` counts within its own group, not
across the whole screen. You rarely need a group in a normal window, which is usually a
single list. Home widgets don't need one either, since every area of the home screen already
is a group (see below).

### Paged content

A knob can't swipe. If your group shows one page out of several (a `PageView`, say), give it
an `onLeave`. It's called just before the highlight walks off the end of the group. Bring in
the next page and return `true`, and the highlight waits. Once the new page is on screen,
put the highlight on it with `SmartifyOsFocus.focusWithin`:

```dart
SmartifyOsFocusGroup(
  onLeave: (direction) {
    final next = _page + (direction == SmartifyOsFocusDirection.next ? 1 : -1);
    if (next < 0 || next >= _pageCount) return false; // walk on out of the group
    _controller
        .animateToPage(next, duration: _turnTime, curve: Curves.easeOut)
        .then((_) {
          if (!mounted) return;
          SmartifyOsFocus.focusWithin(_pageKeys[next].currentContext!, direction);
        });
    return true;
  },
  child: PageView(controller: _controller, children: _pages),
)
```

`focusWithin` lands on the first control of the page when going forwards, and the last one
going backwards. Without an `onLeave`, the only way to the other pages is a swipe, so
anything paged needs one.

TODO: a shorter example once SmartifyOS has a public helper for turning a `PageView`'s pages.

## The home screen and the bar

Each area of the home screen is its own group, so the highlight finishes one area before the
next. Inside an area, a card is a place to stop if it has an `onTap`, or if it has no buttons
of its own and shares the area with other widgets. Then come the buttons inside it, then the
next widget. See [Home Widgets](../home-widgets/adding-widgets.md).

The bar (the info display and the dock, see [The Bar](../layouts/the-bar.md)) comes last,
after everything on the home screen, so a car with a single knob still reaches the dock and
the app list button. While a window is open the bar is never part of the walk. If your car has
a button of its own for the app list and you'd rather the knob stayed in the home widgets,
turn it off:

```dart
await SmartifyOs().init(
  bar: const BarConfig(reachableWithoutTouch: false),
);
```

## Layers of your own

Windows, floating windows, the shade and dialogs each cover what's underneath, and the
highlight only ever walks the layer on top. That's what keeps the knob out of the status bar,
and out of the window behind a dialog. All of SmartifyOS's own layers handle this already.

If you build a layer of your own that covers the screen and isn't a window (a panel sliding in
over everything, say), wrap it in a `SmartifyOsFocusSurface`. Without it, the knob would keep
walking whatever is behind it.

```dart
SmartifyOsFocusSurface(
  layer: SmartifyOsFocusSurface.dialog,
  child: MyOverlay(),
)
```

| Parameters            |                                                                    |
| --------------------- | ------------------------------------------------------------------ |
| **child**             | The layer's content                                                 |
| **layer**             | Optional, defaults to `SmartifyOsFocusSurface.window`. How high up it sits, use one of the levels below or a number between two of them |
| **onBack**            | Optional, what the back button does here before anything gets closed. Return `true` if your layer stepped back inside itself, `false` to let it close as usual. Only needed when your layer has steps of its own |
| **restoresHighlight** | Optional, defaults to `true`. Whether the highlight comes back to this layer on its own once whatever covered it goes away. The home screen turns this off |

The levels, from bottom to top: `home` (the home screen), `window` (a normal window),
`floatingWindow`, `shade` (the notification shade), `dialog`, and `system` (screens
SmartifyOS puts over everything, like the update screen). The highest layer on screen is the
one the knob is in. If two are on the same level, the newest one wins.

:::tip[Tip]

Something that floats over every window until you take it away is usually a
[floating panel](../floating-panels/showing-panels.md), which handles all of this for you.

:::
