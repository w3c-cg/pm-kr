# The stereo mark exists, and the web drops it

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** the stereo mark is knowledge that already exists in the file and is lost between the decoder and the screen, the fragmentation the charter names, so the question is how a representation travels with its object through every layer.

## The question

Take a 3D video from a 3D camera, a 2011 3D phone or a Blu-ray rip, and open it in a browser.
It plays as two flat pictures side by side.
The file said it was 3D: H.264 and H.265 streams carry a frame packing arrangement message (ITU-T H.264, Annex D), Matroska and WebM carry `StereoMode` and the size of one view ([RFC 9559](https://www.rfc-editor.org/rfc/rfc9559), section 18.10), MP4 carries the `st3d` box, Apple's spatial video carries two views in one stream.
Browsers decode the picture and drop the mark.
The same happens to pictures: MPO, JPS and PNG with `sTER` reach a page as one flat view, and most upload forms accept the file types but lose the second view on the way.
A site that wants 3D today builds its own side by side and anaglyph modes, as StorySplat does for Gaussian splats, because a page has no common way to say "this holds two views".

## The idea

Six steps, each working on its own and keeping today's behaviour for everyone who does not use it ([the migration path](../talks/2026-10-13-w3c-me-ig/migration-path.md)):

1. **Read the mark when decoding**, in order: the stream's message, the container's mark with its view size, the person's choice, the picture's shape as a last resort. No new syntax.
2. **Expose what was read**: a read-only layout on `VideoFrame` and on the video element, so a page knows what it received.
3. **Hand the element to the compositor with its layout**: the browser already gives video and canvas their own compositor surfaces; it adds the layout, and the operating system's compositor converts it for each screen. One declaration per element, never per window, so a 2D page can hold a 3D video.
4. **Ask about the screen separately**, as HDR does: one question for decoding, another for the display.
5. **Author-made stereo through WebXR**: pages that build both eyes themselves reach a 3D screen through an [inline-stereo](https://github.com/immersive-web/webxr/pull/1436) session, merged in June 2026.
6. **HDR shares the same contract** ([HDR and 3D: the same road](hdr-same-road.md)).

The page never chooses the output; the screen does ([One format inside, every output a filter](one-format-inside.md)).

## Where it exists today

- A browser build that does steps 1 and 3 for video, and offers immersive and inline-stereo sessions on a flat 3D screen with no headset: [Sparky-OS/waterfox](https://github.com/Sparky-OS/waterfox), branch `stereo3d`, with its [proof](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/waterfox-stereo-m3.md).
- Encoders and servers that keep the mark, merged: HandBrake [#8100](https://github.com/HandBrake/HandBrake/pull/8100), mpv [#18490](https://github.com/mpv-player/mpv/pull/18490), MKVToolNix [!6311](https://codeberg.org/mbunkus/mkvtoolnix/pulls/6311), Universal Media Server [#6330](https://github.com/UniversalMediaServer/UniversalMediaServer/pull/6330).
- Live sources to test on your own screens: [w3c-cg/pm-kr#4](https://github.com/w3c-cg/pm-kr/issues/4) and its three sub-lists.
- Work in progress that touches it: Media Capabilities [#249](https://github.com/w3c/media-capabilities/issues/249) (a `stereoMode` to ask what a browser understands), WebCodecs [#970](https://github.com/w3c/webcodecs/issues/970) (multiview frames).

## Who owns it

The need touches media, immersive content, HTML or CSS, and colour, and no one group owns it; that is the subject of [A need that crosses groups](needs-that-cross-groups.md).
At the Mind the gaps session of TPAC 2026 the question "Which group should own stereo for the video element?" stayed unresolved ([minutes](https://www.w3.org/2026/10/27-mind-the-gaps-minutes.html)).

## Earlier work

W3C took the question up twice: the Stereoscopic 3D Web Task Force of 2012 (LG, KDDI and W3C staff), whose draft proposed CSS properties and a `3d-display` media type, and the Stereoscopic 3D Web Community Group of 2013, closed in April 2023.
The first [stereo report](https://www.w3.org/publications/spec-generator/?type=respec&url=https://raw.githubusercontent.com/w3c-cg/pm-kr/main/reports/source/stereo-3d-adoption-report.html) records both with their sources, "Twice at W3C", and traces where the declarations stop today.

## Questions for the group

1. Which group should own stereo for the video element?
2. Who can test a declared pair on their own screens, 2D fallback included, from the sources in [#4](https://github.com/w3c-cg/pm-kr/issues/4)?
