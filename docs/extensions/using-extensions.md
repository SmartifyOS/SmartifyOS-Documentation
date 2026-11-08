---
sidebar_position: 1
---

# Using Extensions

SmartifyOS itself only comes with what every car needs. Anything only some cars want, like
Android Auto or a voice assistant, is an **extension**: a small package you add to your car's
app with one command. Once it's added, it's part of your car like anything built in. Its
apps show up in the app list, its pages in Settings, its cards on the home screen.

## Adding an extension

In the editor, open your car and click **Add an extension** under "SmartifyOS and
extensions" in the car panel. The dialog lists the extensions the editor recommends, so you
can add one with a click, or paste the GitHub address of any other into its search field.

With the CLI, run this in your car's app folder, with the extension's GitHub address:

```bash
smartify-os extension add https://github.com/Mauznemo/smartify_os_android_auto
```

Either way, the same thing happens. It fetches the extension's newest release (or its newest
commit, if it has never had a release), checks that it works with the SmartifyOS your car
runs, and makes sure your app still builds with it. If anything doesn't fit, it puts your car
back exactly as it was and tells you why. Otherwise it switches the extension on in your
`lib/main.dart`:

```dart title="lib/main.dart"
await SmartifyOs().init(
  // ...
  extensions: [
    const AndroidAutoExtension(),
  ],
);
```

To add one particular release instead of the newest, pass `--version`:

```bash
smartify-os extension add https://github.com/Mauznemo/smartify_os_android_auto --version 0.1.0
```

Anything the extension needs installed on the car's Linux (a driver, a program it runs) is
installed for you the next time you put SmartifyOS on the car, see
[Installing SmartifyOS](../putting-it-on-your-car/installing-smartify-os.md). Some extensions
also download big files while they run, like the voice assistant's speech models. Since a car
on the road often has no internet, exporting an installer or an update asks which of those to
put on the USB stick too.

## Changing its settings

Most extensions take a few settings, the arguments of its class in `lib/main.dart`. You can
change them there by hand, but you don't have to.

In the editor, click the extension in the car panel. Its settings are listed in the panel on
the right, each with an explanation, and a change is written into `lib/main.dart` for you.

With the CLI, `extension settings` lists them with their defaults, and changes one by its
name:

```bash
smartify-os extension settings voice_assistant
```

```bash
smartify-os extension settings voice_assistant wakeWord "Hey Miata"
```

```bash
smartify-os extension settings voice_assistant --unset duckLevel
```

`--unset` takes a setting back to the extension's own default. A setting that is a whole
object of its own is set as JSON, and `--describe` tells you what it can hold:

```bash
smartify-os extension settings voice_assistant --describe aiServer
```

```bash
smartify-os extension settings voice_assistant --set 'aiServer={"url":"http://192.168.1.20:11434/v1","model":"qwen3:8b"}'
```

See [Changing Settings](../cli/changing-settings.md) for how lists and nested settings are
named, it works the same way as `smartify-os config`.

## Updating and removing

```bash
smartify-os extension list
```

```bash
smartify-os extension update
```

```bash
smartify-os extension remove android_auto
```

`list` shows which extensions your car runs and in which version. `update` moves every
extension to its newest release that works with your car's SmartifyOS (name one to update
only that, or pass `--check` to only see what's new). `remove` takes it out of your car and
out of `lib/main.dart`. All three try the change before they keep it, so a broken update
never leaves your car unable to build.

When you move your car to a new SmartifyOS with `smartify-os update` and an extension hasn't
caught up with it yet, the update offers that extension's newest release along with it, or
leaves your car as it was when there isn't one.

The editor does all of this from the car panel too: it marks extensions that have an update,
and right clicking one offers updating it and removing it from your car.

## Hiding something an extension adds

Everything an extension adds goes through the same registries your own app uses, so you hide
it the same way you'd hide a built-in, with the `hidden...` lists in `SmartifyOs().init`. Good
extensions name their ids for you:

```dart title="lib/main.dart"
await SmartifyOs().init(
  // Leave Android Auto's "now playing" card off the home screen.
  homeWidgets: const HomeWidgetsConfig(
    hiddenWidgets: {AndroidAutoIds.playerWidget},
  ),
  extensions: [
    const AndroidAutoExtension(),
  ],
);
```

The ones an extension adds are hidden after it has added them, so this always works,
whatever order things start in.

## Checking whether an extension is there

Code of your own can do a little more when an extension is in the car, without depending on
its package, with `SmartifyOsExtensions` from `package:smartify_os_core/extensions.dart`:

```dart
if (SmartifyOsExtensions.hasExtension('android_auto')) {
  // show a shortcut to it on your own card
}
```

Pass the extension's `id`, the short name in `snake_case` that `extension list` shows.

## Android Auto

```bash
smartify-os extension add https://github.com/Mauznemo/smartify_os_android_auto
```

Plug an Android phone in, or connect it over Bluetooth, and it projects Android Auto onto the
car's screen. It adds:

- **Android Auto** in the app list, which opens it full screen. Closing the window leaves it
  running.
- **A notification** while it runs, with a Stop button and its icon in the status bar.
  Tapping it brings the window back.
- **A page in Settings**, right after Connectivity: start and stop, whether it starts on its
  own, whether phones may connect without a cable, and how big its text and buttons are.
