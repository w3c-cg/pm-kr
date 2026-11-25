# Credits

The Key is an individual contribution by Daniel Campos Ramos, offered as input to the W3C Procedural Memory Knowledge Representation Community Group.
The hall, studio, accounts, keys and helper are fictional.

## The scene

- Daniel Campos Ramos made the hall, lobby, procedural materials, signs, helper, keys, door, portal frame and QR plate. The geometry, source models and reference drawing are under [CC0 1.0](source/CC0-1.0.txt).
- Kay Lousberg made the cargo prop for [KayKit Space Base Bits](https://kaylousberg.com/game-assets/space-base-bits). The source is CC0 1.0 and the author’s [licence notice](vendor/KAYKIT-LICENSE.txt) is included. The hall uses the mesh with new surface coordinates and a procedural material.
- Rob Tuytel made the Poly Haven [Floor Tiles 06](https://polyhaven.com/a/floor_tiles_06) reference, under [CC0 1.0](https://polyhaven.com/license). The floor uses the existing fitted procedure by Daniel Campos Ramos.

## The technique

- [Dynamic Procedural Texture Rendering](../procedural-texture-rendering/) furnishes the original WebAssembly player and its fixed operators. See [the published demo's credits](../procedural-texture-rendering/CREDITS.md), including the work of Farbrausch that inspired the approach.
- Ricardo Cabello and the [three.js contributors](https://github.com/mrdoob/three.js/graphs/contributors) provide the renderer, WebXR session integration and glTF loader. This folder uses [r182](https://github.com/mrdoob/three.js/releases/tag/r182) under the [MIT licence](vendor/THREE-LICENSE.txt).
- The model sources and export recipe use the Blender Foundation and contributors’ [Blender](https://www.blender.org/about/license/) and Blender’s glTF exporter. The SVG & 3D Design workflow from OpenAI guided the reference and model review.
- Kentaro Fukuchi’s [libqrencode](https://fukuchi.org/works/qrencode/) generates the QR matrix at authoring time. The browser represents it as geometry.

## The formats and interfaces

- The Khronos Group and contributors define [glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html).
- The W3C Immersive Web Working Group and contributors define the [WebXR Device API](https://www.w3.org/TR/webxr/).
- The texture descriptions use the [individual draft glTF extension](../procedural-texture-rendering/extension/KHR_texture_procedural_rendering/README.md) as a reference.

## Licence

The walkthrough code is under [BSD 2-clause](LICENSE.txt).
The procedural player retains its [BSD 2-clause licence](../procedural-texture-rendering/LICENSE.txt).
