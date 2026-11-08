---
sidebar_position: 1
---

# Using GPS

`SmartifyOsGps` is where SmartifyOS gets the car's position and speed. The speed on the info
display and the rolling wheels of the [car on screen](../car/showing-the-car.md) both come from
here, it sets the clock from the satellites, and extensions like Android Auto read it too. Your own
widgets can use it as well.

Where the readings come from depends on what the car runs on:

- **An Android tablet** needs nothing at all. SmartifyOS asks for the location permission and uses
  the tablet's own receiver.
- **Everything else** (a car running Linux, so most real setups) has no receiver of its own. You
  hand the readings over yourself, from a GPS module, from the CAN bus, from anywhere.

A GPS module on a USB cable is the usual case. Most of them print NMEA, the standard text format
GPS modules speak, one line at a time, and SmartifyOS reads that for you. Set the module up as a
board (see [Adding a Board](../usb-boards/adding-a-board.md)) and pipe its lines straight in:

```dart
SmartifyOsSerial.lines(gpsModule).listen(SmartifyOsGps.reportNmea);
```

If your source already knows the numbers, hand those over instead:

```dart
SmartifyOsGps.reportFix(speedKmh: 82);
```

Call either from `main` after `SmartifyOs().init`, or from wherever your readings arrive.
`SmartifyOsGps` comes from `package:smartify_os_core/gps.dart`.

**None of the `SmartifyOsGps` methods throw.** A receiver unplugged mid drive, a permission the
driver said no to, a damaged line from a module, all of it is reported on `SmartifyOsGps.errors`
instead, and the car carries on.

## Reporting a reading

Report whatever you have and leave the rest out. Anything you leave out keeps the value it already
had, so the position can come from one place and the speed from another:

```dart
SmartifyOsGps.reportFix(speedKmh: 82);
SmartifyOsGps.reportFix(latitude: 48.137, longitude: 11.575);
```

| Parameters                      |                                                              |
| ------------------------------- | ------------------------------------------------------------ |
| **latitude**                    | Optional, degrees north, between -90 and 90                  |
| **longitude**                   | Optional, degrees east, between -180 and 180                 |
| **altitude**                    | Optional, metres above sea level                             |
| **speed / speedKmh / speedMph** | Optional, the speed in whichever unit you have it in (metres per second, km/h or mph), give one of the three |
| **heading**                     | Optional, degrees clockwise from true north                  |
| **accuracy**                    | Optional, how far off the position could be, in metres       |
| **satellites**                  | Optional, how many satellites the receiver can see           |
| **time**                        | Optional, the time from the satellites, in UTC               |

`reportNmea` takes one line of NMEA at a time. Damaged lines, lines saying there's no fix yet and
the many kinds of line with nothing useful in them are all quietly skipped, so pipe in every line
the module sends.

When the source goes away and the old reading shouldn't keep showing, call
`SmartifyOsGps.clearFix()`.

## Reading it back

For a one-off look, from anywhere:

```dart
final speed = SmartifyOsGps.fix?.speedKmh; // null while there's no reading
```

`SmartifyOsGps.fix` is a `GpsFix` with every field from the table above, plus `speedKmh` and
`speedMph` already worked out. `SmartifyOsGps.speed` is the speed alone, in metres per second.

Reading a getter once doesn't redraw anything when a new reading comes in. For a widget that keeps
itself up to date, watch `gpsSpeedProvider` or `gpsFixProvider` instead. If you haven't used
riverpod before, read [Riverpod Basics](../riverpod-basics.md) first.

```dart
class SpeedReadout extends ConsumerWidget {
  const SpeedReadout({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final speed = ref.watch(gpsSpeedProvider); // metres per second, or null

    return Text(speed == null ? '--' : '${(speed * 3.6).round()} km/h');
  }
}
```

`gpsSpeedProvider` is in **metres per second**: multiply by `3.6` for km/h, or by `2.236936` for
mph. Watching only the speed rather than the whole fix means a car waiting at a junction doesn't
redraw your speed ten times a second while its position wanders about. `gpsFixProvider` gives the
whole `GpsFix`.

If all you want is a number on screen, the info display already does that, see
[Adding Values](../info-display/adding-values.md).

## What the source knows

A source is allowed to know only part of what a real receiver knows. A car that only puts its speed
on the CAN bus reports a speed and nothing else. Check `SmartifyOsGps.capabilities` before drawing
something that needs a piece it might not have:

```dart
if (SmartifyOsGps.capabilities.has(GpsCapability.position)) {
  // show a map
}
```

The capabilities are `GpsCapability.position`, `.altitude`, `.speed`, `.heading`, `.accuracy`,
`.time` and `.satellites`. A source you feed yourself works them out from what you've actually
reported, so watch `gpsCapabilitiesProvider` rather than reading them once.

## Setting it up

GPS is on without any setup. `GpsConfig` in `SmartifyOs().init` is only for changing how it behaves.
Each of these is also a setting of `smartify-os config` (`gps.fixTimeout`, say, see
[Changing Settings](../cli/changing-settings.md)), and on the **GPS** page of the editor's Setup
group.

