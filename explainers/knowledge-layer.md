# The knowledge layer: what a scene graph does not say

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

A scene graph says where things are: identity, transform, hierarchy, and perhaps a semantic role per node.
Signing says who published an object.
An AI or a robot reasoning over the scene, and a person using it, also need to know what each thing is, what it does, and where that knowledge came from.
Which layer carries that, and who is working on it?

## The idea

A knowledge layer next to the scene graph, stored once as procedures for people and AI alike, beside RDF, OWL and JSON-LD.
In Knowledge3D's design each node carries meaning, procedures and provenance, so a person, an AI and a robot use the same house and the same procedures, and a workshop room can be the digital twin of a factory floor ([node specification](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/K3D_NODE_SPECIFICATION.md); [robotic embodiment](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/ROBOTIC_EMBODIMENT_SPECIFICATION.md)).
The specifications describe the design; the current code does not yet implement them.

Semantic role is where the layer starts: the Web of Worlds session asked for a minimal node structure with identity, transform, hierarchy and semantic role, and the offer is to compare designs and explore a mapping to that node model ([Web of Worlds input, point 1](../talks/2026-10-30-tpac-web-of-worlds/README.md#1-semantic-role-is-where-the-knowledge-layer-starts)).
At the scale of one object the layer is [actionable knowledge representation](actionable-knowledge-representation.md); at the scale of a world it is the composition model the group map places with PM-KR ([Where the work belongs](web-of-worlds-task-force.md)).

## Where it exists today

- X3D 4.0 already has a semantic encoding: "you can express any scene graph in X3D as triples", in the session's minutes, with the [X3D Ontology](https://www.web3d.org/x3d/content/semantics/semantics.html); the Web of Worlds whitepaper describes a user and an AI agent operating in a shared virtual world ([glossary, composition model](../glossary/README.md#composition-model-and-semantic-role)).
- PM-KR's own [problem statement](../README.md#the-user-facing-problem): a lesson about a pulley with a diagram, a simulation, text and an AI-facing representation that drift when edited apart, and the question which parts can share a canonical source.

## Questions for the group

1. In your scene format, where would you put what an object does and where that knowledge came from?
2. Would a mapping between Knowledge3D's node and the Forum's node model be worth a joint test?
