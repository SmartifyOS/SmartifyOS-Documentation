---
sidebar_position: 1
---

# Adding Home Widgets

Home widgets are what sits on the home screen around the car: what's playing, the clock, the quick
settings, or a gauge of your own. Each one is a `HomeWidget`, and `SmartifyOsHomeWidgets` is how you
manage them while the car runs.

There are two kinds:

- A **card** turns up on its own when it has something to say (a song playing, a door left open)
  and the driver can swipe it away. Cards show up in the part of the layout made for them.
- A **pinned** widget is always there, wherever the layout or the driver put it, like a widget on
  a phone's home screen. A clock, a gauge, the quick settings.

## The quick way

The CLI and the [editor](../editor/setting-up-your-car.md) make the file for you:

```bash
smartify-os widget create "Oil temperature" --kind pinned
```

`--kind card` makes a card instead. Either way you get `lib/home_widgets/oil_temperature_widget.dart`,
already handed to SmartifyOS in `lib/main.dart`, and you only fill in what it shows. See
[Windows, Tiles, Widgets and Settings](../cli/making-parts.md) for renaming it or changing its icon
later.

## A card

```dart title="lib/home_widgets/door_open_widget.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_my_car_app/windows/doors_window.dart';
import 'package:smartify_os_core/home_widgets.dart';
import 'package:smartify_os_core/navigator.dart';

final doorOpenWidget = HomeWidget(
  id: 'door_open',
  title: 'Door open',
  icon: const Icon(Icons.sensor_door),
  onTap: (context) => SmartifyOsNavigator.push(context, const DoorsWindow()),
  builder: (home) => const Text('A door is open'),
);
```

And in `lib/main.dart`:

```dart title="lib/main.dart"
await SmartifyOs().init(
  homeWidgets: HomeWidgetsConfig(widgets: [doorOpenWidget]),
);
```

(`smartify_os_my_car_app` stands for your own app's name, the `name:` at the top of its `pubspec.yaml`, and
`DoorsWindow` for a window of yours.)

`builder` draws what's inside the card. SmartifyOS draws the card around it, with the theme's
background and some padding, so you don't need any of that yourself.

A card shows until something takes it away: the driver swiping it up or down (gone for the rest of
this drive), your code calling `hideWidget`, or its own `visible` saying no. Most cards want
`visible`, so they come and go with whatever they're about. It gets a `HomeWidgetContext`, whose
`ref` follows a value of your own with `ref.watchValue` (see [Values That Change](../saved-values.md)):

```dart
final doorOpen = ValueNotifier(false);

final doorOpenWidget = HomeWidget(
  id: 'door_open',
  title: 'Door open',
  icon: const Icon(Icons.sensor_door),
  visible: (home) => home.ref.watchValue(doorOpen),
  builder: (home) => const Text('A door is open'),
);
```

Now `doorOpen.value = true;` from whatever reads the door sensor puts the card on screen, and
`false` takes it away again.

## A pinned widget

```dart title="lib/home_widgets/oil_temperature_widget.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/home_widgets.dart';

final oilTemperatureWidget = HomeWidget.pinned(
  id: 'oil_temperature',
  title: 'Oil temperature',
  icon: const Icon(Icons.oil_barrel),
  builder: (home) => const OilTemperatureGauge(),
);
```

`OilTemperatureGauge` stands for a widget of your own. A pinned widget has no spot of its own until
someone gives it one. Either a layout names it for one of its areas (see
[Making a Layout](../layouts/making-a-layout.md)), or the driver holds an area of the home screen
and adds it from the list. That list is why `title` and `icon` are required here.

## Drawing it to fit

The same widget can land in a thin strip along the top of one layout and a big square in another,
so build it to fit the room it gets rather than at a fixed size. `HomeWidgetContext` tells you:

- `home.size` is the room inside the card, in logical pixels.
- `home.shape` is the rough shape of it: `HomeWidgetShape.strip` (much wider than tall, one line
  of things), `.wide`, `.square` or `.tall`.

```dart
builder: (home) => home.shape == HomeWidgetShape.strip
    ? const Text('Oil 92 °C')
    : const OilTemperatureGauge(),
```

Set `minSize` to the smallest box your widget still works in. An area smaller than that leaves it
out, and the driver isn't offered it there.

## Every option

