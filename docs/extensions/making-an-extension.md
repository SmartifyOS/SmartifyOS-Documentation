---
sidebar_position: 2
---

# Making an Extension

An extension is a small Flutter package with one class in it, a `SmartifyOsExtension`, that
adds things to the car while it starts: an app in the app list, a page in Settings, a card on
the home screen. It uses exactly the same API your car's app does, so everything in the rest
of these docs works in an extension too.

You need the `smartify-os` CLI (see [Getting Started](../intro.md)) and a little Dart.
`smartify_os_android_auto` on GitHub is a full, real extension to look at once you know your
way around.

## Should it be an extension?

Make it an extension when a car can do perfectly well without it: hardware only some cars
have, a feature only some drivers want, or something that needs a big library or a licence
SmartifyOS itself shouldn't carry (Android Auto is GPL).

If it's only for your own car, it doesn't need to be an extension at all, just write it in
your car's app. And if every car would want it, or other things would build on it, it
belongs in SmartifyOS itself. The same goes for something your extension needs from
SmartifyOS that isn't there yet: suggest adding it rather than working around it.

## Creating it

```bash
smartify-os extension create
```

It asks for a name, like `Dashcam`, and a line saying what it does, then makes a folder called
`smartify_os_dashcam` with a working extension in it, ready to run and ready to put on GitHub.
Run it in your car's app folder and the extension is made for the SmartifyOS your car runs,
and put next to the app.

Everything named "Dashcam" in there is yours to change:

| File                             |                                                                     |
| -------------------------------- | ------------------------------------------------------------------- |
| `lib/src/dashcam_extension.dart` | **Start here.** What your extension adds to the car when it starts  |
| `lib/src/dashcam.dart`           | Your feature's own logic and saved settings, in one place           |
| `lib/src/windows/`               | Your windows                                                         |
| `lib/src/widgets/`               | Everything else you draw, like the home screen card                  |
| `lib/src/i18n/en.i18n.json`      | Every text the driver reads                                          |
| `lib/dashcam.dart`               | What a car's app can use from your extension                         |
| `test/`                          | Tests, which run on your computer                                    |
| `example/`                       | A small SmartifyOS app with your extension in it, to try it out      |
| `pubspec.yaml`                   | Its name, version, the packages it uses, and what the car's Linux needs |
| `AGENTS.md`                      | The rules on this page, for an AI assistant if you use one           |

To begin with it adds three things, so you can see how each one works: an entry in the app
list that opens a window, a page in Settings, and a card on the home screen that the Settings
page can switch off. Change or delete any of them.

## The extension class

This is the whole of `lib/src/dashcam_extension.dart`, cut down to one thing:

```dart title="lib/src/dashcam_extension.dart"
class DashcamExtension extends SmartifyOsExtension {
  const DashcamExtension();

  @override
  String get id => 'dashcam';

  @override
  String get name => 'Dashcam';

  @override
  Future<void> init(SmartifyOsExtensionContext context) async {
    SmartifyOsAppList.addEntry(
      AppListEntry(
        id: 'dashcam',
        title: 'Dashcam',
        icon: const Icon(Icons.videocam),
        onOpen: (context) =>
            SmartifyOsNavigator.push(context, const DashcamWindow()),
      ),
    );
  }
}
```

| Member   |                                                                          |
| -------- | ------------------------------------------------------------------------ |
| **id**   | A short name, unique among all extensions, in `snake_case`. Every name your extension registers starts with it, see the rules below |
| **name** | The name the driver reads, on the About page                             |
| **init** | Runs once while the car starts, after all of SmartifyOS is up. This is where you add everything |

A car's app switches it on by passing it to `SmartifyOs().init`, which
`smartify-os extension add` does for the owner:

```dart
await SmartifyOs().init(
  extensions: [
    const DashcamExtension(),
  ],
);
```

