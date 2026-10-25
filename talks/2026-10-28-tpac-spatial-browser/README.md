<!-- Input to the PM-KR Community Group from an individual participant. Not a work item or output of the group. -->
> **Status:** input from an individual participant, Daniel Campos Ramos, to the TPAC 2026 breakout [#40, "Evolving the web browser and websites for spatial computing, digital twins, physical AI and robotics"](https://github.com/w3c/tpac2026-breakouts/issues/40), 28 October 2026. It is also offered as input to the PM-KR Community Group; it is not a work item or output of either. Licence: CC BY 4.0.

# Spatial browsing: eight points for the discussion

I co-chair the PM-KR Community Group with Milton Ponson, and I build Sparky Stereo OS, a Linux desktop where every program can show 3D on 3D TVs, monitors and headsets.
These are the points I would raise in the session, with their sources, in case the time runs out.
I welcome the work of the Open Metaverse Browser Initiative, and I agree that W3C should lead it.

## 1. Places with no location: are we locking the web to local only?

The proposal discovers services "by location", and its manual says: "On the web, you type a URL or click a link. In the metaverse, you move."
Location is a great way to find a building's twin, but many places have no location.
A virtual square, a market that exists only online, a library of knowledge, or a place on the other side of the world: nobody can walk there.
I watched the web grow from directories to search engines, then ranking, and now AI answers, and each step kept the links and addresses of the one before.
The spatial web can take the same intermediate path: start from today's sites and links, and give each one a place.
The web already speaks in places: sites, addresses, home pages, portals, forums, marketplaces, chat rooms.
In Knowledge3D each of those is a house, and a link between them is a door ([House, Galaxy and Tablet](https://github.com/danielcamposramos/Knowledge3D/blob/1c524f8f1c364ee9345eabc1c0570372af90b54e/docs/HOUSE_GALAXY_TABLET.md), 19 November 2025).

Sources: [breakout #40](https://github.com/w3c/tpac2026-breakouts/issues/40); [Sneeze architecture](https://github.com/MetaversalCorp/SneezeDoc/blob/main/docs/architecture/sneeze-architecture.md), section 2.4.

## 2. Federated WebXR inside Sneeze

The architecture explains why the engine is native: per-origin isolation cannot hold "dozens of untrusted sources" in one shared scene graph, so it needs "per-branch ownership" (section 2.5).
It also calls WebXR "vital" and says the same content "should be accessible from both browsers" (section 2.6).
So Sneeze could act as the XR device for web pages.
Each WebXR page runs in its own engine process and origin, anchored in the scene, and hands back its layers, colour and depth.
Sneeze composites them like any other branch, so isolation holds, and every WebXR page on the web today becomes spatial content in a fabric.

Each open question already has an answer elsewhere:
- **Head pose for each page:** the way 2D browsers do it today. WebXR is gated by the Permissions Policy [`xr-spatial-tracking`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/xr-spatial-tracking), whose default allowlist is the page's own origin, so an embedded page needs an explicit grant, plus consent and user activation.
- **Input between pages:** massive multiplayer games route thousands of players' actions every tick: each client sends input for its own avatar, the authoritative server decides what it touches, and interest management sends each player only what concerns it ([Boulanger, Kienzle and Verbrugge, NetGames 2006](https://www.comp.nus.edu.sg/~cs4344/0607s1/netgames06/s01Conf96_a32.pdf)).
- **Depth between sources:** OpenXR's [`XR_KHR_composition_layer_depth`](https://github.com/KhronosGroup/OpenXR-Docs/blob/main/specification/sources/chapters/extensions/khr/khr_composition_layer_depth.adoc) already lets applications submit depth with colour; occlusion between sources is then the engine's step, in its own scene graph.
- **Frame timing:** games solved it with a fixed simulation step and interpolation ([Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/)), and XR runtimes give each application a predicted display time.

The precedent at Khronos: OpenXR's [overlay sessions, `XR_EXTX_overlay`](https://github.com/KhronosGroup/OpenXR-Docs/blob/main/specification/sources/chapters/extensions/extx/extx_overlay.adoc), where applications that "execute in a separate process, create a separate session, generate separate content" are composited together by the runtime.

## 3. Service discovery beyond location

**Subscription.** People already choose their services by subscribing: RSS, Atom ([RFC 4287](https://www.rfc-editor.org/rfc/rfc4287)) and W3C's own [WebSub](https://www.w3.org/TR/websub/), a Recommendation since 2018.
In a spatial interface those subscriptions can arrive at the user's own virtual device: a tablet in the hand that holds the old web inside the new one, and is its gateway at the same time (Knowledge3D's Memory Tablet, 2025).

**Squares are places too.** A town square, a lobby, a hub city: games have built places with no location for decades, and people find them without walking, through server lists, friends' presence, lobbies and hubs.
The spatial web should take those lessons rather than start from zero.

**Game interfaces already represent actionable knowledge.** The game interface taxonomy ([Fagerholt and Lorentzon, "Beyond the HUD", Chalmers with EA DICE, 2009](https://publications.lib.chalmers.se/records/fulltext/111921.pdf)) sorts elements as diegetic, non-diegetic, spatial and meta.
Its example, Dead Space (2008), presents its interface "in the game geometry in a diegetic manner": holograms show "the status of doors (locked/unlocked), what items that can be picked up and what they will do".
An object that shows what it is and what it does, where it is, is a knowledge representation of actions: actionable knowledge representation, which is what PM-KR studies.

## 4. The same content on the screens people own

Many people own 3D TVs and 3D monitors, not headsets.
The proposal's outputs end at "2D display" or "HMD / smart glasses".
On our desktop, a WebXR page already reaches a flat 3D screen with no headset, in an immersive session or in the new [`inline-stereo` mode](https://github.com/immersive-web/webxr/pull/1436) (WebXR, June 2026): [the browser proof](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/waterfox-stereo-m3.md).
Which format carries a fabric to a WebXR page today, so a phone, a 3D TV and a headset all see it?

## 5. Sibling surfaces are our desktop

The deck's "Shared Compositor / Sibling Surfaces" option is what our desktop does on Linux.
Each program hands the compositor both eyes, side by side, declared once, and the compositor turns that into each screen's format: HDMI 3D on a television, red and cyan glasses on any monitor, or a headset.
A web engine and a spatial engine can share that, with no headset needed ([Sparky Stereo OS](https://github.com/Sparky-OS/sparky-stereo-os)).

## 6. Procedures, not pixels

I coded web pages by hand on a 56k modem, when JavaScript 1.0 was new.
Every image counted, so I built shapes from squares of stretched one-pixel images, with real images only for the rounded borders, and W3C's [SVG](https://www.w3.org/TR/2001/REC-SVG-20010904/) came in 2001 for the same reason.
Spatial worlds are at that point again.
A procedural texture has no fixed resolution, so each device computes the detail its own eyes need: the fovea gets every octave and the periphery fewer, and nothing pops in when the gaze moves.
The demoscene proved the size long ago: .kkrieger, a whole first-person shooter with its textures, models and music, fits in 96 kilobytes (Breakpoint 2004), and Farbrausch opened its tools in 2012 ([fr_public](https://github.com/farbrausch/fr_public)).
glTF has a draft for procedural textures, [`KHR_texture_procedurals`](https://github.com/KhronosGroup/glTF/pull/2381).
It is part of the answer to foveation and streaming, not all of it: eye tracking, geometry and lighting remain separate problems.

## 7. Add the Web3D Consortium to the organizations

The architecture builds on Khronos (glTF, OpenXR, ANARI, SPIR-V) and OGC (GeoPose).
The Web3D Consortium already standardises what it needs: [X3D 4.0](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/Architecture.html) (ISO/IEC 19775-1:2023), with a Geospatial component for places on Earth, and [HAnim](https://www.web3d.org/documents/specifications/19774/V2.0/Architecture/HAnimArchitecture.html) (ISO/IEC 19774-1:2019) for humanoids, which the avatar work needs.
Web3D already takes part in the Web of Worlds work at the Metaverse Standards Forum ([breakout #35](https://github.com/w3c/tpac2026-breakouts/issues/35)).

## 8. The knowledge layer: twins, robots and provenance

A scene graph says where things are; a knowledge layer says what they are, what they do and where that knowledge came from.
In Knowledge3D a person, an AI and a robot use the same house and the same procedures, and a workshop room can be the digital twin of a factory floor ([robotic embodiment](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/ROBOTIC_EMBODIMENT_SPECIFICATION.md)).
Signing tells us who published an object; an AI or a robot reasoning over the scene also needs to know where its knowledge came from.
That knowledge layer, stored once as procedures for people and AI alike, next to RDF, OWL and JSON-LD, is the question of the [PM-KR Community Group](https://www.w3.org/community/pm-kr/), and it is open to everyone working on this.

---

Daniel Campos Ramos · [PM-KR Community Group](https://www.w3.org/community/pm-kr/) · [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) · [Sparky Stereo OS](https://github.com/Sparky-OS/sparky-stereo-os)

AI partners were leveraged in the production of this work.
