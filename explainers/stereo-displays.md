# Every stereo display shows the same two views

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** a display family's format is knowledge about the output, not about the picture, so a representation that keeps the two views once lets every display, and any program or model, derive its own format from them.

## The question

A 3D television, a projector, a VR headset, a glasses-free screen and a pair of red and cyan glasses look like five different technologies.
They are five ways of doing one thing: getting the left view to the left eye and the right view to the right eye.
Once that is clear, the formats stop looking arbitrary, and a program never needs to know which screen it is on.

## The families

Each family separates the eyes in its own way, and that is why each wants the two views arranged in its own way ([Displays decide the format](https://github.com/danielcamposramos/awesome-stereoscopy#displays-decide-the-format) in awesome-stereoscopy).

| Family | How it separates the eyes | What it wants from the two views |
|---|---|---|
| 3D TVs and projectors with active glasses | alternates whole frames, the glasses switch in time | a frame per eye; over [HDMI®](https://www.hdmi.org/resource/brand) 1.4a that is frame packing, side by side half or top and bottom |
| Passive polarised TVs and cinema screens | polarises alternate rows, or alternate frames through a silver screen | row-interleaved at the panel; frame-sequential at the projector |
| VR headsets and phone viewers | one panel, or half a panel, per eye behind a lens | one picture per eye, with the lens's distortion undone |
| Glasses-free displays | a barrier or lenses send alternate columns to each eye, some tracking the viewer's eyes | column-interleaved, woven by the display's own software |
| Any monitor with red and cyan glasses | colour: the left view through the red filter, the right through the cyan | the two views mixed into one picture by colour |
| A plain 2D monitor | nothing: one eye | one view, the left by convention, unchanged |

The last row matters as much as the others: a stereo picture must stay a good flat picture, because a 2D screen shows one view, and some people see no depth from two views at all ([Who can see it, and who cannot](https://github.com/danielcamposramos/awesome-stereoscopy#who-can-see-it-and-who-cannot)).

## The idea

Because every family takes the same two views, the conversion belongs at the screen, not in the program.
On Sparky Stereo OS, a Linux desktop built on this idea, every program hands the desktop the two views side by side, declared once, and each screen's output turns that into its own format: the HDMI® 3D modes of a 3D TV or projector, a headset, a glasses-free display's weaver, red and cyan on any monitor, and the left view alone on a 2D monitor ([how it works](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/how-it-works.md)).
A new kind of display is one new output filter; every stereo program already written works on it the day the filter lands.
The companion explainer [One format inside, every output a filter](one-format-inside.md) says why.

The scope of the design is every stereo display, and the public texts name the families: 3D TVs and projectors, VR headsets, glasses-free 3D displays, any monitor with red and cyan glasses, and plain 2D monitors without any change.
Naming only the oldest two would shrink the work to 2010.

## Where it exists today

- HDMI® 3D on 3D TVs and projectors, anaglyph on any monitor, row, column and checkerboard interleaving, frame-sequential, and two outputs as one pair: shipped in the edition's compositor; a phone in a cardboard viewer as a headset through [Flat Headset](https://github.com/Sparky-OS/flat-headset); PC headsets through SteamVR where they work on Linux ([the glossary's display families](../glossary/README.md#outputs-every-display-family)).
- Glasses-free displays: planned with [DisplayXR](https://github.com/DisplayXR/displayxr-runtime), an open runtime where the compositor reports a window's geometry and the vendor's weaver computes the lens phase.
- The HDMI® 1.4a structures, byte by byte, as Linux packs them: [Frame packing and HDMI® timings](https://github.com/danielcamposramos/awesome-stereoscopy/blob/main/docs/frame-packing-and-hdmi-timings.md).

## Earlier work

The 2012 Stereoscopic 3D Web Task Force asked for "graceful degradation to 2D" as one of its two requirements ([its wiki](https://www.w3.org/2011/webtv/wiki/3dweb)).
The one-view row of the table above is that requirement, built in.

## Questions for the group

1. Which display family do you own, and which format does it take?
2. Is there a family missing from the table?

HDMI®, HDMI® High-Definition Multimedia Interface and the HDMI® Logo are trademarks or registered trademarks of HDMI Licensing Administrator, Inc.