```dart
await SmartifyOs().init(
  gps: const GpsConfig(fixTimeout: Duration(seconds: 5)),
);
```

| Parameters            |                                                                              |
| --------------------- | ---------------------------------------------------------------------------- |
| **enabled**           | Optional, defaults to `true`. Turn GPS off entirely, nothing is started and no permission is asked for |
| **setClock**          | Optional, defaults to `true`. Sets the car's clock from the satellites whenever a reading carries a time. It's exact and needs no internet, the only way a car parked for a month comes back with the right time. See [Date & Time](../date-time/setting-the-time.md) |
| **fixTimeout**        | Optional, defaults to never. How long a reading stays good after the source goes quiet. Set it when your source can stop without saying so (a module unplugged, a long tunnel), so the display doesn't keep showing an old speed forever |
| **accuracy**          | Optional, defaults to `GpsAccuracy.best`. How hard an Android tablet's receiver works, `.low`, `.medium`, `.high` or `.best`. Ignored by a source you feed yourself |
| **distanceFilter**    | Optional, defaults to `0`. How far the car has to move, in metres, before an Android tablet's receiver reports again. Leave it at `0` for a live speed |
| **requestPermission** | Optional, defaults to `true`. Ask for the location permission on the first run on Android. Turn it off if your app already asks somewhere else |
| **backend**           | Optional, replaces where readings come from entirely, see [Your own source](#your-own-source) |

## Errors

```dart
SmartifyOsGps.errors.listen((error) {
  if (error.code == GpsErrorCode.permissionDenied) {
    // tell the driver location was declined
  }
});
```

`error.code` is a `GpsErrorCode`: `.unsupported` (this system has no GPS of its own),
`.permissionDenied`, `.disabled` (location is switched off on the whole tablet), `.noFix` (there's a
receiver, it just can't see enough satellites yet) or `.unknown`.

`SmartifyOsGps.lastError` holds the most recent one. It's worth checking on a screen that opens long
after startup, since the failure that matters most (the driver said no to the location permission)
happens right while the car boots.

## Trying it without driving

With developer options on, the developer options page can make the car believe it's somewhere else,
for trying a map or anything location based without going there. Only the position is faked, the
speed and time still come from the receiver. From code it's:

```dart
SmartifyOsGps.setFakePosition(latitude: 48.137, longitude: 11.575);
SmartifyOsGps.clearFakePosition();
```

It only works while developer options are on, and goes away when they're turned off, see
[Using Developer Options](../developer-options/using-developer-options.md).

## Your own source

You'll rarely need this. Calling `reportFix` or `reportNmea` from wherever your readings come from
covers almost every car.

The one time it's worth it is to say up front what your source can do, rather than letting
SmartifyOS work it out from what you report. A car that will only ever report a speed then never
offers a map with nowhere to point. Extend `ManualGpsBackend` with the capabilities you have:

```dart title="lib/gps.dart"
import 'package:smartify_os_core/gps.dart';

class CanBusGps extends ManualGpsBackend {
  CanBusGps()
    : super(capabilities: const GpsCapabilities({GpsCapability.speed}));
}
```

```dart title="lib/main.dart"
await SmartifyOs().init(
  gps: GpsConfig(backend: CanBusGps.new),
);
```

`reportFix` and `reportNmea` work exactly as before.

### Writing one from scratch

For a source that doesn't fit "hand over readings" at all, one with its own polling loop or a
permission to ask for first, implement `GpsBackend` directly:

```dart title="lib/gps.dart"
class CanBusGpsBackend implements GpsBackend {
  final _fixes = StreamController<GpsFix?>.broadcast();
  final _capabilities = StreamController<GpsCapabilities>.broadcast();
  GpsFix? _fix;
  GpsCapabilities _caps = GpsCapabilities.none;
  StreamSubscription<CanBusReading>? _sub;

  @override
  GpsFix? get fix => _fix;
  @override
  Stream<GpsFix?> get fixChanges => _fixes.stream;

  @override
  GpsCapabilities get capabilities => _caps;
  @override
  Stream<GpsCapabilities> get capabilityChanges => _capabilities.stream;

  @override
  Stream<GpsException> get errors => const Stream.empty();

  @override
  Future<void> start(GpsConfig config) async {
    _caps = const GpsCapabilities({GpsCapability.speed});
    _capabilities.add(_caps);
    _sub = myCanBus.readings.listen((reading) {
      _fix = GpsFix(speed: reading.speedMetersPerSecond);
      _fixes.add(_fix);
    });
  }

  @override
  Future<void> stop() async {
    await _sub?.cancel();
    await _fixes.close();
    await _capabilities.close();
  }
}
```

`myCanBus` stands for however your own code reads the car. A plain broadcast `StreamController` is
enough, `SmartifyOsGps` is the only thing listening and starts as soon as `start` returns. Throw a
`GpsException` from `start` for anything that stops the GPS from coming up at all (no permission, no
hardware), it ends up on `SmartifyOsGps.errors` and `lastError`. Return a stream of your own from
`errors` only if your source can also fail after it started, a receiver switched off mid drive say.
