---
sidebar_position: 2
---

# Opening Windows

Flutter (the toolkit SmartifyOS itself is built with) keeps track of what's on screen as a stack
of pages, called the **Navigator**. Opening something puts a new page on top, going back removes
it again and reveals whatever was underneath. `SmartifyOsNavigator` is a thin wrapper around
that stack, use it instead of Flutter's own `Navigator.push` to open a window, it works from
anywhere, even from a button built above the navigator like a status bar icon.

```dart
SmartifyOsNavigator.push(context, const MyWindow());
```

`context` here is a `BuildContext`, a value Flutter hands to every widget's `build` method so it
knows where it is on screen. You'll see it as a parameter almost everywhere in Flutter code,
including your own, just pass along the one you were given.

| Parameters                     |                                                          |
| -------------------------------- | -------------------------------------------------------- |
| **context**                      | Used to find the navigator, falls back to the app's own if none is found |
| **page**                         | The window widget to push                                 |
| **transitionDuration**           | Optional, how long the opening animation takes, defaults to 200ms |
| **reverseTransitionDuration**    | Optional, how long the closing animation takes when this window is popped, defaults to the same 200ms as `transitionDuration` |
| **opaque**                       | Optional, whether the window fully covers what's behind it during the transition, defaults to `false` |

`SmartifyOsNavigator.pushReplacement` and `SmartifyOsNavigator.pushAndRemoveUntil` work the same
way as their Flutter `Navigator` counterparts, replacing or clearing out earlier pages instead of
simply adding one on top.

## Closing a window

`SmartifyOsWindow` and `SmartifyOsFloatingWindow` already draw their own close button, so most of
the time you don't need to do anything. If you want to close a window from your own code, for
example after a "Save" button is pressed, use Flutter's normal `Navigator` to pop it, exactly the
way you would in any other Flutter app:

```dart
ElevatedButton(
  onPressed: () => Navigator.of(context).pop(),
  child: const Text('Save'),
)
```

That's it, `SmartifyOsNavigator` is only for opening windows, closing one is always plain Flutter.

## Going back and home

`SmartifyOsNavigator.canGoBack` says whether there's a window open over the home screen, useful for
telling the two apart without keeping track of it yourself:

```dart
if (!SmartifyOsNavigator.canGoBack) {
  // on the home screen
}
```

`back()` and `goHome()` are what a physical back or home button should call, see
[Using Focus](../focus/using-focus.md) if you're wiring one up. `back()` goes back one step: it
lets go of a slider being changed first, then honours a window's own steps (Settings walking back
through its pages, for example), and only then closes the window. `goHome()` closes every window at
once, straight back to the home screen. Both return `false` when there was nothing to do.

```dart
SmartifyOsNavigator.back();
SmartifyOsNavigator.goHome();
```

## Making a window reachable

Most windows should show up in the app list so the user can actually get to them, see
[App List](../app-list/adding-entries.md).

```dart
AppListEntry(
  id: 'my_window',
  title: 'My Window',
  icon: const Icon(Icons.crop_square),
  onOpen: (context) => SmartifyOsNavigator.push(context, const MyWindow()),
),
```
