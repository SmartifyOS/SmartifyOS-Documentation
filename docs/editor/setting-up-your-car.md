---
sidebar_position: 2
---

# Setting Up Your Car

Everything about your car's app is in the car panel on the left of the editor. Pick a row and
its inspector on the right shows what you can change. Every change is written into your car's
code straight away, the same code the rest of these docs show, so nothing you click is lost or
hidden somewhere only the editor knows about.

## Setup

The **Setup** group holds a page for each part of how your car looks and works. Most changes
show up in the preview right away: how the screen is arranged, the theme, how the 3D model sits
and is lit, and the info display all change live, even while you drag a slider. Everything else
SmartifyOS only reads when it starts, so the editor restarts your app once the change is written
and puts the thing you were changing back on screen.

| Page                       |                                                                       |
| -------------------------- | --------------------------------------------------------------------- |
| **Screen**                 | The layout the car starts with, the theme, which side the driver sits on, what's in the bar along the edge, and the apps in the dock. See [Layouts](../layouts/picking-a-layout.md) |
| **The car on the screen**  | Your car as a 3D model, a 2D drawing or a picture, which one it starts as, and what moves on its own: the wheels that roll, the front wheels that steer, the steering wheel, cameras and lamps. The wheels are picked by name from the model's own parts. See [The Car](../car/showing-the-car.md) |
| **Info display**           | The big number in the bar (the speed, unless you change it), the other values it can show, and what a tap on it goes through. See [Info Display](../info-display/adding-values.md) |
| **About page**             | What the About page in Settings says: the car's name (also what phones see when they pair), what car it is, and rows of your own like the VIN |
| **Bluetooth**              | Pairing, reconnecting to known phones, and the sounds it makes. See [Bluetooth](../bluetooth/using-bluetooth.md) |
| **Reverse camera**         | Which camera, and the guide lines (your car's width, wheelbase, where the camera sits). See [Reverse Camera](../reverse-camera/using-the-reverse-camera.md) |
| **Notifications**          | How long they stay on screen, how many the shade keeps, and their sounds |
| **Date and time**          | The time zone, the clock, and whether the car sets its own time       |
| **GPS**                    | Whether the car uses one, and how it reads it. See [GPS](../gps/using-gps.md) |
| **CAN bus**                | How SmartifyOS talks to the boards around your car. See [CAN Bus](../can-bus/defining-devices.md) |
| **Built-in parts**         | Everything SmartifyOS puts in your app on its own (Settings in the app list, the music player card, the clock in the status bar, the Wi-Fi page...). Switch off what your car has no use for |
| **System**                 | USB drives, the volume, and what the power button does                |

A setting you never touched shows SmartifyOS's own default. Changing it back to the default takes
it out of your code again, rather than writing the default in.

If you wrote a setting yourself as code the editor can't read (a variable, say), it shows it but
leaves it alone, with a button that opens the line in VS Code.

## Windows, tiles and widgets

Your own windows, quick settings tiles and home screen widgets each have a group in the car panel,
with a **New** row at the bottom. It asks for:

- **A name**, which the driver reads. You can change it later.
- **What kind**. A window can be fullscreen or floating (smaller, over the home screen). A tile
  can be a switch (turns something on and off) or a button (does the same thing every time). A
  widget can be a card (shows up by itself, the driver can swipe it away) or always there (stays
  where the driver puts it).
- **An icon**, from Flutter's built-in icons. Search them with "More icons".

The editor makes a file for it, hands it to SmartifyOS in `lib/main.dart`, and opens it in
VS Code at the line where you write what it shows or does. Then it restarts your app, since new
code only runs after a restart.

Pick one later to see it in the preview (it opens the window, pulls down the quick settings, or
brings the card back), and to change its name, icon and order. For a window you can also switch
off **In the app list**, for a window your own code opens some other way.

The pages on [Windows](../windows/creating-windows.md), [Quick Settings](../quick-settings/adding-tiles.md)
and [Home Widgets](../home-widgets/adding-widgets.md) explain the code it writes.

:::tip[Tip]

The car panel also lists the ones you wrote yourself in some other way, several in one list of
your own say. Those are shown, but the editor leaves changing them to you, with a button to open
them in VS Code.

:::

## Settings pages

**Settings pages** works the same way. A new page asks for its name, which page of Settings it
goes in (Vehicle, Display, Sound, Settings itself, or one of your own) and an icon. Then add rows
to it in its inspector:

| Row                |                                                                      |
| ------------------ | -------------------------------------------------------------------- |
| **Switch**         | Turns something on and off                                           |
| **Choice**         | Picks one of a few options you list                                  |
| **Button**         | Runs code of yours when tapped                                       |
| **Information**    | Just shows a value                                                   |

A switch or a choice can **Remember it between drives**, so it's still set after the car was off.
The rest of your app reads what it's set to as a `SavedValue` (see
[Values That Change](../saved-values.md)), and the inspector shows its name with a copy button.
It can also **Run code of mine when it changes**, which puts a function in the page's file for you
to fill in. The two are independent, a row can do either or both.

Each change restarts your app and opens the page again, so the preview follows along as you build
it. See [Settings](../settings/adding-pages.md) for the code behind it.

## Extensions

The **SmartifyOS and extensions** group shows the version of SmartifyOS your car runs and every
extension in it. **Add an extension** offers the ones worth knowing about (Android Auto, the voice
assistant), or takes any extension's GitHub address.

Pick an extension to see:

- What it added to your running app (windows, tiles, settings pages...), each one put on screen
  with a click.
- Its settings, with an explanation for each. A setting that's a whole group of its own is folded
  away until you open it.
- Buttons to update it or remove it from your car.

See [Using Extensions](../extensions/using-extensions.md) for more.

## Putting it on the car

The **Export** menu in the title bar puts your car's app on a USB stick:

| Choice                     |                                                                  |
| -------------------------- | ---------------------------------------------------------------- |
| **Export installer**       | A stick that sets up a new car                                   |
| **Export update**          | For a car that runs SmartifyOS already                           |
| **Export for Android**     | Your car as an app, for a tablet that is its screen              |
| **Export firmware**        | New firmware for the boards around your car (only once it has any) |

The same menu has **Get the car's computer ready**, a step by step guide to putting Linux on it
first. See [Putting It On Your Car](../putting-it-on-your-car/installing-linux.md) for the whole
story.
