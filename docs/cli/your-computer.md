---
sidebar_position: 4
---

# Your Computer

Getting your computer ready for SmartifyOS, checking it, and keeping the CLI itself up to date.

## Installing

macOS and Linux:

```bash
curl -fsSL https://smartify-os.com/install.sh | bash
```

Windows:

```powershell
irm https://smartify-os.com/install.ps1 | iex
```

The installer downloads one file, checks it against its published checksum, puts it in
`~/.smartify-os/bin` and adds it to your PATH. It never asks for administrator rights, and needs
nothing else installed first. Open a new terminal afterwards so the `smartify-os` command is
found.

If you installed the [editor](../editor/using-the-editor.md), you already have the CLI too, the
editor installs it for itself.

## Setting up

```bash
smartify-os setup
```

SmartifyOS is built with Flutter, and `setup` installs it for you into `~/.smartify-os/tools`,
out of your way. If you already have Flutter, that one is used instead (it has to be 3.47.1 or
newer).

It also asks about two extras you may not need yet. Add either right away with a flag, or run
`setup` again any time later:

- **PlatformIO** builds the programs of the boards around your car (see
  [Writing the Firmware](../can-bus/writing-firmware.md)). It also sets itself up the first time
  you build one.

  ```bash
  smartify-os setup --platformio
  ```

- **Android** sets up building for an Android tablet that's your car's screen: Google's Android
  SDK and Java, unless Android Studio has them already (see
  [On an Android Tablet](../putting-it-on-your-car/android.md)).

  ```bash
  smartify-os setup --android
  ```

Flutter needs git. If it's missing, `setup` tells you how to get it.

## Checking what's missing

```bash
smartify-os doctor
```

It checks everything and says what to do about anything missing:

| Check                         |                                                              |
| ----------------------------- | ------------------------------------------------------------ |
| Flutter and git               | Needed for everything. Missing (or a Flutter older than 3.47.1) is an error |
| Xcode, Visual Studio, or the Linux build tools | Only needed for `smartify-os run`, trying your car's app on this computer |
| PlatformIO                    | Only needed for the boards around your car                   |
| Android                       | Only needed when an Android tablet is your car's screen      |

## Keeping the CLI up to date

```bash
smartify-os self-update
```

It downloads the newest version, checks it, makes sure it runs on your computer, and only then
replaces the one you have. If anything goes wrong it leaves yours exactly as it was.

You don't have to remember to check. Once a day the CLI quietly asks whether there's something
newer, and mentions it after whatever you were doing has finished. Set
`SMARTIFY_OS_NO_UPDATE_CHECK` if you never want that.

`smartify-os self-update --check` only says whether there's a newer one, and
`smartify-os self-update --to 0.2.0` installs one particular version.

## Uninstalling

Delete the folder everything lives in:

```bash
rm -rf ~/.smartify-os
```

Then take the `export PATH` line back out of your shell config, the one marked
`# added by the SmartifyOS installer`.

:::tip[Tip]

Every command also takes `--json`, which turns its output into JSON for programs (it's how the
editor drives the CLI). You won't need it yourself, the CLI's
[README](https://github.com/SmartifyOS/SmartifyOS-CLI#using-it-from-a-program) describes it.

:::
