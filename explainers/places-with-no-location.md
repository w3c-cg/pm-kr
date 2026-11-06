# Places with no location

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** a place with no location is a spatial concept of the kind the charter names, a house with doors in Knowledge3D's terms, that a representation must be able to address without a coordinate on Earth.

## The question

A spatial browser that discovers services by location, where "in the metaverse, you move", is a fine way to find a building's twin.
But many places have no location.
A virtual square, a market that exists only online, a library of knowledge, a game's hub town, or a place on the other side of the world: nobody can walk there.
Are we locking the spatial web to local only ([spatial browsing input, point 1](../talks/2026-10-28-tpac-spatial-browser/README.md#1-places-with-no-location-are-we-locking-the-web-to-local-only))?

## The idea

- **Take the web's own intermediate path.**
  The web grew from directories to search engines, then ranking, then AI answers, and each step kept the links and addresses of the one before.
  The spatial web can start from today's sites and links and give each one a place.
- **The web already speaks in places.**
  Sites, addresses, home pages, portals, forums, marketplaces, chat rooms: the vocabulary is spatial already.
  In Knowledge3D each of those is a house, and a link between them is a door ([House, Galaxy and Tablet](https://github.com/danielcamposramos/Knowledge3D/blob/1c524f8f1c364ee9345eabc1c0570372af90b54e/docs/HOUSE_GALAXY_TABLET.md), November 2025; [Doors and addresses](doors-and-addresses.md)).
- **People already choose their services by subscribing.**
  RSS, Atom ([RFC 4287](https://www.rfc-editor.org/rfc/rfc4287)) and W3C's own [WebSub](https://www.w3.org/TR/websub/) deliver what a person chose; in a spatial interface those subscriptions can arrive at the person's own virtual device, a tablet in the hand that holds the old web inside the new one and is its gateway (Knowledge3D's Memory Tablet).
- **Squares are places too.**
  Games have built places with no location for decades, and people find them without walking: server lists, friends' presence, lobbies and hubs ([point 3](../talks/2026-10-28-tpac-spatial-browser/README.md#3-service-discovery-beyond-location)).
  The cellular model that joins real and virtual places is the [Spatial Roaming Network](spatial-roaming-network.md).

## Where it exists today

- The Open Metaverse Browser Initiative's [Sneeze architecture](https://github.com/MetaversalCorp/SneezeDoc/blob/main/docs/architecture/sneeze-architecture.md), section 2.4, with discovery by location; its overview calls proximity discovery future work, so the question is asked, not thrown.
- [Web of Worlds' linking work](https://github.com/WebOfWorlds/WoWAPI/blob/ea3d0e7aa8774b6c24728163d1cf2d6e91903f88/README.md), public before Knowledge3D, which this input builds on.

## Questions for the group

1. Which place you visit online every week has no location on Earth?
2. How would you give it an address in a world?
