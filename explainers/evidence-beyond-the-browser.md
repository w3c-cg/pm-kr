# Evidence beyond the browser

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** the charter says the group will study data models, execution semantics and conformance levels, and a status display for such work needs signals for test corpora and implementations, not only a browser's.

## The question

The Community Group redesign gives each specification a status display with progress signals.
The signals it knows are the browser's: an intent to prototype, an origin trial, a shortname in the browser-specs list.
A knowledge model, a media format or a compositor contract has evidence of other kinds.
What would its status display show?

## The idea

Name the kinds of evidence a non-browser specification produces, and give each its own meaning on the display ([Community Group tools input, points 2 and 3](../talks/2026-10-28-tpac-cg-redesign/README.md#2-specifications-beyond-browser-apis)):

- **conformance tests and a test corpus**, for a knowledge model;
- **independent implementations** that interpret an entry the same way;
- **implementation experience** from outside the browser: a desktop compositor, media players, encoders that keep a mark;
- **registry assignments**, which record a type under a stated procedure and prove neither an implementation nor an adoption;
- **measurements on devices**, with their conditions.

The display should keep those apart.
A registry entry next to an origin trial next to a merged encoder patch are three different facts, and a reader deserves to see which is which.

## Where it exists today

- The [metadata documentation](https://github.com/w3c/cg-spec-metadata/blob/main/metadata.md) says a shortname unknown to browser-specs is reported as an error, and the [redesign overview](https://github.com/w3c/cg-program/blob/main/beta-2026/cg-redesign-overview.md) recognises that the existing collectors suit browser APIs and more are expected.
- Evidence of the other kinds from the stereo work: the [IANA Matroska registrations](https://www.iana.org/assignments/matroska) of 20 and 26 October 2026 (Track Plane Types 3 through 5, StereoMode 15 through 20); merged patches in HandBrake, mpv, MKVToolNix and Universal Media Server; a compositor and players measured on 3D televisions ([the glossary's registries section](../glossary/README.md#9-registries)).
- [Stereo 3D after TPAC 2026](https://www.w3.org/publications/spec-generator/?type=respec&url=https://raw.githubusercontent.com/w3c-cg/pm-kr/main/reports/source/stereo-3d-closed-stacks-open-standards.html) lays the evidence out case by case.

## Questions for the group

1. Which kinds of evidence does your work produce that no browser signal names?
2. How should a registry assignment be shown, so that no one reads it as adoption?
