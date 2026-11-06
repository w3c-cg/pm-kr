# One idea, one name: connected vocabularies with their history

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

A stereo picture, a depth, a procedural texture mean the same thing in a file format, a scene format, a web page and a compositor only if every one of them names it the same way.
Then any device that speaks one speaks all, and no vendor's stack is needed to get there.
Today each group defines its terms in its own wiki, a newcomer cannot find who defined a term, where and when, and ignored contributions become invisible prior art.

## The idea

- **One idea, one shared name, and the name every specification gives it.**
  This repository's [glossary](../glossary/README.md) does it for the stereo and spatial work: each entry gives the idea, the one shared name, the name each specification uses with its clause, the group that owns each specification and where to get its text, and the status of every name.
  Where a name already exists it is reused: the layout values of the codecs and containers, "left eye first", the depth words sunk, screen and popped, the names of the display families.
- **Vocabulary tools in the templates.**
  Templates for Community Group documents could suggest defined terms, as [Webref](https://github.com/w3c/webref) collects them from browser specifications and ReSpec links to them, and feed the same guidance to the skill files AI assistants read, so people and assistants use one set of definitions ([Community Group tools input, point 9](../talks/2026-10-28-tpac-cg-redesign/README.md#9-vocabulary-tools-in-the-templates)).
- **A connected registry with its history.**
  Close terms from different groups linked with [SKOS](https://www.w3.org/TR/skos-reference/), each dated and attributed with [PROV-O](https://www.w3.org/TR/prov-o/), so related groups become easier to find and earlier work easier to build on (point 10).
  At the redesign session the chairs took the question into the minutes, with the new report types that could declare their vocabulary that way ([minutes](https://www.w3.org/2026/10/28-cg-program-minutes.html)).

## Where it exists today

- The glossary, 4 November 2026, with the names of the stereo and spatial work across H.264, H.265, H.274, H.273, RFC 9559, HDMI, HEIF, WebXR, FFmpeg, X3D and the desktop ([glossary](../glossary/README.md)); its twin for the edition's own words is the [Sparky Stereo OS glossary](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/glossary.md).
- The same names carried into each technology as the work reaches it: the layout values in Qt, KImageFormats and SVGStereo; the depth words in KWin, Union, SVG and the CSS proposal; DPFR in glTF and X3D ([the glossary's "Why one name"](../glossary/README.md#why-one-name)).

## Questions for the group

1. Which term of your group has a twin in another group under another name?
2. Would your group declare its terms in SKOS and PROV if the template did the work?
