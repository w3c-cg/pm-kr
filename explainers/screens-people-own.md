# The same content on the screens people own

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

Most people own current 2D and 3D devices, not headsets.
Spatial web proposals tend to end their output list at "2D display" or "HMD / smart glasses", so a world reaches the few and a flat picture reaches the many.
Should a user agent's duties include presenting a world, or a stereo page, on the screens people already have?

## The idea

Yes, and the two views are enough.
A 3D TV or projector, a glasses-free display, a monitor with red and cyan glasses and a headset all take the same two views ([Every stereo display shows the same two views](stereo-displays.md)); a plain 2D monitor takes one of them, unchanged.
So:

- a WebXR page reaches a flat 3D screen with no headset, in an immersive session or in the new [inline-stereo](https://github.com/immersive-web/webxr/pull/1436) mode;
- a web engine and a spatial engine can share one compositor, each handing it both eyes side by side, declared once, and the compositor turns that into each screen's format: the deck's "Shared Compositor / Sibling Surfaces" option ([spatial browsing input, points 4 and 5](../talks/2026-10-28-tpac-spatial-browser/README.md#4-the-same-content-on-the-screens-people-own));
- a world's format should carry it to current 2D and 3D devices and to headsets alike, which is the one question asked at the spatial computing breakout: which format carries a fabric to a WebXR page today, so that all of them see it?

## Where it exists today

- The edition's browser build presents WebXR sessions on current 2D and 3D devices without a headset ([the proof](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/waterfox-stereo-m3.md)), with its tested limits recorded.
- The desktop that does the sibling-surfaces part for every program ([One format inside, every output a filter](one-format-inside.md)).
- The question in the Web of Worlds session: "Should the user agent's duties include presenting a world on those screens too?" ([Web of Worlds input, point 3](../talks/2026-10-30-tpac-web-of-worlds/README.md#3-worlds-on-the-screens-people-own)).

## Earlier work

The 2012 Stereoscopic 3D Web Task Force wrote its use cases for the 3D televisions of its day; the screens changed, the requirement did not ([awesome-stereoscopy](https://github.com/danielcamposramos/awesome-stereoscopy#the-web-in-stereo)).

## Questions for the group

1. Which screen do you own that a spatial web proposal leaves out?
2. Which format should carry a world to a WebXR page?