Anything an owner might want to change goes in the class's constructor, with a `///` comment
on each. The CLI's `extension settings` and the editor read those comments, so owners can
change your settings without opening any code, see
[Using Extensions](./using-extensions.md#changing-its-settings).

`context` tells you which version of SmartifyOS the car runs (`context.coreVersion`) and
whether another extension is there too (`context.hasExtension('android_auto')`). Most
extensions never need either.

## What you can add

Everything goes through the same facades a car's app uses, from SmartifyOS's public
libraries:

| To add                                  | Use                                        | See                                            |
| --------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| An app in the app list                  | `SmartifyOsAppList.addEntry`               | [App List](../app-list/adding-entries.md)       |
| A page in Settings                      | `SmartifyOsSettings.addPage`               | [Settings](../settings/adding-pages.md)         |
| A card or widget on the home screen     | `SmartifyOsHomeWidgets.addWidget`          | [Home Widgets](../home-widgets/adding-widgets.md) |
| A tile in the quick settings            | `SmartifyOsQuickSettings.addTile`          | [Quick Settings](../quick-settings/adding-tiles.md) |
| An icon in the status bar               | `SmartifyOsStatusBar.addIcon`              | [Status Bar](../status-bar/adding-icons.md)     |
| A notification                          | `SmartifyOsNotifications.showNotification` | [Notifications](../notifications/sending-notifications.md) |
| A number on the info display            | `SmartifyOsInfoDisplay.addValue`           | [Info Display](../info-display/adding-values.md) |
| A whole layout of the screen            | `SmartifyOsLayouts.addLayout`              | [Making a Layout](../layouts/making-a-layout.md) |
| A panel over every window               | `SmartifyOsFloatingPanels.showPanel`       | [Floating Panels](../floating-panels/showing-panels.md) |
| A music player card                     | `MediaPlayerCard`                          | [Your Own Player](../music/media-player-card.md) |
| A part of the car moving or lighting up | `SmartifyOsCarModel3D`, `SmartifyOsCarDrawing2D` | [The Car](../car/showing-the-car.md)      |
| A device on the CAN bus                 | `SmartifyOsCan.addDevice`, `addMessage`    | [CAN Bus](../can-bus/defining-devices.md)       |
| A board on USB                          | `SmartifyOsSerial.addDevice`               | [Boards on USB](../usb-boards/adding-a-board.md) |
| A short sound                           | `SmartifyOsSound.playSoundAsset`           | [Sound](../sound/playing-sounds.md)             |
| The music turned down while yours plays | `SmartifyOsVolume.duckAudio`               | [Volume](../volume/using-volume.md)             |

A card shows up wherever the car's layout puts cards, and that can be anything from a thin
strip to a big square, so build it to fit the room it gets and say how small it can go with
`minSize`. Give every card a `title` and an `icon` too, the driver sees them when holding the
area it's in.

## The rules

These are what keep every car working with every extension, whatever else it runs:

- **Keep `init` quick.** The car waits for it before showing anything. Add what you add, read
  your settings, and start anything slow without `await`. After 10 seconds the car starts
  without waiting any longer.
- **Never stop the car from starting.** If your feature needs something that isn't there (a
  USB device, a program, the right platform), add nothing and log why. An error thrown in
  `init` is caught, but whatever you hadn't added by then is missing.
- **Build on every platform.** SmartifyOS runs on Linux, Android, macOS and Windows, and your
  extension has to at least build on all four, even where it does nothing. Check
  `Platform.isLinux` and friends before using something that only exists on one.
- **Only import `package:smartify_os_core/<name>.dart`.** Never anything with `/src/` in it,
  that's SmartifyOS's inside and it changes without warning. If you need something from in
  there, ask for it to be made public.
- **Start every name with your extension's `id`.** App list entries, settings pages, cards,
  notifications and saved settings all have names (`dashcam.card`,
  `smartify_os.dashcam.show_card`). Then no two extensions ever take the same one.
