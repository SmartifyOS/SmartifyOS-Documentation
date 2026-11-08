---
sidebar_position: 1
---

# Using the Editor

The SmartifyOS Editor is where most people build their car's app. It opens your car's app,
runs it live in the middle of the window, and lets you change how the car looks and what it can
do with a few clicks. See [Getting Started](../intro.md) for how to install it.

Behind the scenes the editor runs the `smartify-os` CLI for everything it does, so anything you
do in one shows up in the other. You never have to open a terminal, though.

## The start screen

When no car is open, the editor shows its start screen:

- **Create your car's app** asks what your car is called, what car it is, how the screen should
  be laid out, which side the driver sits on, what goes in the bar along the edge of the screen,
  whether you have a 3D model, a drawing or a picture of the car, which time zone it's in and
  whether it has a reverse camera. There's a screenshot for every layout and bar, so you can see
  what you're picking. Or pick **A copy of the example app** to start from a pretend car with one
  of everything (see [Example Project](../example-project/example-project.md)).
- **Open your car's app** opens one you already have: the folder with `pubspec.yaml` in it.
- **How to get the car's computer ready** walks you through putting Linux on the car's
  computer, see [Installing Linux](../putting-it-on-your-car/installing-linux.md).
- **Recent projects** lists the cars you opened before.

If something SmartifyOS can't work without is missing on your computer (Flutter, say), the start
screen says so, with a button to see what's wrong.

## The window

Once a car is open the window has four parts, laid out a bit like Unity:

| Part                |                                                                             |
| ------------------- | --------------------------------------------------------------------------- |
| **Title bar**       | Your car's name (click it for recent projects, opening another one, and Open in VS Code), the **Run** button, reload and restart, and the **Export** menu |
| **Car panel**       | On the left. Everything in your car's app, in groups: Setup, SmartifyOS and extensions, your windows, tiles and widgets, your settings pages, and devices |
| **Preview**         | In the middle. Your car's app, running                                     |
| **Inspector**       | On the right. Whatever you picked in the car panel, and what you can change about it |

Below the preview is the **console**, where everything your app prints shows up. That's the first
place to look when something doesn't work.

Most rows in the car panel also have a right click menu with the same actions as their inspector.

## Running your car's app

Press **Run** in the title bar. The first start takes a while, after that it's quick. Your car's
app shows up in the preview, and you can use it with the mouse just like the touchscreen in the
car.

| Key                     |                                                          |
| ----------------------- | -------------------------------------------------------- |
| ⌘P (Ctrl+P)             | Run, or stop                                             |
| ⌘R (Ctrl+R)             | Reload, shows the changes you saved in your code         |
| ⇧⌘R (Ctrl+Shift+R)      | Restart the app from the beginning                       |
| ⌘, (Ctrl+,)             | The editor's settings                                    |

A reload keeps the app where it is and only swaps in your new code, which is quick. Some changes
(anything in `lib/main.dart`, say) only take effect after a restart. The editor restarts by itself
whenever it changed something that needs one.

The preview takes the shape of your car's screen. Pick another shape above it (fill the space,
16:9, 8:3 for a 1280×480 strip, 5:3 for 800×480, 4:3) to see how a layout copes. The size of your
car's screen itself is `windowSize` in your `lib/main.dart`:

```dart
await SmartifyOs().init(
  display: const DisplayConfig(windowSize: Size(1280, 480)),
);
```

That only sizes the window on your computer. In the car SmartifyOS always fills the whole screen.

:::tip[Tip]

On a Mac the editor asks once for the Accessibility permission. It needs it to keep your app
lined up with the preview while you move or resize the editor. Without it your app still runs,
just in a window of its own.

:::

## Writing code

The editor writes the code for everything it makes, and opens it in
[VS Code](https://code.visualstudio.com/) when there's something for you to fill in (what a
window shows, what a button does). **Open in VS Code** is also in the title bar's menu and in the
inspector of most things. If you don't have VS Code yet, the editor links the download and the
extensions worth adding.

Save a file in VS Code and the editor notices, reads your car again and reloads the app.

## Updating

Pick your car at the top of the car panel to see whether there's a newer SmartifyOS or newer
versions of your extensions, with a button to update. Updating tries the new version first and
only keeps it when your app still builds, so it can't leave your car broken.

The editor keeps itself up to date too. Updates download in the background, and once one is ready
it asks you to restart (or puts it in place the next time you quit). The version in the status
bar at the bottom left checks right away.

## The editor's settings

The gear at the bottom of the car panel (⌘, or Ctrl+,) opens the editor's settings. At the top
it checks your computer: Flutter, git, what running your car's app needs, PlatformIO for the
boards around your car, and what building for an Android tablet needs. Anything missing that the
editor can set up for you has a button next to it, which is how you add PlatformIO or Android
later.

Below that are the editor's own preferences, like where new cars go and whether it looks for
updates in the background.
