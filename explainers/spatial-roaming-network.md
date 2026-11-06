# Finding, moving and receiving a world: the Spatial Roaming Network

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

Inside a world, how does a visitor find what is near them, keep their services as they move, enter a world run by someone else, and receive its content without waiting for a server on the other side of the planet?
Phones answered the same four questions for people moving through cities: cells, handover, roaming and nearby delivery.

## The idea

**The Spatial Roaming Network (SRN)**, named on 28 October 2026 ([the proposal page](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/spatial-roaming-network.md)): a cellular model for finding places, moving between them and receiving their content near the visitor, for physical places and for places inside virtual worlds.

| Term | Meaning | Built on |
|---|---|---|
| cell | an area in which a visitor can discover services, content, people and doors | cellular networks; H3 for real cells |
| real cell, virtual cell | a physical place, or a logical place inside a world with no location on Earth | Open AR Cloud's spatial service discovery; game hubs |
| irradiator | a software role that announces the services, content, people and doors within its range inside a virtual world | a phone tower; Bluetooth beacons; X3D's proximity sensor |
| handover | the change of serving cell as the visitor moves | 3GPP TS 23.502, clause 4.9.1 |
| roaming | entering a network run by another publisher | 3GPP TS 23.501, clause 4.2.4 |
| edge delivery | receiving a world's content from a server near the visitor | content delivery networks, RFC 7336 |
| travel between grids | the precedent in virtual worlds | Crista Lopes's Hypergrid for OpenSimulator |

A person in Brazil visiting another spatial network would receive its content from a nearby server, as content delivery networks do; theoretically that reduces loading delay, and it still needs measuring.
The proposal combines established techniques in one protocol for real and virtual cells; it claims to invent none of them, and no SRN path is implemented or measured ([glossary](../glossary/README.md#spatial-roaming-network-srn)).

## Where it exists today

- Raised with the Metaverse Standards Forum's linking and discovery work at the Web of Worlds breakout ([point 7](../talks/2026-10-30-tpac-web-of-worlds/README.md#7-finding-moving-and-receiving-a-world)), with the question whether it gives that work a common way to describe entering and leaving independently published worlds on current 2D and 3D devices as well as headsets.
- The pieces it credits are each published: the 3GPP procedures, RFC 7336's CDN interconnection, OSCP's discovery by H3 cell, interest management in networked games, Hypergrid.
- Its companion for places that have no location: [Places with no location](places-with-no-location.md).

## Questions for the group

1. Which of the seven terms already has a twin in your own system, under which name?
2. What would an irradiator announce in a world you run?
