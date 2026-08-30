---
sidebar_position: 18
---

# Riverpod Basics

You'll see the word "riverpod" and a `ref.watch(...)` call all over these docs, on `visible`,
`builder`, `isOn` and similar callbacks. Riverpod is a small library SmartifyOS itself is built
on for keeping track of things that change while the car is running, is a door open, how much
battery is left, what's playing. This page explains just enough of it to use in your own car, so
the rest of the docs can point back here instead of re-explaining it every time.

You don't have to use it. Everywhere it comes up is optional. But it's the easiest way to make a
row, a card or an icon update itself automatically whenever something changes, instead of you
having to remember to call a `show`/`hide`/`set` method by hand every time.

`flutter_riverpod` isn't a dependency of your project by default, add it first:

```bash
flutter pub add flutter_riverpod
```

## Storing a value

A "provider" is just a labeled box holding one piece of information. Create a new file for these
in your project, for example `lib/providers.dart`, right alongside `app_list.dart`,
`settings_pages.dart` and the other files described in the various "Putting It Together" pages.
Inside it, declare a provider near the top of the file, outside of any class or function:

```dart title="lib/providers.dart"
import 'package:flutter_riverpod/flutter_riverpod.dart';

final doorsOpenProvider = StateProvider<bool>((ref) => false);
```

`StateProvider<bool>` means it holds a `bool`, and `(ref) => false` is what it starts out as. Add
as many as you like to the same file, one for each piece of information your car needs to track:

```dart title="lib/providers.dart"
import 'package:flutter_riverpod/flutter_riverpod.dart';

final doorsOpenProvider = StateProvider<bool>((ref) => false);
final batteryProvider = StateProvider<int>((ref) => 100);
final lightsProvider = StateProvider<bool>((ref) => false);
```

Then, in any file that needs to read or change one of these, import it the same way you'd import
any other file of your own:

```dart
import 'package:my_car_app/providers.dart';
```

(`my_car_app` there stands for your own project's name, whatever you gave it in its
`pubspec.yaml`.)

## Reading it live

Every callback in these docs that receives a small "context" object, `AppListContext`,
`HomeWidgetContext`, `StatusBarContext`, `QuickSettingsContext`, `SettingsContext`, carries a
`ref` alongside the usual `context`. Call `.watch(...)` on it to read a provider's current value,
and SmartifyOS redraws that one piece of UI on its own whenever it changes, nothing else to wire
up:

```dart
AppListEntry(
  id: 'doors',
  title: 'Doors',
  icon: const Icon(Icons.sensor_door),
  visible: (apps) => apps.ref.watch(doorsOpenProvider),
  onOpen: (context) => SmartifyOsNavigator.push(context, const DoorsWindow()),
)
```

This app list entry now only shows up while `doorsOpenProvider` is `true`.

## Reading it in your own widgets

A window or a settings page you build yourself is a normal Flutter widget, and a plain
`StatelessWidget` can't watch a provider. Extend `ConsumerWidget` instead of `StatelessWidget`,
it works exactly the same way except `build` also hands you a `ref`:

```dart
class DoorsWindow extends ConsumerWidget {
  const DoorsWindow({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOpen = ref.watch(doorsOpenProvider);

    return SmartifyOsWindow(
      title: 'Doors',
      child: Center(child: Text(isOpen ? 'Open' : 'Closed')),
    );
  }
}
```

(If your widget already needs to be a `StatefulWidget` for its own reasons, use
`ConsumerStatefulWidget` and `ConsumerState` instead, the same idea applies.)

## Changing the value

From any `ref` (the one your `ConsumerWidget` gives you, or the one inside `apps`/`home`/
`status`/`qs`/`settings` above), set a new value with:

```dart
ref.read(doorsOpenProvider.notifier).state = true;
```

`ref.read` instead of `ref.watch` here on purpose, you're not trying to redraw anything by
writing to the provider, just changing what it holds. Whatever else is watching it updates on
its own.

:::tip[Tip]

Use `ref.watch(...)` to read a value that should redraw your UI when it changes, and
`ref.read(...)` for a one-off read, or to change the value. Watching something you're about to
change yourself in the same line of code is a common beginner mistake.

:::

## Beyond a simple value

Every provider on this page is something your own code decides and writes into directly, a
`StateProvider` is built exactly for that. If a value instead comes from something asynchronous,
a stream from a plugin, a value read over the network, reach for `StreamProvider` or
`FutureProvider` instead, same idea, just built for a value that arrives over time rather than
one you set yourself.

You'll also see `smartify_os_core` itself use a different style internally, `@riverpod`
functions with generated code (`riverpod_generator`, `build_runner`). That doesn't let it do
anything a plain provider like the ones on this page can't, it mainly saves typing once a
project has dozens of providers that reference each other, which is why the core package (a much
bigger codebase than your own car app) uses it. For the handful of providers a single car adds,
there's no real need to reach for it.
