<!-- Input to the PM-KR Community Group from an individual participant. Not a work item or output of the group. -->
> **Status:** input from an individual participant, Daniel Campos Ramos, to the TPAC 2026 breakout [#35, "Unleashing a Spatial Web: Mapping W3C Standards to Support a Web of Worlds"](https://github.com/w3c/tpac2026-breakouts/issues/35), 30 October 2026. It is also offered as input to the PM-KR Community Group; it is not a work item or output of either. Licence: CC BY 4.0.

# A Web of Worlds: six points for the knowledge layer

I co-chair the PM-KR Community Group with Milton Ponson, and I designed Knowledge3D as a space where people and AI share knowledge.
I also build Sparky Stereo OS, the desktop foundation for presenting it on current 2D and 3D devices.
These are the points I would raise in the session, with their sources, in case the time runs out.
I welcome Muadh Al Kalbani and the Metaverse Standards Forum and Web3D participants' work on linked worlds.
[Web of Worlds' linking work](https://github.com/WebOfWorlds/WoWAPI/blob/ea3d0e7aa8774b6c24728163d1cf2d6e91903f88/README.md) was public before Knowledge3D, and I would like to build on that common ground.

## 1. Semantic role is where the knowledge layer starts

The [session invitation](https://lists.w3.org/Archives/Public/public-immersive-web/2026Oct/0010.html) asks about a minimal node structure with identity, transform, hierarchy and semantic role.
In [Knowledge3D's node design](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/K3D_NODE_SPECIFICATION.md), each node carries meaning, procedures and provenance, so people and AI use the same underlying knowledge.
The specifications describe my design; the current code does not yet implement them.
The [PM-KR Community Group](https://www.w3.org/community/pm-kr/) studies that question alongside RDF, OWL and JSON-LD.
I would be glad to compare the designs and explore a mapping to your node model.

## 2. Addresses inside a world

I needed addresses for places inside Knowledge3D spaces too.
The [September 2025 doors design](https://github.com/danielcamposramos/Knowledge3D/blob/de9a880b4e840167e42618a69ef560140f9afe70/docs/DOORS_AND_NETWORK.md) gives a door an address with a spatial destination, and the [glTF data description](https://github.com/danielcamposramos/Knowledge3D/blob/main/spec/glTF_K3D_extension.md) associates knowledge-node identifiers with glTF nodes.
I would be happy to compare those choices with the proposed 3D fragment identifiers.
A link should be able to take a person to the object or viewpoint they meant to reach.

## 3. Worlds on the screens people own

I want worlds to reach current 2D and 3D devices as well as headsets.
WebXR's [inline-stereo mode](https://github.com/immersive-web/webxr/pull/1436), merged in June 2026, lets a page draw both eyes.
Our [Waterfox branch's proof](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/waterfox-stereo-m3.md) records presentation on current 2D and 3D devices without requiring a headset.
Should the user agent's duties include presenting a world on those screens too?

## 4. The same knowledge for people and AI

Your [whitepaper](https://webofworlds.github.io/initial_MSF_Whitepaper/gen/MSF-3DWebInterop_WoWWhitepaper.pdf) describes a user and an AI agent operating in a shared virtual world.
That is a question I have worked on in Knowledge3D since 2025, including the [House, Galaxy and Tablet design](https://github.com/danielcamposramos/Knowledge3D/blob/1c524f8f1c364ee9345eabc1c0570372af90b54e/docs/HOUSE_GALAXY_TABLET.md), and that PM-KR has explored since February 2026.
Do the two clients consume the same underlying node data?
My [Dual-Client Contract](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/DUAL_CLIENT_CONTRACT_SPECIFICATION.md) calls for one source presented in two modalities.
I would welcome testing that idea together in PM-KR.

## 5. Common ground with Web3D

My [avatar specification](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/AVATAR_EMBODIMENT_SPECIFICATION.md) uses HAnim and X3D 4.0.
Our [early X3D drafts](https://github.com/danielcamposramos/Knowledge3D/tree/main/docs/W3C/x3d) extended Don Brutzman's X3D Ontology with procedural knowledge.
They are labelled as an early non-fruitful attempt and individual input.
I would value Web3D's review of that direction.

## 6. Assets as procedures

On my 56k modem every image counted, so I built shapes from stretched one-pixel images, with real images only for the rounded borders.
I see a similar opportunity for worlds to ship textures as procedures, letting current 2D and 3D devices and headsets compute the detail they need.
I call this [Dynamic Procedural Foveated Rendering (DPFR)](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/dynamic-procedural-foveated-rendering.md): surface detail stored as procedures and evaluated every frame at the detail each part of each eye needs, adapting to gaze, device and GPU load.
The demoscene showed the scale: .kkrieger fitted a whole game in 96 kilobytes, and [Farbrausch's tools](https://github.com/farbrausch/fr_public) have been open source since 2012.
Could the glTF draft for [KHR_texture_procedurals](https://github.com/KhronosGroup/glTF/pull/2381) be part of your asset pillar?
I see this as part of the answer to size, streaming and foveation; textures come first and procedural geometry can follow, while eye tracking and lighting remain separate problems.
The name combines established techniques; it does not claim to invent procedural textures or foveated rendering.

---

Daniel Campos Ramos · [PM-KR Community Group](https://www.w3.org/community/pm-kr/) · [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) · [Sparky Stereo OS](https://github.com/Sparky-OS/sparky-stereo-os)

AI partners were leveraged in the production of this work.
