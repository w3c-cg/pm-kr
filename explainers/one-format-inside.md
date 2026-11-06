# One format inside, every output a filter

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** one format inside and conversions only at the edges is the charter's idea applied to pictures, the content stored once and every output derived from it, so programs and AI systems consume the same source instead of each keeping its own.

## The question

Every earlier attempt at stereo on a desktop put the format question on each program.
Quad-buffer OpenGL needed a workstation card, NVIDIA's 3D Vision needed one vendor's driver, and every video player grew its own menu of packings and outputs.
Each program had to know the screen, and almost none did.
With several formats the work is every input format times every output format times every program that wants stereo.
The formats and the screens are short lists; the programs are an open list, and that is the term that never ends.

## The idea

One format inside, and every output a filter.
Sparky Stereo OS, a Linux desktop built this way, states it in three lines ([how it works](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/how-it-works.md)):

- the compositor speaks full side by side, at any resolution;
- programs decode or generate stereo in any standard, and deliver full side by side, at any resolution, declared once;
- outputs, one per kind of screen, convert from that to whatever each screen needs.

**Full side by side** is the layout, not a size: the two views as separate complete pictures next to each other, left eye first, each at the resolution it already has.
A half top-and-bottom frame of 1920x1080 arrives as one 3840x540 buffer; a half side-by-side frame goes as it is; a game renders at whatever size per eye the person chose.
No program resizes an eye; the compositor resizes once, into the window or the screen.
Unpacking any packing is reading, copying and placing samples, with no resampling, so old half-format content plays as it is and resizing is never paid twice.

**A window's 2D part and its 3D area are separate surfaces.**
Menus, toolbars and the document around a picture are the window's own surface, at one eye's size, identical in both eyes, and declare nothing.
The 3D area (a stereo video, a 3D viewport, a canvas) is a surface of its own that hands over full side by side.
So a 2D window can hold a 3D video, and a 2D page can too.

**It is how sound already works.**
A program hands PipeWire its samples with their rate and channel layout; PipeWire mixes and sends them to HDMI®, Bluetooth or a USB DAC, and the program never learns which.
Nobody calls that a limitation; it is why every Linux program plays sound on every device.

## The names, and where they come from

- **Full side by side**: [HDMI®](https://www.hdmi.org/resource/brand) 1.4a's structure 3, "side-by-side (full)", as the Linux kernel names it in `include/linux/hdmi.h`, is the published twin on the cable ([glossary](../glossary/README.md#full-side-by-side-at-any-resolution)).
- **The declaration**: `kde_stereo_content_v1`, one value, `side_by_side_full`, through the shared helper [libstereo-declare](https://github.com/Sparky-OS/libstereo-declare); on X11 the property `_KDE_NET_WM_STEREO_CONTENT` ([glossary](../glossary/README.md#the-declaration)).
- **View size**: the size one view is shown at, named by view and never by eye, because a view can be a picture or a depth map.
- **The presentation contract**: the same rule for depth, colour, HDR and sound ([house formats](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/house-formats.md)).

## Where it exists today

- Shipped in the edition's compositor: one mirrored desktop has driven two 3D televisions from two GPUs in two 3D modes at once, frame packing from an AMD integrated GPU and top and bottom from an NVIDIA RTX 3060; every test also runs in software rendering.
- Programs taught the contract, each with its public branch: Krita, Kdenlive, Marble, Kalzium, Haruna, Dragon Player, Spectacle, Dolphin and more ([Programs made stereo-able](https://github.com/danielcamposramos/awesome-stereoscopy#programs-made-stereo-able-a-growing-list)).
- The design in one page: [STEREO3D.md](https://invent.kde.org/danielcamposramos/kwin/-/blob/stereo3d/STEREO3D.md).

## On the web

Step 3 of the [migration path](../talks/2026-10-13-w3c-me-ig/migration-path.md) is this idea for a page: the browser already gives video and canvas their own compositor surfaces; it adds the layout to that surface, and the operating system's compositor converts it for each screen.
One declaration per element, never per window.
The Open Metaverse Browser Initiative's deck lists "Shared Compositor / Sibling Surfaces" as one option for a spatial engine and a web engine; that option is what this desktop does ([spatial browsing input, point 5](../talks/2026-10-28-tpac-spatial-browser/README.md#5-sibling-surfaces-are-our-desktop)).

## Earlier work

VMD ran "stereo in a window" on SGI workstations in 1995; compositing desktops lost it, because a window's second buffer was dropped unless the compositor carried it.
KDE's request of 2014 and GNOME's quad-buffer patch of the same year never landed, each for want of a 3D screen to test on, and a 2017 Wayland series got no review ([The desktop in stereo](https://github.com/danielcamposramos/awesome-stereoscopy#the-desktop-in-stereo)).
A Wayland protocol for stereo surfaces is open for review again since September 2026 ([wayland-protocols !533](https://gitlab.freedesktop.org/wayland/wayland-protocols/-/merge_requests/533)).

## Questions for the group

1. Does your system have a place where one format is converted for every output, as sound has?
2. Which program of yours would be the next to hand over two views?

HDMI®, HDMI® High-Definition Multimedia Interface and the HDMI® Logo are trademarks or registered trademarks of HDMI Licensing Administrator, Inc.
