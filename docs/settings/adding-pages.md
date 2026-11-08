---
sidebar_position: 1
---

# Adding Settings Pages

Your car probably has a few things the driver should be able to change: how long the headlights
stay on, how warm the seats get. Those go on a settings page of your own, a `SettingsPage`, which
shows up inside Settings next to the pages SmartifyOS brings along. `SmartifyOsSettings` is how you
manage them while the car runs.

## The quick way

The CLI and the [editor](../editor/setting-up-your-car.md) make a page for you, then add its rows
one at a time:

```bash
smartify-os settings create "Seat heating" --in vehicle
```

```bash
smartify-os settings add-row "Seat heating" "Driver seat" --kind switch
```

```bash
smartify-os settings add-row "Seat heating" Level --kind choice --option Low --option High
```

This makes `lib/settings/seat_heating_page.dart`, hands it to SmartifyOS in `lib/main.dart`, and puts
a "Seat heating" row on the Vehicle page that opens it. A switch or a choice remembers what the
driver picked between drives, and the rest of your app reads it like a variable. See
[Windows, Tiles, Widgets and Settings](../cli/making-parts.md) for every option.

You can always change the file by hand afterwards, so the rest of this page explains what's in it.

## What a page looks like

```dart title="lib/settings/seat_heating_page.dart"
import 'package:flutter/material.dart';
import 'package:smartify_os_core/settings.dart';

final seatHeatingPage = SettingsPage(
  id: 'seat_heating',
  parent: SettingsPages.vehicle,
  title: 'Seat heating',
  icon: const Icon(Icons.event_seat),
  entries: [
    SettingsEntry.toggle(
      id: 'driver_seat',
      title: 'Driver seat',
      saved: seatHeatingDriverSeat,
    ),
  ],
);

/// What the `driver_seat` row is set to, kept between drives.
const seatHeatingDriverSeat = SavedValue(
  'seat_heating.driver_seat',
  defaultValue: false,
);
```

And in `lib/main.dart`:

```dart title="lib/main.dart"
await SmartifyOs().init(
  settings: SettingsConfig(pages: [seatHeatingPage]),
);
```

Because the page names Vehicle as its `parent`, a "Seat heating" row appears on the Vehicle page by
itself, there's nothing else to register. The rows (`entries`) are covered on
[Settings Entries](./settings-entries.md), and `SavedValue` on [Values That Change](../saved-values.md).

| Parameters      |                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| **id**          | A short name that's unique across all of Settings, like `'seat_heating'`. Other pages use it as their `parent` |
| **title**       | The heading at the top of the page, and the text of the row that opens it                |
| **parent**      | Optional, the page this one's row sits on, see below. Leave it out and the page becomes a new category on the first page of Settings |
| **entries**     | Optional, the rows on the page. Leave it out for a page that only holds other pages      |
| **icon**        | Optional, the icon on the row that opens it                                              |
| **subtitle**    | Optional, a dimmer second line on that row                                               |
| **section**     | Optional, puts that row under a heading on the parent page. Rows with the same section text end up together |
| **order**       | Optional, where that row sits on the parent page, smaller comes first, defaults to `100` |
| **visible**     | Optional, decides whether the page (and its row) is there right now. Leave it out and it always is |

## Where a page can go

`parent` takes the `id` of any page, one of your own or one of the built-in ones in `SettingsPages`:

| Page                          |                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `SettingsPages.root`          | The first page of Settings, the default. A page here is a category of its own |
| `SettingsPages.connectivity`  | Bluetooth, Wi-Fi and mobile data                                             |
| `SettingsPages.sound`         | Sound                                                                         |
| `SettingsPages.display`       | Display                                                                       |
| `SettingsPages.appearance`    | How the car looks: the layout, theme, home screen widgets and info display. Hang anything off it that changes how the car looks |
| `SettingsPages.vehicle`       | Anything about the car itself, usually where your pages belong               |
| `SettingsPages.dateTime`      | Date & time                                                                   |
| `SettingsPages.language`      | Language                                                                      |
| `SettingsPages.system`        | System                                                                        |
| `SettingsPages.developer`     | Developer options, only shown while they're switched on, see [Using Developer Options](../developer-options/using-developer-options.md). Anything only for testing goes here |

