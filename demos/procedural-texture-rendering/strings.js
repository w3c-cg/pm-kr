// Every string the page shows, in one table per language (en here; the other nine in lang/CODE.js, loaded only when
// chosen). {0}, {1} ... are filled in order. A key a language lacks is shown in English. Our code, BSD 2-clause.
export const LANGS = [   // code, the language's own name, the BCP 47 tag for the lang attribute
  ['en', 'English', 'en'], ['pl', 'Polski', 'pl'], ['pt_BR', 'Português (Brasil)', 'pt-BR'], ['fr', 'Français', 'fr'],
  ['de', 'Deutsch', 'de'], ['es', 'Español', 'es'], ['ja', '日本語', 'ja'], ['ko', '한국어', 'ko'],
  ['zh_CN', '简体中文', 'zh-Hans'], ['zh_TW', '繁體中文', 'zh-Hant']];

export const STRINGS = {
  en: {
    // the page around the panel
    docTitle: 'Procedural Texture Rendering: a 3D scene drawn before its pictures arrive',
    skip: 'Skip to the download panel',
    hTitle: 'Procedural Texture Rendering',
    hLead: 'This 3D courtyard appears almost at once, even on a dial-up connection. Each surface is first drawn from a tiny recipe, called a procedure, and its photograph takes over when its download ends.',
    hNext: 'Pick a connection speed in the panel and press “Restart with these settings”.',
    hStatus: 'A working demo by Daniel Ramos, offered as input to the W3C PM-KR Community Group, and a proposal for the glTF 3D format. It is not part of glTF yet.',
    language: 'Language',
    hScene: 'The scene',
    sceneText: 'A small courtyard seen from above its front edge: a tiled floor, a brick wall behind it, a crate with metal plates, a plinth of terracotta tiles, a boulder, a tree trunk and a rusted barrel. The camera turns slowly left and right.',
    sceneState: '{0} of {1} surfaces show their picture; the others are drawn from their procedure.',
    sceneStateWait: 'The scene is loading.',
    hAbout: 'About this demo',
    aHowH: 'How the scene loads',
    aHow1: 'Every procedure arrives first. All seven together are about 15 KB.',
    aHow2: 'The scene is drawn at once from the procedures.',
    aHow3: 'The pictures (6.26 MB) download beside the drawing.',
    aHow4: 'Each procedure blends into its picture when the picture has arrived.',
    aHow5: 'That procedure then stops being computed.',
    aSimH: 'What is simulated',
    aSim: 'The connection speed is simulated in this page. Your browser downloads each file at your own speed, and the page releases its bytes at the speed you choose, as Macromedia Flash\'s Simulate Download did. Nothing is sent anywhere.',
    aWhoH: 'Whose work this is',
    aWho: 'An individual contribution by Daniel Ramos, offered as input to the W3C Procedural Memory Knowledge Representation Community Group. It is not a report or a decision of the group.',
    aFmtH: 'The format',
    aFmt: 'The scene is a glTF 2.0 file. Each texture names its procedure through a draft extension, KHR_texture_procedural_rendering, written as a proposal for glTF. A viewer that does not know it shows the pictures.',
    aFmtLink: 'Read the proposal',
    a3dH: 'In 3D',
    a3d: 'Where the browser offers a WebXR device, “Enter 3D” draws one view for each eye. In an ordinary browser this is a 2D page, and the panel says so.',
    aCreditsH: 'Credits and licence',
    aCredits: 'Pictures: Poly Haven, CC0, by Rob Tuytel and Amal Kumar. Operators after Farbrausch\'s werkkzeug3. The panel follows Macromedia Flash\'s Simulate Download and Dreamweaver\'s download time. The page\'s code is under the BSD 2-clause licence; the scene\'s geometry, script and sound are CC0.',
    aCreditsLink: 'All credits',
    aLicenceLink: 'Licence',
    aRunH: 'Run it yourself',
    aRun: 'This folder is plain files. Copy it to any web server, or to any folder of one, and open it.',
    // the panel
    panel: 'Simulate Download',
    panelNote: 'After Macromedia Flash\'s Simulate Download and Bandwidth Profiler and Dreamweaver\'s download time, in one panel.',
    linkPage: 'The link is simulated in this page: your browser downloads each file at your own speed, and the page releases its bytes at the chosen speed.',
    linkServer: 'The link is the local server\'s: it sends each file at the chosen speed.',
    linkChoice: 'Link',
    linkChoicePage: 'simulated in this page',
    linkChoiceServer: 'the local server\'s',
    speed: 'Connection speed',
    custom: 'Custom (kbit/s)',
    customLabel: 'Custom speed in kbit/s',
    customBad: 'Type a speed above 0 kbit/s. The speed stays at {0}.',
    connections: 'Connections',
    limitTo: 'Limit applies to',
    limitPictures: 'pictures only',
    limitEverything: 'everything',
    blend: 'Procedure to picture',
    blendCoarse: 'coarse first, then detail',
    blendCross: 'cross-fade',
    blendSeconds: 'Blend time (s)',
    restart: 'Restart with these settings',
    detailed: 'Detailed',
    motion: 'Camera motion',
    motionReduced: 'The camera stands still because this device asks for reduced motion. The blends still happen.',
    summary: 'Sizes and times at this speed',
    summaryPart: 'Part',
    summaryTime: 'Time at this speed',
    procedures: 'Procedures',
    pictures: 'Pictures',
    otherParts: 'Scene description, models, script, sound',
    total: 'Total',
    headline: 'Usable after {0} from {1} of procedures; the pictures ({2}) take {3} at this speed.',
    headlineWait: 'Drawing from {0} of procedures; the pictures ({1}) take {2} at this speed.',
    usableAfter: 'Usable from its procedures after',
    usableBoth: '{1} (estimate: {0})',
    notLimitedShort: 'at once',
    legendTick: 'last work on its procedure',
    pictureFirst: 'picture first',
    notLimited: 'at once (not limited)',
    simulated: 'Simulated download',
    elapsed: 'elapsed {0}',
    remaining: 'about {0} left',
    done: 'all in after {0}',
    measured: 'measured {0} (set {1})',
    noLimit: 'no limit',
    component: 'Scene component',
    kind: 'Kind',
    size: 'Size',
    state: 'State',
    kindDescription: 'scene description',
    kindProcedure: 'procedure',
    kindModel: 'model',
    kindPicture: 'picture',
    kindScript: 'script',
    kindSound: 'sound',
    waiting: 'waiting',
    loading: 'loading',
    arrived: 'in at {0}',
    failed: 'failed: {0}',
    unknownSize: 'size not known yet',
    timeline: 'Each texture: drawn from its procedure, picture arrived, blend, procedure stopped',
    timelineAlt: 'A chart of each texture over time. The same times are in the table below.',
    timelineTable: 'The timeline as a table',
    tlTexture: 'Texture',
    tlProcedure: 'Drawn from its procedure',
    tlDownload: 'Picture download',
    tlBlend: 'Blend',
    tlStopped: 'Procedure stopped',
    tlLastWork: 'Last work on its procedure',
    tlFromTo: '{0} to {1}',
    tlFrom: 'from {0}',
    tlNotYet: 'not yet',
    legendProcedure: 'procedure drawn',
    legendDownload: 'picture downloading',
    legendBlend: 'blend',
    legendPicture: 'picture only, procedure stopped',
    player: 'Procedure player',
    playerWebgpu: 'WebGPU on {0}',
    playerWasmChosen: 'WebAssembly on the processor (chosen in the address)',
    playerWasmNoWebgpu: 'WebAssembly on the processor: this browser offers no WebGPU ({0})',
    playerOff: 'stopped: every procedure has been replaced by its picture',
    longest: 'Longest GPU submission (the GPU\'s own time)',
    longestWall: 'Longest GPU submission (from submit to done)',
    msgNoTimestamps: 'This browser gives no GPU timestamps: submissions are timed from submit to done.',
    longestPiece: 'Longest piece drawn on the processor',
    longestValue: '{0} ms ({1}, {2})',
    submissions: '{0} submissions; after a texture stopped: {1}',
    wasmCalls: '{0} pieces drawn; after a texture stopped: {1}',
    firstFrame: 'First frame from the procedures at {0}',
    enter3d: 'Enter 3D',
    no3d: 'No WebXR device here: an ordinary 2D page.',
    in3d: 'In 3D: one view per eye from the session.',
    problem: 'Problem:',
    msgUnknownVersion: '{0}: the procedure is {1}, which this player does not know; the texture shows its picture alone when it arrives.',
    msgPictureFailed: '{0}: the picture did not arrive ({1}); the procedure stays.',
    msgNoWebgl: 'This browser offers no WebGL 2: the scene cannot be drawn.',
    msgSceneFailed: 'The scene description did not load: {0}',
    msgProcedureFailed: '{0}: the procedure failed to draw ({1}).',
    msgSoftwareAdapter: 'The WebGPU adapter is a software one ({0}): the drawings are right, the times are the processor\'s.',
    msgNoStop: 'Negative control: procedures keep drawing after their picture (nostop=1).',
    msgSoundBlocked: 'The sound is loaded and decodes; this page does not play it.',
    msgOtherExtension: 'This scene names its procedures with {0}, which this player does not know. It reads {1}. The textures show their pictures alone.',
    msgFormatVersion: 'This scene\'s {0} object says version {1}; this player knows version {2}. The textures show their pictures alone.',
    msgSceneElsewhere: 'The scene at {0} is on another site: this page loads scenes from its own site only.',
    msgScriptNotRun: 'This scene lies outside the page\'s own folder, so its script is not run.',
    msgNoServerLink: 'No link server answers at this address, so the local server\'s link cannot be used here. Restart with the link simulated in this page.',
    msgOwnSpeed: 'The pictures came at {0}, below the chosen {1}: your own connection or this device was the slower one.',
    msgLanguageFailed: 'The text for {0} did not load; the page stays in {1}.',
    msgHidden: 'This tab was hidden for {0}. A browser wakes a hidden page only from time to time (once a second, later once a minute), so the bytes came in lumps at the same average speed.',
    presetDialup: 'dial-up',
    presetIsdn: 'ISDN',
    presetDsl: 'DSL',
    presetCable: 'cable',
    presetMobile: '4G',
    presetFibre: 'fibre',
    presetNone: 'no limit (your own connection)',
    presetNoneServer: 'no limit (this machine)',
  },
};

