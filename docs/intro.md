---
sidebar_position: 1
---

# Getting Started

SmartifyOS is an open source infotainment system for older cars. It turns a small computer (a
Raspberry Pi 5, a mini PC, or an Android tablet) and a touchscreen into a car screen with a home
screen, an app list, settings, Bluetooth music and calls, a 3D model of your own car, and
whatever else you want to add yourself.

You don't build SmartifyOS itself. You build **your car's app**: a small project that says what
your car is called, how its screen is laid out, and what's special about it (a window for the
seat heating, a switch for the interior light, a gauge for the oil temperature). SmartifyOS does
everything around that for you: the boot screen, the status bar, the notification shade,
Bluetooth, updates and so on.

There are two ways to build your car's app, and they do exactly the same thing underneath:

- **The SmartifyOS Editor**, a desktop app with your car's screen running live in the middle.
  You click through how the car looks and what it can do, and only write code where you want to.
  Start here if you've never programmed before.
- **The `smartify-os` CLI**, the same steps as commands you type in a terminal. Handy if you'd
  rather type than click, or want something small.

You can switch between them whenever you like, they work on the same files.

## Using the editor

Download the editor for your computer from its
[releases page](https://github.com/SmartifyOS/SmartifyOS-Editor/releases/latest). A Mac from 2021
or later is almost always Apple Silicon (Apple menu, About This Mac says "Apple M1" or newer).
Almost every Windows and Linux computer is x64.

- **macOS**: open the `.dmg` and drag SmartifyOS Editor into Applications.
- **Windows**: run the `.exe` and follow the installer. The editor isn't signed yet, so the first
  time Windows warns you about it: click More info, then Run anyway.
- **Linux**: make the `.AppImage` runnable (right click, Properties, allow executing) and open
  it, or install the `.deb`.

The first time it starts, the editor installs everything else it needs on its own: the CLI and
Flutter (the toolkit SmartifyOS is built with). Both go into your home folder and need no
administrator rights. It also asks whether you want to build the boards around your car
(PlatformIO) and build for an Android tablet. Say no if you're not sure, you can add either later
from the editor's settings.

Then:

1. Click **Create your car's app** and answer the questions (what the car is called, how the
   screen should be laid out, and so on). Every answer can be changed later.
2. Press **Run** (⌘P on a Mac, Ctrl+P elsewhere). Your car's app starts and shows up in the
   middle of the editor.

That's it, you're looking at your car's screen. [Using the Editor](./editor/using-the-editor.md)
explains the rest of the window.

## Using the CLI

macOS and Linux:

```bash
curl -fsSL https://smartify-os.com/install.sh | bash
```

Windows:

```powershell
irm https://smartify-os.com/install.ps1 | iex
```

Nothing else is needed, and it never asks for administrator rights. Open a new terminal
afterwards, then get your computer ready. This installs Flutter, unless you have it already:

```bash
smartify-os setup
```

Create your car's app. It asks the same questions the editor does:

```bash
smartify-os create
```

It makes a folder named after your car, like `smartify_os_golf_app`. Go into it and start the app:

```bash
cd smartify_os_golf_app
```

```bash
smartify-os run
```

Your car's app opens in a window. Save a change in your code and press `r` in the terminal to see
it straight away, `q` stops it. See [The CLI](./cli/your-car.md) for everything else it does.

:::tip[Tip]

Run `smartify-os` with no arguments for a guided menu of everything it can do.

:::

## Learning from the example

If you'd rather start from something full than from an empty car, create a copy of the example
app instead. It's a pretend car with one of everything SmartifyOS lets you add: windows, quick
settings tiles, home widgets, a settings page, a theme and a layout of its own, a device on the
CAN bus, and both official extensions. In the editor pick "A copy of the example app" when
creating a car, or type:

```bash
smartify-os create --from example
```

See [Example Project](./example-project/example-project.md) for a tour of it.

## What's in your car's app

Your car's app is a normal Flutter project. These are the parts you'll actually touch:

| File or folder           |                                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| `lib/main.dart`          | Where everything about your car is set up, in one call to `SmartifyOs().init(...)` |
| `lib/windows/`           | Your own windows, one file each                                              |
| `lib/quick_settings/`    | Your own quick settings tiles                                                |
| `lib/home_widgets/`      | Your own cards and widgets on the home screen                                |
| `lib/settings/`          | Your own settings pages                                                       |
| `assets/`                | The 3D model, drawing or picture of your car, and anything else your app shows |
| `devices/`               | The programs of the boards around your car, once it has any                  |

The editor and the CLI write all of these for you, in a shape they can read back later. You can
still open any of them in a code editor (VS Code, say) and change them by hand, and the rest of
these docs show you how.

## Where to go next

- Change how your car looks: [Layouts](./layouts/picking-a-layout.md),
  [Themes](./theme/picking-a-theme.md) and [The Car](./car/showing-the-car.md).
- Add your own things: [Windows](./windows/creating-windows.md),
  [Quick Settings](./quick-settings/adding-tiles.md), [Home Widgets](./home-widgets/adding-widgets.md)
  and [Settings](./settings/adding-pages.md).
- Talk to the car itself: [CAN Bus](./can-bus/defining-devices.md) or
  [Boards on USB](./usb-boards/adding-a-board.md).
- Add features other people made, like Android Auto: [Extensions](./extensions/using-extensions.md).
- Put it on the car: [Putting It On Your Car](./putting-it-on-your-car/installing-linux.md).
