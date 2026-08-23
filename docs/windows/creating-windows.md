---
sidebar_position: 1
---

# Creating Windows

A window is what a page is called in SmartifyOS. To build one, wrap your content in
`SmartifyOsWindow` or `SmartifyOsFloatingWindow`, both give you the themed panel, title bar and
close button for free.

## Fullscreen windows

`SmartifyOsWindow` fills the screen and slides the speed display out of the way while it's open.

```dart
class MyWindow extends StatelessWidget {
  const MyWindow({super.key});

  @override
  Widget build(BuildContext context) {
    return const SmartifyOsWindow(
      title: 'My Window',
      child: Center(child: Text('Hello!')),
    );
  }
}
```

| Parameters           |                                                           |
| --------------------- | --------------------------------------------------------- |
| **title**             | Shown in the title bar                                    |
| **child**             | The window's content                                      |
| **leading**           | Optional widget before the title, e.g. a back button      |
| **actions**           | Optional widgets after the title bar's close button        |
| **hideInfoDisplay**   | Optional, slides the speed display out of view while open, defaults to `true` |

## Floating windows

`SmartifyOsFloatingWindow` sits centered over the rest of the UI, dims everything behind it and
closes when you tap outside of it.

```dart
class MyFloatingWindow extends StatelessWidget {
  const MyFloatingWindow({super.key});

  @override
  Widget build(BuildContext context) {
    return const SmartifyOsFloatingWindow(
      title: 'My Floating Window',
      widthFactor: 0.5,
      heightFactor: 0.5,
      child: Center(child: Text('Hello!')),
    );
  }
}
```

It takes the same `title`, `child`, `leading` and `actions` as `SmartifyOsWindow`, plus
`widthFactor` and `heightFactor` to size it relative to the screen.

See the next page for how to actually open a window.
