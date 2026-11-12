# Credits

Procedural Texture Rendering is an individual contribution by Daniel Campos Ramos, offered as input to the W3C Procedural Memory Knowledge Representation Community Group.
It is not a report or a decision of the group.

## The scene

The pictures are CC0 1.0 from [Poly Haven](https://polyhaven.com/license), each by its author as Poly Haven records it:

- brick wall: `red_brick_03` by Rob Tuytel;
- floor tiles: `floor_tiles_06` by Rob Tuytel;
- metal plate: `metal_plate` by Rob Tuytel;
- terracotta tiles: `patterned_terracotta_tiling` by Amal Kumar;
- rock: `rock_05` by Rob Tuytel;
- bark: `bark_brown_02` by Rob Tuytel;
- rusted metal: `rusty_metal_02` by Rob Tuytel.

Each is Poly Haven's 2K diffuse picture, here at 2048 pixels as JPEG quality 85.
The procedures were found from those pictures' pixels by a fitting program, never typed by hand.
The geometry, the script and the sound (made from noise) are ours, CC0 1.0.

## The technique

- [Farbrausch](https://github.com/farbrausch/fr_public), for werkkzeug3 and .kkrieger (2004): textures built from small operators. The operators here are new, in werkkzeug3's way.
- Macromedia Flash's Simulate Download and Bandwidth Profiler, and Dreamweaver's download time (now Adobe's), as the panel's model.
- James Kurose and Keith Ross, for the token bucket as their book "Computer Networking: A Top-Down Approach" teaches it; the simulated link is one.
- Eric Heitz and Fabrice Neyret, for the variance-preserving blend (2018) used when a picture's detail replaces a procedure's.

## The formats and interfaces

- glTF 2.0, KHR_texture_basisu, KHR_lights_punctual and the KHR_texture_procedurals draft (The Khronos Group and each extension's contributors, named in its own document); the KHR_audio_emitter draft (the Open Metaverse Interoperability Group's contributors).
- The WebXR Device API, WebGPU and WebAssembly (W3C); the Fetch and Streams standards (WHATWG).
- WCAG 2.2 (W3C), which the page's accessibility checks follow.

## Licence

The page's code and the WebAssembly player are under the BSD 2-clause licence: see [LICENSE.txt](LICENSE.txt).
The text of the extension proposal is under CC-BY-4.0.
