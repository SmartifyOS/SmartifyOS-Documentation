---
sidebar_position: 1
---

# Image Background

`ImageBackground` is the simplest background there is, it just draws a picture behind
everything else on screen. Good for getting started, or for a car with no 3D model.

```dart
runApp(
  SmartifyOsApp(
    background: ImageBackground(
      imageAssetPath: 'packages/smartify_os_core/assets/background.png',
    ),
  ),
);
```

| Parameters          |                                                          |
| ---------------------- | ---------------------------------------------------------- |
| **imageAssetPath**      | The image to draw, as an asset path from your own app     |

To use your own image instead of the one SmartifyOS ships with:

1. Put the image file somewhere in your project, for example `assets/background.png`.
2. Add it under `flutter: assets:` in your `pubspec.yaml`:
   ```yaml
   flutter:
     assets:
       - assets/background.png
   ```
3. Point `imageAssetPath` at it: `imageAssetPath: 'assets/background.png'`.
