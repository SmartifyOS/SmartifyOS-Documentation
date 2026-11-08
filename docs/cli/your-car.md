---
sidebar_position: 1
---

# Your Car

The `smartify-os` CLI creates your car's app, runs it, keeps it up to date and changes how it
looks. See [Getting Started](../intro.md) for how to install it.

Every command except `create` works on the car's app in the folder you're in, so `cd` into it
first (the folder with `pubspec.yaml` in it). Every command asks for whatever you didn't give it,
so you can always start with the bare command and let it ask. `--help` after any command lists
its flags.

## Creating your car's app

```bash
smartify-os create
```

It asks what your car is called, what car it is, how the screen is laid out, which side the
driver sits on, what goes in the bar, which time zone the car is in, whether you have a 3D model,
a drawing or a picture of the car, and whether it has a reverse camera. Then it makes a folder
called `smartify_os_<name>_app` with your answers in `lib/main.dart`, checks that it builds, and
makes it a git repository so it's ready to put on GitHub.

Every question can be answered with a flag instead:

```bash
smartify-os create "Golf 4" --car "Volkswagen Golf IV" --layout split --driver-side right
```

| Flag                 |                                                                       |
| -------------------- | --------------------------------------------------------------------- |
| **--car**            | What car it is, for the About page, like `"Mazda MX-5 NB"`            |
| **--layout**         | How the screen is laid out: `classic`, `split`, `sidebar`, `tiles`, `focus` or `portrait`, see [Layouts](../layouts/picking-a-layout.md) |
| **--driver-side**    | `left` or `right`                                                     |
| **--bar**            | What goes in the bar: `info-display`, `dock` or `both`                |
| **--time-zone**      | Like `Europe/Berlin`                                                   |
| **--model-3d**       | A 3D model of the car, a `.glb` file                                  |
| **--drawing**        | A drawing of the car seen from above, an `.svg` file                  |
| **--picture**        | A picture of the car, a `.png` or `.jpg` file                         |
| **--reverse-camera** | The car has a reverse camera on USB                                   |
| **--dir**            | The folder to create it in, instead of the one you're in              |
| **--dry-run**        | Only check the answers and say where it would go                     |

To start from the example app instead, a pretend car with one of everything SmartifyOS lets you
add:

```bash
smartify-os create --from example
```

It's copied as it is, so give it your car's name and the rest yourself afterwards (see
[Changing how it looks](#changing-how-it-looks) below).

## Running it on your computer

```bash
smartify-os run
```

Your car's app opens in a window. Save a change and press `r` in the terminal to see it, `R` to
restart the app from the beginning, `q` to stop. If your car has devices on a CAN bus, this also
writes the header file their programs are built with (see
[Writing the Firmware](../can-bus/writing-firmware.md)).

To run it on an Android tablet or phone plugged into your computer instead, see
[On an Android Tablet](../putting-it-on-your-car/android.md).

## Changing how it looks

How the screen is arranged, the theme, the driver's side, the bar and the picture of the car can
all be changed without opening `lib/main.dart`. On its own it asks what to change:

```bash
smartify-os appearance
```

Or say it straight away:

```bash
smartify-os appearance --layout split --theme slate --driver-side right
```

```bash
smartify-os appearance --model-3d ~/Downloads/golf.glb --look model-3d
```

| Flag                |                                                                        |
| ------------------- | ---------------------------------------------------------------------- |
| **--layout**        | The layout it starts with, a built-in one or one of your own          |
| **--theme**         | `glass`, `slate`, `carbon`, `frost`, `midnight`, `horizon`, `retro`, one of your own, or `none` to follow each layout's own theme, see [Themes](../theme/picking-a-theme.md) |
| **--driver-side**   | `left` or `right`                                                      |
| **--bar**           | `info-display`, `dock` or `both`                                       |
| **--model-3d**      | A `.glb` file, or `none`                                               |
| **--drawing**       | An `.svg` file, or `none`                                              |
| **--picture**       | A `.png` or `.jpg` file, or `none`                                     |
| **--look**          | Which of them the car starts as: `model-3d`, `drawing`, `picture`, or `first` |
| **--show**          | Only say how it's set up now                                           |

A model, drawing or picture is copied into your app's `assets` folder for you. The driver can still
pick another layout and theme in Settings, this is only what the car starts with.

What the About page in Settings says about your car works the same way. The name is also what
phones see when they pair with the car:

```bash
smartify-os about --name "Golf" --car "Volkswagen Golf IV 1.6"
```

Add rows of your own with `--extra`, again for more, and take one off with an empty value:

```bash
smartify-os about --extra "VIN=WVWZZZ1JZXW000001"
```

```bash
smartify-os about --extra "VIN="
```

Both commands write into `lib/main.dart` exactly the way you would by hand, and leave alone
anything there they can't read. For every other setting, see [Changing Settings](./changing-settings.md).

## Keeping SmartifyOS up to date

Move your car to the newest SmartifyOS:

```bash
smartify-os update
```

It shows what changed, tries the new version, and only keeps it when your app and every extension
still build. If anything doesn't, it puts everything back the way it was and tells you which
extension is at fault. An extension that hasn't caught up yet is offered its newest release at the
same time.

`smartify-os update --check` only says whether there's a newer one, and
`smartify-os update --to 0.3.0` moves to one particular version.

This only changes your car's app on your computer. To get the new version into the car, export an
update, see [Updating Your Car](../putting-it-on-your-car/updating.md).

## Extensions

Extensions add features to your car, like Android Auto. Add one from its GitHub address:

```bash
smartify-os extension add https://github.com/Mauznemo/smartify_os_android_auto
```

It's switched on in `lib/main.dart` for you, and tried before it's kept, just like an update.

```bash
smartify-os extension list
```

```bash
smartify-os extension update
```

```bash
smartify-os extension remove android_auto
```

An extension's own settings are changed with `smartify-os extension settings`. See
[Using Extensions](../extensions/using-extensions.md) for that, and
[Making an Extension](../extensions/making-an-extension.md) for writing your own.

## Trying a copy from a folder

If you're working on an extension (or on SmartifyOS itself) in a folder on your computer, make your
car use that copy instead of the released one:

```bash
smartify-os link ../smartify_os_dashcam
```

Nothing in `pubspec.yaml` changes for that. Go back to the released versions with:

```bash
smartify-os unlink
```
