---
sidebar_position: 1
---

# Adding Settings Pages

To add your own settings you need to use `SmartifyOsSettings`. A page is a `SettingsPage`, and
it can live under one of the built-in pages or under one of your own.

```dart
SmartifyOsSettings.addPage(
  SettingsPage(
    id: 'seat_heating',
    title: 'Seat Heating',
    parent: SettingsPages.vehicle,
    icon: const Icon(Icons.chair),
    entries: [
      SettingsEntry.toggle(
        title: 'Driver Seat',
        initialValue: true,
        onChanged: (on) {},
      ),
    ],
  ),
);
```

| Parameters       |                                                                          |
| ------------------- | -------------------------------------------------------------------------- |
| **id**              | Unique id for the page                                                     |
| **title**           | Shown in the page's title bar and as its row title in the parent page      |
| **parent**          | Optional, the id of the page this one lives under, defaults to the settings root |
| **subtitle**        | Optional subtitle under the row title                                     |
| **icon**            | Optional icon for the row                                                  |
| **section**         | Optional section header to group it under in the parent page              |
| **order**           | Optional, where its row sits relative to siblings, lower is earlier, defaults to `100` |
| **visible**         | Optional, return `false` to hide the page depending on app state           |
| **entries**         | Optional, the rows shown on the page, defaults to none                    |

`SettingsPages` has constants for every built-in page you can use as a `parent`: `root`,
`connectivity`, `bluetooth`, `wifi`, `mobileData`, `sound`, `display`, `vehicle`, `dateTime`,
`language`, `system`, `about`.

## Live and custom pages

If your rows depend on state that changes while the page is open, use `SettingsPage.builder`
instead, its `entries` is a function that gets called again whenever it needs to rebuild. It
receives a `SettingsContext` with a `context` and a `ref`, so it can watch a value that changes
while the car is running, see [Riverpod Basics](../riverpod-basics.md) if you haven't used that
before:

```dart
SettingsPage.builder(
  id: 'battery',
  title: 'Battery',
  entries: (settings) => [
    SettingsEntry.info(title: 'Charge', value: '${settings.ref.watch(batteryProvider)}%'),
  ],
)
```

If you need something that doesn't fit the row-based layout at all, use `SettingsPage.custom`
and build your own `body`:

```dart
SettingsPage.custom(
  id: 'gauges',
  parent: SettingsPages.display,
  title: 'Gauges',
  body: (settings) => const MyGaugeEditor(),
)
```

A custom page has no child rows or pages shown underneath it.

## Adding a single row

If you just want to drop one row onto a page that already exists, without making a whole page of
your own, use `SmartifyOsSettings.addEntry` instead. The page doesn't even have to exist yet, the
row appears as soon as it does.

```dart
SmartifyOsSettings.addEntry(
  SettingsEntry.action(title: 'Reset Trip Meter', onTap: myCar.resetTrip),
  to: SettingsPages.vehicle,
  section: 'Maintenance',
);
```

## Managing existing pages

```dart
SmartifyOsSettings.removePage('seat_heating');
SmartifyOsSettings.hidePage('seat_heating');
SmartifyOsSettings.showPage('seat_heating');
SmartifyOsSettings.hasPage('seat_heating');
```

None of these throw, an id that isn't registered is logged and worked around, a typo in a
settings page should never stop a car.

You can also add several pages at once with `SmartifyOsSettings.addPages(...)`, read the current
pages with `SmartifyOsSettings.pages`, and open the settings window directly with
`SmartifyOsSettings.open(context)` or `SmartifyOsSettings.open(context, pageId: 'seat_heating')`.

To leave a built-in page out from the start instead, use `SettingsConfig.hiddenPages`:

```dart
await SmartifyOs().init(
  settings: const SettingsConfig(hiddenPages: {SettingsPages.mobileData}),
);
```
