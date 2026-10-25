<!-- Input to the PM-KR Community Group from an individual participant. Not a work item or output of the group. -->
> **Status:** input from an individual participant, Daniel Campos Ramos, to the TPAC 2026 breakout [#68, "Mind the gaps: Where does the web platform fall short?"](https://github.com/w3c/tpac2026-breakouts/issues/68), 27 October 2026. It is also offered as input to the PM-KR Community Group; it is not a work item or output of either. Licence: CC BY 4.0.

# Mind the gaps: five points from building a stereo desktop

I co-chair the PM-KR Community Group with Milton Ponson, and I designed [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D), where people and AI would share knowledge in one 3D space.
To show it, I built Sparky Stereo OS as a desktop foundation for current 2D and 3D devices.
The web is the missing piece between them.
These are the points I would raise in the session, with their sources, in case the time runs out.
I welcome Sarah Inman, Kadir Topal, Patrick Brosset and Lea Verou's effort to give developers a way to raise needs before they have a proposal.

## 1. Stereo information exists, but gets lost

The gap I bring is stereo 3D: H.264, Matroska and MP4 can already carry the stereo mark, yet a side by side video can reach a web page as two flat halves.
My [stereo report](https://www.w3.org/publications/spec-generator/?type=respec&url=https://raw.githubusercontent.com/w3c-cg/pm-kr/main/reports/source/stereo-3d-adoption-report.html) traces where the declarations stop.
I wrote a [six-step migration path](https://github.com/w3c-cg/pm-kr/blob/main/talks/2026-10-13-w3c-me-ig/migration-path.md) that preserves today's behaviour at every step.
The page would keep both views and their description attached to each element's surface, and the compositor would present them for each device.
That lets an ordinary 2D page contain a 3D video.

## 2. Who owns a need that crosses groups?

I started in a Community Group, then brought the problem to an Interest Group call, then to issues in Media and Immersive Web.
The [13 October M&E IG minutes](https://www.w3.org/2026/10/13-me-minutes.html), [Media Capabilities #249](https://github.com/w3c/media-capabilities/issues/249) and [WebCodecs #970](https://github.com/w3c/webcodecs/issues/970) show that route.
The need touches media, immersive content, HTML or CSS, and colour, so I still need an answer to the migration path's [ownership questions](https://github.com/w3c-cg/pm-kr/blob/main/talks/2026-10-13-w3c-me-ig/migration-path.md#questions-for-the-group).
Who would triage a need that crosses groups and keep it moving between them?

## 3. A workaround each site has to build

I see the cost in StorySplat, which draws Gaussian splats in the browser and supplies its own side by side and anaglyph modes to reach current 2D and 3D devices.
A page has no common way to declare a stereo canvas, so the site has to make those presentation choices itself.
Our [live stereo examples](https://github.com/w3c-cg/pm-kr/issues/6) give people something to try.
I would like a shared declaration that lets sites provide the views and leaves device presentation to the browser and desktop.

## 4. Take evidence with the need

I find a need easier to judge when there is something to test.
We keep a [public list of live 3D and HDR sources](https://github.com/w3c-cg/pm-kr/issues/4), so people can check the gap on their own screens.
Could the intake ask for the need, the workaround and a page that shows it?
HDR shares the question of declarations for each element, but our migration path says the HDR path has not yet been tried on an HDR screen.

## 5. WebXR helps, and media still needs a route

I welcome WebXR's [inline-stereo mode](https://github.com/immersive-web/webxr/pull/1436), merged in June 2026, for pages that draw both eyes.
Our [Waterfox branch's proof](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/waterfox-stereo-m3.md) shows stereo presentation on current 2D and 3D devices without requiring a headset.
That is our browser build, with the tested limits recorded in the proof.
Video and pictures still need their stereo information preserved through the media pipeline.
Which group should own stereo for the video element?

---

Daniel Campos Ramos · [PM-KR Community Group](https://www.w3.org/community/pm-kr/) · [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) · [Sparky Stereo OS](https://github.com/Sparky-OS/sparky-stereo-os)

AI partners were leveraged in the production of this work.
