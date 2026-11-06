# Doors and addresses inside a world

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** an address inside a world is a reference, and the charter's composition by reference needs addresses that reach an object or a viewpoint, not only a world's entrance.

## The question

A link to a world should take a person to the object or viewpoint they meant to reach, not only to the world's entrance.
The web solved the same problem for pages with the fragment identifier.
What is the equivalent inside a 3D space, and what more than a link does a door need?

## The idea

Reverse the web's analogies: a page becomes a world, a link a door, a URL an address inside the space.

- **A door is both a 3D object and a network interface**, with an address that carries a routing hint, a port, a spatial destination and a label: `k3d://rx,ry,rz:port@x,y,z?label=...` ([Doors and network](https://github.com/danielcamposramos/Knowledge3D/blob/de9a880b4e840167e42618a69ef560140f9afe70/docs/DOORS_AND_NETWORK.md), September 2025).
- **A door needs more than a link**: how it is crossed, its shape, how it is shown, and a preview of the destination ([Web of Worlds input, after the session](../talks/2026-10-30-tpac-web-of-worlds/README.md#after-the-session)).
- **Knowledge-node identifiers on scene nodes**: the [glTF data description](https://github.com/danielcamposramos/Knowledge3D/blob/main/spec/glTF_K3D_extension.md) associates them with glTF nodes, so a link can name an object, not only a place.

## Where the same idea already lives

| Where | Its form |
|---|---|
| X3D 4.0 (ISO/IEC 19775-1:2023) | the `Anchor` node loads another world or binds a viewpoint; a URL ending in `#ViewpointName` binds the viewpoint of that name ([Networking component, 9.4.1](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/networking.html#Anchor)) |
| Web of Worlds | a portal, "an object with a spatial identifier in your world", linking to a spatial part of another world; Metaverse Bookmarks that capture coordinates, viewpoints and temporal states |
| OMI, the W3C Metaverse Interoperability Community Group | `OMI_link`, world traversal on a glTF node, archived in March 2026 because a useful door needs more than a link |
| the session | 3D fragment identifiers, and Dave Raggett's "a room could be addressed by its path" |

The glossary keeps the four side by side under one pair of names, world and door ([glossary](../glossary/README.md#world-door-link); [Address inside a world](../glossary/README.md#address-inside-a-world)).
Amanda Morgan's reading of glTF 2.1 against the room's wish list, stable identifiers as targets for links and agent actions, meets this point ([quoted with her permission](../talks/2026-10-30-tpac-web-of-worlds/README.md#after-the-session)).

## Questions for the group

1. Should a fragment identifier name a viewpoint, an object, or either?
2. What should a door show before it is crossed?
