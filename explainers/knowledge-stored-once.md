# Knowledge stored once: from form to meaning

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** this is the group's own question, from its charter: knowledge stored once as executable procedures, like font programs, consumed by humans and AI systems from the same source.

## The question

A lesson about a pulley may have a diagram, a simulation, text, accessibility descriptions and an AI-facing representation.
They serve different needs, some encode the same facts, and they drift when edited apart.
For a student the desired outcome is the same information in visual, spoken, tactile and machine form; for a developer, less duplicated maintenance and a documented way to exchange executable knowledge ([the group's problem statement](../README.md#the-user-facing-problem)).
Which parts can share one source, which must stay specific to a form, and how do meaning and provenance survive between them?

## The idea

Store knowledge once, as procedures with explicit meaning and provenance, that people and AI consume alike.
A knowledge entry has four layers: form, meaning, rules and meta-rules ([glossary](../glossary/README.md#the-four-layers-form-meaning-rules-meta-rules)); a semantic model is the first stone, and procedures are added on top of it as they are understood ([Stepping stones I can show, point 2](../talks/2026-11-03-stepping-stones/README.md#2-semantic-models-first-procedures-after)).

**The stepping stone that already scales is the font file.**
A glyph is a small procedure, an outline with its hinting program, mapped to a meaning, its Unicode character; writing itself began as drawings, the A from an ox's head.
A first deliverable in that image: a repository of knowledge entries, each a procedure for its form, a SKOS term for its meaning and PROV for its origin and time, next to RDF, OWL and JSON-LD rather than in place of them ([the reply on the list, 28 October 2026](https://lists.w3.org/Archives/Public/public-pm-kr/2026Oct/0016.html), and [its clarification](https://lists.w3.org/Archives/Public/public-pm-kr/2026Oct/0018.html): the font file is the precedent for the format, not procedural fonts as the deliverable).

**Small models over a shared space.**
Knowledge that lives once in a space people can inspect lets small specialist models navigate it instead of one large model memorising everything; the specifications describe that design, the current Knowledge3D code does not yet implement it, and no energy saving is claimed for it until measured ([AI policy input, point 12](../talks/2026-10-28-tpac-ai-policy/README.md#12-small-models-and-shared-knowledge)).

## What it is not

The proposal does not replace RDF, OWL or JSON-LD, mandate GPU execution, select one AI architecture, or require spatial presentation; Knowledge3D's runtime and its House and Galaxy architecture are implementation choices, and other approaches are welcome ([non-goals](../README.md#non-goals)).

## Where it exists today

- [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D), the reference implementation, now paused: the model, not the specification.
- Two things running at the scale of an operating system that follow the same rule: Lean Code, one source in a form people read and a form the machine reads ([One truth, two interfaces](one-truth-two-interfaces.md)), and the skills that people and AI partners follow alike ([Skills are procedural memory](skills-as-procedural-memory.md)).
- The group's [candidate use cases](../README.md#candidate-use-cases), with the evidence each would need.

## Questions for the group

1. In your own work, which knowledge exists in three forms that drift?
2. What would the font-file analogy miss for your domain?