- **Put anything only for testing on the Developer options page**, with
  `parent: SettingsPages.developer`, see [Developer Options](../developer-options/using-developer-options.md).
  If you let a developer fake something, stop faking it when developer options are switched
  off.
- **Build windows from the `Themed*` widgets** (see [Building Blocks](../windows/building-blocks.md)),
  so they match the car's theme and work with its knob and buttons, not only the
  touchscreen.
- **Log with `SmartifyOsLog`** from `package:smartify_os_core/utils.dart`, never `print`, so
  your messages end up next to SmartifyOS's own on the car:
  `SmartifyOsLog.info('Dashcam', 'Recording started')`.
- **Write every text in `lib/src/i18n/en.i18n.json`**, then run `dart run slang`. To show
  them in the car's language, follow `SmartifyOsLanguage`, see
  [Language](../language/using-language.md).

## Trying it

From the extension's folder, start its example app, SmartifyOS with your extension in it, on
your computer:

```bash
smartify-os extension run
```

Save a change and press `r` in that terminal to see it straight away, `q` to stop. Things that
need the car's hardware, like Bluetooth, only work on the car.

Run the tests, also from the extension's folder:

```bash
flutter test
```

`test/dashcam_extension_test.dart` shows how to check that your extension adds what it should,
and how to test a window. Keep them passing, they're how you notice you broke something
before anyone installs it.

### In your own car

To try it in your car's app before it's on GitHub, point the car at the extension's folder.
From your car's app folder:

```bash
smartify-os link ../smartify_os_dashcam
```

Your car now runs exactly what's in that folder, and the extension is switched on in
`lib/main.dart`. When you're done, go back to the released versions:

```bash
smartify-os unlink
```

In the editor, right click an extension your car already has and pick **Use a copy from a
folder…**, and **Go back to the released one** to undo it.

## Packages it uses

