# HDR and 3D: the same road

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** a picture's colour description and its stereo layout are two facts about one object that must travel with it to the place that knows the screen, so a representation stored once carries both, not one copy per output.

## The question

At the Media and Entertainment Interest Group call of 13 October 2026, Wolfgang Schildbach asked whether 3D and HDR are "the same thing or two separate things" ([minutes](https://www.w3.org/2026/10/13-me-minutes.html)).
They are two properties of a picture, independent of each other: a picture can be mono or stereo, SDR or HDR.
They share one problem: the description of the picture has to travel with it, element by element, to the place that knows the screen.
Today an HDR photo and the SDR text around it are often flattened into one picture before anyone knows which screen will show it.

## The idea

Describe each content layer once, preserve its information through the stack, and convert for the screen at the output.
For stereo the description is the layout; for HDR it is the colour description and, for a gain-map picture, the map that says how much brighter each pixel may go.
One declaration per element carries both, so a 3D HDR photo keeps a gain map for each eye, and each screen adapts the picture to its own range: an HDR screen keeps it, a deep-colour SDR screen gets it tone-mapped into its 10 or 12 bits, an 8-bit screen gets it dithered, and two mirrored screens can show it two ways at once.
Where the colour comes from follows the same order as the stereo mark: the stream, the container, the file, and nothing ([the migration path](../talks/2026-10-13-w3c-me-ig/migration-path.md), "HDR: the same problem, the same road").

On Linux the stereo layer is what makes this possible: Wayland's colour management gives one image description per surface, and the stereo work already gives every picture inside a flat window its own declared surface, so the same surface can carry the picture's colour description too ([Stereo and HDR in one declaration](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-hdr-content.md)).

## Status, plainly

The stereo half is built and measured on devices.
The HDR half is a design: not built, and not tried on an HDR screen.
PQ, HLG and gain-map images have different decoding and reconstruction needs; the working colour space, the precision and the metadata handling remain choices to validate with reference images on HDR, deep-colour SDR and 8-bit displays.
Deep colour alone is not HDR, and the stereo results are not evidence that the HDR path works ([how it works](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/how-it-works.md), the HDR section).

## What the web has today

The `dynamic-range` and `video-dynamic-range` media queries ask about the screen; Media Capabilities' `hdrMetadataType`, `colorGamut` and `transferFunction` ask about decoding; CSS `dynamic-range-limit` caps an element's headroom; some browsers show gain-map images.
What is missing is the same thing stereo is missing: a declaration that travels with the element to the compositor.

## Questions for the group

1. Who has an HDR screen and a deep-colour SDR screen side by side, to test a declared picture on both?
2. Which HDR image formats should the first test cover?
