---
sidebar_position: 1
---

# Using GPS

`SmartifyOsGps` is where the car's position and speed come from. It's what feeds the speed shown
on the built-in display and the wheel spin on [Car Orbit Background](../backgrounds/car-orbit-background.md),
and it's there for your own widgets too.

On an Android tablet this needs no setup at all, SmartifyOS asks for the location permission and
uses the tablet's own receiver. On anything else (a car running Linux, most real setups), there's
no receiver of its own, so you hand readings over yourself, from a GPS module on a serial port,
from the car's own bus, from anywhere:

```dart
await SmartifyOs().init(gps: const GpsConfig());

// then, whenever a reading comes in:
SmartifyOsGps.reportFix(speedKmh: 82);
mySerialPort.lines.listen(SmartifyOsGps.reportNmea);
```

**None of the `SmartifyOsGps` methods throw.** A receiver that's unplugged mid drive, a permission
the driver said no to, a damaged line from a module, all of it is reported on `SmartifyOsGps.errors`
instead, and the car carries on.

## Startup config

```dart
await SmartifyOs().init(
  gps: const GpsConfig(),
);
```

| Parameters              |                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **enabled**                  | Optional, defaults to `true`. Turn the whole thing off, nothing is started and no permission is asked for                        |
| **accuracy**                 | Optional, defaults to `GpsAccuracy.best`. How hard the built-in Android receiver should work, `.low`/`.medium`/`.high`/`.best`. Ignored by a source you feed yourself |
| **distanceFilter**           | Optional, defaults to `0`. How far the car has to move, in metres, before the built-in Android receiver reports again. Leave it at `0` for a live speed |
| **requestPermission**        | Optional, defaults to `true`. Ask the driver for the location permission on the first run. Turn it off if your app already asks for it somewhere else |
| **setClock**                 | Optional, defaults to `true`. Set the car's clock from the satellites whenever a reading carries a time, see below |
| **fixTimeout**                | Optional, defaults to zero (never). How long the last reading stays good after the source goes quiet. Set it when your source can stop without saying so (a dongle unplugged, a long tunnel), so the display doesn't keep showing an old speed forever |
| **backend**                  | Optional, replaces the whole GPS implementation, see [Custom backends](#custom-backends) below |

Setting a time from the satellites is exact and needs no network, which is the only way a car
parked in a garage for a month comes back with the right time. This happens on its own, you don't
need to wire up [`SmartifyOsTime`](../date-time/setting-the-time.md) yourself.

## Reporting a fix

Report whatever you have and leave the rest out, anything you leave out keeps the value it
already had, so reporting the position from one place and the speed from another is fine:

```dart
SmartifyOsGps.reportFix(speedKmh: 82);
SmartifyOsGps.reportFix(latitude: 48.137, longitude: 11.575);
```

| Parameters      |                                                                    |
| ------------------ | ------------------------------------------------------------------ |
| **latitude**          | Optional, degrees north, between -90 and 90                       |
| **longitude**         | Optional, degrees east, between -180 and 180                      |
| **altitude**          | Optional, metres above sea level                                  |
| **speed / speedKmh / speedMph**  | Optional, give it in whichever unit you have it in, one of the three |
| **heading**           | Optional, degrees clockwise from true north                       |
| **accuracy**          | Optional, how far off the position could be, in metres            |
| **satellites**        | Optional, how many satellites the receiver can see                |
| **time**              | Optional, the time from the satellites, in UTC                    |

If your source speaks NMEA (most GPS modules do), skip parsing it yourself and pipe the raw lines
straight in:

```dart
mySerialPort.lines.listen(SmartifyOsGps.reportNmea);
```

Damaged lines, lines saying there's no fix yet, and the many kinds of line with nothing useful in
them are all quietly ignored, so it's safe to pipe every line a receiver sends into this.

Call `SmartifyOsGps.clearFix()` when the source goes away and you don't want the old reading to
keep showing.

## Reading state

```dart
final speed = SmartifyOsGps.fix?.speedKmh;
```

To have your own widget redraw the moment a new reading comes in, watch one of the providers
instead of reading `SmartifyOsGps` once. If you haven't used riverpod before, read
[Riverpod Basics](../riverpod-basics.md) first.

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

`gpsSpeedProvider` is in **metres per second**, multiply by `3.6` for km/h or by `2.236936` for
mph, or watch `gpsFixProvider` instead and read `GpsFix.speedKmh`/`GpsFix.speedMph` off it, which
does the conversion for you. Watching just the speed rather than the whole fix means a car
standing still at a junction doesn't rebuild your speed display ten times a second while its
position wanders about.

The full list: `gpsFixProvider` (the whole `GpsFix`, or `null` when there's no reading yet),
`gpsSpeedProvider`, `gpsCapabilitiesProvider`. The same values are also available as plain,
one-off getters (`SmartifyOsGps.fix`, `SmartifyOsGps.speed`, `SmartifyOsGps.capabilities`,
`SmartifyOsGps.isReady`), useful inside a one-off function that isn't building UI, but reading one
of those directly won't redraw anything when it later changes.

## Capabilities

A source is allowed to know only some of what a real GPS receiver knows, a car that only puts its
speed on the wire reports a fix with a speed and nothing else. Always check
`SmartifyOsGps.capabilities` before drawing something that needs a piece it might not have:

```dart
if (SmartifyOsGps.capabilities.has(GpsCapability.position)) {
  // show a map
}
```

The capabilities are `GpsCapability.position`, `.altitude`, `.speed`, `.heading`, `.accuracy`,
`.time` and `.satellites`. Watch `gpsCapabilitiesProvider` rather than reading it once, some
sources only work out what they can do once a reading has actually come in.

## Errors

```dart
SmartifyOsGps.errors.listen((error) {
  if (error.code == GpsErrorCode.permissionDenied) {
    // tell the driver location was declined
  }
});
```

`error.code` is a `GpsErrorCode`: `.unsupported` (this platform has no GPS built in),
`.permissionDenied`, `.disabled` (location switched off on the whole machine), `.noFix` (there's a
receiver, it just can't see enough satellites yet), or `.unknown`. `SmartifyOsGps.lastError` holds
the most recent one, worth checking on a screen that opens well after the car has booted, since
the one failure that matters (the driver said no to the location permission) happens right at
startup.

## Custom backends

`GpsConfig.backend` replaces the whole GPS implementation. You only need this if the car has its
own way of getting position or speed that isn't "hand readings over with `reportFix`/`reportNmea`",
say a permanent CAN bus connection.

Most of the time you don't need a custom backend at all, just call `SmartifyOsGps.reportFix` or
`SmartifyOsGps.reportNmea` from wherever your readings come from and leave `GpsConfig.backend`
unset. Reach for a backend when you want to say up front what your source can do, rather than
letting SmartifyOS work it out from what's actually been reported, which is the tidiest way to
give a car its own named GPS:

```dart
class MyCanBusGps extends ManualGpsBackend {
  MyCanBusGps()
    : super(capabilities: const GpsCapabilities({GpsCapability.speed}));
}
```

```dart
await SmartifyOs().init(
  gps: GpsConfig(backend: MyCanBusGps.new),
);
```

Feed it the same way as before, `SmartifyOsGps.reportFix`/`.reportNmea` still work, just now the
UI knows in advance that only the speed will ever show up, and doesn't offer to draw a map that
will never have anywhere to point at.

### Writing one from scratch

For a source that doesn't fit the "hand over readings" shape at all, one with its own polling
loop or its own permission dance to do first, implement `GpsBackend` directly instead of
extending `ManualGpsBackend`:

```dart
class MyCanBusGpsBackend implements GpsBackend {
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

Pass it the same way as any other backend:

```dart
await SmartifyOs().init(
  gps: GpsConfig(backend: MyCanBusGpsBackend.new),
);
```

A plain broadcast `StreamController` is all you need, `fixChanges` and `capabilityChanges` only
ever get one listener (`SmartifyOsGps` itself, right after `start` returns), so there's no late
listener to catch up. Throw a `GpsException` from `start` for anything that stops the GPS from
coming up at all (no permission, no hardware found), that's what ends up on
`SmartifyOsGps.lastError`. Only override `errors` (it defaults to an empty stream) if your source
can fail again after `start` has already returned, a receiver switched off mid-drive, say.
