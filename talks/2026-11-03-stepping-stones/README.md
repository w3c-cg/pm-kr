<!-- Input to the PM-KR Community Group from an individual participant. Not a work item or output of the group. -->
> **Status:** input from an individual participant, Daniel Campos Ramos, to the list thread "Defining AI in 3D Space" (public-pm-kr and public-aikr, 28 October to 3 November 2026). Not a position of the group.

# Stepping stones I can show today

Christoph Dorn asked for stepping stones toward procedural knowledge representation, each with value of its own, and for each participant's perspective.
Dave Raggett described a mix of symbolic and neural approaches, with formal procedures often written in natural language.
Milton Ponson grounded the discussion in 3D space and time, and named StratML for turning natural language into machine-readable plans.
These are the stones from my own work that already exist, each with its record, so the group can weigh them next to everyone else's.

## 1. One truth, two interfaces

Christoph's first point: people and AI need different interfaces to the same knowledge, without losing information on the way.
- **The design:** Knowledge3D's [Dual Client Contract](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/DUAL_CLIENT_CONTRACT_SPECIFICATION.md) specifies human and synthetic users reading the same node truth, each through its own presentation.
- **Running today, at the scale of an operating system:** Lean Code in Sparky Stereo OS gives every text file a package ships (code, settings, documentation) two forms: the authored form people read, with every comment and explanation, and a lean form the machine reads. The lean form is recorded against the original, and the original can always be restored ([Lean Code packages](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/lean-code-packages.md)).
- **Measured:** the same installation lean, with its original files and lean again, on a laptop from 2016: builds against kernel headers 6 to 9 % faster, desktop programs 3 to 6 % smaller, boot unchanged, and one open problem published with the rest ([the measurement](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/lean-code-a10-aba.md)).

## 2. Semantic models first, procedures after

Christoph asked whether procedural memory must start with semantic modelling.
In Knowledge3D's design it does: knowledge is layered as form, meaning, rules and meta-rules ([Foundational Knowledge](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/FOUNDATIONAL_KNOWLEDGE_SPECIFICATION.md)), so a semantic model is the first stone, and procedures are added on top of it as they are understood.
Status: these specifications are my design; the current Knowledge3D code does not yet implement them.

## 3. Space and time on the screens people already own

- **One declaration that travels with the object:** a program marks its window as stereo once, and the desktop shows it in 3D on any 3D screen, while everything else stays 2D. The first report describes the specifications that already carry this, and what Linux and the web never adopted ([Stereo 3D on Linux and the Web](https://www.w3.org/publications/spec-generator/?type=respec&url=https://raw.githubusercontent.com/w3c-cg/pm-kr/main/reports/source/stereo-3d-adoption-report.html)); it was discussed at the Media and Entertainment Interest Group ([minutes, 13 October](https://www.w3.org/2026/10/13-me-minutes.html)).
- **Why on open standards:** a second report measures the headset and 3D TV markets and shows, case by case, that the closed stacks retreated while the open standards stayed ([Stereo 3D after TPAC 2026](https://www.w3.org/publications/spec-generator/?type=respec&url=https://raw.githubusercontent.com/w3c-cg/pm-kr/main/reports/source/stereo-3d-closed-stacks-open-standards.html)).
- **Procedures instead of pixels:** surface detail stored as procedures and evaluated per frame at the detail each part of each eye needs ([Dynamic Procedural Foveated Rendering](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/dynamic-procedural-foveated-rendering.md)); part of the answer, not all of it.

## 4. Places, paths and time

At the Web of Worlds session on 30 October, Dave raised spatial and semantic indexing, a room addressed by its path, the different ways of approaching time, discovery of which servers serve a world, and a workshop to map semantic, spatial and temporal linking together ([log](https://www.w3.org/2026/10/30-spatial-web-msf-irc), [minutes](https://www.w3.org/2026/10/30-spatial-web-msf-minutes.html)).
Knowledge3D's design has the same pieces: houses as places, and doors as links between them, each addressed by a k3d:// link ([Doors and network](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/DOORS_AND_NETWORK.md), [House, Galaxy and Tablet](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/HOUSE_GALAXY_TABLET.md)).
My input to that session is on its own page ([A Web of Worlds](../2026-10-30-tpac-web-of-worlds/README.md)); the workshop Dave proposed is where these approaches can be compared side by side.

## 5. Procedures people write, machines execute

Dave noted that formal procedures are often written in natural language; Milton proposed StratML (ISO 17469-1) to turn natural language plans into machine-readable form.
Both meet the first stone: one procedure, a form people read and a form machines execute, kept in step.

## A question for every participant

Would you describe your own stepping stone in three lines?
1. What exists today, with a link.
2. The next increment, and the value it has on its own.
3. What it needs from others in the group.

Replies on the list are welcome, and I will collect them on this page.

AI partners were leveraged in the production of this work.
