# Procedural Memory Knowledge Representation (PM-KR)

[![Report editorial checks](https://github.com/w3c-cg/pm-kr/actions/workflows/editorial-checks.yml/badge.svg)](https://github.com/w3c-cg/pm-kr/actions/workflows/editorial-checks.yml)

**W3C Community Group** | [Join](https://www.w3.org/community/pm-kr/) | [GitHub](https://github.com/w3c-cg/pm-kr) | [Reference Implementation](https://github.com/danielcamposramos/Knowledge3D)

**Chair:** Daniel Campos Ramos (EchoSystems AI Studios) **Co-Chair:** Milton Ponson (Rainbow Warriors Core Foundation CIAMSD) **Status:** OPEN for participation | Published February 2026

---

## Start with the discussion and evidence

PM-KR investigates how reusable procedures, explicit meaning and provenance could let human interfaces and AI systems share knowledge. The group is incubating proposals; this README does not announce an adopted W3C standard.

- [Reports and their status](reports/README.md): the standards-path discussion remains a CG draft; stereo/HDR adoption remains individual input for the group's consideration.
- [Senior-partner prompting experiment](reports/experiments/2026-10-21-partnership-framing/README.md): an individual pilot with prompts, cross-provider samples and executable checks; all completed answers caught the defect, while repair quality varied.
- [Public issues](https://github.com/w3c-cg/pm-kr/issues) and [mailing-list archive](https://lists.w3.org/Archives/Public/public-pm-kr/): discussion, questions and recorded decisions.
- [Knowledge3D's public evidence and proposal index](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/README.md): one implementation and design corpus informing discussion, without constraining other approaches.

## The user-facing problem

A lesson about a pulley may have a diagram, a simulation, text, accessibility descriptions and an AI-facing representation. These serve different needs; some encode overlapping facts and can drift when edited independently. PM-KR asks which parts can share a canonical source, which must stay modality-specific, and how to preserve meaning and provenance between them.

For a student, the desired outcome is consistent information across visual, audio, tactile and machine interfaces. For a developer, it is less duplicated maintenance and a documented way to exchange executable knowledge. Existing semantic, accessibility and media standards provide foundations; the proposed contribution is a compositional procedural layer that can connect them.

## Proposed approach

Represent a knowledge entry through explicit meaning, reusable procedures and versioned references. A client could execute a procedure, present an appropriate representation, or inspect its provenance. Knowledge3D explores RPN programs and spatial organization as one implementation approach.

For example, a character entry could reference a glyph program, a semantic identifier, language-specific names and accessible representations. Sharing an identifier does not make these representations interchangeable: Braille, speech, typography and language each need their own rules and testing. Compression gains must be measured on a stated corpus, including references and runtime overhead.

### Goals

- Reduce avoidable duplication through reusable canonical content and references.
- Make procedure inputs, execution context, outputs and provenance inspectable.
- Support human and machine clients without requiring identical presentation.
- Study interoperability with existing web formats and multiple implementations.
- Include accessibility, internationalization, privacy and security in design and validation.

### Non-goals

The proposal does not replace RDF, OWL or JSON-LD, mandate GPU execution, select one AI architecture, or require spatial presentation. Knowledge3D's GPU runtime and House/Galaxy architecture are implementation choices. Alternative implementations and approaches are welcome.

## Candidate use cases

These are scenarios for requirements and testing, not a claim that every path is implemented end to end.

| Scenario | Desired outcome | Evidence to seek |
| --- | --- | --- |
| Inclusive education | A shared lesson remains consistent in visual, spoken and tactile forms | Assistive-technology tests and review with users |
| Knowledge reuse | Multiple courses reference common concepts and procedures | Update propagation, storage and execution measurements |
| Inspectable AI execution | A user can inspect the procedures and sources used for an answer | Reproducible traces, including failures and limits |
| Spatial collaboration | Human and AI clients refer to the same objects across 2D, stereo and immersive views | Cross-client identity and presentation tests |
| Cross-implementation exchange | Independently developed clients interpret an entry consistently | A versioned format, test corpus and independent runs |

The [stereo/HDR report](reports/source/stereo-3d-adoption-report.html) connects scientific, engineering, AI and desktop workflows to concrete presentation questions. Sparky Stereo OS supplies implementation experience with the desktop/display path. Stereo device observations inform that discussion; choosing an HDR working representation still requires its own engineering and device testing. Outreach identifies relevant work and potential reviewers; it does not establish participation or endorsement.

## Alternatives and unresolved choices

RDF/OWL/JSON-LD already describe shared meaning and relationships; the question is how executable procedures should reference those descriptions and what interoperability is demonstrable. SVG, MathML, media and scene formats already serve important presentation roles. A procedural layer should justify any additional machinery against those existing solutions.

Explicit programs can expose operations more directly than learned representations, but they still require a runtime, interpretation of inputs and independent validation of outputs. They do not by themselves guarantee correct reasoning. Open choices include execution limits, versioning, semantic equivalence, cache invalidation, accessible interaction and evidence of benefit over simpler approaches.

## Accessibility, internationalization, privacy and security

Accessible visual, audio, tactile and non-spatial paths are design goals that need separate user and device evaluation. Language-specific forms may share a concept identifier, but meaning is contextual and cross-language equivalence must not be assumed.

Local execution can reduce the need to send personal knowledge to a service. Exchange still needs consent, access controls and a clear boundary between public and private information. Executable knowledge also needs resource limits, provenance checks and an execution threat model. Reducing framework dependencies does not remove risks in drivers, runtimes, procedures or surrounding software.

## Implementation and group scope

[Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) is an independently developed reference implementation for concepts proposed to PM-KR. Its published code and reports are evidence to evaluate, not proof of an adopted conformance standard. It does not constrain the group's discussions and is not a group deliverable.

PM-KR's role is collaborative incubation: use cases, candidate models, interoperability questions and possible reports. A future standards transition depends on the relevant W3C process and group decisions.

## Human-led editorial checks

[respec-mcp](https://github.com/danielcamposramos/respec-mcp) makes repository policy and ReSpec diagnostics reviewable through GitHub Actions, a local CLI and MCP. Reviewers can read job summaries and JSON evidence without installing an AI client. A passing result covers those configured checks; it does not validate consensus or technical claims.

See [practical commands, profiles and document skills](reports/README.md). Explain ideas in your preferred language if that is easier; AI partners can help draft English while preserving your meaning, uncertainty and attribution. **Se for mais fácil para você, pode explicar em sua própria língua.**

---

## Participant snapshot (March 2026)

Historical context: affiliations identify individuals and do not imply institutional endorsement of the proposals. For current participation, use the [group page](https://www.w3.org/community/pm-kr/).

### Early Ingressors
- **Jonathan DeRouchie** — Persistent memory AI architecture, public/private knowledge separation
- **Nitin Pasumarthy** (LinkedIn LLM/GNN) — Production-scale systems perspective
- **Hanna Abi Akl** (INRIA, France) — Neuro-symbolic AI, representing Institut National de Recherche en Informatique et en Automatique
- **OpenFn Organization** — Real-world validation (40+ countries, 10M+ transactions/year)

### Key Participants
- **Milton Ponson** (Co-Chair, Mathematician) — Godelian critique of LLM scaling, Domains of Discourse
- **Christoph Dorn** (K3D main contributor, PM-KR group member) — Coined "semantic gravity cohered by meaning"; TerraVision spatial heritage
- **Damir Cavar** (Indiana University) — Computational linguistics, AI energy efficiency, Quantum AI, NLP (20+ years)
- **Henrique Santos** (RPI/Tetherless World Constellation) — Director of Semantic Applications, DARPA Machine Common Sense
- **Anisa Rula** (University of Brescia, Italy) — Co-author of the Knowledge Graphs book (Springer 2021), KG quality and validation
- **Oserebameh Beckley** — WebGPU compute shaders, GPU memory management, ray tracing
- **Majid Babaei** (McGill University, Canada) — AI explainability via knowledge graphs, LLMs and AI agents research
- **Charles Waweru** — W3C Meta-Layer Infrastructure CG, contextual annotation and semantic overlays

### Institutions
- **Rensselaer Polytechnic Institute** (Tetherless World Constellation — world's top knowledge graph center)
- **Indiana University** (Computational linguistics program)
- **University of Brescia** (Knowledge graph validation, semantic web research)
- **INRIA** (French national research institute for computer science)
- **McGill University** (AI explainability, LLM/AI agent research)
- **LinkedIn** (Production-scale GNNs)
- **Digital Bazaar** (Semantic Web technologies)

---

## Early Collaborative Insights

### Jonathan DeRouchie: Cognitive Load and Familiar Technical Concepts
"Users are more likely to adopt a framework that uses or simplifies existing language, concept or structure."
Led to Track 6 proposal: Developer Adoption and Cognitive Load Minimization: mapping PM-KR concepts to familiar mental models (file system, OOP, graph database, 3D modeling).

### Marko Rodriguez: Graph Traversal Expertise
Apache TinkerPop founder, Gremlin creator.
Ensuring PM-KR builds on established graph theory.
Gremlin-style 2D graph traversal extends naturally to PM-KR's 3D spatial traversal.

### Biological Grounding: Hippocampus-Inspired Architecture
PM-KR's spatial architecture has biological roots in hippocampal function: place cells map to 3D rooms, memory consolidation maps to sleep-time protocols, episodic memory maps to procedural audit trails.
This grounding informs Track 5: Ethics and Safety for AI Agents and Robots.

---

## Initial 2026 plan and possible deliverables

The schedule below records the initial plan, not completed milestones. Use the public repository history and meeting records for subsequent activity.

### Q1 2026 plan
- Community Group published and open
- Foundation documents available
- 24+ participants from 7+ institutions
- First working sessions upcoming

### Q2 2026
- Public comment period, gather use cases
- Collaborative working sessions
- Interoperability studies (RDF/JSON-LD mapping, WebGPU integration, spatial data standards)

### Q3-Q4 2026
- Draft specifications (data models, execution semantics, audit journal, conformance levels)
- Test suites and validation frameworks
- Reference implementations beyond Knowledge3D

### Potential Outputs (Subject to Group Consensus)
- Data model specification (procedural composition, symlink references, content-addressing)
- Execution semantics (dual-client rendering, canonical procedures)
- Audit and tracing specification (temporal metadata, provenance, explainability)
- Compression guidelines (procedural canonicalization, carbon impact assessment)
- Interoperability guidelines (RDF/OWL/JSON-LD, WebGPU compute, glTF extensions)
- Accessibility specification (multi-modal rendering from procedural sources)
- Use case documentation (accessibility, XR, knowledge graphs, AI systems, robotics, spatial data)

---

## Proposed Year 1 tracks

| Track | Focus | Champion |
|-------|-------|----------|
| **1** | OpenFn Integration Architecture | Production validation |
| **2** | BPMN to PM-KR Compilation Strategy | Workflow verification |
| **3** | State/Context Ontology | Audit schema, provenance |
| **4** | Lean4 Formalization | Theorem proving for correctness |
| **5** | Ethics and Safety for AI Agents/Robots | Safety predicates, multi-agent coordination |
| **6** | Developer Adoption and Cognitive Load | Familiar technical labels, mental models |

---

## Technical Documentation

### Knowledge3D architecture proposals and specifications
- [THREE_BRAIN_SYSTEM_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/THREE_BRAIN_SYSTEM_SPECIFICATION.md) — Cranium + Galaxy + House architecture
- [DUAL_CLIENT_CONTRACT_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/DUAL_CLIENT_CONTRACT_SPECIFICATION.md) — Form to Meaning evolution
- [MEANING_CENTRIC_STAR_SCHEMA_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/MEANING_CENTRIC_STAR_SCHEMA_SPECIFICATION.md) — Atomic knowledge unit
- [Complete Vocabulary Index](https://github.com/danielcamposramos/Knowledge3D/tree/main/docs/vocabulary)

### Candidate PM-KR documents hosted by Knowledge3D
- [PM_KR_PROBLEM_STATEMENT.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_PROBLEM_STATEMENT.md) — Why PM-KR?
- [PM_KR_NORMATIVE_MODEL.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_NORMATIVE_MODEL.md) — candidate model using normative requirement language
- [PM_KR_CONFORMANCE_PROFILES.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_CONFORMANCE_PROFILES.md) — proposed Level A/B/C requirements
- [PM_KR_INTEROPERABILITY_GUIDE.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_INTEROPERABILITY_GUIDE.md) — proposed RDF/OWL/JSON-LD mapping

### Video Presentations
- [Knowledge3D — A Universe of Meaning (6 min)](https://www.youtube.com/watch?v=D1k_uCPBjLc): Overview
- [Multi-Language Playlist (12 languages)](https://www.youtube.com/playlist?list=PLmWTHH0cS_OgQ7h_xRMhZ6UqE5mRYAhD7)

### Deep Dive Resources
- [PM-KR NotebookLM Research Space](https://notebooklm.google.com/notebook/98ffd298-1314-477f-b1e1-8d29da4f3848) — Explore PM-KR technology and architecture
- [K3D Theory Research Space](https://notebooklm.google.com/notebook/1bd10bda-8900-4c41-931e-c9ec67ac865f) — Deep dive into the reference implementation

---

## How to Participate

### Join the Community Group
1. Visit: https://www.w3.org/community/pm-kr/
2. Create W3C account (free): https://www.w3.org/accounts/request
3. Join the group (no membership fees, open participation)

### Contribute
- **Review specifications** and share feedback
- **Propose use cases** from your domain
- **Participate in interoperability studies** (RDF/OWL/JSON-LD mapping, WebGPU integration, glTF extensions)
- **Help shape conformance levels** and test suites
- **Explore procedural canonicalization** patterns
- **Test bidirectional mapping** (RDF ↔ PM-KR, glTF ↔ PM-KR)

---

## Philosophy

**"We patent nothing.
We publish everything.
We build in the open."**

- **Contribution terms**: see [CONTRIBUTING.md](CONTRIBUTING.md) and this repository’s [license](LICENSE.md); implementation repositories have their own licenses.
- **Public mailing lists**: Transparent decision-making
- **Open collaboration**: Alternative implementations welcomed
- **Cross-domain impact**: Work benefits accessibility, XR, knowledge graphs, AI, robotics, spatial data, performance, and trust: simultaneously

---

## Proposed repository structure

```
pm-kr/
├── README.md                     # This file
├── CONTRIBUTING.md               # Contribution guidelines
├── CODE_OF_CONDUCT.md            # W3C Code of Conduct
├── LICENSE                       # W3C Community Group License
├── specifications/               # Draft specifications (collaborative)
├── use-cases/                    # Use case documentation
├── interoperability/             # Interop studies and mappings
└── tests/                        # Test suites and validation
```

This structure will evolve as the group develops specifications collaboratively.
Technical documentation currently lives in [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) as the reference implementation.

---

## References and Acknowledgments

### Inspiration and Heritage
- **Gutenberg Press** (1440) — Democratized knowledge
- **Aaron Swartz** — Guerrilla Open Access Manifesto, open knowledge philosophy
- **Tim Berners-Lee** — Giant Global Graph vision, Semantic Web
- **Nikola Tesla** — 3-6-9 sacred geometry, ternary logic inspiration

### Technical Foundations
- **NVIDIA** — CUDA, PTX ISA
- **W3C Semantic Web Community** — RDF, OWL, JSON-LD foundations
- **Game Industry** — glTF, spatial rendering, procedural generation
- **Unicode Consortium** — Character representation standards
- **Khronos Group** — Vulkan, OpenGL, GPU standards

**Complete Attributions**: [Knowledge3D ATTRIBUTIONS.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/ATTRIBUTIONS.md)

---

## Contact

**Mailing List**: public-pm-kr@w3.org **GitHub**: https://github.com/w3c-cg/pm-kr **W3C Page**: https://www.w3.org/community/pm-kr/ **Reference Implementation**: https://github.com/danielcamposramos/Knowledge3D **Questions?**
Email: daniel@echosystems.ai

---

**Ready to help build the future of knowledge representation?
[Join us.](https://www.w3.org/community/pm-kr/)**
