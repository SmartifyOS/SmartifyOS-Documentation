---
sidebar_position: 1
---

# Running Commands

A lot of what a car needs to do, setting the clock, reading a sensor, restarting a service, is a
one line command on Linux. `SmartifyOsShell` is the safe way to run one. **None of its methods
throw.** A command that doesn't exist, isn't allowed, or takes too long comes back as a result you
check, never a crash.

## Running a command and waiting for it

```dart
final result = await SmartifyOsShell.run('uname', arguments: ['-r']);
if (result.ok) {
  print('Running kernel ${result.output}');
} else {
  print('Could not check: ${result.error}');
}
```

Always check `result.ok` first. `result.output` is what the command printed, with the trailing
newline trimmed, and `result.error` is something ready to show or log when it didn't work
(whatever the command printed on its error output, or why it couldn't be run at all).

Pass the program as the first argument and everything after it as separate `arguments`, never as
one string:

```dart
// Right:
await SmartifyOsShell.run('timedatectl', arguments: ['set-ntp', 'true']);
// Wrong, this looks for a program literally called "timedatectl set-ntp true":
await SmartifyOsShell.run('timedatectl set-ntp true');
```

This also means a file name with a space in it just works, nothing needs quoting yourself.

| Parameters              |                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| **command**                | The program to run, e.g. `'uname'`                                                          |
| **arguments**               | Optional, everything after the program name, one item per argument                          |
| **timeout**                 | Optional, defaults to 10 seconds. The command is stopped and `result.timedOut` is `true` past this. Pass `Duration.zero` to wait forever, only when you're sure the command ends on its own |
| **workingDirectory**        | Optional, the directory the command runs in                                                 |
| **environment**             | Optional, extra environment variables for the command                                      |
| **elevated**                | Optional, defaults to `false`. Run the command as the system administrator, see below       |

## Following a long running command

For something that keeps going, `journalctl -f`, `ping`, start it instead and read its output as
it arrives:

```dart
final process = await SmartifyOsShell.start('ping', arguments: ['1.1.1.1']);
if (process == null) return; // could not be started at all

final sub = process.output.listen((line) {
  print(line.isError ? 'Error: ${line.text}' : line.text);
});

// ...later
await process.kill();
await sub.cancel();
```

`start` takes the same `arguments`/`workingDirectory`/`environment`/`elevated` parameters as
`run`, but there's no `timeout`, the command keeps running until you call `kill` yourself.
Nothing stops it on its own, always `kill` a process you're done with, `journalctl -f` in
particular never ends by itself.

`process.write('some line')` types a line into the command's input, for the rare tool that asks a
question while it runs.

## Running as the administrator

Some commands only work as the system administrator. Pass `elevated: true` and the command runs
with `sudo` (or `su` on Android):

```dart
await SmartifyOsShell.run('systemctl', arguments: ['restart', 'my-service'], elevated: true);
```

This never asks for a password, a car has nobody sitting there to type one. If a password would
be needed, the command simply fails instead of hanging. On a platform with no way to elevate at
all (macOS, Windows), it fails the same way.

## Checking a command exists first

```dart
if (await SmartifyOsShell.has('journalctl')) {
  // use it
} else {
  // fall back to something else
}
```

Worth checking once before relying on a tool that isn't on every machine, so you can fall back
instead of every call failing. The answer is remembered, asking again is free.