Add packages to `pubspec.yaml` the usual way, with one exception. A package SmartifyOS uses
too (look under `dependencies` in SmartifyOS's `smartify_os_core/pubspec.yaml`) gets `any`
instead of a version:

```yaml title="pubspec.yaml"
dependencies:
  shared_preferences: any
```

The car's SmartifyOS then decides which version, so your extension never stands in the way
of an update. For anything else, `flutter pub add <package>` picks the version for you.

Avoid code generators whose output only works with one exact version of a package.
`riverpod_generator` is one of them, so write riverpod providers out by hand. `freezed` is
fine. Always commit what a generator writes, the car never runs it.

The `smartify_os_core` line says which SmartifyOS your extension needs at least:

```yaml title="pubspec.yaml"
smartify_os_core: ">=0.2.0"
```

The CLI fills in the version you started with. Raise it when you start using something only a
newer SmartifyOS has, and never add an upper limit. If a new SmartifyOS ever breaks your
extension, nothing breaks in anyone's car: `smartify-os update` keeps their old SmartifyOS and
tells them which extension is behind. Fix it, raise this line, and release.

## What the car needs installed

Some extensions need something on the car's Linux: a library to build against, a driver, a
program they run. List it under `smartify_os: linux:` in `pubspec.yaml` and the CLI installs it
on every car that adds your extension. Most extensions need nothing, so leave this out if
yours doesn't.

```yaml title="pubspec.yaml"
smartify_os:
  linux:
    build:
      apt:
        - libusb-1.0-0-dev
    run:
      apt:
        - iw
        - package: intel-media-va-driver
          arch: [x64]
      udev:
        - system/udev/70-dashcam.rules
      groups:
        - plugdev
```

| Key        |                                                                              |
| ---------- | ---------------------------------------------------------------------------- |
| **build**  | What building your extension needs, usually packages ending in `-dev`. Flutter's own tools are already there |
| **run**    | Only what the car loads or starts while it runs: a program you run with `SmartifyOsShell`, a driver, a GStreamer plugin. Never a library your code is linked against, the CLI works those out from the finished build |
| **arch**   | Limits an entry to `x64` or `arm64`, for a package only one of them has      |
| **udev**   | Rule files in `system/udev/` that let SmartifyOS use a device without being root, named `NN-dashcam.rules`. They may only set permissions |
| **groups** | Groups the car's user is added to, like `plugdev` or `dialout`. Only a short list of harmless ones is allowed |

The names are the ones `apt install` takes on Debian 13, without versions. List everything
your extension uses, even what SmartifyOS lists already. When you change this, raise your
version and say so in `CHANGELOG.md`, so owners get it installed with the update.

On Android, the car's app is a normal Android app, and some things only the app can set. Put
them next to `linux:`, and the CLI writes them into every car's Android project:

```yaml title="pubspec.yaml"
smartify_os:
  android:
    minSdk: 28
    permissions:
      - android.permission.RECORD_AUDIO
```

`minSdk` is the oldest Android your extension runs on (28 is Android 9), only needed when
something you use needs more than Flutter's own. `permissions` are the ones your code asks the
driver for.

## Big downloads

An extension that downloads something big while it runs (speech models, maps) can let the CLI
put it on the car's USB stick instead, since a car often has no internet. Name a JSON file
listing what you download in `pubspec.yaml`:

```yaml title="pubspec.yaml"
smartify_os:
  downloads: smartify_os_downloads.json
```

```json title="smartify_os_downloads.json"
{
  "folder": "dashcam/models",
  "items": [
    {
      "id": "plates",
      "title": "Number plates",
      "about": "Reads the number plates in a recording",
      "folder": "plates-v2",
      "sizeMb": 40,
      "default": true,
      "files": [
        { "url": "https://example.com/plates-v2.onnx", "path": "plates.onnx" }
      ]
    }
  ]
}
```

Each item ends up as a folder of its own, `smartify-os/<folder>/<item folder>` in the car's
data folder (`~/.local/share` on Linux), and `folder` starts with your extension's id. A file
comes from a `url`, a whole Hugging Face repository (`huggingFace`), or an `archive` it
unpacks. When an owner exports an installer or an update, the CLI asks which items to put on
the stick (it downloads each one once and keeps it for the next car), and the car puts each in
place that it doesn't have yet. Which ones are ticked to start with:

| Key                    |                                                                     |
| ---------------------- | ------------------------------------------------------------------- |
| **required**           | `true` for something nothing works without, always put on the stick without asking |
| **setting**, **value** | The item is what one of your extension's settings can be set to, written the way it's written in `lib/main.dart` (`"setting": "recognizer"`, `"value": "SpeechModels.whisperBase"`). It's ticked when the car's app picks it |
| **default**            | Otherwise, `true` to tick it, or a list of architectures it suits (`["arm64"]` for a lighter one on a Raspberry Pi) |

Download it in your own code the same way the CLI does, so the two never get in each other's
way: fill a folder named `<item folder>.part`, rename it once every file is in, treat a folder
that is there as complete, and delete a `.part` you find when you start.
`smartify_os_voice_assistant` has a complete example.

## Sharing it

Put the folder on GitHub, it already is a git repository. Anyone can then add it to their car
with your repository's address:

```bash
smartify-os extension add https://github.com/you/smartify_os_dashcam
```

Releases are optional, but they let owners stay on a version that works until they choose to
update. From the extension's folder:

```bash
smartify-os extension release
```

It asks whether this is a fix or something new and what changed, runs your tests, raises the
version, writes `CHANGELOG.md`, and puts the release on GitHub. The first time, it asks for the
address of an empty repository you made on GitHub for it. To skip the questions, pass them as
flags:

```bash
smartify-os extension release --fix --notes "The card shows the right time again"
```

Use `--feature` instead of `--fix` when the release adds anything at all. Owners get it with
`smartify-os extension update`. An extension with no releases is installed from its newest
commit instead, which is fine for something small.

Add a `LICENSE` file and say which licence in `pubspec.yaml`, so people know what they may do
with it. If you use a GPL package (like `android_auto`), your extension has to be GPL too.