| Parameters      |                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| **id**          | A short name that's unique across the home screen, like `'oil_temperature'`. Layouts and everything below use it |
| **builder**     | Draws what's inside the card                                                             |
| **title**       | Required on a pinned widget, optional on a card but give it one anyway: it's what the driver reads when holding an area to change what's in it. Without one they read the `id` |
| **icon**        | Required on a pinned widget, optional on a card, shown next to `title` in that list      |
| **visible**     | Optional, decides whether the widget belongs on screen right now. Leave it out and a card shows until it's hidden or swiped away, and a pinned widget always shows |
| **onTap**       | Optional, what tapping it does. A good place to open a window with the full version of what it shows |
| **order**       | Optional, where it sits when several share an area, smaller comes first, defaults to `100`. Give an urgent warning a small number |
| **minSize**     | Optional, the smallest box it can be drawn in, defaults to `Size(100, 60)`               |
| **height**      | Optional, how tall a card wants to be in an area that sizes itself to its cards (the strip along the top of the classic layout). Leave it out so all cards line up while the driver swipes between them |
| **panel**       | Optional, defaults to `true`. Turn it off for a widget that draws its own background or fills its box edge to edge |
| **unique**      | Optional, defaults to `false`. Set it for something there can only be one of on the home screen, so the driver isn't offered it a second time |
| **dismissible** | Optional, cards only, defaults to `true`. Set it to `false` for something the driver must not be able to swipe away, like a warning light |
| **replaces**    | Optional, cards this one stands in for, by `id`, see below                               |

## When two cards would say the same thing

`replaces` keeps other cards off screen while this one is showing. The usual case is a music player
of your own: the driver listens to one thing at a time, so it should take the Bluetooth player's
place (see [Your Own Player](../music/media-player-card.md)):

```dart
HomeWidget(
  id: 'radio',
  title: 'Radio',
  icon: const Icon(Icons.radio),
  replaces: const {HomeWidgets.bluetoothPlayer},
  visible: (home) => home.ref.watchValue(radioPlaying),
  builder: (home) => const RadioCard(),
)
```

## Where cards go, and what the driver can change

Every layout has one area that takes cards. Each card is there by default, ahead of the area's
pinned widgets, and shows whenever it has something to say. Holding any area lists everything in
it, where the driver can:

- move a card to another area,
- take a card out, so it never turns up on its own again,
- add a pinned widget, or take one out.

All of that is remembered between drives, per layout. Swiping a card away is different: it's only
for the current drive. Settings, Appearance lists the areas of the current layout too, since an
empty area that slides out of the way can't be held.

## Turning widgets on and off from code

Everything here works at any time, and the home screen updates right away:

```dart
SmartifyOsHomeWidgets.addWidget(doorOpenWidget);
SmartifyOsHomeWidgets.addWidgets([firstWidget, secondWidget]);
SmartifyOsHomeWidgets.removeWidget('door_open');
SmartifyOsHomeWidgets.hideWidget('door_open');    // off screen until shown again
SmartifyOsHomeWidgets.showWidget('door_open');    // back on, even after a swipe
SmartifyOsHomeWidgets.dismissWidget('door_open'); // the same as a swipe
SmartifyOsHomeWidgets.hasWidget('door_open');
SmartifyOsHomeWidgets.isWidgetActive('door_open'); // registered, not hidden, not swiped away
SmartifyOsHomeWidgets.widgets; // every widget there is
```

`showWidget` is how you make sure something important is seen again after the driver swiped it
away. None of these throw: an `id` that isn't registered is logged and skipped, and hiding or
showing one before it's added still works, so the order you set things up in doesn't matter.

`SmartifyOsHomeWidgets.resetAreaWidgets()` forgets what the driver put where, in every layout, and
goes back to what the layouts say.

## Built-in widgets

`HomeWidgets` names the ones SmartifyOS brings along:

| Widget                        |                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `HomeWidgets.bluetoothPlayer` | Card: what's playing on the phone, see [Using Bluetooth](../bluetooth/using-bluetooth.md) |
| `HomeWidgets.filePlayer`      | Card: what's playing from a USB stick, see [The File Player](../music/file-player.md) |
| `HomeWidgets.quickSettings`   | Pinned: the quick settings tiles, big                                            |
| `HomeWidgets.clock`           | Pinned: the time, with the date under it                                         |
| `HomeWidgets.infoDisplay`     | Pinned: the speed and friends, see [Adding Values](../info-display/adding-values.md) |
| `HomeWidgets.car`             | Pinned: your car, see [Showing the Car](../car/showing-the-car.md)                |
| `HomeWidgets.reverseCamera`   | Pinned: the reverse camera, live, only on a car that has one                     |

Leave any of them out with `hiddenWidgets`:

```dart
await SmartifyOs().init(
  homeWidgets: const HomeWidgetsConfig(hiddenWidgets: {HomeWidgets.clock}),
);
```
