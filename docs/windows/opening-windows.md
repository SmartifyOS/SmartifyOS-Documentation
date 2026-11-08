---
sidebar_position: 2
---

# Opening Windows

To open a window you use `SmartifyOsNavigator`. Most of the time you don't call it yourself at
all: a window made with `smartify-os window create` already opens from its icon in the app list
and the dock. This page is for opening one from your own code, a button in another window, a
card on the home screen, a notification.

## Opening a window

```dart
SmartifyOsNavigator.push(context, const TripComputerWindow());
```

Flutter keeps track of what's on screen as a stack of pages. Opening a window puts it on top,
closing it takes it off again and shows whatever was underneath. `push` adds your window to that
stack.

`context` is a `BuildContext`, a value Flutter hands to every widget's `build` method so the
widget knows where it is on screen. You'll see it as a parameter almost everywhere, just pass on
the one you were given. `SmartifyOsNavigator` finds the right place to open the window from any
context, even from a status bar icon or the bar, which sit outside the stack of windows.

| Parameters                    |                                                          |
| ----------------------------- | -------------------------------------------------------- |
| **context**                   | Where you're opening it from, any `BuildContext` works   |
| **page**                      | The window to open                                       |
| **transitionDuration**        | Optional, how long it takes to open, defaults to 200ms   |
| **reverseTransitionDuration** | Optional, how long it takes to close, defaults to 200ms  |
| **opaque**                    | Optional, whether it fully covers what's behind it while it opens, defaults to `false` |

`SmartifyOsNavigator.pushReplacement` swaps the window in front for a new one, and
`SmartifyOsNavigator.pushAndRemoveUntil` closes windows until a test you pass says stop, then
opens the new one. They work the same way as Flutter's own `Navigator` methods of the same name.

## Opening an app list entry

If the window you want is already in the app list, open it through its entry instead of pushing it
yourself:

```dart
SmartifyOsAppList.openEntry(context, 'trip_computer');
```

That's exactly what tapping its icon does, and it remembers the window: if it's already open
somewhere under other windows, those close and it comes back to the front, rather than a second
copy opening on top. The dock and the voice assistant open apps this way too.

```dart
SmartifyOsAppList.isEntryOpen('trip_computer');    // open somewhere on screen
SmartifyOsAppList.isEntryInFront('trip_computer'); // the one the driver is looking at
```

## Closing a window

Both window kinds draw their own close button, so most of the time there's nothing to do. To
close one from your own code, after a Save button say, use Flutter's `Navigator`:

```dart
ThemedButton(
  onTap: () => Navigator.of(context).pop(),
  child: const Text('Save'),
)
```

## Going back and home

`back()` and `goHome()` are what a physical back or home button should call, see
[Physical Controls](../focus/using-focus.md).

```dart
SmartifyOsNavigator.back();
SmartifyOsNavigator.goHome();
```

`back()` goes back one step. If the driver is holding a slider with the knob, it lets go of that
first. If the window has steps of its own (Settings walking back through its pages), it takes one
of those. Only then does it close the window. `goHome()` closes every window at once. Both return
`false` when there was nothing to do.

`SmartifyOsNavigator.canGoBack` says whether any window is open, which is how you tell whether the
driver is looking at the home screen:

```dart
if (!SmartifyOsNavigator.canGoBack) {
  // on the home screen
}
```
