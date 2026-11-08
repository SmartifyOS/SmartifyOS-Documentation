---
sidebar_position: 1
---

# Setting the Time

`SmartifyOsTime`, from `package:smartify_os_core/date_time.dart`, is the car's clock: what time it
is, which time zone the car is in, and how to change either.

Most cars need nothing from this page. The Date & time page in Settings already lets the driver pick
their time zone, switch between a 24 hour and a 12 hour clock, and turn automatic time on or off.
Read on if your car has its own source for the time (a GPS module, say), or you're building
something that shows a time.

## Always use SmartifyOsTime.now

Anywhere in your app where you'd write `DateTime.now()` to show the driver a time, write
`SmartifyOsTime.now` instead:

```dart
Text('Trip started at ${formatClockTime(context, SmartifyOsTime.now)}');
```

It's the same kind of value, but it's in the time zone the driver picked, with summer time right,
and it includes any correction SmartifyOS makes on a computer that won't let its clock be set. That
way your own widgets always agree with the clock in the status bar. (Plain `DateTime.now()` is
still fine for measuring how long something took, where only the difference matters.)

`SmartifyOsTime.nowUtc` is the same moment in UTC, for anything you send somewhere else or write
down.

## The time zone the car starts in

`smartify-os create` asks which time zone the car is in and writes it into `lib/main.dart` as a
`DateTimeConfig`:

```dart
await SmartifyOs().init(
  dateTime: const DateTimeConfig(timeZone: 'Europe/Berlin'),
);
```

This only decides how the car starts out. Whatever the driver later changes on the Date & time page
is remembered, and wins from then on.

| Parameters         |                                                                            |
| ------------------ | -------------------------------------------------------------------------- |
| **timeZone**       | Optional, a standard `Region/City` name like `'Europe/Berlin'`. Leave it out and the car starts in whatever zone the computer itself is set to |
| **automatic**      | Optional, defaults to `true`. Lets the computer keep its own time, from the internet or from a GPS module. Turn it off for a car that's never online, so the driver sets the clock by hand |
| **use24HourClock** | Optional, `true` for 13:45, `false` for 1:45 PM. Leave it out to follow the computer's own setting |
| **setSystemClock** | Optional, defaults to `true`. Leave it on: it's what changes the computer's real clock when the time is set. Turn it off only when something else on the car already owns the clock |
| **backend**        | Optional, a clock of your own, only for testing or a car whose clock is set some way SmartifyOS doesn't know |

You can also change these with the CLI, or on the Date and time setup page in
[the editor](../editor/setting-up-your-car.md):

```bash
smartify-os config dateTime.timeZone Europe/Vienna
```

## Setting the time from your own source

If you've set up [GPS](../gps/using-gps.md), this already happens by itself: the clock is set from
the satellites as soon as a reading carries the time. Only call this yourself if the car has some
other source that knows the exact time:

```dart
myTimeSource.times.listen(SmartifyOsTime.setTime);
```

Give `setTime` whatever your source hands you, UTC or local, both are handled. On a car running
Linux this sets the computer's real clock, so logs are right too. On one that won't let its clock
be set (an Android tablet, usually), SmartifyOS remembers how far off the computer is and shows the
right time anyway. Either way it's saved, so the next drive starts out right.

It's safe to call as often as you like. A time that's already right changes nothing, so a GPS
module reporting several times a second costs nothing.

`setTime` hands back `false` in one case: the computer is keeping its own time (`automatic` is on)
and would only correct it back. Turn automatic time off first if your time should win:

```dart
await SmartifyOsTime.setAutomatic(false);
await SmartifyOsTime.setTime(timeFromMyModule);
```

## Building a time from parts

When you put a time together from a year, month, day, hour and minute, use
`SmartifyOsTime.dateTime(...)` instead of `DateTime(...)`:

```dart
final service = SmartifyOsTime.dateTime(2026, 8, 24, 13, 45);
```

A plain `DateTime(...)` is made in whatever zone the app happened to start in, which usually isn't
the zone the car is set to.

## Showing a time

Whether the car shows 13:45 or 1:45 PM is the driver's choice, so don't format times by hand. Use
these helpers from `package:smartify_os_core/date_time.dart`, which follow that choice and write day
and month names in the car's language:

```dart
Text(formatClockTime(context, SmartifyOsTime.now));       // 13:45 or 1:45 PM
Text(formatClockDate(context, SmartifyOsTime.now));       // Sunday, 23 August 2026
Text(formatClockDateShort(context, SmartifyOsTime.now));  // 23 Aug 2026
```

`context` is the `BuildContext` your widget's `build` method gets.

To have a widget of your own redraw when the time, the zone or the clock format changes, watch
`dateTimeStateProvider` (see [Riverpod Basics](../riverpod-basics.md)), or `clockProvider` for the
current time ticking over every minute, the way the status bar clock does:

```dart
final now = ref.watch(clockProvider).value ?? SmartifyOsTime.now;
Text(formatClockTime(context, now));
```

## Changing the clock from code

Everything on the Date & time settings page can be changed from your own code too:

```dart
SmartifyOsTime.timeZone;                     // 'Europe/Berlin'
await SmartifyOsTime.setTimeZone('Europe/Berlin');

SmartifyOsTime.automatic;                    // true while the computer keeps its own time
await SmartifyOsTime.setAutomatic(false);

SmartifyOsTime.use24HourClock;               // true, false, or null to follow the computer
await SmartifyOsTime.setUse24HourClock(true);
```

None of these throw. Summer time follows by itself once the zone is set. A zone name SmartifyOS
doesn't know falls back to UTC and logs a warning.

`SmartifyOsTime.timeZones` lists every zone that can be picked, the same list the settings page
shows. Each is a `TimeZoneOption` with a `region` (`'Europe'`), a `city` (`'Berlin'`), the `id` to
pass to `setTimeZone` (`'Europe/Berlin'`), and an `offsetLabel` the way people read it (`'GMT+2'`).

## What the computer allows

Not every computer lets SmartifyOS change everything about its clock. An Android tablet usually
allows none of it. Check `SmartifyOsTime.capabilities` before showing a control the computer would
ignore:

```dart
if (SmartifyOsTime.capabilities.has(DateTimeCapability.setTimeZone)) {
  // show a time zone picker
}
```

The capabilities are `DateTimeCapability.setClock`, `.setTimeZone` and `.automaticTime`. When
`SmartifyOsTime.usesOwnClock` is `true`, the computer wouldn't let its clock be set, so SmartifyOS
is keeping the right time itself: the clock on screen is right, the rest of the computer isn't. The
settings page already explains this to the driver, you only need it for screens of your own.

## Asking the driver for a date or time

For a screen of your own that needs a date or a time from the driver, use `ThemedDatePicker` and
`ThemedTimePicker` (from `package:smartify_os_core/modals.dart`) instead of Flutter's own pickers.
They're wheels to spin rather than boxes to type in, since a car screen usually has no keyboard, and
they match the car's theme:

```dart
final picked = await ThemedTimePicker.show(
  context,
  initial: TimeOfDay.fromDateTime(SmartifyOsTime.now),
);
if (picked != null) {
  // the driver picked a time
}
```

`ThemedDatePicker.show` works the same way with an `initial` `DateTime`. Both hand back `null` when
the driver cancels.
