# Stereo 3D and HDR on the web: a migration path

Input from an individual, Daniel Campos Ramos, to the W3C Media & Entertainment Interest Group, after its call of 13 October 2026 ([minutes](https://www.w3.org/2026/10/13-me-minutes.html)), where Rob Smith suggested a path from the status quo to the target.
It is also offered as input to the PM-KR Community Group; it is not a work item of either group.

## Where we are

The mark already exists, in the files people make today:
- H.264 and H.265 carry the frame packing arrangement SEI (ITU-T H.264 and H.265, Annex D, Table D-8).
- Matroska and WebM carry StereoMode, and the size of one view (RFC 9559: the StereoMode element, and section 18.10 for the view size).
- MP4 carries Google's Spherical Video V2 `st3d` box, and Apple's MV-HEVC files carry two views in one stream (the `vexu` box).

Browsers decode the picture and drop the mark.
A side-by-side video plays as two flat halves, and an MV-HEVC video plays its base view in 2D.
WebXR Layers already know stereo layouts (`XRLayerLayout`: `stereo-left-right`, `stereo-top-bottom`), but only inside an XR session.
Screens that show stereo are many and different: 3D TVs over HDMI 1.4a, red-cyan anaglyph on any monitor, headsets, a phone in a cardboard viewer.

Work in progress that touches it:
- [w3c/media-capabilities#249](https://github.com/w3c/media-capabilities/issues/249) (Meta, October 2025): a `stereoMode` field (`mono`, `left-right`, `top-bottom`, `multiview`) to ask whether a browser understands stereo video; discussed by the Media WG at TPAC 2025, where the view was that Media Capabilities should answer what the browser understands, not what the screen can render.
- [w3c/webcodecs#970](https://github.com/w3c/webcodecs/issues/970) (Apple, 9 October 2026): multiview coding in WebCodecs, how to detect and configure it, and what kind of frame it produces.
- The [`<model>` element](https://immersiveweb.dev/model) (Immersive Web Community Group): 3D models rendered by the browser, in stereo where the platform can show it.
- 360° video: Google's Spherical Video V2 boxes (`st3d`, `sv3d`) and WebXR Layers' equirect layer.

## Where we want to be

A marked stereo video or picture on an ordinary web page shows in 3D on whatever screen the person has, with no code in the page, and in plain 2D (one eye) on a 2D screen.
Pages that draw their own stereo (canvas, WebGL) get the same, through one declared layout.
The page never chooses the output: the screen does.

The same target includes HDR: each content layer keeps its colour description and reconstruction information until adaptation for the output.
Decoded samples with that description play the same role as PCM with its sample rate and channel layout in audio.
Stereo uses full side by side to carry both views of a frame together; the HDR interchange representation remains an engineering choice to evaluate.

## The steps

Each step works on its own and keeps today's behaviour for everyone who does not use it.

1. **Read the mark when decoding.** The user agent reads the marks above, in this order: the stream's SEI, then the container's mark with its size, then the user's choice, then the shape of the picture as a last resort. No new syntax. The values match #249's: one view, side by side, top and bottom, multiview.
2. **Expose what was read.** A read-only layout on `VideoFrame` and on the video element, so canvas, WebGL and WebXR pages know what they received. WebCodecs' multiview frames (#970) report the same values.
3. **Hand the element to the compositor with its layout.** The browser already gives video and canvas their own compositor surfaces; it adds the layout to that surface, and the operating system's compositor converts it for each screen: frame packing for a 3D TV, anaglyph for a monitor, one image per eye for a headset or a phone, one eye for 2D. One declaration per element, never per window, so a 2D page can hold a 3D video.
4. **Ask about the screen separately.** As with HDR, one question for decoding (#249) and another for the display, so a page can offer a 3D button only where it shows.
5. **Author-made stereo through WebXR.** Pages like StorySplat's 3D View ([w3c-cg/pm-kr#6](https://github.com/w3c-cg/pm-kr/issues/6)), which build both eyes themselves, reach a 3D screen through a WebXR session on a flat 3D display, using the stereo layouts WebXR Layers already define. A short text on Layers for the Immersive Web groups follows separately.
6. **HDR shares the same contract.** The same per-element declaration carries the colour description and applicable reconstruction information, so one picture can be stereo, HDR or both. Each output adapts it to that screen's capabilities; the next section describes the proposal and its untested choices.

## HDR: the same problem, the same road

At the call, Wolfgang asked whether 3D and HDR are one thing or two.
They are two properties of a picture with one problem in common: the description of the picture has to travel with it, element by element, to the place that knows the screen.
The proposed remedy is the same: describe each content layer once, preserve its information through the stack, and convert for the screen at the output.

**What the web has today:**
- The page can ask about the screen: the `dynamic-range` and `video-dynamic-range` media queries.
- The page can ask about decoding: Media Capabilities' `hdrMetadataType` (`smpteSt2086`, `smpteSt2094-10`, `smpteSt2094-40`), `colorGamut` and `transferFunction`.
- The page can limit the headroom of an element: CSS `dynamic-range-limit`, shipped in Chrome 136.
- Gain-map images (an SDR base plus a map of how much brighter each pixel may go) are shown by some browsers; on Linux, Firefox's HDR output is experimental and covers video only.

**Where information can be lost:**

- On Linux, Wayland's colour management protocol (`wp_color_management_v1`) gives one image description per surface. An HDR photo and SDR text submitted in one buffer therefore share one description.
- The browser must either compose them into a common colour representation or expose separate content surfaces. The latter lets the operating system retain each picture's description.
- If the client has already adapted the picture to one screen, the compositor may lack the information needed to adapt it differently for a second screen, as when an HDR monitor and an SDR 3D TV are mirrored.
- The proposed gain-map carrier would preserve reconstruction information for the compositor to use with each screen's own headroom.

**The target, per element, as for stereo:** each video, picture or canvas that carries a colour description gets its own compositor surface with that description, and the compositor converts it for every output:
- an HDR screen keeps the picture's range, with SDR content at reference white (ITU-R BT.2408, 203 cd/m²);
- an SDR screen with deep colour gets the picture tone-mapped into its 10, 12 or 16 bits per channel (HDMI deep colour), so gradients keep their steps instead of banding: the 3D TVs of 2010 to 2013 take 12 bits;
- an 8-bit screen gets the same, dithered;
- a gain-map picture is weighted by each screen's own headroom, between the file's base and alternate headroom (ISO 21496-1), so two screens can show it two ways at once;
- a floating-point composition path is a candidate for retaining useful precision until output encoding; its precision, gamut and luminance behaviour need measurement.

**Where the colour comes from, in the same order as the stereo mark:**
1. the stream: the colour code points of ITU-T H.273 in the H.264/H.265 VUI, the mastering display colour volume SEI and the content light level SEI;
2. the container: Matroska's Colour element (RFC 9559), MP4's `colr`, `mdcv` and `clli` boxes;
3. the file, for photos: Ultra HDR (a JPEG with its gain map and metadata), Apple's HDR photos (HEIF with a gain-map auxiliary image), ISO 21496-1 metadata in HEIF, AVIF and JPEG XL;
4. nothing: BT.709 SDR.

**The steps, beside the stereo ones:**
- reading the colour already happens for video; extend it to photos with gain maps, for every format above;
- WebCodecs already exposes `VideoFrame.colorSpace`; the same frame reports its stereo layout (step 2);
- hand each element's surface to the compositor with its description, and with its gain map where it has one: one declaration per element carries the stereo layout, the colour description and the gain map, so a 3D HDR photo keeps a gain map for each eye;
- the screen query already exists (`dynamic-range`); the compositor answers it for each screen the window is on.

**Not covered yet:** dynamic metadata, which changes the tone mapping frame by frame: SMPTE ST 2094-40 (HDR10+) is open and fits as per-frame state later; Dolby Vision's metadata is proprietary.

On Linux, our design for that declaration is public: [Stereo and HDR in one declaration](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-hdr-content.md).
It is a design, not yet built, and not yet tried on an HDR screen.

**Engineering limit, clarified 19 October 2026:** the author selected full side by side through stereo content and device testing; equivalent cross-format HDR device testing has not yet been done for this proposal.
PQ, HLG and gain-map images impose different decoding and reconstruction requirements; a shared presentation contract does not make them one encoding.
The HDR working colour space, pixel representation, precision and metadata handling remain choices to validate with reference images on HDR, deep-colour SDR and 8-bit displays, including mirrored outputs and mixed SDR/HDR content.
Existing stereo and deep-colour measurements are not evidence that this HDR path works, and deep colour alone is not HDR.

## What can be tested today

- On Linux, a desktop that takes one declared full side-by-side picture per surface and converts it for every screen: [Sparky Stereo OS](https://github.com/Sparky-OS/sparky-stereo-os), with captures of both eyes.
- A browser build that does steps 1 and 3 for video: our Waterfox stereo branch, [Sparky-OS/waterfox](https://github.com/Sparky-OS/waterfox) (`stereo3d`).
- Encoders that keep the mark: merged in HandBrake (#8100), mpv (#18490), MKVToolNix and PeerTube (#7816).
- Live sources on the web to test against ([w3c-cg/pm-kr#4](https://github.com/w3c-cg/pm-kr/issues/4)): YouTube channels and video portals for steps 1–4 ([w3c-cg/pm-kr#5](https://github.com/w3c-cg/pm-kr/issues/5)), VR, WebXR and author-made stereo for step 5 ([w3c-cg/pm-kr#6](https://github.com/w3c-cg/pm-kr/issues/6)), and native Web HDR, gain maps and deep colour for step 6 ([w3c-cg/pm-kr#7](https://github.com/w3c-cg/pm-kr/issues/7)).
- The background: [Stereo 3D on Linux and the Web: Established Specifications, Adopted in Pieces](https://www.w3.org/publications/spec-generator/?type=respec&url=https://raw.githubusercontent.com/w3c-cg/pm-kr/main/reports/source/stereo-3d-adoption-report.html).

## Questions for the group

- Which group should own each step: the Media WG for 1, 2 and 4, the Immersive Web groups for 5, and the CSS WG or HTML for 3?
- Who can test a declared pair on their own screens, 2D fallback included, using the sources in [w3c-cg/pm-kr#4](https://github.com/w3c-cg/pm-kr/issues/4) ([#5](https://github.com/w3c-cg/pm-kr/issues/5), [#6](https://github.com/w3c-cg/pm-kr/issues/6), [#7](https://github.com/w3c-cg/pm-kr/issues/7))?
