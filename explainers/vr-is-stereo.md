# VR is stereo: a headset is a stereo display with head tracking

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

People speak of 3D and VR as two worlds, with different content, different software and different standards.
A headset is a stereoscope you wear: two small pictures, two eyes, held at the right distance, the same line that runs from Wheatstone's mirrors of 1838 through the View-Master and Google Cardboard ([Headsets and worn displays](https://github.com/danielcamposramos/awesome-stereoscopy#headsets-and-worn-displays)).
What a headset adds is head tracking: the picture follows where you look.
Everything it shows is a stereo pair, and a stereo pair can be shown on any stereo display.

## The idea

Two directions, one pair of views.

- **A headset is also a stereo monitor.** Most headsets are a pair of small screens, one for each eye, and the rest split one screen in two, just as a 3D TV does.
  So a desktop that already draws two views can send them to a headset as it sends them to a TV, with the lens correction applied at that output.
  Sparky Stereo OS calls this [VR is also a stereo monitor](https://github.com/Sparky-OS/sparky-stereo-os#vr-is-also-a-stereo-monitor): a compatible Android phone in an inexpensive viewer already works as a screen for the whole desktop; standalone headsets are next and not yet tested.
- **A VR game is already a stereo game.** A game with a VR mode renders two eyes.
  A 3D TV can show them directly; what stands in the way is everything the VR mode does for a headset.
  [The formula](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/formula.md), learned on Half-Life 2's own VR interface, lists what changes: the eyes go to a window instead of a headset, the mouse drives the view instead of a head tracker, the HUD and the crosshair sit on the screen plane, and settings are restored on exit.
  Played through level transitions on two Sony 3D televisions in September 2026.
- **The Stereo Spectator.** While one person plays in a headset, the room sees the same two eyes on the 3D television, in stereo, instead of a flat mirror ([vr-to-3d](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/skills/vr-to-3d/SKILL.md)).

## Two kinds of content, one vocabulary

Content made to stay around the screen plane is 3D content; content made to come out of the screen and surround the viewer is VR content ([glossary](../glossary/README.md#3d-content-and-vr-content)).
The pair of views is the same; the comfortable separation is not.
A headset tolerates more separation; a framed 3D screen wants less, so the limits are resolved per display and the person's own setting wins ([Depth on a desktop and on a page](depth-sunk-screen-popped.md)).

## On the web

WebXR's [inline-stereo](https://github.com/immersive-web/webxr/pull/1436) session mode, merged in June 2026, lets a page draw both eyes inside the page, and the browser may show them in fixed stereo when head tracking is not granted.
That is the web's way of saying the same thing: a 3D screen with no headset can show what a headset shows.
The edition's browser build presents such a session on current 2D and 3D devices with no headset ([the proof](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/waterfox-stereo-m3.md)).

## Earlier work

Ivan Sutherland's head-mounted display of 1968 showed a computer's output stereoscopically; computer graphics and stereoscopic display start together ([awesome-stereoscopy](https://github.com/danielcamposramos/awesome-stereoscopy#headsets-and-worn-displays)).
[VRto3D](https://github.com/oneup03/VRto3D) is an OpenVR driver that drives 3D displays today; the universal VR mods per engine are listed in the same section.

## Questions for the group

1. Should a user agent's duties include presenting an immersive session on a flat 3D screen when the person has one?
2. Which VR content of yours would you show to a room on a 3D TV?
