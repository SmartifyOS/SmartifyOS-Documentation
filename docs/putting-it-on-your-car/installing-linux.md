---
sidebar_position: 1
---

# Installing Linux

SmartifyOS runs on Linux, so the car's computer needs that first. You only do this once per car,
and all it takes is a free program that writes Linux onto a memory card or USB stick. Neither the
editor nor the CLI does this part for you, since writing a drive erases it, and picking the wrong
one would erase something you wanted to keep.

The editor has the same steps as a guide: **How to get the car's computer ready** on the start
screen, or **Get the car's computer ready** in the Export menu.

## Picking a computer

Two kinds of computer are supported:

| Computer                                     | Linux                                    |
| -------------------------------------------- | ---------------------------------------- |
| **Raspberry Pi 5** (4 or 8 GB), ideally with an NVMe drive rather than an SD card | Raspberry Pi OS Lite, 64-bit |
| **A small PC**, like an Intel N100 or N150 mini PC | Debian 13                          |

An SD card is the weak spot in a car, since the power is cut every time the ignition goes off,
which is why an NVMe drive is the better choice on a Pi.

The Pi 5 is the one to pick if you want Android Auto: it decodes the video in software without
trouble, while older Pis struggle. A PC with Intel graphics decodes it in hardware.

There's no desktop on the car. SmartifyOS brings its own screen and starts straight into it, so
you install the smallest version of Linux there is.

## On a Raspberry Pi

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/), Raspberry Pi's own
   program for this. It downloads Linux by itself.
2. Plug the Pi's SD card into your computer (or its NVMe drive, in a USB case). In Raspberry Pi
   Imager pick your Raspberry Pi, then **Raspberry Pi OS (other)** and **Raspberry Pi OS Lite
   (64-bit)**, then the card. Everything on the card is erased.
3. Fill in the settings it offers. Pick a username and password, SmartifyOS will run as that user.
   Add your Wi-Fi too, unless the Pi has a network cable, since installing SmartifyOS needs the
   internet.
4. Put the card back into the Pi, connect a screen and a keyboard, switch it on and log in with
   that username and password.

## On a PC

1. Download Debian 13 from [Debian's download page](https://www.debian.org/download). Take
   the **64-bit PC netinst** file, which ends in `.iso`.
2. Download a program that writes it onto a USB stick:
   [Rufus](https://rufus.ie/) on Windows, [balenaEtcher](https://etcher.balena.io/) on a Mac or
   Linux.
3. Write the Debian installer onto a USB stick. Use another stick than the one SmartifyOS's
   installer goes on, since everything on it is erased.
   - **Rufus**: pick the stick under **Device**, press **SELECT** and pick the `.iso`, then
     **START**. When it asks how to write it, pick **DD Image mode**.
   - **balenaEtcher**: pick **Flash from file** and the `.iso`, then **Select target** and the
     stick, then **Flash**. If your Mac says afterwards that it can't read the stick, press Eject,
     that's expected.
4. Plug the stick into the car's computer and start it from the stick: right after switching it on,
   press the key that picks what it starts from (often F12, F11, F7 or Esc, it differs per
   computer). Pick **Graphical install** and follow the installer. Installing erases the drive of
   the car's computer.
   - Connect it to the internet when it asks (a network cable is easiest), since installing
     SmartifyOS needs it.
   - When it asks for a root password, **leave it empty** and press Continue. That lets the user
     you make next set everything up, and SmartifyOS runs as that user.
5. When it asks what software to install, untick **Debian desktop environment** and **GNOME**, and
   leave only **standard system utilities** ticked.
6. Once it restarts, take the stick out and log in.

Either way, you're now looking at a plain text screen asking for nothing. That's right, the next
step is [Installing SmartifyOS](./installing-smartify-os.md).
