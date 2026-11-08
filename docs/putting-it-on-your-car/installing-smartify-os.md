---
sidebar_position: 2
---

# Installing SmartifyOS

Once the car's computer runs Linux (see [Installing Linux](./installing-linux.md)), SmartifyOS
goes onto it from a USB stick. You make the stick on your own computer, plug it into the car and
type two lines there. After that the car starts straight into SmartifyOS every time, full screen,
with no desktop and no mouse pointer.

## Making the installer stick

Plug a USB stick into your computer. In the editor pick **Export installer** in the Export menu.
With the CLI, run this in your car's app folder:

```bash
smartify-os export installer
```

It asks which USB stick to use and puts a `smartify-os` folder on it, without erasing anything
else on the stick. You can also give it any folder with `--to`, to copy onto a stick later.

It also asks **where SmartifyOS is built**:

| Built on          |                                                                         |
| ----------------- | ----------------------------------------------------------------------- |
| **The car**       | The stick gets your app's code, and the car installs Flutter and builds it itself. Works from any computer, but the first install takes a while on a Raspberry Pi |
| **This computer** | Your computer builds it, and the car only gets the finished app. Needs [Docker Desktop](https://docs.docker.com/get-docker/) running (or Podman), unless your computer runs Debian 13 itself |

Building on your computer asks what the car runs on: `arm64` for a Raspberry Pi, `x64` for a PC.
The first build sets up a Debian 13 container with everything building needs, which takes a while,
and every build after that is quick. Building for the other kind of computer than your own (an
`arm64` car from a normal PC, say) runs emulated and takes a good deal longer.

If Docker isn't running when it asks, start Docker Desktop and pick "this computer" again, it looks
once more.

```bash
smartify-os export installer --build-on computer --arch arm64
```

Some extensions download big files onto the car while it runs, like the voice assistant's speech
models. A car on the road often has no internet, so the export asks which of them to put on the
stick too, with the ones your car needs already ticked. They're downloaded once and kept on your
computer, so the next stick doesn't download them again.

## Installing on the car

1. Start the car's computer and log in as the user SmartifyOS should run as. It needs the internet
   while it installs.
2. Plug the stick in. The car only shows the text screen you logged in on, and nothing there opens
   the stick by itself, so type this to open it:

   ```bash
   sudo mount /dev/sda1 /mnt
   ```

   If the stick isn't `sda1`, `lsblk` lists the drives (the stick is often `sdb1` on a computer
   with a SATA drive). If you installed Debian with a root password, there's no `sudo`: type
   `su -c "mount /dev/sda1 /mnt"` instead, and the root password.

3. Then start the installer:

   ```bash
   bash /mnt/smartify-os/install.sh
   ```

It asks for your password once and restarts straight into SmartifyOS when it's done. Everything
SmartifyOS, your extensions and your own app need installed on Linux (drivers, programs, the
screen it runs in) is worked out and installed for you, nothing for you to `apt install`.

The car needs the internet while it installs, even when your computer built SmartifyOS, since it
downloads what SmartifyOS needs from Linux. A car that builds SmartifyOS itself also downloads
Flutter. Updates later only need the internet when there's something new to download for them.

`README.txt` on the stick says the same, for whoever finds it.

:::tip[Tip]

Your car's app runs as a background service, so its log is where to look when something doesn't
work on the car: `journalctl -u smartify-os` on the car's computer.

:::

Next time you change something, you don't need a new installer, see
[Updating Your Car](./updating.md).
