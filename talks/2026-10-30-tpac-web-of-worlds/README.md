<!-- Input to the PM-KR Community Group from an individual participant. Not a work item or output of the group. -->
> **Status:** input from an individual participant, Daniel Campos Ramos, to the TPAC 2026 breakout [#35, "Unleashing a Spatial Web: Mapping W3C Standards to Support a Web of Worlds"](https://github.com/w3c/tpac2026-breakouts/issues/35), 30 October 2026. It is also offered as input to the PM-KR Community Group; it is not a work item or output of either. Licence: CC BY 4.0.

<a id="a-web-of-worlds-six-points-for-the-knowledge-layer"></a>
<a id="a-web-of-worlds-seven-points-for-the-knowledge-layer"></a>

# A Web of Worlds: eight points for the knowledge layer

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

## 6. Procedures first, the image last

On my 56k modem every image counted, so I built shapes from stretched one-pixel images, with real images only for the rounded borders.
I see a similar opportunity for worlds to ship their procedural layers first, letting current 2D and 3D devices and headsets compute the detail they need while the image loads.
I call this [Dynamic Procedural Foveated Rendering (DPFR)](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/dynamic-procedural-foveated-rendering.md): procedures first, with a high-resolution texture as the last layer loading while the procedural layers already render.
The procedural layers are evaluated every frame at the detail each part of each eye needs, adapting to gaze, device and GPU load.
The image blends in when it arrives, replacing the procedural approximation without a jump.
Its tiles can load where the person looks first, a design to explore rather than a measured result.
Theoretically, one high-resolution texture per surface plus a small procedure covering every coarser level replaces the lower-resolution copies and per-device versions assets carry today; the savings still need measuring.
The demoscene showed the scale: .kkrieger fitted a whole game in 96 kilobytes, and [Farbrausch's tools](https://github.com/farbrausch/fr_public) have been open source since 2012.
Could the glTF draft for [KHR_texture_procedurals](https://github.com/KhronosGroup/glTF/pull/2381) be part of your asset pillar?
I see this as part of the answer to size, streaming and foveation; textures come first and procedural geometry can follow, while eye tracking and lighting remain separate problems.
The name combines established techniques: procedural textures with frequency limits, foveated rendering and texture streaming.
It claims to invent none of them and remains a proposal, not an implemented or measured DPFR path.

## 7. Finding, moving and receiving a world

I call this proposal [Spatial Roaming Network (SRN)](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/spatial-roaming-network.md), named on 28 October 2026: a cellular model for finding places, moving between them and receiving their content near the visitor.
Real cells describe physical places; virtual cells describe logical places inside worlds, including a game hub or square with no location on Earth.
Inside a virtual world, "irradiators" would act like phone towers, announcing the services, content, people and doors within their range.
Handover would aim to keep services available as a visitor moves from cell to cell, and roaming would let them enter networks run by independent publishers.
A person in Brazil visiting another spatial network could receive its content from a nearby server, as content delivery networks (CDNs) do.
Theoretically, that could reduce loading delay; it still needs measuring.
The linked proposal credits spatial discovery, federated maps, proximity sensors, game interest management, Bluetooth beacons, cellular mobility, CDNs and Hypergrid's travel between virtual grids.
It proposes combining those techniques in one protocol for real and virtual cells, with handover, roaming and edge delivery; it is not an implemented or measured SRN path.
Could this give your linking and discovery work a common way to describe entering and leaving independently published worlds on current 2D and 3D devices as well as headsets?

## 8. Where the work belongs: a Web of Worlds Task Force

The session asks where the work belongs, and my answer is: everywhere a world runs, inside the browser and outside it.
So I propose a joint Web of Worlds Task Force, hosted by the Community Groups that hold the pieces, with liaisons to the Working Groups and to the bodies outside W3C.
It would map each gap to the group where it belongs, build a working prototype and a test for it, and hand it over when that group takes it.

The form already exists at W3C.
The [Process Document](https://www.w3.org/policies/process/) (section 3.4.1) lets a Chair "form task forces (composed of group participants) to carry out assignments for the group", within the group's charter.
[COGA](https://www.w3.org/WAI/about/groups/task-forces/coga) is one task force serving two Working Groups.
The Credentials Community Group's [VC-EDU Task Force](https://lists.w3.org/Archives/Public/public-vc-edu/2021Sep/0000.html) ran plugfests with implementers.
Spatial data has been joint work of W3C and OGC since the [2015 charter](https://www.w3.org/2015/spatial/charter), today in the [Spatio-temporal Data on the Web Working Group](https://www.w3.org/groups/wg/sdw).
And this session is itself organised jointly by W3C and the Metaverse Standards Forum.

| Area | Where I would start it | W3C groups with it | Bodies outside W3C |
|---|---|---|---|
| Linking, addressing and locating | Immersive Web CG | Immersive Web WG; Spatio-temporal Data on the Web WG; Maps for HTML CG | OGC (GeoPose); IETF and IANA |
| Composition and semantics | PM-KR CG (the knowledge layer) | JSON-LD WG; RDF & SPARQL WG; Immersive Web CG (`<model>` nodes) | Web3D Consortium (X3D, HAnim) and ISO/IEC JTC 1/SC 24; IEEE's Spatial Web work (P2874) |
| Presenting worlds on the screens people own | Immersive Web WG (inline-stereo) | CSS WG; Media WG; Accessible Platform Architectures WG | HDMI Forum; VESA (DisplayPort); CTA (CTA-861); Wi-Fi Alliance (Miracast); Khronos (OpenXR) |
| Portable identity, user data and preferences | Credentials CG | Verifiable Credentials WG; Decentralized Identifier WG; Federated Identity WG; Privacy WG | Metaverse Standards Forum (User Manifest) |
| Assets, size and procedural layers | GPU for the Web WG | Immersive Web WG | Khronos 3D Formats WG (glTF); Web3D Consortium |
| Finding and moving between worlds | Web of Things WG (WoT Discovery) | Spatio-temporal Data on the Web WG; WebTransport WG | IETF; 3GPP; Bluetooth SIG; OGC |
| Sound in shared spaces | Web Real-Time Communications WG | Media WG; Audio WG | Bluetooth SIG (Auracast) |
| Media that carries stereo and depth | Media WG | Media and Entertainment IG; Timed Text WG | IETF CELLAR and IANA; ISO/IEC JTC 1/SC 29 (MPEG); ITU-T SG16; AOMedia |
| Testing against use cases | the task force itself | Browser Testing and Tools WG | Web Platform Tests |

Some of those specifications are not public, the HDMI one among them.
Experts whose companies are members can carry a question there where an individual cannot.

Each of us can act before any group exists.
Aaron Swartz was a member of the [RDF Core Working Group](https://www.w3.org/2001/sw/RDFCore/members) and wrote [RFC 3870](https://www.rfc-editor.org/rfc/rfc3870) in 2004, the IANA registration of `application/rdf+xml`; from then on the web could name RDF.
In October 2026, IANA registered [Matroska's depth planes and StereoMode 15 to 20](https://www.iana.org/assignments/matroska) at my request.
StereoMode 17 and 19 are the picture-plus-depth layouts HDMI 1.4a defined in 2010: a cable could carry them, and now a file can name them.

The values to keep are already written in the [Ethical Web Principles](https://www.w3.org/TR/ethical-web-principles/), a W3C Statement since December 2024.

## After the session

The [minutes](https://www.w3.org/2026/10/30-spatial-web-msf-minutes.html) record the Task Force proposal and the room's next step: a two-day workshop co-organised by W3C, the Metaverse Standards Forum and Khronos, starting with a program committee on its scope.
The map above is ready as input for that scope.
The session's follow-up to the Web of Worlds group of the Metaverse Standards Forum listed this input as an "in-depth analysis", beside the session's slides and minutes.
My report on the whole week: [TPAC 2026: seven breakouts, one thread](../2026-10-30-tpac-2026-report/README.md).

---

Daniel Campos Ramos · [PM-KR Community Group](https://www.w3.org/community/pm-kr/) · [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) · [Sparky Stereo OS](https://github.com/Sparky-OS/sparky-stereo-os)

AI partners were leveraged in the production of this work.
