---
sidebar_position: 1
---

# Getting Started

SmartifyOS is an open source infotainment system for your car, built with Flutter. You build
your own car app on top of the `smartify_os_core` package: register your settings pages, app
list entries, home screen widgets, status bar icons, quick settings tiles and a theme, then
`smartify_os_core` takes care of the shell around them (boot screen, status bar, notification
shade, Bluetooth, sound).

## Installing

The `smartify-os` CLI handles project setup, building and deploying for you, you never have to
touch Flutter, git or adb directly.

macOS and Linux:

```bash
curl -fsSL https://smartify-os.com/install.sh | bash
```

Windows:

```powershell
irm https://smartify-os.com/install.ps1 | iex
```

:::tip[Tip]

Run `smartify-os` with no arguments to see everything it can do.

:::

TODO: how to create a new project with the CLI, once that command exists.
