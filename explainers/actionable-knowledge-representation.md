# Actionable knowledge representation: an object that shows what it does, where it is

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

A knowledge graph says what a thing is and how it relates to other things.
A person in a space, or a robot, needs something more direct: what can I do with this, here, now.
Where has that been done well?

## The idea

In games, for decades.
The game interface taxonomy of Fagerholt and Lorentzon ("Beyond the HUD", Chalmers with EA DICE, 2009) sorts interface elements as diegetic, non-diegetic, spatial and meta.
Its example, Dead Space (2008), presents its interface "in the game geometry in a diegetic manner": holograms show "the status of doors (locked/unlocked), what items that can be picked up and what they will do".
An object that shows what it is and what it does, where it is, is a knowledge representation of actions: **actionable knowledge representation**, an existing phrase in knowledge management, taken here as the name of what PM-KR studies in space ([spatial browsing input, point 3](../talks/2026-10-28-tpac-spatial-browser/README.md#3-service-discovery-beyond-location); [glossary](../glossary/README.md#actionable-knowledge-representation)).

For a Web of Worlds this is the knowledge layer at the scale of one object: the door that shows whether it opens and where it leads, the tool that shows what it does, each carrying its meaning and its provenance with it ([The knowledge layer](knowledge-layer.md)).

## Where it exists today

- The taxonomy: [Beyond the HUD](https://publications.lib.chalmers.se/records/fulltext/111921.pdf) (PDF).
- Knowledge3D's design, where a node carries meaning, procedures and provenance, so a person, an AI and a robot read the same object; a design the current code does not yet implement ([node specification](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/K3D_NODE_SPECIFICATION.md)).

## Questions for the group

1. Which object in your work would benefit from showing its own actions in place?
2. Which game interface taught you something a document never did?
