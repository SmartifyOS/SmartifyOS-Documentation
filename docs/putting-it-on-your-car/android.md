---
sidebar_position: 4
---

# On an Android Tablet

An Android tablet (or phone) can be your car's screen too, instead of a Raspberry Pi or a PC. It's
the quickest way to get going, since there's no Linux to install, but SmartifyOS can do less on
Android than on Linux. These don't work on a tablet yet:

- the CAN bus and boards on USB,
- Bluetooth music and calls from the driver's phone,
- the reverse camera,
- updating from a USB stick.

What does work there: everything on the screen, your own windows, tiles, widgets and settings, the
3D car, and the tablet's own GPS for the speed. Android Auto works partly.

## Getting your computer ready

Building for Android needs Google's Android SDK and Java. The editor offers to install them the
first time you build for Android (or from its settings). With the CLI:

```bash
smartify-os setup --android
```

If you have Android Studio, its SDK is used and nothing is installed.

## Trying it on the tablet

Switch on USB debugging on the tablet (Android's developer options, which you unlock by tapping
the build number in Settings, About seven times), and plug it into your computer with a USB cable.
Then:

```bash
smartify-os run --android
```

It works just like `smartify-os run`: save a change and press `r` to see it. With more than one
Android device plugged in, pick one with `--device`.

The first build takes ten minutes or more. Your car's app gets its Android part set up the first
time: the whole screen, the permissions SmartifyOS and your extensions need, and the oldest Android
they run on. It's set up again every time you add or update an extension, so you never have to open
it yourself.

## Installing it for good

To install your car's app on the tablet without your computer, put it on a USB stick (or in any
folder) as an `.apk` file. In the editor pick **Export for Android** in the Export menu. With the
CLI:

```bash
smartify-os export android
```

Open the `.apk` on the tablet to install it. Android asks whether to allow installing apps from
that source the first time.

To update it later, export it again and install the new `.apk` over the old one.