- **Two cards on the home screen** while a phone is connected: what's playing (in place of the
  Bluetooth player), and the next turn while it's navigating. Both work with the Android Auto
  window closed, and each can be switched off in Settings.

Without a cable, the car brings up a Wi-Fi hotspot for the phone while Android Auto runs.
Most Wi-Fi chips can't host a hotspot and stay on another network at the same time, so the
car drops its own Wi-Fi meanwhile. If your car is always on a network the phone can join
too, or should only ever use the cable, change `wirelessNetwork`.

| Parameters          |                                                                        |
| ------------------- | ---------------------------------------------------------------------- |
| **wirelessNetwork** | Optional, defaults to `AndroidAutoWirelessNetwork.hotspot()`. How a phone connects without a cable: `.hotspot()` (the car brings one up), `.existing(passphrase: ...)` (the car and phone share a network), or `.none()` (cable only) |
| **headUnitName**    | Optional, the name the phone shows while connected. Left out, it's your car's name from `AboutConfig` |
| **carModel**        | Optional, the car as the phone is told it. Left out, it's `AboutConfig.model` |
| **carYear**         | Optional, the car's model year. Left out, it's this year                 |

:::tip[Tip]

**Pair phones after adding Android Auto.** A phone only finds out that the car can do Android
Auto without a cable while it pairs. A phone paired before has to be forgotten and paired
again, once.

:::

On macOS and Windows it runs a pretend phone, so you can try the whole flow on your computer.
To try it with a real phone on the car without a car to connect it to, open Android Auto's
settings on the phone, tap Version ten times, pick "Start head unit server" from the menu,
then in SmartifyOS go to Settings, System, Developer options, Android Auto, "Connect to the
head unit server".

Android Auto is GPL licensed, so a car's app that uses it is GPL too.

## Voice assistant

```bash
smartify-os extension add https://github.com/Mauznemo/smartify_os_voice_assistant
```

Say the wake word or press a button, say what you want, and the car does it and answers. It
all happens on the car itself, no internet needed. It adds:

- **Ask** in the app list, which starts listening. Put it in the dock for a button that's
  always there: `BarConfig(dockApps: [VoiceAssistantIds.appListEntry])`.
- **A panel** over everything while it listens and answers.
- **Voice assistant** in Settings: the wake word (off until the driver switches it on), the
  speech model and voice, and downloading them.
- Commands it knows already: the volume, muting, the phone's music, opening anything in the
  app list by name, going home, the time, and "never mind".

Before it can listen, it needs its speech models. Either put them on the car with the
installer or update (exporting asks which), or open Settings, Voice assistant, **Get ready to
listen** on the car, which downloads them.

Teach it what your car can do with your own commands. The easiest way is `words`: the
command runs when what the driver said has a word out of every list, in any order:

```dart title="lib/main.dart"
VoiceAssistantExtension(
  wakeWord: 'Hey Miata',
  commands: [
    VoiceCommand(
      id: 'windows_up',
      title: 'Close the windows',
      words: [
        ['window', 'windows'],
        ['up', 'raise', 'close'],
      ],
      onRun: (run) {
        myCar.closeWindows();
        return "I'm closing the windows.";
      },
    ),
  ],
)
```

Return what the car should say, or `null` to only show that it's done. Your commands always
win over the built-in ones. `smartify_os_example_app/lib/voice_commands.dart` has more, including
`phrases` for when the exact words matter.

To start it from a button of your own (one on the steering wheel, say):

```dart
SmartifyOsVoiceAssistant.toggleListening();
```

| Parameters              |                                                                    |
| ----------------------- | ------------------------------------------------------------------ |
| **wakeWord**            | Optional, defaults to `'Hey Smartify'`. Any phrase, no training needed. Two or three words start it by mistake less often than one |
| **wakeWordSpellings**   | Optional, a few spellings of how the wake word sounds, for a word it doesn't know well, like a car's name: `['Hey Miyata', 'Hey Me ah ta']`. The driver can also teach it their voice in Settings |
| **wakeWordOnByDefault** | Optional, defaults to `false`. Whether the wake word is on before the driver switches it on |
| **commands**            | Optional, your own commands, see above                              |
| **hiddenCommands**      | Optional, ids of built-in commands to leave out                     |
| **recognizer**          | Optional, the speech model that understands what's said, from `SpeechModels`. The driver can change it in Settings |
| **aiServer**            | Optional, an AI server (Ollama at home, or anything that speaks the OpenAI API) for answering anything at all, with your commands as its tools. Without a connection it falls back to your commands |

The speech models trade speed for accuracy:

| Model                             | Speed                            | Accuracy  | Languages    | Size   |
| --------------------------------- | -------------------------------- | --------- | ------------ | ------ |
| `SpeechModels.parakeet` (default) | good on a mini PC, slow on a Pi  | best      | 25 European  | 670 MB |
| `SpeechModels.whisperBase`        | good                             | good      | nearly all   | 160 MB |
| `SpeechModels.whisperTiny`        | fast                             | rough     | nearly all   | 105 MB |
| `SpeechModels.moonshineBase`      | fast                             | very good | English      | 290 MB |
| `SpeechModels.moonshineTiny`      | fastest                          | good      | English      | 125 MB |

Settings, System, Developer options, Voice assistant has a field to type a sentence in and run
it as if you'd said it, handy on a computer without a microphone.
