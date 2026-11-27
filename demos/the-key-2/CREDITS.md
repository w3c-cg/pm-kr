# Credits

The Key is an individual contribution by Daniel Campos Ramos, offered as input to the W3C Procedural Memory Knowledge Representation Community Group.
The hall, studio, accounts, keys and helper are fictional.

## The scene

- Daniel Campos Ramos arranged the hall, lobby and members’ lab and made their procedural materials, signs, keys, doors, portal frame and QR plate. The geometry, source models and reference drawing are under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- Kenney Vleugels made the [Modular Space Kit](https://kenney.nl/assets/modular-space-kit). It supplies `template-wall`, `template-wall-detail-a`, `template-floor-detail-a` and `template-detail` for the bulkheads, ribbed walls, deck panels and pillars. The author's [CC0 1.0 notice](vendor/kenney-LICENSE.txt) is included.
- Kay Lousberg made [KayKit Space Base Bits](https://kaylousberg.com/game-assets/space-base-bits). It supplies `cargo_A` and `lights`, plus `basemodule_D`, `basemodule_B` and `basemodule_E` for the reception, lobby exhibits and lab benches. The author's [CC0 1.0 notice](vendor/KAYKIT-LICENSE.txt) is included.
- Kay Lousberg made the Knight from [KayKit Character Pack: Adventurers](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/tree/672074b73ba276876a19e8816ecdc5241817ab47), posed as Mica. The author's [CC0 1.0 notice](vendor/adventurers-LICENSE.txt) is included.
- The kit meshes carry new surface coordinates and plain material names. The named procedures draw their textures in the viewer.
- Rob Tuytel made the CC0 1.0 reference textures [Floor Tiles 06](https://polyhaven.com/a/floor_tiles_06), [Metal Plate](https://polyhaven.com/a/metal_plate), [Rusty Metal 02](https://polyhaven.com/a/rusty_metal_02) and [Rock 05](https://polyhaven.com/a/rock_05). Daniel Campos Ramos fitted the published floor, wall and ceiling procedures to those references.

## The people

- Imani, Theo, Mei, Omar, Hugo, Léa and Mica use CC0 [MakeHuman and MPFB](https://www.makehumancommunity.org/about/license.html) geometry, skins, hair and clothing. The core assets credit Data Collection AB, Joel Palmius and Jonas Hauquier. Figure and clip details are in the [people credits](people/README.md). Mica’s original combination of features is used only by her, with the Metal Plate procedure.
- The motion comes from [100STYLE](https://zenodo.org/records/8127870) by Ian Mason, Sebastian Starke and Taku Komura, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The Key retargets the original BVH recordings to each rig, trims them into loops and converts them to ANIM files.
- Dave Raggett designed the [SPLT and ANIM formats](https://www.w3.org/2026/11/animation/). This demo implements a reader for those formats in [splat-format.js](splat-format.js).
- The projected-covariance splatting follows Bernhard Kerbl, Georgios Kopanas, Thomas Leimkühler and George Drettakis, [“3D Gaussian Splatting for Real-Time Radiance Field Rendering”](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/), ACM Transactions on Graphics 42(4), 2023, as Dave Raggett's player writes it for disk splats.

## The tablet

- The Memory Tablet is Daniel Campos Ramos's design in Knowledge3D: [Memory Tablet Specification](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/MEMORY_TABLET_SPECIFICATION.md) (3.1 a thing you hold, 8-inch, 12-inch or wall-sized; 4.4 running applications; 6.4 a browser's picture on a screen object with clicks forwarded) and [the Living Room](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/HOUSE_GALAXY_TABLET.md) (full screen as the monitor and keyboard paradigm).
- Full screen binds a view of the tablet with no navigation, as an X3D 4 `Viewpoint` may carry its own `NavigationInfo` (Web3D Consortium, X3D Architecture, `X3DViewpointNode`).
- The desktop-window route uses the noVNC core library by Joel Martin and the noVNC authors, under the [MPL 2.0](vendor/novnc/LICENSE.MPL-2.0) ([LICENSE.txt](vendor/novnc/LICENSE.txt)), version 1.6.0, with pako by Vitaly Puzrin (Expat) and its zlib port by imaya (Zlib), as the [Debian copyright file](vendor/novnc/COPYRIGHT-debian.txt) records. The rig serves the desktop with x11vnc (Karl Runge and contributors) and websockify (Joel Martin and contributors).
- The positioned overlay uses three.js's `CSS3DRenderer` (r182, MIT).

## The keys and the services

- OAuth 2.0 ([RFC 6749](https://www.rfc-editor.org/rfc/rfc6749), Dick Hardt, editor), PKCE ([RFC 7636](https://www.rfc-editor.org/rfc/rfc7636), Nat Sakimura, John Bradley and Naveen Agarwal), [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) (OpenID Foundation), [Web Authentication](https://www.w3.org/TR/webauthn-3/) (W3C Web Authentication Working Group) and TLS 1.3 ([RFC 8446](https://www.rfc-editor.org/rfc/rfc8446), Eric Rescorla) are the mechanisms behind the keys; the demo key server implements their test side.
- The services are composed through HTML's `postMessage`, `MessageChannel` and transferable objects, sandboxed frames and Fetch's CORS (WHATWG), and draw their pictures through WebGL with its origin restrictions (Khronos).

## The technique

- [Dynamic Procedural Texture Rendering](https://w3c-cg.github.io/pm-kr/demos/procedural-texture-rendering/) furnishes the original WebAssembly player and its fixed operators. See [the published demo's credits](https://w3c-cg.github.io/pm-kr/demos/procedural-texture-rendering/CREDITS.md), including the work of Farbrausch that inspired the approach.
- Ricardo Cabello and the [three.js contributors](https://github.com/mrdoob/three.js/graphs/contributors) provide the renderer, WebXR session integration and glTF loader. This folder uses [r182](https://github.com/mrdoob/three.js/releases/tag/r182) under the [MIT licence](vendor/THREE-LICENSE.txt).
- The model sources and export recipe use the Blender Foundation and contributors’ [Blender](https://www.blender.org/about/license/) and Blender’s glTF exporter. The SVG & 3D Design workflow from OpenAI guided the reference and model review.
- Kentaro Fukuchi’s [libqrencode](https://fukuchi.org/works/qrencode/) generates the QR matrix at authoring time. The browser represents it as geometry.

## The formats and interfaces

- The Khronos Group and contributors define [glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html).
- The W3C Immersive Web Working Group and contributors define the [WebXR Device API](https://www.w3.org/TR/webxr/).
- The texture descriptions use the [individual draft glTF extension](https://github.com/w3c-cg/pm-kr/tree/main/demos/procedural-texture-rendering/extension/KHR_texture_procedural_rendering) as a reference.

## Licence

The shipped model, procedure and library digests are in [ASSETS.sha256](ASSETS.sha256).

The walkthrough code is under [BSD 2-clause](LICENSE.txt).
The procedural player retains its [BSD 2-clause licence](../procedural-texture-rendering/LICENSE.txt).
