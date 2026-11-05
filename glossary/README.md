<!-- Input to the PM-KR Community Group from an individual participant. Not a work item or output of the group. -->
> **Status:** input from an individual participant, Daniel Campos Ramos, to the PM-KR Community Group (Procedural Memory Knowledge Representation, a W3C Community Group), 4 November 2026. It answers the vocabulary questions raised in the [Community Group tools input](../talks/2026-10-28-tpac-cg-redesign/README.md) (points 9 and 10): where a term was defined, by whom, and under which name in each technology. It is not a work item or output of the group. Licence: CC BY 4.0.

# Glossary: one idea, one name, across every technology

**For** people who meet the same idea under different names in different specifications, and for the people who write those specifications: each entry gives one idea, the one name this group's work uses for it, the name every specification gives it with its clause, the group that owns each specification, where to get its text, and the status of every name.

## Why one name

The aim behind this page is interoperability on any hardware.
A stereo picture, a depth, a procedure or a world mean the same thing in a file, a scene, a web page and a desktop only when every one of them names the idea the same way.
Then a device that speaks one of them speaks all of them, and no vendor's stack is needed in between.
That can only come from shared things: open specifications, open registries and open code, never from closed doors.
So no entry here invents a second name for an idea that already has one.
Where a specification already names the idea, that name is quoted with its clause.
Where no specification names it, the entry says so and marks the name as a proposal, with the place it was proposed.

## How to read an entry

- **Idea.** What the thing is, in plain words.
- **Shared name.** The one name used across the group's reports, the talks and the implementations.
- **In the specifications.** Each specification's own name for the idea, with its clause and page where known, the body that owns the text, and where to get it.
- **Status.** One of: a published standard, with its edition and year; a registry assignment, with its date; a draft in a group, with its link; a proposal, with where it was proposed.
- **Our reading.** A meaning that no clause states, marked so a reader can tell it from the text of a standard.