let lang = 'en';
export const language = () => lang;
export const languageTag = (l = lang) => (LANGS.find((x) => x[0] === l) || LANGS[0])[2];

// The language for this visitor: the whole tag first, then the bare language, then English; Chinese keeps its script
// (Traditional for Taiwan, Hong Kong, Macao and zh-Hant; Simplified otherwise).
export function pickLanguage(wanted) {
  for (const raw of wanted) {
    if (!raw) continue;
    const tag = String(raw).replace('_', '-');
    const [l, ...rest] = tag.split('-');
    const lower = l.toLowerCase(), sub = rest.map((x) => x.toLowerCase());
    if (lower === 'zh') return sub.some((x) => ['tw', 'hk', 'mo', 'hant'].includes(x)) ? 'zh_TW' : 'zh_CN';
    if (lower === 'pt') return 'pt_BR';
    const exact = LANGS.find((x) => x[0].toLowerCase() === tag.toLowerCase().replace('-', '_'));
    if (exact) return exact[0];
    const bare = LANGS.find((x) => x[0] === lower);
    if (bare) return bare[0];
  }
  return 'en';
}

// Load a language's table (English is here already); a table that does not load leaves the page in English and
// the caller says so.
export async function setLanguage(l) {
  if (!LANGS.some((x) => x[0] === l)) l = 'en';
  if (!STRINGS[l]) {
    const m = await import(`./lang/${l}.js`);
    STRINGS[l] = m.default;
  }
  lang = l;
}

export function t(key, ...args) {
  const s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  return s.replace(/\{(\d+)\}/g, (_, i) => String(args[+i]));
}
