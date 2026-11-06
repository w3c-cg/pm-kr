# One truth, two interfaces

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

People and AI need different interfaces to the same knowledge, without losing information on the way.
A person reads a page with its pictures and its explanations; a machine executes the procedure underneath.
If the two are kept as two documents, they drift.
How is one source presented in two modalities, and does it run anywhere today?

## The idea

- **The design**: Knowledge3D's [Dual Client Contract](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/DUAL_CLIENT_CONTRACT_SPECIFICATION.md) specifies human and synthetic users reading the same node truth, each through its own presentation.
  The Web of Worlds whitepaper describes a user and an AI agent operating in a shared virtual world; the question put to its authors is whether the two clients consume the same underlying node data ([Web of Worlds input, point 4](../talks/2026-10-30-tpac-web-of-worlds/README.md#4-the-same-knowledge-for-people-and-ai)).
- **Running today, at the scale of an operating system**: Lean Code in Sparky Stereo OS gives every text file a package ships (code, settings, documentation) two forms: the authored form people read, with every comment and explanation, and a lean form the machine reads.
  The lean form is recorded against the original, and the original can always be restored ([Lean Code packages](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/lean-code-packages.md)).
- **Measured**: the same installation lean, with its original files and lean again, on a laptop from 2016: builds against kernel headers 6 to 9 % faster, desktop programs 3 to 6 % smaller, boot unchanged; one program's larger figure was traced to its catalog cache, not to the lean files ([the measurement](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/proofs/lean-code-a10-aba.md)).
- **Procedures people write, machines execute**: Dave Raggett noted at the list that formal procedures are often written in natural language, and Milton Ponson proposed StratML (ISO 17469-1) to turn plans into machine-readable form; both meet the same stone, one procedure in a form people read and a form machines execute, kept in step ([Stepping stones I can show](../talks/2026-11-03-stepping-stones/README.md)).

## Questions for the group

1. Where in your work do a human form and a machine form of the same thing drift apart?
2. Which of them would you make the recorded source, and how would you restore the other?
