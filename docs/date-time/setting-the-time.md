---
sidebar_position: 1
---

# Setting The Time

`SmartifyOsTime` is the car's clock: what time it is, what zone it is in, and how to change
either. **Most of this page is not something you need to do.** The built-in Date & time settings
page already lets the driver pick a region, switch between a 24 hour and a 12 hour clock, and
turn automatic time on or off, no setup needed for any of that. Reach for `SmartifyOsTime`
yourself only when your car has its own source of the time (a GPS module, say) or you're building
something that needs to show or format a time.

Everywhere in your car app, use `SmartifyOsTime.now` instead of `DateTime.now()`. It's the same
kind of value, but it's in the zone the driver picked and includes any correction SmartifyOS is
applying, so a widget built from it always agrees with the clock in the status bar.

```dart
Text('It is currently ${SmartifyOsTime.now}');
```

**None of the `SmartifyOsTime` methods throw.** A machine that won't let its clock be changed
just gets handled another way, covered below, not an exception.

## Startup config

Pick the zone the car starts out in with `DateTimeConfig`, passed to `SmartifyOs.init`:

```dart
await SmartifyOs().init(
  dateTime: const DateTimeConfig(timeZone: 'Europe/Berlin'),
);
```

| Parameters          |                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **timeZone**          | Optional, a standard `Region/City` name like `'Europe/Berlin'`. Left out, the car starts out in whatever zone the machine itself is set to |
| **automatic**         | Optional, defaults to `true`. Whether the machine keeps its own time (from the network, or from a GPS module you feed it yourself). Turn it off for a car that's never online, so the driver sets the clock by hand |
| **use24HourClock**    | Optional, `true` for 13:45, `false` for 1:45 PM, left out to follow the machine's own setting |
| **setSystemClock**    | Optional, defaults to `true`. Leave this on, it's what actually changes the machine's real clock when the time is set. Turn it off only when something else on the car already owns the clock and SmartifyOS should stay out of the way |

This only decides what the car starts out as. Anything the driver later changes on the Date &
time settings page is remembered and wins over this from then on.

## Setting the time

If you've set up [GPS](../gps/using-gps.md), this already happens on its own, `GpsConfig.setClock`
(on by default) sets the clock from the satellites the moment a reading carries a time. You only
need to call this yourself if the car has some other source that knows the exact time:

```dart
mySource.times.listen(SmartifyOsTime.setTime);
```

Give `setTime` whatever your source hands you, in UTC or local, either is converted correctly. On
a machine that lets its clock be set (a normal Linux car), this sets the real system clock, so
`date` and any logs are right too. On one that doesn't (an Android tablet you haven't unlocked),
SmartifyOS remembers how far off the machine is and shows the right time anyway. Either way it's
saved, so the next drive starts out right.

It's safe to call as often as you like, a time that's already right changes nothing, so a GPS
module reporting several times a second costs nothing.

## Building a time from parts

Use `SmartifyOsTime.dateTime(...)` instead of `DateTime(...)` whenever you put a time together
from its own year/month/day/hour/minute:

```dart
final meetingTime = SmartifyOsTime.dateTime(2026, 8, 24, 13, 45);
```

A plain `DateTime(...)` is built in whatever zone the app process started in, which usually isn't
the zone the car is set to. `SmartifyOsTime.dateTime(...)` builds it in the car's own zone
instead.

## Time zone

```dart
SmartifyOsTime.timeZone;              // 'Europe/Berlin'
await SmartifyOsTime.setTimeZone('Europe/Berlin');
```

Summer time follows on its own once the zone is set. `SmartifyOsTime.timeZones` lists every zone
that can be picked (the same list the built-in settings page uses), each one a `TimeZoneOption`
with a `region` (`'Europe'`), a `city` (`'Berlin'`), the real `id` to pass to `setTimeZone`
(`'Europe/Berlin'`), and an `offsetLabel` written the way people expect to read it (`'GMT+2'`):

```dart
for (final zone in SmartifyOsTime.timeZones) {
  print('${zone.region} / ${zone.city} (${zone.offsetLabel})');
}
```

## Automatic time

```dart
SmartifyOsTime.automatic;             // true while the machine keeps its own time
await SmartifyOsTime.setAutomatic(false);
```

While this is on, there's no point calling `setTime` by hand, the machine only corrects the clock
back on its own. Turn it off first if you want your own time to win.

## 12 hour or 24 hour

```dart
SmartifyOsTime.use24HourClock;        // true, false, or null to follow the machine
await SmartifyOsTime.setUse24HourClock(true);
```

This choice applies to the whole car, not just SmartifyOS's own clock. It's set into Flutter's
`MediaQuery` for you, so anything that formats a time the normal Flutter way already agrees with
it. To format a time yourself the same way, use the helpers in `package:smartify_os_core/widgets.dart`
instead of formatting it by hand:

```dart
Text(formatClockTime(context, SmartifyOsTime.now));       // 13:45 or 1:45 PM
Text(formatClockDate(context, SmartifyOsTime.now));       // Sunday, 23 August 2026
Text(formatClockDateShort(context, SmartifyOsTime.now));  // 23 Aug 2026
```

## What the machine allows

Not every machine lets SmartifyOS change everything about its clock, an Android tablet you
haven't unlocked usually allows none of it. Check `SmartifyOsTime.capabilities` before offering a
control the machine would only ignore:

```dart
if (SmartifyOsTime.capabilities.has(DateTimeCapability.setTimeZone)) {
  // show a time zone picker
}
```

The three capabilities are `DateTimeCapability.setClock`, `.setTimeZone` and `.automaticTime`.
When `SmartifyOsTime.usesOwnClock` is `true`, the machine wouldn't let its clock be set at all, so
SmartifyOS is keeping the right time itself, the clock on screen is correct, the rest of the
machine isn't. The built-in settings page already shows a note about this when it applies, you
only need to check it yourself if you're building your own clock-related UI.

## Reading it live

To have your own widget redraw the moment the time, the zone or the clock format changes, watch
`dateTimeStateProvider` instead of reading `SmartifyOsTime` once. If you haven't used riverpod
before, read [Riverpod Basics](../riverpod-basics.md) first.

```dart
final state = ref.watch(dateTimeStateProvider).value;
```

`state` is a `DateTimeState` with the same information as the plain getters above (`timeZone`,
`automatic`, `use24HourClock`, `capabilities`, `usesOffset`). Everything on `SmartifyOsTime` is
also available as `SmartifyOsTime.changes`, a plain stream, if you'd rather not go through
riverpod.

## Asking for a date or time

For your own settings row or dialog that needs a date or a time from the driver, use
`ThemedDatePicker` and `ThemedTimePicker` instead of Flutter's own pickers, they're wheels you
spin rather than boxes you type into, since a car screen usually has no keyboard, and they follow
the active theme.

```dart
final picked = await ThemedTimePicker.show(
  context,
  initial: TimeOfDay.fromDateTime(SmartifyOsTime.now),
);
if (picked != null) {
  // ...
}
```

`ThemedDatePicker.show` works the same way, taking an `initial` `DateTime` and returning `null`
when cancelled.
