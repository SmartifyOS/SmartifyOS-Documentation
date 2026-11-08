---
sidebar_position: 1
---

# Running Commands

A lot of what a car needs to do, restarting a service, reading a sensor through a tool, checking
the Wi-Fi, is a one line command on Linux. `SmartifyOsShell` is how you run one from your app.

**None of its methods throw.** A command that doesn't exist, isn't allowed, or takes too long
comes back as a result you check, never as a crash.

## Running a command and waiting for it

```dart
final result = await SmartifyOsShell.run('uname', arguments: ['-r']);
if (result.ok) {
  SmartifyOsLog.info('System', 'Running kernel ${result.output}');
} else {
  SmartifyOsLog.warning('System', 'Could not check: ${result.error}');
}
```

Always check `result.ok` first, it's `true` only when the command ran and said it worked.
`result.output` is what it printed, without the newline at the end, and `result.error` is
something ready to show or log when it didn't work (what the command complained about, or why it
couldn't be run at all). `result.timedOut` says whether it ran out of time, and `result.exitCode`
is the number the command ended with, `0` meaning it worked.

Pass the program first and everything after it as separate `arguments`, **never as one string**:

```dart
// Right:
await SmartifyOsShell.run('timedatectl', arguments: ['set-ntp', 'true']);

// Wrong, this looks for a program literally called "timedatectl set-ntp true":
await SmartifyOsShell.run('timedatectl set-ntp true');
```

Each argument goes to the program exactly as you wrote it, so a file name with a space in it just
works, and nothing ever needs quoting.

| Parameters           |                                                                   |
| -------------------- | ----------------------------------------------------------------- |
| **command**          | The program to run, like `'uname'`                                |
| **arguments**        | Optional, everything after the program name, one item per argument |
| **timeout**          | Optional, defaults to 10 seconds. The command is stopped after this and `result.timedOut` is `true`. Pass `Duration.zero` to wait forever, but only for a command you're sure ends on its own |
| **workingDirectory** | Optional, the folder the command runs in, leave it out for wherever the app runs |
| **environment**      | Optional, extra environment variables for the command             |
| **elevated**         | Optional, defaults to `false`. Runs the command as the administrator, see below |

## Following a command that keeps running

For something that keeps going, like `journalctl -f` or `ping`, start it instead and read what it
prints as it happens:

```dart
final process = await SmartifyOsShell.start('ping', arguments: ['1.1.1.1']);
if (process == null) return; // could not be started at all

final subscription = process.output.listen((line) {
  SmartifyOsLog.debug('Ping', line.isError ? 'Error: ${line.text}' : line.text);
});

// ...later, once you've seen enough:
await process.kill();
await subscription.cancel();
```

`start` takes the same `arguments`, `workingDirectory`, `environment` and `elevated` as `run`, but
has no `timeout`. **Nothing stops it on its own**, so always `kill` a process you're done with.
`journalctl -f` in particular never ends by itself.

Each line has its `text`, and `isError` says whether it came from the command's error output.
`await process.done` waits for the command to end and hands you the same kind of result `run`
does. That result only holds the last 1000 lines, so a command running for hours doesn't fill up
the memory (`output` still gives you every line). Pass `keepLines` to `start` to change that.

`process.write('yes')` types a line into the command, for the rare tool that asks a question
while it runs.

## Running as the administrator

Some commands only work as the system administrator. Pass `elevated: true` and the command runs
with `sudo` (or `su` on an Android tablet):

```dart
await SmartifyOsShell.run(
  'systemctl',
  arguments: ['restart', 'my-service'],
  elevated: true,
);
```

This never asks for a password, a car has nobody sitting there to type one. If one would be
needed, the command just fails instead of waiting forever. A car the installer set up never needs
one. On a computer with no way to do this at all (macOS, Windows) it fails the same way.

## Checking a command is there

```dart
if (await SmartifyOsShell.has('journalctl')) {
  // use it
} else {
  // fall back to something else
}
```

Worth checking once before you rely on a program that isn't on every machine, so you can fall
back instead of every call failing. The answer is remembered, so asking again costs nothing.

## Getting a program onto the car

A program your app runs has to be installed on the car. Never install it by hand: list it in your
car's app's `pubspec.yaml`, and the CLI installs it on the car for you whenever it sets up or
updates one:

```yaml title="pubspec.yaml"
smartify_os:
  linux:
    run:
      apt:
        - iw
```

The names are the package names `apt install` takes on the car's Linux (Debian 13), without
versions. See [Making an Extension](../extensions/making-an-extension.md) for everything else this
section can hold, it works the same in a car's app as in an extension.
