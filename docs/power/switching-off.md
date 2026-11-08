---
sidebar_position: 1
---

# Switching Off

`SmartifyOsPower` switches the car's computer off, or restarts it. The driver already has a power
button for this at the top of the quick settings, which asks whether to power off or restart.
You only need `SmartifyOsPower` yourself for two things: switching off on your own (when the
ignition goes off, say), and doing something first whenever the car switches off.

**Nothing on `SmartifyOsPower` throws.**

## Switching off from your own code

```dart
SmartifyOsPower.powerOff();
SmartifyOsPower.restart();
```

Both return `false` when it didn't work. For example, if a board on your
[CAN bus](../can-bus/sending-and-listening.md) says when the ignition goes off:

```dart
SmartifyOsCan.messages(Ignition.state).listen((message) {
  if (!message.get(Ignition.on)) SmartifyOsPower.powerOff();
});
```

A physical power button of your own can open the same menu the quick settings button does:

```dart
SmartifyOsPower.showPowerMenu(context);
```

## Doing something first

Before the computer goes off, the SmartifyOS logo shows for a moment. That moment is for anything
that has to happen first: lowering pop-up headlights, telling a board to cut the power once the
computer is down, saving something. Listen to `SmartifyOsPower.poweringOff`:

```dart
SmartifyOsPower.poweringOff.listen((action) {
  lowerHeadlights();
});
```

It fires once, however the car was asked to switch off (the quick settings button, your own
code, an extension), with `PowerAction.powerOff` or `PowerAction.restart`. Put it in a function
of your own and call that once from `main` after `SmartifyOs().init`.

What you do here has to be quick: the logo shows for two seconds, and then the computer goes off
whether you're done or not. Make it longer with `PowerConfig.delay` if you need more time.

## Where it works

Only a car the installer set up is really switched off. On any other computer, the one you're
working on say, nothing is switched off: the log says what would have happened and the screen
comes back, so you can try your `poweringOff` code safely. An Android tablet can't be switched
off by an app at all, so there the power button doesn't show and `SmartifyOsPower` does nothing.

Check before you show a power button of your own:

```dart
if (SmartifyOsPower.capabilities.has(PowerAction.restart)) {
  // show a restart button
}
```

## Setting it up

The defaults suit every car. `PowerConfig`, passed to `SmartifyOs.init`, is only for changing
them:

```dart
await SmartifyOs().init(
  power: const PowerConfig(delay: Duration(seconds: 5)),
);
```

| Parameters  |                                                                    |
| ----------- | ------------------------------------------------------------------ |
| **delay**   | Optional, defaults to 2 seconds. How long the logo shows before the computer really goes off, which is the time everything listening to `poweringOff` gets |
| **enabled** | Optional, defaults to `true`. Turn it off to leave the power alone entirely: no power button in the quick settings, and `SmartifyOsPower` does nothing. For a car where something else switches the computer off |
| **backend** | Optional, replaces how the computer is switched off, for one SmartifyOS doesn't know how to switch off itself |
