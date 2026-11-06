# Explainers: one idea each

**Status:** individual input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos; each explainer carries its own date.
They are not decisions or reports of the group.
Comments and objections are welcome in this repository's issues.

An explainer here is one page for one idea: the question it answers in the reader's own words, the idea with the names it already has and where they come from, where it exists today with its status said plainly, the earlier work it builds on, and what a reader can try or discuss.
The form follows W3C's [Writing Effective Explainers](https://www.w3.org/TR/explainer-explainer/): the end user's need first, plain words, the proposal, the alternatives and the history, deep links.
Pictures carry a text alternative.
Where a group adopts an explainer, it becomes the group's draft and its status line changes; until then every page is one participant's input ([A label for individual input](individual-input.md)).

## Stereo 3D, from the eyes to the screen

| Explainer | What it answers | For whom |
|---|---|---|
| [Stereo 3D: two views, one depth](stereo-3d.md) | What a stereo picture is, how parallax makes depth, and the names the formats use | anyone; start here |
| [Every stereo display shows the same two views](stereo-displays.md) | How 3D TVs and projectors, headsets, glasses-free displays, red and cyan glasses and a 2D monitor each show the same pair | anyone who owns a screen |
| [VR is stereo](vr-is-stereo.md) | Why a headset is a stereo display with head tracking, and how the same two eyes reach a 3D TV | VR people, game people |
| [One format inside, every output a filter](one-format-inside.md) | Why programs hand over one format and the outputs convert it, and why that format is full side by side at any resolution | program, driver and standards people |
| [Depth on a desktop and on a page](depth-sunk-screen-popped.md) | Sunk, screen and popped; the person's limits per display; the edge rule | theme, toolkit and CSS people |
| [Centimetres, pixels and where a model sits in depth](centimetres-and-model-depth.md) | The WebKit threads #147 and #163: a model's size, its rendering resolution and its place in depth are three things; why a centimetre of depth cannot mean the same on every screen; overlap and readability | CSS and spatial-web people |
| [The stereo mark exists, and the web drops it](stereo-mark-on-the-web.md) | Where the mark lives in files, where browsers lose it, and six steps that keep today's behaviour | browser and media people |
| [HDR and 3D: the same road](hdr-same-road.md) | Two properties of a picture, one problem: the description must travel to the place that knows the screen | media people |

## Knowledge, people and AI

| Explainer | What it answers | For whom |
|---|---|---|
| [Knowledge stored once: from form to meaning](knowledge-stored-once.md) | The group's own idea, and the font file as the stepping stone that already scales | newcomers to PM-KR |
| [One truth, two interfaces](one-truth-two-interfaces.md) | One source presented to people and to machines, with Lean Code as the running example | developers |
| [Skills are procedural memory](skills-as-procedural-memory.md) | The skill files people and AI follow alike, and why they are the group's subject | anyone who works with AI partners |
| [Synthetic User](synthetic-user.md) | An AI that acts as a declared, delegated user, credited by roles (31 October 2026) | web and policy people |
| [Provenance by roles](provenance-by-roles.md) | Record the tools' part by CRediT role without giving them standing; one disclosure form | standards and policy people |
| [AI for access and language](ai-for-access-and-language.md) | Accessibility tools welcome by default; language help is not substance | everyone who writes in a second language |
| [Review the contribution, not the tool](review-the-contribution.md) | Rules written about reviewability and understanding, not about the tool | maintainers and reviewers |
| [Measure energy per finished task](energy-per-finished-task.md) | What to count if a body weighs the energy cost of AI in its work | policy people |
| [Models that check each other](models-that-check-each-other.md) | Multi-Vibe Code In Chain: several models, a person who decides, a log | anyone who works with AI partners |

## How a Community Group works

| Explainer | What it answers | For whom |
|---|---|---|
| [The group's rules in its repository](rules-in-the-repository.md) | respec-mcp: profiles, checks and skills a reviewer can read without an AI account | chairs and editors |
| [A label for individual input](individual-input.md) | The three-line status that keeps the group's name off what it has not decided | chairs and participants |
| [Tools for a small Community Group](community-group-tools.md) | Activity where the group works, decisions recorded in the meeting, a stepping stone in three lines | chairs |
| [A need that crosses groups](needs-that-cross-groups.md) | Who owns a need that no single group holds, and a path between groups through their chairs | anyone with such a need |
| [Take evidence with the need](evidence-with-the-need.md) | The need, the workaround and a live page that shows it | people raising a need |
| [Evidence beyond the browser](evidence-beyond-the-browser.md) | What a status display should show for work whose evidence is not an origin trial | the CG program |
| [One idea, one name](connected-vocabularies.md) | A glossary that reuses names, and a connected registry with SKOS and PROV | editors |
| [What it costs to follow every clause](every-clause-costs.md) | The paid texts, their free twins, and what that means for a group | everyone who reads specifications |

## The Web of Worlds

| Explainer | What it answers | For whom |
|---|---|---|
| [The same content on the screens people own](screens-people-own.md) | A world or a stereo page on the devices people already have | spatial-web people |
| [Places with no location](places-with-no-location.md) | Why a spatial web that discovers by location alone leaves most places out | spatial-web people |
| [Doors and addresses inside a world](doors-and-addresses.md) | Houses, doors, k3d links, X3D viewpoints and fragment identifiers | world and format people |
| [Finding, moving and receiving a world](spatial-roaming-network.md) | The Spatial Roaming Network: cells, irradiators, handover, roaming, edge delivery | network and world people |
| [Federated WebXR inside a spatial engine](federated-webxr.md) | Each WebXR page as a branch of an engine's scene, isolation kept | engine and browser people |
| [The knowledge layer](knowledge-layer.md) | What a scene graph does not say: what things are, what they do, where that knowledge came from | world and AI people |
| [Actionable knowledge representation](actionable-knowledge-representation.md) | An object that shows what it does, where it is; games did it first | interface and AI people |
| [Procedures first, the image last](dpfr.md) | Dynamic Procedural Foveated Rendering, a proposal for assets that arrive before their images | asset and engine people |
| [Where the work belongs](web-of-worlds-task-force.md) | A Web of Worlds Task Force inside and outside W3C, and the map of groups | everyone in the workshop's scope |

The dated inputs these explainers draw on are in [talks/](../talks/), the names in the [glossary](../glossary/README.md), and the longer arguments in the [reports](../reports/README.md).

AI partners were leveraged in the production of this work.
