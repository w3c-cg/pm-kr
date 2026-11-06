# Federated WebXR inside a spatial engine

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** a page composed into a world as a branch that keeps its own origin is the charter's composition by reference applied to content from many sources, referenced into one scene instead of copied into it.

## The question

A native spatial engine like Sneeze keeps a shared scene graph and explains why it is not a web engine: per-origin isolation cannot hold "dozens of untrusted sources" in one scene graph, so it needs "per-branch ownership" (its architecture, section 2.5).
It also calls WebXR "vital" and says the same content "should be accessible from both browsers" (section 2.6).
How do today's WebXR pages become content of such a world without giving up their isolation?

## The idea

The engine acts as the XR device for web pages.
Each WebXR page runs in its own engine process and origin, anchored in the scene, and hands back its layers, colour and depth.
The engine composites them like any other branch, so isolation holds inside its own per-branch model, and every WebXR page on the web today becomes spatial content in a fabric ([spatial browsing input, point 2](../talks/2026-10-28-tpac-spatial-browser/README.md#2-federated-webxr-inside-sneeze)).

Each open question already has an answer elsewhere:

- **head pose for each page**: as 2D browsers do it today, gated by the Permissions Policy `xr-spatial-tracking`, consent and user activation;
- **input between pages**: as massive multiplayer games route thousands of players' actions every tick, with an authoritative server and interest management;
- **depth between sources**: OpenXR's `XR_KHR_composition_layer_depth` already lets an application submit depth with colour, and occlusion is then the engine's step;
- **frame timing**: a fixed simulation step with interpolation, and the predicted display time XR runtimes already give each application.

The precedent at Khronos is OpenXR's [overlay sessions](https://github.com/KhronosGroup/OpenXR-Docs/blob/main/specification/sources/chapters/extensions/extx/extx_overlay.adoc), where applications that "execute in a separate process, create a separate session, generate separate content" are composited together by the runtime.
On a desktop the same thing is the compositor composing stereo surfaces from many programs ([One format inside, every output a filter](one-format-inside.md)).

## Where it exists today

- The [Sneeze architecture](https://github.com/MetaversalCorp/SneezeDoc/blob/main/docs/architecture/sneeze-architecture.md), sections 2.4 to 2.6.
- The question read into the spatial computing breakout of 28 October 2026 ([minutes](https://www.w3.org/2026/10/28-spatial-computing-minutes.html)).

## Questions for the group

1. Which of the four open questions do you consider unsolved, and why?
2. Which WebXR page of yours would you anchor in someone else's world first?