The Bluetooth page and the About page are drawn by SmartifyOS itself, so a page or row you point at
them won't show up. Use `SettingsConfig.about` for the About page instead, see
[The About Page](./about-page.md).

## Rows that change while the page is open

A plain `SettingsPage` builds its rows once. If a row has to show something that changes, use
`SettingsPage.builder`, whose `entries` is a function that runs again every time something it reads
changes. It gets a `SettingsContext`, and its `ref` follows your own values with `ref.watchValue`
(see [Values That Change](../saved-values.md)):

```dart
final batteryLevel = ValueNotifier(100);

SettingsPage.builder(
  id: 'battery',
  parent: SettingsPages.vehicle,
  title: 'Battery',
  entries: (settings) => [
    SettingsEntry.info(
      title: 'Charge',
      value: '${settings.ref.watchValue(batteryLevel)}%',
    ),
  ],
)
```

A row with a `SavedValue` already follows it on its own, so you only need this for anything else.

## A page you draw yourself

For something that isn't a list of rows at all, use `SettingsPage.custom` and build the whole page:

```dart
SettingsPage.custom(
  id: 'gauges',
  parent: SettingsPages.display,
  title: 'Gauges',
  body: (settings) => const GaugeEditor(),
)
```

`GaugeEditor` here stands for any widget of your own. A custom page shows only that widget, so
rows added to it and pages that name it as their `parent` don't show up.

`SettingsContext` also has a `controller` for moving around inside Settings from your own widgets:
`settings.controller.openPage('seat_heating')`, `.back()` and `.close()`.

## Adding a row to a page that already exists

Sometimes a whole page is too much, and one row on an existing page is all you need. Pass rows to
`SettingsConfig.entries`, by the `id` of the page they go on:

```dart title="lib/main.dart"
await SmartifyOs().init(
  settings: SettingsConfig(
    pages: [seatHeatingPage],
    entries: {
      SettingsPages.vehicle: [
        SettingsEntry.action(
          title: 'Reset trip meter',
          section: 'Maintenance',
          onTap: resetTripMeter,
        ),
      ],
    },
  ),
);
```

Or add one while the car runs:

```dart
SmartifyOsSettings.addEntry(
  SettingsEntry.action(title: 'Reset trip meter', onTap: resetTripMeter),
  to: SettingsPages.vehicle,
  section: 'Maintenance',
);
```

The page doesn't even have to exist yet, the row shows up as soon as it does. `section` puts the
row under a heading, and using the text of a heading that's already on the page puts it into that
group. The CLI and editor leave rows like these to you, they only change pages in `lib/settings/`.

## Managing pages while the car runs

Pages can come and go at any time, and Settings updates right away, even while it's open:

```dart
SmartifyOsSettings.addPage(seatHeatingPage);
SmartifyOsSettings.addPages([firstPage, secondPage]);
SmartifyOsSettings.removePage('seat_heating');
SmartifyOsSettings.hidePage('seat_heating');
SmartifyOsSettings.showPage('seat_heating');
SmartifyOsSettings.hasPage('seat_heating');
SmartifyOsSettings.pages; // every page there is
```

None of these throw. An `id` that isn't registered is logged and skipped, a typo in a settings page
should never stop a car.

To open Settings from your own code, straight on one page if you like:

```dart
SmartifyOsSettings.open(context);
SmartifyOsSettings.open(context, pageId: 'seat_heating');
```

## Leaving built-in pages out

Anything your car doesn't have can go, by its `id`:

```dart
await SmartifyOs().init(
  settings: const SettingsConfig(hiddenPages: {SettingsPages.mobileData}),
);
```
