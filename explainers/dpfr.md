# Procedures first, the image last: Dynamic Procedural Foveated Rendering

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** a surface stored as a small procedure with one image as its last layer is the charter's font-program idea applied to textures: the knowledge of a surface stored once and evaluated by each device at the detail it needs.

## The question

On a 56k modem every image counted, so web pages were built from stretched one-pixel images, with real images only where a shape could not be drawn; W3C's SVG came in 2001 for the same reason.
Spatial worlds are at that point again: assets carry lower-resolution copies and per-device versions of every texture, standalone headsets have tight memory budgets, and a world has to arrive before anyone can enter it.

## The idea

**Dynamic Procedural Foveated Rendering (DPFR)**: procedures first, with a high-resolution texture as the last layer loading while the procedural layers already render ([the proposal page](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/dynamic-procedural-foveated-rendering.md)).

- A procedural texture has no fixed resolution, so each device computes the detail its own eyes need: the fovea gets every octave the sampling rate can resolve and the periphery fewer, with smooth changes as the gaze moves.
- The procedural layers are evaluated every frame at the detail each part of each eye needs, adapting to gaze, device and GPU load.
- The image blends in when it arrives, replacing the procedural approximation without a jump; its tiles can load where the person looks first, a design to explore rather than a measured result.
- Theoretically, one high-resolution texture per surface plus a small procedure covering every coarser level replaces the lower-resolution copies and per-device versions assets carry today; the savings still need measuring.
- Each eye has a rendering resolution and an output resolution, and the compositor scales once at the output.

The size is saved in the textures; the geometry stays modern.
The name combines established techniques, procedural textures with frequency limits, foveated rendering and texture streaming, and claims to invent none of them.
It is part of the answer to foveation, world size and streaming, not all of it: textures come first and procedural geometry can follow, while eye tracking and lighting remain separate problems ([glossary](../glossary/README.md#dynamic-procedural-foveated-rendering-dpfr)).

## Where it exists today

- The demoscene proved the size long ago: .kkrieger, a whole first-person shooter with its textures, models and music, fits in 96 kilobytes (Breakpoint 2004), and Farbrausch opened its tools in 2012 ([fr_public](https://github.com/farbrausch/fr_public)).
- glTF has a draft for procedural textures, [KHR_texture_procedurals](https://github.com/KhronosGroup/glTF/pull/2381), and the proposal that its single image be declarable as the refining last layer is on its tracker ([glTF #2696](https://github.com/KhronosGroup/glTF/issues/2696)).
- Raised at two TPAC 2026 breakouts ([spatial browsing, point 6](../talks/2026-10-28-tpac-spatial-browser/README.md#6-procedures-first-the-image-last); [Web of Worlds, point 6](../talks/2026-10-30-tpac-web-of-worlds/README.md#6-procedures-first-the-image-last)) and introduced to the X3D community, where one engine author identified his shader texture extension as a possible layered node.
- Not an implemented or measured DPFR path; the reference platform it would run on is the stereo desktop, with its per-eye rendering and output resolutions.

## Questions for the group

1. Which of your assets ship several resolutions of the same texture?
2. On a standalone headset, where would the compute for a procedure cost more than the memory it saves?