Clause numbers were read in the texts named in [Where the texts come from](#where-the-texts-come-from).
A clause from a paid text that could not be read is marked "not read here".

## Contents

1. [Knowledge stored once: PM-KR's own terms](#1-knowledge-stored-once-pm-krs-own-terms)
2. [Standards process words](#2-standards-process-words)
3. [The Web of Worlds](#3-the-web-of-worlds)
4. [Stereo pictures: views, layouts and eye order](#4-stereo-pictures-views-layouts-and-eye-order)
5. [Depth](#5-depth)
6. [Presentation: the contract, the declaration and the displays](#6-presentation-the-contract-the-declaration-and-the-displays)
7. [Colour and HDR](#7-colour-and-hdr)
8. [Files, containers, streams and APIs](#8-files-containers-streams-and-apis)
9. [Registries](#9-registries)
10. [The bodies and groups, and where to get their texts](#10-the-bodies-and-groups-and-where-to-get-their-texts)
11. [Where the texts come from](#where-the-texts-come-from)
12. [Credits](#credits)

## 1. Knowledge stored once: PM-KR's own terms

### Procedural Memory Knowledge Representation (PM-KR)

**Idea.** Knowledge stored once, as procedures with explicit meaning and provenance, that people and AI both read.
A lesson about a pulley may exist as a diagram, a simulation, text, an accessibility description and an AI-facing form; PM-KR asks which parts can share one canonical source and how meaning and provenance survive between them ([the group's README](../README.md#the-user-facing-problem)).

**Shared name.** PM-KR, the name of the [W3C Community Group](https://www.w3.org/community/pm-kr/), open since February 2026, chaired by Daniel Campos Ramos and co-chaired by Milton Ponson.

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| [PM-KR Community Group](https://www.w3.org/community/pm-kr/), W3C | Procedural Memory Knowledge Representation | a Community Group, open participation, no fee |
| [Canonical Procedural Knowledge Interoperability Report](../reports/source/pm-kr-standards-track-transition-report.html) | "a procedural, reference-preserving knowledge representation in which canonical knowledge can be stored once, linked compositionally across layers, and consumed consistently by both humans and machines" | a draft Community Group report (CG-DRAFT); a proposed standards path, not an approved transition |
| Knowledge3D, [PROCEDURAL_MEMORY_KR_STANDARD_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/PROCEDURAL_MEMORY_KR_STANDARD_SPECIFICATION.md) | "a procedural-first, compression-aware knowledge representation model where knowledge is stored as executable programs plus symlinked references from form to meaning" (19 February 2026) | a candidate specification of the reference implementation; the design, not the group's deliverable |

**Status.** A Community Group and its draft report.
Not a W3C standard, and the README says so.

### Procedure

**Idea.** An executable form of a piece of knowledge, with its inputs, execution context, outputs and provenance inspectable ([Goals](../README.md#goals)).

**Shared name.** Procedure.

**In the specifications.**

| Where | Its name | Owner | Text |
|---|---|---|---|
| Knowledge3D vocabulary | RPN program (a procedure in reverse Polish notation), one implementation approach ([Proposed approach](../README.md#proposed-approach)) | Daniel Campos Ramos | [public repository](https://github.com/danielcamposramos/Knowledge3D), CC BY 4.0 documentation |
| ISO 17469-1:2015, Strategy Markup Language (StratML) Part 1 | a plan in machine-readable XML; named by Milton Ponson on the group's list as the way to turn natural-language plans into machine-readable form ([Stepping stones, point 5](../talks/2026-11-03-stepping-stones/README.md#5-procedures-people-write-machines-execute)) | ISO/TC 171/SC 2 | [ISO Online Browsing Platform](https://www.iso.org/obp/ui/#iso:std:iso:17469:-1:ed-1:v1:en), paid |
| the group's list | "formal procedures often written in natural language" (Dave Raggett, same thread) | | [public-pm-kr archive](https://lists.w3.org/Archives/Public/public-pm-kr/) |

**Status.** A group concept under discussion; StratML is a published ISO standard.

### Knowledge entry, knowledge node

**Idea.** The smallest unit that carries a meaning, its procedures and its provenance, with a stable identifier, so two clients can refer to the same thing.

**Shared name.** Node.

**In the specifications.**

| Where | Its name | Clause | Owner | Text |
|---|---|---|---|---|
| Knowledge3D | K3D Node, "the atomic unit of spatial knowledge representation" | [K3D_NODE_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/K3D_NODE_SPECIFICATION.md), Abstract | Daniel Campos Ramos | public, CC BY 4.0 |
| Transition report | "minimal node contract, stable identifiers, and conformance profiles" | [Candidate normative core](../reports/source/pm-kr-standards-track-transition-report.html) | PM-KR CG | public |
| glTF, the K3D data description | a glTF node carries a K3D id (`extras.k3dId`), or a sidecar `.k3d` file through the `K3D_nodes` extension | [glTF_K3D_extension.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/spec/glTF_K3D_extension.md) | Daniel Campos Ramos | draft, public |
| glTF 2.0 | `node`: a hierarchy element with a transform, a mesh, a camera or children | [glTF 2.0 specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html), section 3.5 Nodes and Hierarchy | Khronos 3D Formats Working Group | free |
| X3D 4.0, ISO/IEC 19775-1:2023 | node: the scene graph element, each with a type and fields | [Architecture, Part 1](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/Architecture.html) | Web3D Consortium and ISO/IEC JTC 1/SC 24 | free on web3d.org |
| Web of Worlds session | a minimal node structure "with identity, transform, hierarchy and semantic role" | [the session invitation](https://lists.w3.org/Archives/Public/public-immersive-web/2026Oct/0010.html) | Metaverse Standards Forum and the Immersive Web groups | public |
| RDF | resource, named by an IRI | [RDF 1.1 Concepts](https://www.w3.org/TR/rdf11-concepts/) | W3C RDF & SPARQL Working Group | free |

**Status.** A shared idea; the K3D node is a design, the glTF and X3D nodes are published, the Web of Worlds node is a session question.

### The four layers: Form, Meaning, Rules, Meta-Rules

**Idea.** Knowledge layered as its form (the glyph, the surface), its meaning (the concept), the rules that act on it and the rules about those rules.
A semantic model comes first, and procedures are added on top of it as they are understood ([Stepping stones, point 2](../talks/2026-11-03-stepping-stones/README.md#2-semantic-models-first-procedures-after)).

**Shared name.** Form, Meaning, Rules and Meta-Rules.

**In the specifications.**

| Where | Its name | Clause | Status |
|---|---|---|---|
| Knowledge3D | "the 4-layer knowledge representation (Form → Meaning → Rules → Meta-Rules)" | [FOUNDATIONAL_KNOWLEDGE_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/FOUNDATIONAL_KNOWLEDGE_SPECIFICATION.md), Abstract | design; the current code does not implement it |
| Transition report | "The four-layer model: Form, Meaning, Rules, and Meta-Rules", first item of the candidate normative core | [Candidate normative core](../reports/source/pm-kr-standards-track-transition-report.html) | CG-DRAFT |
| Knowledge3D | the Knowledge Proceduralizer converts a source into "symlink-first knowledge packets" that follow the four layers, at ingestion time, outside the runtime | [KNOWLEDGE_PROCEDURALIZER_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/KNOWLEDGE_PROCEDURALIZER_SPECIFICATION.md), section 1 | design |

**Status.** The group's candidate normative core; a design in the reference implementation.

### Canonical content and references

**Idea.** A concept is stored once and reused through stable references from rules and interfaces, instead of being copied into every place that needs it.

**Shared name.** Canonical content, with references.

**In the specifications.**

| Where | Its name | Clause | Status |
|---|---|---|---|
| Transition report | "Canonicality and reference-preservation invariants" | [Candidate normative core](../reports/source/pm-kr-standards-track-transition-report.html) | CG-DRAFT |
| Knowledge3D | the symlink pattern, "referencing existing symbols instead of duplicating"; the Save Information Principle | [FOUNDATIONAL_KNOWLEDGE_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/FOUNDATIONAL_KNOWLEDGE_SPECIFICATION.md), Abstract | design |
| Knowledge3D | Canonical Registry: one stable identifier per canonical object, "meaning-first, not string-first" | [CANONICAL_REGISTRY_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/CANONICAL_REGISTRY_SPECIFICATION.md), section 1.1 | design |
| Knowledge3D | Meaning-Centric Star: "a star represents a concept, not a word", language forms are references to it | [MEANING_CENTRIC_STAR_SCHEMA_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/MEANING_CENTRIC_STAR_SCHEMA_SPECIFICATION.md), Abstract | design |
| Linked Data | "Use URIs as names for things", "Include links to other URIs", Tim Berners-Lee's four rules of 2006, quoted by the Web of Worlds whitepaper, section 4.1 | [Linked Data design issues](https://www.w3.org/DesignIssues/LinkedData.html) | published note |
| RDF, OWL, JSON-LD | the existing ways to describe shared meaning and relationships, which PM-KR does not replace ([Non-goals](../README.md#non-goals)) | [RDF 1.1](https://www.w3.org/TR/rdf11-concepts/), [OWL 2](https://www.w3.org/TR/owl2-overview/), [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/) | W3C Recommendations |

### Dual-client equivalence

**Idea.** One truth, two interfaces: a person and an AI read the same knowledge node, each through its own presentation, without losing information on the way.

**Shared name.** Dual-client equivalence.

**In the specifications.**

| Where | Its name | Clause | Status |
|---|---|---|---|
| Transition report | "Dual-client equivalence requirements for shared node identity" | [Candidate normative core](../reports/source/pm-kr-standards-track-transition-report.html) | CG-DRAFT |
| Knowledge3D | Dual-Client Contract: "both clients operate on identical knowledge data", humans through 3D navigation, AI through vectors | [DUAL_CLIENT_CONTRACT_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/DUAL_CLIENT_CONTRACT_SPECIFICATION.md), Abstract | design |
| Sparky Stereo OS, Lean Code | every text file a package ships has two forms: the authored form people read and the lean form the machine reads, recorded against each other, the original always restorable | [Lean Code packages](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/lean-code-packages.md) | shipped and measured ([the measurement](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/lean-code-a10-aba.md)) |

**Status.** The group's candidate requirement; one running example at the scale of an operating system ([Stepping stones, point 1](../talks/2026-11-03-stepping-stones/README.md#1-one-truth-two-interfaces)).

### Lean Code

**Idea.** Prepare the machine's form ahead of consumption, as pre-rendering does, while keeping the complete human-authored source available.

**Shared name.** Lean Code.

**In the specifications.**

| Term | Meaning | Where |
|---|---|---|
| authored form | the text people read, with every comment and explanation | [Lean Code packages](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/lean-code-packages.md) |
| lean form | the text the machine reads, projected from the authored form and checked against its consumer | same page |
| `lc1` | the first format of the mark a processed package carries, in the control field `Sparky-Lean-Code: lc1 <manifest SHA-256>`, so clients do not repeat the projection | same page, "Package contract" |
| HR package | the `<package>-lc-hr` companion that holds the full authored text of the changed files, at the same version | same page, "Configuration, documentation and debugging" |
| the resolver | `dpkg-stereo --resolve` maps a location in lean code back to the authored source by the line's content, and reports what it cannot resolve instead of guessing | same page |

**Status.** Shipped in the edition's packages; a release rule since 18 October 2026.
Offered to the group as a stepping stone, not as a specification.

### Provenance

**Idea.** Who did what, recorded so that a person and an AI client can check it, with credit given by role.

**Shared name.** Provenance by roles.

**In the specifications.**

| Where | Its name | Clause | Owner | Text |
|---|---|---|---|---|
| ANSI/NISO Z39.104-2022 | CRediT, the Contributor Roles Taxonomy: fourteen roles such as Conceptualization, Software, Validation, Writing | [credit.niso.org](https://credit.niso.org/) | NISO | free |
| Sparky Stereo OS | people and AI partners credited by CRediT role and one disclosure line, "human-like provenance, not human-like status" | [ai-provenance.md](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/ai-provenance.md); [AI skills input, point 4](../talks/2026-10-28-tpac-ai-skill-review/README.md#4-roles-in-the-record-responsibility-with-me) | Daniel Campos Ramos | public |
| PROV-O | the W3C ontology for provenance: entities, activities, agents, with time | [PROV-O](https://www.w3.org/TR/prov-o/) | W3C Recommendation, 2013 | free |
| Transition report | "Deterministic reconstruction and provenance expectations"; lineage and reconstruction metadata | [Candidate normative core](../reports/source/pm-kr-standards-track-transition-report.html) | PM-KR CG | public |

**Status.** CRediT and PROV-O are published; the group's requirement is a draft.

### Synthetic User

**Idea.** An AI that works through a profile like a person's account, on the web as it already is: declared as synthetic, delegated on demand under a mandate like a power of attorney, bounded and revocable, autonomous only inside an institution that answers for it, and credited by CRediT roles.

**Shared name.** Synthetic User.

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| [Synthetic User explainer](../explainers/synthetic-user.md), 31 October 2026 | the five properties above, and three questions for the group | individual input |
| Knowledge3D | "AI accounts = user accounts"; the House, Galaxy and Tablet design gives Synthetic Users accounts like any user's | design, paused reference implementation |
| Web of Worlds minutes, 30 October 2026 | "I think there should also be a type of synthetic user (e.g. AI). This would give agents a user-like identity." ([minutes](https://www.w3.org/2026/10/30-spatial-web-msf-minutes.html), User Manifest) | recorded in a breakout |
| W3C, "W3C and the State of the Web in the AI Era", 21 October 2026 | recommends an Agentic Web Working Group with scope for agent identity and delegation; the model is offered as input there when that work starts | W3C paper |
| Metaverse Standards Forum | User Manifest: what a user shares when moving between experiences (see [User manifest](#user-manifest-and-universal-manifest)) | whitepaper and API drafts |

**Status.** A proposal; no new protocol is asked for, since accounts, sign-in, permissions and delegation already exist on the web.

### Knowledge3D's places: House, Galaxy, Door, Tablet

**Idea.** Knowledge in space: a place where people and AI share one explicit memory of the world.
Knowledge3D is the group's reference implementation, now paused: the model, not the specification.

**Shared names and their definitions, from the public specifications.**

| Term | Definition | Where |
|---|---|---|
| House | persistent memory, the "external shared 3D reality where humans AND AI cohabit. Rooms are knowledge domains. Doors are network interfaces." | [THREE_BRAIN_SYSTEM_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/THREE_BRAIN_SYSTEM_SPECIFICATION.md), Abstract |
| Galaxy | active memory, "what happens INSIDE the avatar's head", the working set loaded for reasoning | same |
| Cranium | reasoning and learning; with Galaxy and House, the Three-Brain System | same |
| Door | "both a 3D object and a networking interface", with an address `k3d://rx,ry,rz:port@x,y,z?label=...` | [DOORS_AND_NETWORK.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/DOORS_AND_NETWORK.md) |
| Memory Tablet | "the common interactive surface through which both humans and AI navigate, manipulate, and create knowledge", a 3D object carried through the space | [MEMORY_TABLET_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/MEMORY_TABLET_SPECIFICATION.md), Abstract |
| Museum | cold storage of superseded artifacts, for retrospection and audit | [HOUSE_GALAXY_TABLET.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/HOUSE_GALAXY_TABLET.md) |
| SleepTime | consolidation from Galaxy to House during idle time | [SLEEPTIME_PROTOCOL_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/SLEEPTIME_PROTOCOL_SPECIFICATION.md), Abstract |
| sovereign boundary | the separation of offline ingestion from runtime use, kept in the transition report as an architectural contract without standardizing one runtime | [Candidate normative core](../reports/source/pm-kr-standards-track-transition-report.html) |
| semantic gravity cohered by meaning | Christoph Dorn's term for how loaded concepts organize themselves in the Galaxy ([Participant snapshot](../README.md#participant-snapshot-march-2026)) | [MEANING_CENTRIC_STAR_SCHEMA_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/MEANING_CENTRIC_STAR_SCHEMA_SPECIFICATION.md) |
| Spatial General Intelligence (SGI), Superhuman General Intelligence (SHGI) | the long-range framing, listed by the transition report as informative material, not as normative | [Candidate informative material](../reports/source/pm-kr-standards-track-transition-report.html) |

**Status.** Design documents of one implementation, CC BY 4.0; the transition report keeps the runtime and the spatial patterns informative.

### Actionable knowledge representation

**Idea.** An object that shows what it is and what it does, where it is.
Games have done it for years: Dead Space's holograms show "the status of doors (locked/unlocked), what items that can be picked up and what they will do".

**Shared name.** Actionable knowledge representation.

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| Fagerholt and Lorentzon, "Beyond the HUD", Chalmers with EA DICE, 2009 | the game interface taxonomy: diegetic, non-diegetic, spatial and meta elements ([PDF](https://publications.lib.chalmers.se/records/fulltext/111921.pdf)) | published thesis |
| [Spatial browsing input, point 3](../talks/2026-10-28-tpac-spatial-browser/README.md#3-service-discovery-beyond-location) | "game interfaces already represent actionable knowledge" | individual input |

## 2. Standards process words

These words say what each document here is, and what it is not.

| Term | Meaning | Where it is defined |
|---|---|---|
| Community Group (CG) | an open W3C group anyone may join at no fee; it incubates and may publish Community Group Reports, which are not standards | [W3C Community and Business Groups](https://www.w3.org/community/) |
| Community Group Report, draft and final | a report of a CG; a Final Report invites Final Specification Agreement commitments, which keep the IPR continuity a later Working Group needs | [CG report requirements](https://www.w3.org/community/reports/reqs/); [CG transition guidance](https://www.w3.org/guide/process/cg-transition.html) |
| individual input | a document a participant offers to a group, which the group has not adopted; every page in `talks/`, the two stereo reports and this glossary carry that label | [Community Group tools input, point 4](../talks/2026-10-28-tpac-cg-redesign/README.md#4-a-label-for-individual-input) |
| Working Group (WG), Interest Group (IG) | W3C groups under the Process; a WG publishes on the Recommendation Track, an IG discusses and coordinates | [W3C Process Document](https://www.w3.org/policies/process/) |
| Recommendation Track | the path from Working Draft to Candidate Recommendation to Recommendation | same |
| horizontal review | review across accessibility, internationalization, privacy and security | [W3C document review guide](https://www.w3.org/Guide/documentreview/) |
| task force | a group of participants a Chair forms "to carry out assignments for the group", within its charter; the form proposed for the Web of Worlds | [W3C Process Document](https://www.w3.org/policies/process/), section 3.4.1 |
| registry assignment | a value recorded by a registry under a stated procedure; it names a thing, and proves neither an implementation nor an adoption | [RFC 8126](https://www.rfc-editor.org/rfc/rfc8126), the IANA registration policies |
| Ethical Web Principles | the values the W3C holds as a Statement since December 2024 | [W3C Statement](https://www.w3.org/TR/ethical-web-principles/) |
| respec-mcp | the tool that runs ReSpec with each group's own rules, through repository checks, a local command and MCP; a passing result covers the configured checks and validates neither consensus nor technical claims | [respec-mcp](https://github.com/danielcamposramos/respec-mcp); [Open source program input](../talks/2026-10-28-tpac-open-source-program/README.md) |
| Webref | the collection of definitions from browser specifications, which connects a term to the specification that defines it | [w3c/webref](https://github.com/w3c/webref) |
| SKOS, PROV-O | the W3C vocabularies proposed for a connected registry of terms with their origins and dates ([point 10](../talks/2026-10-28-tpac-cg-redesign/README.md#10-connected-vocabularies-with-their-history)) | [SKOS](https://www.w3.org/TR/skos-reference/), [PROV-O](https://www.w3.org/TR/prov-o/) |

## 3. The Web of Worlds

### Web of Worlds

**Idea.** "A platform made up of many addressable, linked spatial experiences (i.e., virtual worlds) that are interconnected, much like today's websites form the open World Wide Web" (the whitepaper's abstract).

**Shared name.** Web of Worlds (WoW).

**In the specifications.**

| Where | What it holds | Status |
|---|---|---|
| [The Web of Worlds Whitepaper](https://webofworlds.github.io/initial_MSF_Whitepaper/gen/MSF-3DWebInterop_WoWWhitepaper.pdf), Metaverse Standards Forum, 3D Web Interoperability Domain Group, 31 March 2026, by Nicholas Polys, Johannes Behr and Tracey Swales | the use cases (Hello Metaverse, Metaverse Bookmarks, Portable Personal Content and more, section 2.2), the requirements (2.3), the gap analysis and the core building blocks (4.1) | a whitepaper of the Forum's domain group |
| [WoWAPI](https://github.com/WebOfWorlds/WoWAPI) | the proposed architecture, with the Open Spatial World API, the Open User Manifest API and the Open Spatial Asset API | drafts on GitHub |
| [TPAC 2026 breakout #35](https://github.com/w3c/tpac2026-breakouts/issues/35), 30 October 2026, chaired by Muadh Al Kalbani | the session's six topics: the meaning of "here", composition and origins, what the browser must understand, user manifest, AI-centric immersive web, next steps ([minutes](https://www.w3.org/2026/10/30-spatial-web-msf-minutes.html)) | public minutes, draft |
| [A Web of Worlds: eight points for the knowledge layer](../talks/2026-10-30-tpac-web-of-worlds/README.md) | the knowledge layer's answers, and the map of groups below | individual input |

**Status.** A Forum whitepaper and a W3C breakout; the room's next step is a two-day workshop co-organised by W3C, the Metaverse Standards Forum and Khronos, starting with a program committee on its scope (Dave Raggett's proposal in the minutes).

### World, door, link

**Idea.** The web's analogies, reversed: a page becomes a world, a link a door, a URL an address inside the space ("let's reuse the analogies the web already has", Daniel in the minutes).

**Shared names.** World; door.

**In the specifications.**

| Where | Its name | Clause | Status |
|---|---|---|---|
| Web of Worlds | portal: "an object with a spatial identifier in your world", linking to a spatial part of another world (Johannes, in the minutes) | [minutes](https://www.w3.org/2026/10/30-spatial-web-msf-minutes.html) | session record |
| Knowledge3D | door: a 3D object with an address bar, resolved to a route in the current House or to another House | [DOORS_AND_NETWORK.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/DOORS_AND_NETWORK.md) | design |
| X3D 4.0 | the `Anchor` node, clause 9.4.1: "retrieves the content of a URL when the user activates" its geometry, loading another world or binding a viewpoint | [Networking component](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/networking.html#Anchor), ISO/IEC 19775-1:2023 | published standard |
| OMI (W3C Metaverse Interoperability CG) | `OMI_link`: world traversal behaviour on a glTF node, optionally on an `OMI_physics_body` trigger the visitor walks into | [OMI_link](https://github.com/omigroup/gltf-extensions/tree/main/extensions/2.0/Archived/OMI_link) | draft, archived in March 2026: a useful door needs more than a link |
| the web | a hyperlink, an address | [HTML Living Standard](https://html.spec.whatwg.org/multipage/links.html) | published |

**Our reading.** "Portal" and "door" name the same idea; this page uses "door" for the knowledge layer and keeps "portal" where the Forum's texts use it.

### Address inside a world

**Idea.** A link that takes a person to the object or viewpoint they meant to reach, not only to a world's entrance.

**Shared name.** Address inside a world.

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| Web of Worlds whitepaper, section 2.2 ii | Metaverse Bookmarks: addresses that "capture spatial coordinates, viewpoints, and even temporal states" | use case |
| Web of Worlds session | 3D fragment identifiers, "addressing, linking to, parts of immersive experiences" | session topic |
| Knowledge3D | the `k3d://` address: `rx,ry,rz` routing hint, `port`, `x,y,z` spatial destination, `label` | [DOORS_AND_NETWORK.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/DOORS_AND_NETWORK.md), since September 2025 |
| X3D 4.0 | a URL ending in `#ViewpointName` binds the `Viewpoint` of that name: "the Viewpoint node with the given name (\"ViewpointName\") in the Anchor's run-time name scope(s) shall be bound" | [Networking component, 9.4.1](https://www.web3d.org/documents/specifications/19775-1/V4.0/Part01/components/networking.html#Anchor) |
| Dave Raggett, in the minutes | "That (e.g. a room) could be addressed by its path"; spatial, semantic and temporal indexing | session record |

**Status.** Open: the session's follow-up workshop is where these are to be compared.

### "Here": reference space, place and pose

**Idea.** How a local coordinate space inside an experience is tied to a place in the world, and how a coordinate says whether it is physical or virtual.

**Shared names.** Reference space (inside an experience); place (in the world); pose.

**In the specifications.**

| Where | Its name | Owner | Text |
|---|---|---|---|
| WebXR Device API | `XRReferenceSpace`: the coordinate system a session draws in | [W3C Immersive Web WG](https://www.w3.org/TR/webxr/) | free |
| Geolocation API | the user's position on Earth | [W3C](https://www.w3.org/TR/geolocation/) | free |
| OGC GeoPose 1.0 | a position and orientation on Earth, in a standard frame | [OGC](https://www.ogc.org/standards/geopose/) | free |
| Open AR Cloud | OSCP spatial service discovery by location, with H3 cells | [OSCP](https://github.com/OpenArCloud/oscp-spatial-service-discovery) | open source |
| the minutes | "the physical world could be one world as any other", with the coordinate system saying which (François Daoust) | [minutes](https://www.w3.org/2026/10/30-spatial-web-msf-minutes.html) | session record |

**Status.** Published APIs on each side; the bridge between them is the session's gap.

### Composition model and semantic role

**Idea.** The minimal shared structure that lets one experience refer to another's objects: an identity, a transform, a hierarchy and a semantic role per node, light enough to be JSON-LD.

**Shared name.** Composition model.

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| Web of Worlds session | "Does the web need a minimal shared spatial composition model?"; "it could be JSON-LD that defines how the structure looks" (Johannes); the user agent as intermediary for privacy, security and accessibility (François Daoust) | session record |
| Knowledge3D | each node carries meaning, procedures and provenance; the K3D node design compared with the Forum's node model in [point 1](../talks/2026-10-30-tpac-web-of-worlds/README.md#1-semantic-role-is-where-the-knowledge-layer-starts) | individual input |
| X3D 4.0 | the scene graph, with a semantic encoding: "you can express any scene graph in X3D as triples" (Don Brutzman, in the minutes); the [X3D Ontology](https://www.web3d.org/x3d/content/semantics/semantics.html) | published |
| Immersive Web CG | the [`<model>` element](https://immersiveweb.dev/model): a 3D model rendered by the browser | CG work |
| WICG | [cross-origin storage](https://github.com/WICG/cross-origin-storage), which lets a page pull resources from several origins (Dave Raggett, in the minutes) | incubation |
| XR Accessibility User Requirements | what a user agent needs to understand to give access | [XAUR](https://www.w3.org/TR/xaur/), W3C | published note |

### User manifest and universal manifest

**Idea.** A small profile that says what a person wants to share with an experience when moving between worlds, and a generic manifest that can describe any resource.

**Shared names.** User manifest; universal manifest.

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| Metaverse Standards Forum | User Manifest, "a small profile that links to other things" (the session); Open User Manifest API in [WoWAPI](https://github.com/WebOfWorlds/WoWAPI) | drafts |
| [Universal Manifest](https://universalmanifest.net/standards/) | a generic manifest for any kind of data, with a decentralized resolver (Johannes, in the minutes) | Forum work |
| W3C | [Decentralized Identifiers (DID)](https://www.w3.org/TR/did-core/), [Verifiable Credentials](https://www.w3.org/TR/vc-data-model-2.0/), [Controlled Identifiers 1.0](https://www.w3.org/TR/cid-1.0/) (named by elf Pavlik as the baseline Linked Web Storage uses) | Recommendations and drafts |
| the explainer | the Synthetic User's declaration and mandate, which a site should be able to read | individual input |

### Spatial Roaming Network (SRN)

**Idea.** A cellular model for finding places, moving between them and receiving their content near the visitor, for physical places and for places inside virtual worlds.

**Shared name.** Spatial Roaming Network; in Portuguese, Rede de Roaming Espacial.
Named by Daniel Campos Ramos on 28 October 2026.

**Its terms**, from the [proposal page](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/spatial-roaming-network.md).

| Term | Meaning | The established technique it builds on |
|---|---|---|
| cell | an area in which a visitor can discover services, content, people and doors | cellular networks; H3 for real cells |
| real cell, virtual cell | a physical place, or a logical place inside a world with no location on Earth | Open AR Cloud's OSCP; game hubs |
| network | a set of cells managed by one publisher, connected to other publishers' cells | federated maps (Bharadwaj, Rowe and Seshan, HotOS 2025) |
| irradiator | a software role that announces the services, content, people and doors within its range inside a virtual world | a phone tower; Bluetooth beacons |
| handover | the change of serving cell as the visitor moves | [3GPP TS 23.502](https://www.etsi.org/deliver/etsi_ts/123500_123599/123502/15.09.00_60/ts_123502v150900p.pdf), clause 4.9.1 |
| roaming | entering a network run by another publisher | [3GPP TS 23.501](https://www.etsi.org/deliver/etsi_ts/123500_123599/123501/15.05.00_60/ts_123501v150500p.pdf), clause 4.2.4 |
| edge delivery | receiving a world's content from a server near the visitor | content delivery networks; [RFC 7336](https://www.rfc-editor.org/rfc/rfc7336.html) |
| travel between grids | the precedent in virtual worlds | Crista Lopes's Hypergrid for OpenSimulator |

**Status.** A proposal combining established techniques; it claims to invent none of them, and no SRN path is implemented or measured.
Raised with the Forum's linking and discovery work in [point 7](../talks/2026-10-30-tpac-web-of-worlds/README.md#7-finding-moving-and-receiving-a-world).

### Dynamic Procedural Foveated Rendering (DPFR)

**Idea.** Procedures first, the image last: a world's surfaces ship as small procedures evaluated every frame at the detail each part of each eye needs, and one high-resolution texture per surface loads as the last layer and blends in without a jump.

**Shared name.** Dynamic Procedural Foveated Rendering; in Portuguese, Renderização Foveada Procedural Dinâmica.
Named by Daniel Campos Ramos on 25 October 2026.

**Its terms**, from the [proposal page](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/dynamic-procedural-foveated-rendering.md).

| Term | Meaning |
|---|---|
| procedural layer | a texture or model generated by a procedure, with its frequencies limited to what each sample can represent |
| last layer | the one high-resolution texture per surface, loaded while the procedural layers already render |
| tile | the unit of evaluation and of loading; the gaze decides which tiles come first and at what resolution |
| rendering resolution, output resolution | where the procedures and the scene are evaluated, and the screen's; the compositor scales once at the output |
| dynamic | foveation that follows the gaze, the device and the GPU's load |

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| glTF, [KHR_texture_procedurals](https://github.com/KhronosGroup/glTF/pull/2381) | a draft proposal for procedural textures in glTF, opened 3 April 2024 | draft, open |
| glTF, [issue #2696](https://github.com/KhronosGroup/glTF/issues/2696) | "Procedural textures refined by one image: Dynamic Procedural Foveated Rendering (DPFR)", 4 November 2026 | proposal, open |
| Khronos Vulkan | `VK_KHR_fragment_shading_rate` and sparse resources: the mechanisms, not DPFR | published |
| the demoscene | .kkrieger, a whole game in 96 kilobytes (Breakpoint 2004); [fr_public](https://github.com/farbrausch/fr_public), open since 2012 | precedent |
| [Spatial browsing input, point 6](../talks/2026-10-28-tpac-spatial-browser/README.md#6-procedures-first-the-image-last); [Web of Worlds input, point 6](../talks/2026-10-30-tpac-web-of-worlds/README.md#6-procedures-first-the-image-last) | the proposal in its discussion context | individual input |

**Status.** A proposal combining procedural textures with frequency limits, foveated rendering and texture streaming; not an implemented or measured path.

### Presenting worlds on the screens people own

**Idea.** A world reaches current 2D and 3D devices as well as headsets: 3D TVs and projectors, VR headsets, glasses-free 3D displays, any monitor with red and cyan glasses, and a plain 2D monitor unchanged.

**Shared name.** The screens people own.

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| WebXR Device API | `inline-stereo`, a session mode that lets a page draw both eyes outside an immersive session; [pull request #1436](https://github.com/immersive-web/webxr/pull/1436), merged by Rik Cabanier on 9 June 2026 | merged into the specification's editor's draft |
| Sparky Stereo OS | the Waterfox branch's [proof](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/waterfox-stereo-m3.md) of presentation on current 2D and 3D devices without a headset | measured |
| the Sneeze architecture deck | "Shared Compositor / Sibling Surfaces", the option the desktop already implements ([Spatial browsing input, point 5](../talks/2026-10-28-tpac-spatial-browser/README.md#5-sibling-surfaces-are-our-desktop)) | individual input |
| the minutes | "Should the user agent's duties include presenting a world on those screens too?" | open question |

### Where the work belongs: the group map

The areas, where each could start, the W3C groups that hold it and the bodies outside W3C, from [point 8](../talks/2026-10-30-tpac-web-of-worlds/README.md#8-where-the-work-belongs-a-web-of-worlds-task-force), with each group's page.

| Area | Where to start it | W3C groups with it | Bodies outside W3C |
|---|---|---|---|
| Linking, addressing and locating | [Immersive Web CG](https://www.w3.org/community/immersive-web/) | [Immersive Web WG](https://www.w3.org/groups/wg/immersive-web/); [Spatio-temporal Data on the Web WG](https://www.w3.org/groups/wg/sdw/); [Maps for HTML CG](https://www.w3.org/community/maps4html/); [Metaverse Interoperability CG](https://www.w3.org/community/metaverse-interop/) (OMI) | [OGC](https://www.ogc.org/) (GeoPose); [IETF](https://www.ietf.org/) and [IANA](https://www.iana.org/) |
| Composition and semantics | [PM-KR CG](https://www.w3.org/community/pm-kr/) | [JSON-LD WG](https://www.w3.org/groups/wg/json-ld/); [RDF & SPARQL WG](https://www.w3.org/groups/wg/rdf-star/); Immersive Web CG (`<model>`) | [Web3D Consortium](https://www.web3d.org/) (X3D, HAnim) and [ISO/IEC JTC 1/SC 24](https://www.iso.org/committee/45252.html); IEEE's Spatial Web work ([P2874](https://standards.ieee.org/ieee/2874/10375/)) |
| Presenting worlds on the screens people own | Immersive Web WG (inline-stereo) | [CSS WG](https://www.w3.org/groups/wg/css/); [Media WG](https://www.w3.org/groups/wg/media/); [Accessible Platform Architectures WG](https://www.w3.org/groups/wg/apa/) | [HDMI Forum](https://hdmiforum.org/); [VESA](https://vesa.org/) (DisplayPort); [CTA](https://www.cta.tech/) (CTA-861); [Wi-Fi Alliance](https://www.wi-fi.org/) (Miracast); [Khronos](https://www.khronos.org/openxr/) (OpenXR) |
| Portable identity, user data and preferences | [Credentials CG](https://www.w3.org/community/credentials/) | [Verifiable Credentials WG](https://www.w3.org/groups/wg/vc/); [Decentralized Identifier WG](https://www.w3.org/groups/wg/did/); [Federated Identity WG](https://www.w3.org/groups/wg/fedid/); [Privacy WG](https://www.w3.org/groups/wg/privacy/) | [Metaverse Standards Forum](https://metaverse-standards.org/) (User Manifest) |
| Assets, size and procedural layers | [GPU for the Web WG](https://www.w3.org/groups/wg/gpu/) | Immersive Web WG; Metaverse Interoperability CG (OMI, [glTF extensions](https://github.com/omigroup/gltf-extensions)) | [Khronos 3D Formats WG](https://www.khronos.org/gltf/) (glTF); Web3D Consortium |
| Finding and moving between worlds | [Web of Things WG](https://www.w3.org/groups/wg/wot/) (WoT Discovery) | Spatio-temporal Data on the Web WG; [WebTransport WG](https://www.w3.org/groups/wg/webtransport/) | IETF; [3GPP](https://www.3gpp.org/); [Bluetooth SIG](https://www.bluetooth.com/); OGC |
| Sound in shared spaces | [Web Real-Time Communications WG](https://www.w3.org/groups/wg/webrtc/) | Media WG; [Audio WG](https://www.w3.org/groups/wg/audio/) | Bluetooth SIG (Auracast) |
| Media that carries stereo and depth | Media WG | [Media and Entertainment IG](https://www.w3.org/groups/ig/me/); [Timed Text WG](https://www.w3.org/groups/wg/timed-text/) | [IETF CELLAR](https://datatracker.ietf.org/wg/cellar/about/) and IANA; [ISO/IEC JTC 1/SC 29](https://www.iso.org/committee/45316.html) (MPEG); [ITU-T SG21](https://www.itu.int/en/ITU-T/studygroups/2025-2028/21/Pages/default.aspx) (since 2025 the successor of SG16); [AOMedia](https://aomedia.org/) |
| Testing against use cases | the task force itself | [Browser Testing and Tools WG](https://www.w3.org/groups/wg/browser-tools-testing/) | [Web Platform Tests](https://web-platform-tests.org/) |

**Status.** A proposed task force; the room took a workshop as the next step, and this map is input for its scope.

## 4. Stereo pictures: views, layouts and eye order

### View, eye, constituent frame

**Idea.** A stereo picture holds two views, one for each eye.
Specifications name the two in different ways; the pairing is the same.

**Shared name.** View, with left and right; "left eye first" for the order.

**In the specifications.**

| Specification | Its name for a view | Clause | Owner | Text |
|---|---|---|---|---|
| ITU-T H.264 (V16, 06/2026) | constituent frame 0 and 1, with `content_interpretation_type` 1 meaning "frame 0 being associated with the left view" | D.2.26, Table D-10 (page 389) | ITU-T SG21, formerly SG16 | [free](https://www.itu.int/rec/T-REC-H.264/en) |
| ITU-T H.265 (V11, 01/2026) | the same words | D.3.16, Table D.9 (page 352) | ITU-T SG21 | [free](https://www.itu.int/rec/T-REC-H.265/en) |
| ITU-T H.274 (V4, 01/2026) | the same, in `fp_arrangement_type` and its content interpretation | 8.6.2, Table 7 | ITU-T SG21 | [free](https://www.itu.int/rec/T-REC-H.274/en) |
| ISO/IEC 14496-12:2026 (edition 8) | `left_view_flag` equal to 1 "indicates the left view of a stereo pair" in the `ster` track group | 8.3.4.4.2.3, page 36 | ISO/IEC JTC 1/SC 29 | [free at IEC](https://webstore.iec.ch/en/publication/113218) |
| ISO/IEC 23008-12:2025 (HEIF) | the `ster` entity group: left and right image items; `stem`: left, right and a monoscopic fallback | 6.8.5; Amendment 1, 6.8.11 (as read by the edition's [HEIF reader contract](https://github.com/Sparky-OS/stereo-layer/blob/main/docs/heif-stereo.md)) | ISO/IEC JTC 1/SC 29 | [ISO](https://www.iso.org/standard/89035.html), paid (CHF 227 as its ISO page listed it on 4 November 2026, read through a search result; the page refused a direct read) |
| RFC 9559 (Matroska) | `TrackPlaneType` 0 "left eye", 1 "right eye", 2 "background", in `TrackCombinePlanes` | 5.1.4.1.30.4; 18.10 | IETF CELLAR WG | [free](https://www.rfc-editor.org/rfc/rfc9559) |
| OpenEXR | views named `left` and `right`, "in lower-case English", in the `multiView` header attribute | [Storing Multi-View Images in OpenEXR Files](https://openexr.com/en/latest/MultiViewOpenEXR.html) | Academy Software Foundation | free |
| WebXR Layers | sub-images for the left and right eye in a `stereo` layout | [XRLayerLayout](https://www.w3.org/TR/webxrlayers-1/) | W3C Immersive Web WG | free |
| Sparky Stereo OS | view: the X11 property `_KDE_NET_WM_STEREO_CONTENT_ONE_VIEW_SIZE` names one view's display size, never an eye or a side, because a view can be a picture or a depth map | [house formats](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/house-formats.md), [stereo-layer](https://github.com/Sparky-OS/stereo-layer/blob/main/docs/x11-child-place.md) | Daniel Campos Ramos | public |

**Status.** Published standards; the edition's naming rule is its own.

### Layout, packing, arrangement

**Idea.** How the two views are placed: side by side, one above the other, interleaved by row, column or checkerboard, alternated in time, or kept as two separate pictures or tracks.
Every specification lists its own set, and the sets overlap.

**Shared name.** `Stereo3DLayout`, the text value the edition's readers report (Qt, KImageFormats, KFileMetaData, stereo-layer, SVGStereo), each value with `LeftFirst` or `RightFirst` for the eye order.
The whole set is read, never a subset, because the output side never decodes a packing.

**One table, one row per idea.**
A blank cell means that specification has no value for the idea.

| Idea | `Stereo3DLayout` | H.264 Table D-9, H.265 Table D.8, H.274 Table 7 (`frame_packing_arrangement_type`, `fp_arrangement_type`) | H.273 Table 5 (`VideoFramePackingType`) | RFC 9559 Table 5 (`StereoMode`) | HDMI 1.4a `3D_Structure` (as the Linux kernel names it in `include/linux/hdmi.h`) | WebXR Layers `XRLayerLayout` | FFmpeg `AVStereo3DType` |
|---|---|---|---|---|---|---|---|
| side by side | `sideBySideLeftFirst`, `sideBySideRightFirst` | 3 | 3 | 1 "side by side (left eye first)", 11 "side by side (right eye first)" | 3 "side-by-side (full)", 8 "side-by-side (half)" | `stereo-left-right` | `AV_STEREO3D_SIDEBYSIDE` |
| top and bottom | `topBottomLeftFirst`, `topBottomRightFirst` | 4 | 4 | 3 "top - bottom (left eye is first)", 2 "top - bottom (right eye is first)" | 6 "top-and-bottom" | `stereo-top-bottom` | `AV_STEREO3D_TOPBOTTOM` |
| checkerboard | `checkerboardLeftFirst`, `checkerboardRightFirst` | 0 (H.264 only; reserved in H.265 and H.274) | 0 | 5 "checkboard (left eye is first)", 4 "checkboard (right eye is first)" | | | `AV_STEREO3D_CHECKERBOARD` |
| column interleaved | `columnInterleavedLeftFirst`, `columnInterleavedRightFirst` | 1 (H.264 only) | 1 | 9, 8 | | | `AV_STEREO3D_COLUMNS` |
| row interleaved | `rowInterleavedLeftFirst`, `rowInterleavedRightFirst` | 2 (H.264 only) | 2 | 7, 6 | 2 "line alternative" | | `AV_STEREO3D_LINES` |
| quincunx side by side | `sideBySideQuincunx` | 3 with `quincunx_sampling_flag` 1 | 3 with `QuincunxSamplingFlag` | | | | `AV_STEREO3D_SIDEBYSIDE_QUINCUNX` |
| temporal interleaving, frame sequential | `frameSequentialLeftFirst`, `frameSequentialRightFirst` | 5 | 5 | | 1 "field alternative"; frame packing (0) carries two frames in one | | `AV_STEREO3D_FRAMESEQUENCE` |
| both eyes in one container block | `blockLacedLeftFirst`, `blockLacedRightFirst` | | | 13 "both eyes laced in one Block (left eye is first)", 14 (right eye first) | | | |
| two separate pictures or tracks | `multiViewLeftFirst`, `multiViewRightFirst` | H.264 Annex G (MVC), H.265 Annex G (MV-HEVC): two views as layers | | `TrackPlaneType` 0 and 1 in `TrackCombinePlanes` | | `stereo` (two sub-images) | per-frame view id (`AV_FRAME_DATA_VIEW_ID`) |
| anaglyph | `anaglyphCyanRed`, `anaglyphGreenMagenta`; JPS's `anaglyphRedLeft`, `anaglyphRedRight` | | | 10 "anaglyph (cyan/red)", 12 "anaglyph (green/magenta)" | | | |
| one picture, 2D | `mono` | 6 "a complete 2D frame" (H.264); H.273's note 4: 2D content in a mixed 2D and 3D service | 6 | 0 "mono" | the 2D modes | `mono` | `AV_STEREO3D_2D` |
| picture with its depth | `depthSideBySidePictureFirst`, `depthSideBySideDepthFirst`, `depthTopBottomPictureFirst`, `depthTopBottomDepthFirst`, `depthGraphicsTopBottom`, `depthBackgroundQuarters`, `depthSeparate` | H.265 Annex G depth auxiliary layer (`AuxId` 2, Table F.2); H.264 Annex H and I | | 15 to 20 (packed); `TrackPlaneType` 3 to 5 (separate) | 4 "L + depth", 5 "L + depth + graphics + graphics-depth" | | |

**Where each column comes from.**

- H.264 V16 (06/2026), Table D-9, page 387 (Table D-8 in V15, 08/2024); H.265 V11 (01/2026), Table D.8, page 351; H.274 V4 (01/2026), Table 7, in 8.6.2.
  H.265 and H.274 list only 3, 4 and 5; H.264 lists 0 to 6.
- ITU-T H.273 V4 (07/2024), 8.4 "Video frame packing type", Table 5, page 14, with `QuincunxSamplingFlag`; 8.5 "Packed video content interpretation".
  ISO/IEC 23091-2:2025 is its paid twin (CHF 159).
- RFC 9559, section 5.1.4.1.28.3, Table 5, and section 18.10 "Multi-planar and 3D Videos"; 15 to 20 from the IANA registry, assigned 26 October 2026.
- HDMI 1.4a's eight `3D_Structure` values, read in the Linux kernel's `enum hdmi_3d_structure` (`include/linux/hdmi.h`): frame packing 0, field alternative 1, line alternative 2, side-by-side (full) 3, L + depth 4, L + depth + graphics + graphics-depth 5, top-and-bottom 6, side-by-side (half) 8.
  The HDMI text itself is read-only for evaluation ([the 3D extract](https://www.hdmi.org/docs/hdmi14bspecs)).
- WebXR Layers, Working Draft of 11 August 2026, `XRLayerLayout`: `default`, `mono`, `stereo`, `stereo-left-right`, `stereo-top-bottom`.
- FFmpeg, `libavutil/stereo3d.h`, with `AV_STEREO3D_FLAG_INVERT` for the eye order.
- `Stereo3DLayout`: [stereo-layer's README](https://github.com/Sparky-OS/stereo-layer#readme) and [depth marks](https://github.com/Sparky-OS/stereo-layer/blob/main/docs/depth-marks.md).

**Status.** The codec, container and link columns are published standards and a registry; `Stereo3DLayout` is the edition's shared vocabulary, registered in stereo-layer and on [awesome-stereoscopy's standards page](https://github.com/danielcamposramos/awesome-stereoscopy/blob/main/standards.md); the WebXR column is a Working Draft.

**Our reading.** The row "two separate pictures or tracks" maps the layer and track mechanisms onto one layout word; no specification names them as a layout.

### Eye order

**Idea.** Which view comes first in the frame, the file or the time sequence, and which is the left eye.
A declaration can be wrong, so a player also offers the person a per-file correction ("Swap left and right eyes"), kept where the player keeps its per-file state, and the file is written only when the person chooses to save it.

**Shared name.** Left eye first; `LeftFirst` and `RightFirst`.

**In the specifications.**

| Specification | Its name | Clause |
|---|---|---|
| H.264, H.265, H.274 | `content_interpretation_type`: 1 left view first, 2 right view first, 0 unspecified | H.264 D.2.26 Table D-10; H.265 D.3.16 Table D.9; H.274 8.6.2 |
| RFC 9559 | separate values per order: 1 against 11, 3 against 2, 5 against 4, 7 against 6, 9 against 8, 13 against 14 | 5.1.4.1.28.3, Table 5 |
| ISO/IEC 14496-12:2026 | `left_view_flag` | 8.3.4.4.2.3 |
| PNG Extensions 1.4.0, `sTER` | mode 0 "cross-fuse layout" (right eye at the left), mode 1 "diverging-fuse layout" (left eye at the left) | [3.6](http://www.libpng.org/pub/png/spec/register/pngext-1.4.0-pdg.html) |
| HDMI 1.4a | the left eye first in every structure | the 3D extract's figures (the edition's reading, since the text is for evaluation only) |
| SVGStereo | `sideBySideLeftFirst`, the only stereo value since version 0.3 | [SVGStereo README](https://github.com/Sparky-OS/svgstereo#readme) |
| Sparky Stereo OS | one eye flip per output in Display Settings, for a screen or glasses that show the eyes reversed; one per-file correction in each player; a program that renders its own 3D scene offers no swap | [stereo labor division](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-labor-division.md#outputs-where-formats-live) |

### Full side by side, at any resolution

**Idea.** The two views as separate complete pictures, side by side, left eye first, each at the resolution it already has: a half top-and-bottom frame of 1920x1080 becomes one 3840x540 buffer, and nothing is stretched or squeezed.
"Full" names the layout, not a size.

**Shared name.** Full side by side.

**In the specifications.**

| Where | Its name | Clause | Status |
|---|---|---|---|
| HDMI 1.4a | `3D_Structure` 3, "side-by-side (full)", as against 8, "side-by-side (half)" | `include/linux/hdmi.h`, `HDMI_3D_STRUCTURE_SIDE_BY_SIDE_FULL = 3` | published, text for evaluation only |
| Sparky Stereo OS | the house format: "Full side by side, left eye first, both eyes complete, at the source's resolution; declared once to the compositor"; the declared value is 3, the same number as HDMI's | [house formats](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/house-formats.md); [stereo labor division](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-labor-division.md#the-picture-kwin-understands) | shipped |
| the stereo report | "one interchange format: full side by side, left eye first, at the source's own resolution" | [One presentation contract](../reports/source/stereo-3d-adoption-report.html) | individual input |
| IMAX 3D | two complete pictures, one per eye, from two projectors | the labor division's comparison | practice |
| SteamVR | the layout of its stereo screenshots | the labor division | practice |

**Status.** The edition's standard for what a program hands its compositor; HDMI's structure 3 is the published twin on the cable.

### Half and full views, view size

**Idea.** A packed frame may hold each view at half its width or half its height; what matters is the size each view is shown at.

**Shared name.** View size; half and full.

**In the specifications.**

| Specification | Its name | Clause |
|---|---|---|
| RFC 9559 | `DisplayWidth` and `DisplayHeight` give one view's size; section 18.10 says how they relate to `StereoMode` | 5.1.4.1.28.12, 5.1.4.1.28.13, 18.10 |
| ITU-T H.273 | the sample aspect ratio to signal with a packing: 2:1 for side by side, 1:2 for top and bottom (note 2 under Table 5) | 8.4 |
| HDMI 1.4a | half and full as separate structures (8 and 3) | the kernel's enum |
| Sparky Stereo OS | ANY resolution per view is the pact; the compositor scales once, at the output; `_KDE_NET_WM_STEREO_CONTENT_ONE_VIEW_SIZE` on X11, the `wp_viewport` destination on Wayland | [how it works](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/how-it-works.md) |

### Frame packing

**Idea.** Two names for two things: in the codecs, the "frame packing arrangement" message that describes any packing; on the cable, HDMI's structure 0, two full frames in one taller frame with an active space between them, the mode 3D Blu-ray players send.

**Shared name.** Frame packing arrangement for the message; frame packing for the HDMI structure.

**In the specifications.**

| Specification | Its name | Clause | Text |
|---|---|---|---|
| ITU-T H.264 | frame packing arrangement SEI message, syntax D.1.26 and semantics D.2.26 (V16; D.2.25 in the 2012 edition) | pages 346 and 386 | free |
| ITU-T H.265 | the same, D.2.16 and D.3.16 | pages 302 and 350 | free |
| ITU-T H.274 | the same, 8.6.1 and 8.6.2, for VVC and any codec that uses H.274's messages | page 33 | free |
| ISO/IEC 14496-12:2026 | `StereoVideoBox` (`stvi`), with `stereo_scheme` 1 "the frame packing scheme as specified by the Frame packing arrangement Supplemental Enhancement Information message of ISO/IEC 14496-10", 2 the arrangement type of ISO/IEC 10646 Annex D, 3 the scheme of ISO/IEC 23000-11, 4 and 5 the H.273 code points; `single_view_allowed` | 13.5.4.2, pages 218 and 219 | free at IEC |
| ISO/IEC 23009-1 (MPEG-DASH) | the `FramePacking` descriptor in a manifest | [DASH-IF IOP Part 7](https://dashif.org/docs/IOP-Guidelines/DASH-IF-IOP-Part7-v5.0.0.pdf); the ISO text not read here | paid at ISO |
| HDMI 1.4a | `3D_Structure` 0 "frame packing"; the mandatory formats for a sink that declares 3D are frame packing and top-and-bottom at 1080p24, 720p50 and 720p60, and side-by-side half at 1080i50 and 1080i60 (`stereo_mandatory_modes` in the kernel's `drm_edid.c`) | the 3D extract | evaluation only |
| Blu-ray 3D | not frame packing in the stream: MVC, H.264 Annex G in the current edition (Annex H in the 2009 numbering the Blu-ray release cites), full 1080p per eye, playable in 2D on existing players (BDA, 17 December 2009) | [the BDA release](https://www.sportsvideo.org/2009/12/17/blu-ray-disc-association-announces-final-3d-specification/) | licensed |

**How long a message holds.**
A frame packing arrangement applies from the picture it comes with, in output order, until it is cancelled or until the next message, and a picture that is skipped or not output keeps its place in that order; a message with a reserved value is ignored.
That is how H.264 D.2.26, H.265 D.3.16 and H.274 8.6.2 are read in the edition's FFmpeg work ([FFmpeg #24628](https://code.ffmpeg.org/FFmpeg/FFmpeg/pulls/24628)).

**Our reading.** One arrangement per picture, the latest in output order, applied per layer in multiview streams; the clauses define persistence, and the per-picture rule is the edition's application of them.

### Multiview: two views as layers

**Idea.** The two views coded as two layers of one stream, each a complete picture, instead of packed into one frame.

**Shared name.** Multiview.

**In the specifications.**

| Specification | Its name | Clause | Text |
|---|---|---|---|
| ITU-T H.264 | Multiview video coding (MVC), Annex G; multiview and depth, Annex H; with enhanced non-base view, Annex I | V16, pages 664, 728 and 776 | free |
| ITU-T H.265 | the multiview format range extensions (MV-HEVC), Annex G; its depth representation information SEI, G.14.3.4 | V11 | free |
| ISO/IEC 14496-12:2026 | the `ster` track group: "this track is either the left or right view of a stereo pair" | 8.3.4.4.2, page 36 | free at IEC |
| Apple | the `vexu` box with the view identities of MV-HEVC files; FFmpeg assembles the pair with `AV_FRAME_DATA_VIEW_ID` ([the edition's MV-HEVC notes](https://github.com/Sparky-OS/stereo-layer/blob/main/docs/mvhevc.md)) | Apple's documentation | public |
| Blu-ray 3D | MVC, since 17 December 2009 | the BDA release above | licensed |

### Anaglyph

**Idea.** The two views mixed into one picture by colour, seen with red and cyan or green and magenta glasses.
On the input side it is a packing to rebuild into two eyes; on the output side it is the filter that makes any 2D monitor a stereo screen.

**Shared name.** Anaglyph.

**In the specifications.**

| Where | Its name | Clause |
|---|---|---|
| RFC 9559 | `StereoMode` 10 "anaglyph (cyan/red)", 12 "anaglyph (green/magenta)" | Table 5 |
| `Stereo3DLayout` | `anaglyphCyanRed`, `anaglyphGreenMagenta` (the red and the green view are the left eye's); JPS's `anaglyphRedLeft`, `anaglyphRedRight` | stereo-layer README |
| FFmpeg | the `stereo3d` filter's outputs `arcd`, `agmd` and others, with Dubois's least-squares projection | [filters documentation](https://ffmpeg.org/ffmpeg-filters.html#stereo3d) |
| Eric Dubois | "A projection method to generate anaglyph stereo images", ICASSP 2001, the matrices the compositor uses, with a set for CRTs and one for modern panels | the labor division's references |
| Sparky Stereo OS | anaglyph as an output filter on every output, off by default, the toggle "Anaglyph" per screen | [stereo labor division](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-labor-division.md#outputs-where-formats-live) |

## 5. Depth

### The three planes: sunk, screen, popped

**Idea.** A desktop and a drawing already fake depth with shadows, bevels and raised buttons.
Three plain words make it real on a stereo screen and keep the old cue on a 2D one: a thing is sunk behind the screen, on the screen, or popped in front of it, each a few pixels at most, within limits the person sets.

**Shared name.** `sunk`, `screen`, `popped`.

**In the specifications.**

| Where | Its name | Clause | Status |
|---|---|---|---|
| KDE Union (the style engine of Plasma) | `depth: sunk | screen | popped | <percentage> | <number>`, a fraction of the user's limits; an outer shadow means raised, an inset means sunk | the edition's Union work ([for theme designers](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/for-theme-designers.md)) | built on the edition's branch, to be offered upstream with finished work |
| Stereo KWin | `[StereoDepth]` in `kwinrc`: `SunkLimit` 10 px, `PoppedLimit` 4 px for desktop elements, `ElementLimit` 1 px for a window's own elements, at 1920 wide; System Settings, "3D Depth" | [depth inside every window](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/depth-inside-windows.md) | shipped, seen on a 3D TV on 13 October 2026 |
| SVGStereo 0.4 | `svgstereo:depth="sunk | screen | popped | <number>"` on a single-view SVG, doubled by the reader with its gradients, patterns and animation evaluated per view | [DEPTH.md](https://github.com/Sparky-OS/svgstereo/blob/main/DEPTH.md) | proposal |
| CSS, WebKit explainers | "plain depth words" and "depth limits the person sets", proposed for css-spatial | [WebKit/explainers #163](https://github.com/WebKit/explainers/issues/163), 4 November 2026 | proposal, open |
| the stereo report | "an element could declare a plane (sunk, screen or popped) and the platform would draw it for the screen: a shadow on a 2D screen, real depth on a stereo one" | [What a browser would need](../reports/source/stereo-3d-adoption-report.html) | individual input |
| W3C, 2012 | `perspective-baseline`, among the Stereoscopic 3D Web Task Force's proposed properties | [editor's draft, 30 November 2012](https://www.w3.org/2011/webtv/3dweb/3dweb_proposal_121130.html) | never entered CSS |
| Qt | `QFrame::Shadow`: `Plain`, `Raised`, `Sunken`; `QStyle::State_Raised`, `State_Sunken` | [QFrame](https://doc.qt.io/qt-6/qframe.html#Shadow-enum) | published API |
| Material Design 3 | elevation: the distance between surfaces on the z-axis, in dp, as tokens | [Elevation](https://m3.material.io/styles/elevation/overview) | published guidelines |

**Status.** Built in the edition; proposed to Union, to SVG and to CSS under the same three words.

**Our reading.** Qt's and Material's words name the same idea without stereo; the three planes give them one vocabulary that a 2D theme already encodes.

### Disparity, parallax, the screen plane

**Idea.** The horizontal offset of a point between the two views; zero at the screen plane, positive behind it, negative in front of it.

**Shared names.** Parallax, in pixels of a view; the screen plane at zero parallax.

**In the specifications.**

| Where | Its name | Clause |
|---|---|---|
| ITU-T H.265 | disparity, with `DMin` and `DMax` "in luma sample widths of the view" | G.14.3.4 |
| the edition's depth marks | "the right eye's position of a point minus the left eye's, in pixels of the view, positive behind the screen" | [depth marks](https://github.com/Sparky-OS/stereo-layer/blob/main/docs/depth-marks.md) |
| the VR to 3D display formula | the off-axis frustum: two frustums share one window at the convergence distance, "zero parallax, the screen plane"; never toe-in | [formula.md](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/formula.md), section 1 |
| the labor division | eye separation, the camera moved half of it to each side; objects at the screen's distance appear on the screen | [stereo labor division](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-labor-division.md#program-developers-applications-games-engines) |

### The stereo window

**Idea.** A popped thing cut by the screen's edge looks wrong, and a sunk thing seen through the edge looks like a view through a window; so anything that touches the output's edge stays at the screen plane.

**Shared name.** The stereo window; the edge rule.

**In the specifications.**

| Where | Its name |
|---|---|
| Stereo KWin | a popped element touching the output's edge stays at screen level; windows are at the screen or behind, popped is for small things inside |
| SVGStereo 0.4 | "A popped element cut by or touching the drawing's outer edge stays at the screen plane for that frame" ([DEPTH.md](https://github.com/Sparky-OS/svgstereo/blob/main/DEPTH.md), "The stereo window") |
| Sparky Stereo OS | the wallpaper's edge columns are cut the same in both eyes, never stretched ([depth inside every window](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/depth-inside-windows.md)) |

### Picture with its depth

**Idea.** A picture and its depth map are a stereo format: a program that understands them draws the two views (depth-image-based rendering), and every other program shows the picture as before.

**Shared names.** `Stereo3DLayout`'s depth layouts for where the picture and the depth are; `Stereo3DDepth` for what a depth sample means.

**In the specifications.**

| Specification | Its name | Clause | Status |
|---|---|---|---|
| HDMI 1.4a | `3D_Structure` 4 "L + depth", 5 "L + depth + graphics + graphics-depth" | `include/linux/hdmi.h`; HDMI's Appendix H (the edition's reading) | published; zero of 104,243 EDIDs in the linuxhw collection declare them |
| RFC 9559 and IANA | `StereoMode` 15 "picture and depth side by side, picture first" to 20 "picture, depth, background and background depth, in four quarters"; `TrackPlaneType` 3 "depth of the left eye plane", 4, 5 | [IANA Matroska registries](https://www.iana.org/assignments/matroska) | assigned 26 and 20 October 2026, change controller Daniel Ramos, reference [stereo-layer v1.9.0](https://github.com/Sparky-OS/stereo-layer/blob/v1.9.0/docs/depth-marks.md) |
| ITU-T H.265 | depth representation information SEI, `depth_representation_type` 0 inverse Z, 1 disparity, 2 Z, 3 non-linear disparity | G.14.3.4, Table G.3 (page 590) | published |
| ITU-T H.264 | the same types | Annex H, Table H-1 (V16) | published |
| ISO/IEC 23008-12 (HEIF) | a depth auxiliary image: `auxC` with `urn:mpeg:hevc:2015:auxid:2` and its kin, `auxl` reference | as read by the depth marks page | paid |
| ISO/IEC 23002-3:2007 | auxiliary video: depth and parallax maps | not read here (CHF 135); the `parallax` formula is the edition's reading, marked unverified | paid |
| Google | Dynamic Depth 1.0 (`RangeLinear`, `RangeInverse`, `Near`, `Far`); GDepth (`GDepth:Near`, `GDepth:Far`) | [Dynamic Depth 1.0](https://developer.android.com/training/camera2/Dynamic-depth-v1.0.pdf); [depthmap metadata](https://developers.google.com/depthmap-metadata) | published, CC BY 4.0 |
| Apple | `AVDepthData`: disparity or depth, `hdis`, `fdis`, `hdep`, `fdep` | [AVDepthData](https://developer.apple.com/documentation/avfoundation/avdepthdata) | published documentation |
| Sparky Stereo OS | `Stereo3DDepth` kinds: `nearness`, `farness`, `inverseZ`, `disparity`, `z`, `nonlinearDisparity`, `parallax`, `rangeLinear`, `rangeInverse`, `metric`, each mapped to the format it comes from; readers never take a picture for a depth picture by its shape, only a mark says so | [depth marks](https://github.com/Sparky-OS/stereo-layer/blob/main/docs/depth-marks.md) | proposal 0.2, 17 October 2026, implemented in the edition's readers |

**Status.** The registry assignments name the layouts; support in a muxer, decoder or player is a separate fact, checked per program.

### 3D content and VR content

**Idea.** Content made to stay around the screen plane is 3D content; content made to come out of the screen and surround the viewer is VR content.
A desktop has no camera motion, 2D stays at the screen plane, and 2D is always one switch away.

**Shared names.** 3D content; VR content; a headset is also a stereo monitor.

**In the specifications.**

| Where | Its name |
|---|---|
| Sparky Stereo OS | "VR is also a stereo monitor": a headset is one more output filter fed the same full side by side ([README](https://github.com/Sparky-OS/sparky-stereo-os#vr-is-also-a-stereo-monitor)) |
| the labor division | HT mode, a headset used as a fixed 3D screen; the Stereo Spectator, one person in a headset while the room watches the 3D television ([sound section](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-labor-division.md#sound-the-same-division)) |
| Flat Headset | a phone in a cardboard viewer as a stereo screen for the desktop ([Flat Headset](https://github.com/Sparky-OS/flat-headset)) |
| WebXR | an immersive session in a headset; `inline-stereo` for both eyes on a screen |
| OpenXR 1.1 | composition layers, and `XR_KHR_composition_layer_depth` for depth with colour ([Khronos](https://registry.khronos.org/OpenXR/specs/1.1/html/xrspec.html)) |
| the second stereo report | the comfort literature (Hoffman 2008, Shibata 2011, Solimini 2013, Read and Bohr 2014) and the edition's answer by design: depth within limits, no motion ([the other causes](../reports/source/stereo-3d-closed-stacks-open-standards.html)) |

## 6. Presentation: the contract, the declaration and the displays

### The presentation contract

**Idea.** Programs describe each picture once; the compositor adapts it for each screen.
For stereo, a program hands the compositor full side by side, declared once; the compositor converts it for every output; nothing in the middle knows formats.
Sound already works this way: programs hand PipeWire PCM samples with their rate and channel layout.

**Shared name.** The presentation contract; the stereo contract in three lines.

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| Sparky Stereo OS | "Stereo KWin speaks full side by side, at any resolution. Programs decode or generate stereo in any standard, and deliver full side by side, at any resolution, to Stereo KWin. Outputs convert from that to whatever each screen needs." ([how it works](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/how-it-works.md)) | shipped; the compositor design in [STEREO3D.md](https://invent.kde.org/danielcamposramos/kwin/-/blob/stereo3d/STEREO3D.md) |
| the stereo report | "One presentation contract for stereo and HDR" | individual input |
| the migration path | step 3, "hand the element to the compositor with its layout", one declaration per element, never per window | [migration path](../talks/2026-10-13-w3c-me-ig/migration-path.md) |
| house formats | the same rule for depth, colour, HDR, audio, sound in XR and input devices | [house formats](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/house-formats.md) |

### The declaration

**Idea.** A program says once that a surface holds full side by side; the one value exists so that no consumer ever reads other layouts.
The information travels with the object.

**Shared name.** Declaration; "declared once".

**In the specifications.**

| Where | Its name | Status |
|---|---|---|
| plasma-wayland-protocols, the edition's addition | `kde_stereo_content_v1`, value `side_by_side_full`, through `kde_stereo_content_manager_v1`; an adopting compositor keeps the KDE name after its own prefix | shipped in Stereo KWin; the protocol at version 3 in [libstereo-declare](https://github.com/Sparky-OS/libstereo-declare) 1.8.0 |
| X11 | `_KDE_NET_WM_STEREO_CONTENT` = 3; `_KDE_NET_WM_STEREO_CONTENT_ONE_VIEW_SIZE`; `_KDE_NET_WM_STEREO_CONTENT_CHILDREN` for a 2D window's stereo children; the proposed `_KDE_NET_WM_STEREO_CONTENT_CHILD_PLACE` ([x11-child-place](https://github.com/Sparky-OS/stereo-layer/blob/main/docs/x11-child-place.md)) | shipped; the child place is a proposal at support version 8 |
| the shared helper | `stereo_declare_x11()`, `stereo_declare_wayland()` with `STEREO_SBS_FULL`; on other desktops the calls return `-ENOTSUP` and the window stays 2D | [libstereo-declare](https://github.com/Sparky-OS/libstereo-declare) |
| Wayland | `wp_content_type_v1`, the upstream protocol the edition uses for the content's kind (none, photo, video, game); `wp_viewporter` for the view's shown size | [content-type-v1](https://wayland.app/protocols/content-type-v1), [viewporter](https://wayland.app/protocols/viewporter), stable |
| wayland-protocols | `xx-stereoscopy-v1`, Emmanuel Gil Peyrot's protocol for 3D surfaces, revived in September 2026 | [merge request 533](https://gitlab.freedesktop.org/wayland/wayland-protocols/-/merge_requests/533), open |
| the edition's design | `kde-stereo-hdr-content`: the stereo value and the HDR description in one object per content layer, so no one adopts HDR without 3D | [stereo and HDR in one declaration](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-hdr-content.md), design only |

### 3D area and 2D part

**Idea.** A window's 2D part (menus, toolbars, the document around a picture) is its own surface at one eye's size and declares nothing; the 3D area (a stereo video, a 3D viewport, a canvas) is a surface of its own that hands the compositor full side by side.
The compositor shows the 2D part identical in both eyes and gives the 3D area each eye's view, in place.

**Shared names.** 3D area; 2D part; stereo window (a window that holds a 3D area).

**Where.** [How it works](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/how-it-works.md), "A window's 2D part and its 3D area are separate surfaces"; mpv's video layer under its controls' layer is the shape every player follows.

### Outputs: every display family

**Idea.** Each output converts full side by side into what its screen needs; a new kind of display is one new output filter, never a change in any program.
The families: 3D TVs and projectors, VR headsets, glasses-free 3D displays, any monitor with red and cyan glasses, and a plain 2D monitor, unchanged.

**Shared name.** Output filter.

**In the specifications.**

| Family | Its format | Specification | Owner | Text |
|---|---|---|---|---|
| 3D TVs and projectors | HDMI 1.4a `3D_Structure`, switched by the HDMI Vendor Specific InfoFrame; the EDID's Vendor-Specific Data Block (`3D_present`, `3D_Multi_present`) says which the screen accepts | HDMI 1.4a; CTA-861 for the video identification codes and InfoFrames | HDMI Licensing Administrator; CTA | evaluation extract; CTA-861-I USD 405 |
| DisplayPort displays | the stereo field in the Main Stream Attribute; frame sequential behind a per-connector opt-in in the edition's kernel | VESA DisplayPort | VESA | members only |
| VR headsets | OpenXR composition layers; OpenVR for SteamVR; a phone in a viewer through Flat Headset | [OpenXR 1.1](https://registry.khronos.org/OpenXR/specs/1.1/html/xrspec.html); [OpenVR](https://github.com/ValveSoftware/openvr) | Khronos; Valve | free |
| glasses-free displays | the compositor reports a window's geometry, and only the vendor's weaver computes the lens phase | DisplayXR's [window geometry specification](https://github.com/DisplayXR/displayxr-runtime/blob/main/docs/specs/runtime/wayland-window-geometry.md) and [ADR-033](https://github.com/DisplayXR/displayxr-runtime/blob/main/docs/adr/ADR-033-placement-reports-geometry-weaver-owns-phase.md) | DisplayXR | open source |
| any monitor, red and cyan glasses | anaglyph, Dubois's matrices, as a virtual 3D mode twin of every 2D mode | Dubois 2001 | | |
| passive and active displays switched by hand | row, column and checkerboard interleaving; frame sequential for shutter glasses and DLP projectors; two outputs as one pair for dual projection; a replica that copies the composed eyes | the edition's "Other stereo formats" toggle per output | Daniel Campos Ramos | [architectural synthesis](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/architectural-synthesis.md) |
| a plain 2D monitor | the left eye, unchanged; stereo themes render normally on 2D | the edition's default | | |
| wireless display | Miracast, the Wi-Fi Display specification, with an optional 3D video formats capability | [Wi-Fi Alliance](https://www.wi-fi.org/node/6909) | Wi-Fi Alliance | members and registered developers |

**Status.** Shipped in the edition for HDMI 3D, anaglyph, interleaving, frame sequential, pairs and replicas; headsets through OpenXR and the phone viewer; glasses-free planned with DisplayXR.
Two petitions of 27 October 2026 ask HDMI Licensing Administrator and the Wi-Fi Alliance for a side-by-side-only sink profile for single-panel headsets ([the petitions](../reports/source/stereo-3d-closed-stacks-open-standards.html)).

### Render resolution per eye

**Idea.** The one stereo option a program needs: the size each eye is rendered at, higher than the output for sharpness, lower for speed; the compositor scales it.
No program offers output formats, 3D modes or monitor settings.

**Where.** [Stereo labor division](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-labor-division.md#what-a-program-keeps-and-the-one-option-it-needs); DPFR's "two resolutions".

## 7. Colour and HDR

### Colour description

**Idea.** The primaries, transfer characteristics, matrix coefficients and range that say what a picture's samples mean; it travels with the picture, like the stereo layout.

**Shared name.** Colour description, in ITU-T H.273's code points.

**In the specifications.**

| Specification | Its name | Clause | Owner | Text |
|---|---|---|---|---|
| ITU-T H.273 (V4, 07/2024) | `ColourPrimaries` 8.1, `TransferCharacteristics` 8.2, `MatrixCoefficients` 8.3; also `VideoFramePackingType` 8.4 | pages 5 to 14 | ITU-T SG21 | [free](https://www.itu.int/rec/T-REC-H.273/en); ISO/IEC 23091-2:2025 paid, CHF 159 |
| H.264, H.265 | the same code points in the video usability information (VUI), Annex E | H.265 Tables E.3 to E.5 | ITU-T SG21 | free |
| RFC 9559 | the `Colour` element | 5.1.4.1.28.16 | IETF CELLAR | free |
| ISO/IEC 14496-12 | the `colr` box; `mdcv` and `clli` for mastering display and content light level | not read here for the clause | ISO/IEC JTC 1/SC 29 | free at IEC |
| WebCodecs | `VideoColorSpace`: primaries, transfer, matrix, full range | [WebCodecs](https://www.w3.org/TR/webcodecs/#video-color-space-interface) | W3C Media WG | free |
| Wayland | `wp_color_management_v1`: one image description per surface | [color-management-v1](https://wayland.app/protocols/color-management-v1), staging | wayland-protocols | free |

### Deep colour

**Idea.** More than 8 bits per colour component on the link, so gradients keep their steps; deep colour alone is not HDR.

**Shared name.** Deep colour; 10, 12 and 16 bits per component.

**In the specifications.**

| Specification | Its name | Where |
|---|---|---|
| HDMI 1.3 and later | `DC_30bit`, `DC_36bit`, `DC_48bit` in the Vendor-Specific Data Block of the EDID | `drm_parse_hdmi_deep_color_info()` in the kernel's `drm_edid.c` |
| the Linux DRM core | the connector property "max bpc" | `include/uapi/drm/drm_mode.h` |
| the edition | the house format for video colour: "the decoder's own bit depth, never reduced in the middle" | [house formats](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/house-formats.md) |

### HDR: the signals and the reconstruction

**Idea.** A picture with more range than SDR, described by its transfer function and its luminance metadata, or by an SDR base with a gain map that says how much brighter each pixel may go; the compositor adapts it per output.

**Shared names.** PQ, HLG, gain map, static and dynamic metadata, reference white.

**In the specifications.**

| Specification | Its name | Owner | Text |
|---|---|---|---|
| SMPTE ST 2084 | PQ, the perceptual quantizer transfer function | SMPTE | paid |
| ITU-R BT.2100 | HLG and PQ in one Recommendation | ITU-R | [free](https://www.itu.int/rec/R-REC-BT.2100/en) |
| ITU-R BT.2408 | reference white at 203 cd/m² for SDR content in an HDR picture | ITU-R | [free](https://www.itu.int/rec/R-REC-BT.2408/en) |
| ISO 21496-1:2025 | gain map metadata: per channel the map's min and max, gamma, base and alternate offsets, base and alternate headroom | ISO/IEC JTC 1/SC 29 | [ISO](https://committee.iso.org/standard/86775.html), CHF 100 |
| Android | Ultra HDR, a JPEG with its gain map and metadata | Google | [free](https://developer.android.com/media/platform/hdr-image-format) |
| CTA-861.3-A | HDR static metadata, the Dynamic Range and Mastering InfoFrame | CTA | USD 74 |
| H.265, H.264 | the mastering display colour volume and content light level SEI messages | ITU-T SG21 | free |
| SMPTE ST 2094-40 | HDR10+, dynamic metadata; outside the edition's first proposal | SMPTE | paid |
| the edition's design | one declaration per content layer with the stereo value, the image description and the gain map per eye; per output: unpack the eyes, to linear light, apply the gain map by the output's headroom, gamut map, tone map, encode at the output's depth | [stereo and HDR in one declaration](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-hdr-content.md) | design, not tested on an HDR screen |

**Status.** The stereo choice has device-test evidence; the HDR extension is a design awaiting implementation and cross-format device tests, and its working representation remains an engineering choice.

## 8. Files, containers, streams and APIs

### Still pictures

| Format | Its stereo mark | Clause | Owner | Text | Status |
|---|---|---|---|---|---|
| MPO | the Multi-Picture Format's stereo attribute tags, two images in one file; the format of 3D cameras, the LG Optimus 3D and the Nintendo 3DS | CIPA DC-007 | CIPA | [CIPA standards](https://www.cipa.jp/e/std/std-sec.html), free download | published; DC-007-Translation-2026 |
| stereo still images in cameras | CIPA DC-006, "Stereo Still Image Format for Digital Cameras" | DC-006-Translation-2021 | CIPA | same page | published |
| JPS | a JPEG with a stereoscopic descriptor, side by side, read by its own `Stereo3DLayout` values (`anaglyphRedLeft`, `anaglyphRedRight` among them) | no standards body holds it; stereo-layer's README | | | an industry format, read as is |
| PNG | the `sTER` chunk: "the datastream contains a stereo pair of subimages within a single PNG image", mode 0 cross-fuse, mode 1 diverging-fuse; the right subimage's left edge on a column divisible by eight | [PNG Extensions 1.4.0](http://www.libpng.org/pub/png/spec/register/pngext-1.4.0-pdg.html), 3.6 | the PNG Development Group; PNG itself is a [W3C Recommendation](https://www.w3.org/TR/png/) | free | published extension, 1 May 2008 |
| HEIF, AVIF | the `ster` and `stem` entity groups; a depth auxiliary item | ISO/IEC 23008-12:2025, 6.8.5; Amd 1, 6.8.11; registered at [MP4RA](https://mp4ra.org/registered-types/entity-groups) | ISO/IEC JTC 1/SC 29; AVIF by [AOMedia](https://aomediacodec.github.io/av1-avif/) on the same file format | paid (CHF 227 listed); AVIF free | published |
| OpenEXR | `multiView` attribute, views `left` and `right`, channels `left.R` and `right.R` | [Storing Multi-View Images](https://openexr.com/en/latest/MultiViewOpenEXR.html) | Academy Software Foundation | free | published |
| SVG | SVGStereo: `svgstereo:layout="sideBySideLeftFirst"` on the root, the viewBox holding both views; `svgstereo:depth` for single-view drawings | [SVGStereo](https://github.com/Sparky-OS/svgstereo) | Daniel Campos Ramos | public | proposal, at [WICG proposals #316](https://github.com/WICG/proposals/issues/316), opened 1 November 2026 |
| glTF thumbnails | a stereo thumbnail for a 3D asset, raised on the glTF 2.1 thumbnails issue | [glTF #2593](https://github.com/KhronosGroup/glTF/issues/2593) | Khronos | | discussion |
| Apple and Google depth photos | portrait HEIF and JPEG with depth or disparity; Dynamic Depth 1.0; GDepth | see [Picture with its depth](#picture-with-its-depth) | | | read by the edition's KImageFormats |

**Stereo by default.** On a stereo desktop, stereo content shows in stereo wherever it appears, thumbnails and previews included; flat is the person's opt-out ([STEREO3D.md](https://invent.kde.org/danielcamposramos/kwin/-/blob/stereo3d/STEREO3D.md)).

### Containers and manifests

| Format | Its stereo mark | Clause | Owner | Text |
|---|---|---|---|---|
| Matroska, WebM | `StereoMode`; `OldStereoMode`; `TrackCombinePlanes` with `TrackPlane`, `TrackPlaneUID`, `TrackPlaneType`; `DisplayWidth`, `DisplayHeight` for one view | RFC 9559, 5.1.4.1.28.3 and 5.1.4.1.28.5; 5.1.4.1.30.1 to 5.1.4.1.30.4; 18.10 | IETF CELLAR WG (Steve Lhomme, Moritz Bunkus, Dave Rice) | [free](https://www.rfc-editor.org/rfc/rfc9559) |
| MP4, the ISO base media file format | `stvi` with `stereo_scheme` and `stereo_indication_type`; the `ster` track group | ISO/IEC 14496-12:2026, 13.5.4.2 and 8.3.4.4.2 | ISO/IEC JTC 1/SC 29 | [free at IEC](https://webstore.iec.ch/en/publication/113218) |
| MP4, Google | the `st3d` box of Spherical Video V2, with `sv3d` for 360° video | [Spherical Video V2](https://github.com/google/spatial-media/blob/master/docs/spherical-video-v2-rfc.md) | Google | free |
| MOV, Apple | `vexu`, the view identities of MV-HEVC | Apple's documentation | Apple | free |
| MPEG-DASH | the `FramePacking` descriptor | ISO/IEC 23009-1, not read here; [DASH-IF IOP Part 7](https://dashif.org/docs/IOP-Guidelines/DASH-IF-IOP-Part7-v5.0.0.pdf) | ISO/IEC JTC 1/SC 29; DASH-IF | paid; the IOP free |
| MPEG-2 transport stream | an auxiliary video stream, stream type 0x1E, for depth and parallax maps | ISO/IEC 13818-1, the edition's reading (CHF 227, not read here); ITU-T H.222.0 is its free twin | ISO/IEC JTC 1/SC 29; ITU-T | H.222.0 free |
| DVB frame-compatible 3DTV | the broadcast profile | [ETSI TS 101 547-2](https://www.etsi.org/deliver/etsi_ts/101500_101599/10154702/01.02.01_60/ts_10154702v010201p.pdf) | ETSI and DVB | free |

### Graphics APIs

| API | Its stereo | Where | Owner | Text |
|---|---|---|---|---|
| OpenGL and GLX | quad-buffer stereo: a `GLX_STEREO` visual (GLX 1.4), the `GL_BACK_LEFT` and `GL_BACK_RIGHT` draw buffers (OpenGL 4.6, `glDrawBuffer`); since OpenGL 1.0, 1992 | [Khronos OpenGL registry](https://registry.khronos.org/OpenGL/) | Khronos | free |
| GLX | `GLX_EXT_stereo_tree`: which windows have both buffers, so a compositor can carry them | [extension text](https://registry.khronos.org/OpenGL/extensions/EXT/GLX_EXT_stereo_tree.txt) | Khronos | free |
| EGL | `EGL_EXT_multiview_window`, a window with two views | [extension text](https://registry.khronos.org/EGL/extensions/EXT/EGL_EXT_multiview_window.txt) | Khronos | free |
| Vulkan | a swapchain with `imageArrayLayers` 2 (`VK_KHR_swapchain`), offered through `maxImageArrayLayers`; multiview, core since Vulkan 1.1 (2018) | [Vulkan specification](https://docs.vulkan.org/spec/latest/) | Khronos | free |
| Direct3D 11.1, DXGI 1.2 | `DXGI_SWAP_CHAIN_DESC1::Stereo`, `IDXGIFactory2::IsWindowedStereoEnabled`, carried on Linux by Wine and DXVK | Microsoft's documentation | Microsoft | free |
| WebGPU | `GPUCanvasConfiguration` has no stereo layout member (checked 12 October 2026) | [WebGPU](https://www.w3.org/TR/webgpu/#dictdef-gpucanvasconfiguration) | W3C GPU for the Web WG | free |
| WebXR Layers | `XRLayerLayout` on quad, cylinder, equirect and cube layers, and on media layers from a video element | [WebXR Layers](https://www.w3.org/TR/webxrlayers-1/) | W3C Immersive Web WG | free |
| Mesa, the edition | packs quad-buffer, EGL multiview and two-layer swapchains into full side by side and declares them | [stereo labor division](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/stereo-labor-division.md#toolkit-and-library-developers-qt-wine-mesa-players) | | shipped |

### Where the web stops today

| Specification | What it lacks | Where | Work in progress |
|---|---|---|---|
| HTML media elements | no stereo attribute | [HTML](https://html.spec.whatwg.org/multipage/media.html#media-elements) | |
| CSS | no property describes stereo content, among 2,279 in the index (October 2026) | [CSS index](https://www.w3.org/Style/CSS/all-properties.en.html) | [WebKit/explainers #163](https://github.com/WebKit/explainers/issues/163) |
| WebCodecs | `VideoFrame` carries no frame packing | [WebCodecs](https://www.w3.org/TR/webcodecs/#videoframe-interface) | [webcodecs #970](https://github.com/w3c/webcodecs/issues/970), multiview coding, opened by Apple on 9 October 2026 |
| Media Capabilities | `spatialRendering` is for audio | [Media Capabilities](https://www.w3.org/TR/media-capabilities/#videoconfiguration) | [media-capabilities #249](https://github.com/w3c/media-capabilities/issues/249), a `stereoMode` field (`mono`, `left-right`, `top-bottom`, `multiview`), opened by Meta on 22 October 2025 |
| WebXR Layers | the vocabulary, only inside a headset session; `inline-stereo` now lets a page draw both eyes on a screen | | |

The six steps that preserve today's behaviour at each step: [the migration path](../talks/2026-10-13-w3c-me-ig/migration-path.md).

## 9. Registries

| Registry | What it assigns | Procedure | Who holds it | Where |
|---|---|---|---|---|
| Matroska Stereo Modes | `StereoMode` values; 0 to 14 by the IETF, 15 to 20 by Daniel Ramos | Specification Required (RFC 9559, 27.7; RFC 8126) | IANA | [matroska](https://www.iana.org/assignments/matroska) |
| Matroska Track Plane Types | `TrackPlaneType` values; 0 to 2 by the IETF, 3 to 5 by Daniel Ramos | First Come First Served (RFC 9559, 27.17) | IANA | same page, last updated 26 October 2026 |
| MP4RA | box types (`stvi`), entity group types (`ster`, `stem`, `altr`), brands and more for the ISO base media file format | registration with the MP4 registration authority | MP4RA, for ISO/IEC JTC 1/SC 29 | [mp4ra.org](https://mp4ra.org/) |
| Khronos registries | glTF extensions (`KHR_`, vendor prefixes), OpenXR extensions, OpenGL and EGL extensions | Khronos working groups | Khronos | [glTF](https://github.com/KhronosGroup/glTF/tree/main/extensions), [OpenXR](https://registry.khronos.org/OpenXR/), [OpenGL](https://registry.khronos.org/OpenGL/) |
| PNG chunk registry | registered public chunks such as `sTER` | the PNG Development Group | libpng.org | [PNG Extensions](http://www.libpng.org/pub/png/spec/register/) |
| IANA media types | `application/rdf+xml` by RFC 3870 (Aaron Swartz, 2004), the step that let the web name RDF | RFC 6838 | IANA | [media types](https://www.iana.org/assignments/media-types/) |
| W3C Technical Reports | every W3C draft and Recommendation | the W3C Process | W3C | [TR](https://www.w3.org/TR/) |
| CTA VICs and InfoFrames | video identification codes and InfoFrame types | CTA | CTA | CTA-861 |

A registry assignment names a thing; implementation and adoption are separate facts, checked per program.

## 10. The bodies and groups, and where to get their texts

| Body or group | What it holds here | Its page | Texts |
|---|---|---|---|
| W3C Community Groups: [PM-KR](https://www.w3.org/community/pm-kr/), [Immersive Web](https://www.w3.org/community/immersive-web/), [Credentials](https://www.w3.org/community/credentials/), [Maps for HTML](https://www.w3.org/community/maps4html/), [Metaverse Interoperability (OMI)](https://www.w3.org/community/metaverse-interop/), [WICG](https://www.w3.org/community/wicg/), [Stereoscopic 3D Web](https://www.w3.org/community/stereoweb/) (closed 2023) | the knowledge layer; `<model>`; identity; maps; SVGStereo's proposal; the 2013 attempt | [W3C Community Groups](https://www.w3.org/community/) | free; open participation |
| W3C Working Groups: [Immersive Web](https://www.w3.org/groups/wg/immersive-web/), [Media](https://www.w3.org/groups/wg/media/), [CSS](https://www.w3.org/groups/wg/css/), [GPU for the Web](https://www.w3.org/groups/wg/gpu/), [Spatio-temporal Data on the Web](https://www.w3.org/groups/wg/sdw/), [JSON-LD](https://www.w3.org/groups/wg/json-ld/), [RDF & SPARQL](https://www.w3.org/groups/wg/rdf-star/), [Verifiable Credentials](https://www.w3.org/groups/wg/vc/), [DID](https://www.w3.org/groups/wg/did/), [Federated Identity](https://www.w3.org/groups/wg/fedid/), [Privacy](https://www.w3.org/groups/wg/privacy/), [Web of Things](https://www.w3.org/groups/wg/wot/), [WebTransport](https://www.w3.org/groups/wg/webtransport/), [WebRTC](https://www.w3.org/groups/wg/webrtc/), [Audio](https://www.w3.org/groups/wg/audio/), [Timed Text](https://www.w3.org/groups/wg/timed-text/), [APA](https://www.w3.org/groups/wg/apa/), [Browser Testing and Tools](https://www.w3.org/groups/wg/browser-tools-testing/) | WebXR and Layers; WebCodecs and Media Capabilities; CSS; WebGPU; spatial data; the linked data stack; identity | [W3C groups](https://www.w3.org/groups/) | free at [w3.org/TR](https://www.w3.org/TR/) |
| W3C Interest Groups: [Media and Entertainment](https://www.w3.org/groups/ig/me/); the Web and TV IG's [Stereoscopic 3D Web Task Force](https://www.w3.org/2011/webtv/wiki/3dweb) (2012) | the 13 October 2026 discussion; the 2012 attempt | | free |
| [Khronos Group](https://www.khronos.org/) | glTF (3D Formats WG), OpenXR, Vulkan, OpenGL, EGL | | free registries |
| [Web3D Consortium](https://www.web3d.org/) with ISO/IEC JTC 1/SC 24 | X3D 4.0 (ISO/IEC 19775-1:2023), HAnim (ISO/IEC 19774) | [SC 24](https://www.iso.org/committee/45252.html) | free on web3d.org |
| [Metaverse Standards Forum](https://metaverse-standards.org/) | the Web of Worlds whitepaper and APIs, the User Manifest | | free |
| [OGC](https://www.ogc.org/) | GeoPose; joint spatial work with W3C since 2015 | | free |
| [IETF](https://www.ietf.org/) and [IANA](https://www.iana.org/) | RFC 9559 (CELLAR WG), RFC 8126, RFC 3870, RFC 7336; the Matroska registries | [CELLAR](https://datatracker.ietf.org/wg/cellar/about/) | free |
| [ISO/IEC JTC 1/SC 29](https://www.iso.org/committee/45316.html) (MPEG and JPEG) | 14496-12 (free at IEC), 14496-10 and 14496-15, 23008-12, 23000-11, 23002-3, 23002-7, 23091-2, 23009-1, 13818-1, 21496-1 | | the prices on [What it costs to follow every clause](../talks/2026-11-04-paid-standards/README.md), checked 4 November 2026: 14496-12:2026 CHF 0; 23000-11:2009 CHF 135; 14496-15:2024 CHF 227; 23002-3:2007 CHF 135; 23091-2:2025 CHF 159; 14496-10:2025 CHF 227; 23002-7:2026 CHF 227; 13818-1:2025 CHF 227; 21496-1:2025 CHF 100; 23008-12:2025 CHF 227 as [its ISO page](https://www.iso.org/standard/89035.html) listed it the same day, read through a search result because the page refused a direct read |
| [ITU-T SG21](https://www.itu.int/en/ITU-T/studygroups/2025-2028/21/Pages/default.aspx), since 2025 the successor of SG16, which wrote them | H.264, H.265, H.273, H.274, H.222.0, the free twins of the paid ISO/IEC texts | | [free](https://www.itu.int/rec/T-REC-H/en) |
| [ITU-R](https://www.itu.int/en/ITU-R/) | BT.2100, BT.2408 | | free |
| [CTA](https://www.cta.tech/) | CTA-861 (VICs, InfoFrames, EDID extensions), CTA-861.3 (HDR static metadata) | | [CTA-861-I](https://shop.cta.tech/products/cta-861) USD 405; [CTA-861.3-A](https://shop.cta.tech/products/cta-861-3) USD 74 |
| HDMI Licensing Administrator and the [HDMI Forum](https://hdmiforum.org/) | HDMI 1.4a 3D structures, the VSIF and the EDID bits; deep colour since 1.3 | [adopters](https://www.hdmi.org/adopter/index) | adopters only; the [1.4 3D extract](https://www.hdmi.org/docs/hdmi14bspecs) for evaluation; no published price, reported adopter fees on the paid standards page |
| [VESA](https://vesa.org/vesa-standards/) | DisplayPort (the stereo field), E-EDID, DisplayID | | members only; E-EDID and DisplayID through a download form |
| [CIPA](https://www.cipa.jp/e/std/std-sec.html) | DC-007 (MPO), DC-006 | | free download |
| [AOMedia](https://aomedia.org/) | AV1, AVIF | | free |
| [Wi-Fi Alliance](https://www.wi-fi.org/) | Miracast (Wi-Fi Display) | [membership](https://www.wi-fi.org/membership) | registered developers; membership for certification |
| [Academy Software Foundation](https://www.aswf.io/) | OpenEXR | | free |
| [NISO](https://www.niso.org/) | CRediT, ANSI/NISO Z39.104-2022 | | [free](https://credit.niso.org/) |
| [ETSI](https://www.etsi.org/) and DVB | TS 101 547-2, frame-compatible 3DTV | | free |
| [3GPP](https://www.3gpp.org/), [Bluetooth SIG](https://www.bluetooth.com/) | handover and roaming; beacons and Auracast | | free |
| the Linux kernel | the open implementation of HDMI 3D, EDID parsing and deep colour: `include/linux/hdmi.h`, `drivers/gpu/drm/drm_edid.c`, `include/uapi/drm/drm_mode.h` | [git.kernel.org](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/include/linux/hdmi.h?h=v7.3) | free, GPL-2.0 |
| Sparky Stereo OS and its libraries | the house formats, Stereo KWin, [stereo-layer](https://github.com/Sparky-OS/stereo-layer), [libstereo-declare](https://github.com/Sparky-OS/libstereo-declare), [SVGStereo](https://github.com/Sparky-OS/svgstereo), [Flat Headset](https://github.com/Sparky-OS/flat-headset); its own [glossary](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/glossary.md) of the edition's names | [Sparky-OS](https://github.com/Sparky-OS) | free |
| [awesome-stereoscopy](https://github.com/danielcamposramos/awesome-stereoscopy) | the standards page where every stereo mark is registered | | CC0 |

**Why the paid ones are paid, and what it costs.**
The issuers explain that selling their texts pays for developing them; [What it costs to follow every clause](../talks/2026-11-04-paid-standards/README.md) puts those prices next to the work that has to follow every clause.
Where a free twin exists (ITU-T for ISO/IEC 14496-10, 23002-7, 23091-2 and 13818-1), this page cites the free one.

## Where the texts come from

The clause numbers on this page were read in these texts, on 4 November 2026.

- ITU-T H.264 V16 (06/2026), H.265 V11 (01/2026), H.274 V4 (01/2026) and H.273 V4 (07/2024), downloaded from the ITU.
- ISO/IEC 14496-12:2026 (edition 8), Daniel's licensed copy, quoted at most a sentence at a time with its clause and page.
- RFC 9559, the RFC Editor's text.
- PNG Extensions 1.4.0, OpenEXR's documentation, the IANA Matroska registries, MP4RA, the WebXR Layers Working Draft of 11 August 2026, the W3C minutes of 13, 27, 28 and 30 October 2026, and the Web of Worlds whitepaper, read at their public addresses.
- HDMI 1.4a's values, read in the Linux kernel's `include/linux/hdmi.h` and `drivers/gpu/drm/drm_edid.c` (v7.3), since the HDMI text may only be read for evaluation.
- ISO/IEC 23008-12:2025, 23000-11, 23002-3, 23009-1 and 13818-1: not read here; their clauses are cited as the edition's reader contracts and depth marks record them, and marked so.

## Credits

Named from each project's own records.

- RFC 9559: Steve Lhomme, Moritz Bunkus and Dave Rice, IETF CELLAR Working Group, 2024.
- The Web of Worlds Whitepaper: Nicholas Polys, Johannes Behr and Tracey Swales, Metaverse Standards Forum, 3D Web Interoperability Domain Group, 31 March 2026.
- TPAC 2026 breakout #35: Muadh Al Kalbani, chair; Dave Raggett, Don Brutzman, François Daoust and elf Pavlik, whose words the minutes record.
- WebXR `inline-stereo`: Rik Cabanier, Immersive Web Working Group, merged 9 June 2026.
- The 2012 Stereoscopic 3D Web Task Force: Dong-Young Lee (LG Electronics), who also reviewed the first stereo report in October 2026; the 2013 Community Group and its research: Diego González-Zúñiga, Alexey Chistyakov, Pilar Orero and Jordi Carrabina.
- Anaglyph: Eric Dubois, ICASSP 2001.
- Frame packing and depth: the ITU-T video coding experts of SG16, now SG21.
- PNG `sTER`: the PNG Development Group; OpenEXR multi-view: the OpenEXR project at the Academy Software Foundation.
- CRediT: NISO; the StratML standard: Milton Ponson named it on the list; "semantic gravity cohered by meaning": Christoph Dorn.
- Knowledge3D's specifications: Daniel Campos Ramos, with the partners credited in [Knowledge3D's ATTRIBUTIONS.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/ATTRIBUTIONS.md).
- Sparky Stereo OS: Daniel Ramos's edition of SparkyLinux, by Paweł "pavroo" Pijanowski, with the people credited in the edition's [ATTRIBUTIONS.md](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/ATTRIBUTIONS.md).
- The Linux kernel's HDMI 3D code: Intel's i915 since Linux 3.13 (2013), and the DRM developers who wrote `drm_edid.c`.

AI partners were leveraged in the production of this work.

HDMI®, HDMI® High-Definition Multimedia Interface and the HDMI® Logo are trademarks or registered trademarks of HDMI Licensing Administrator, Inc.
