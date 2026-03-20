# Procedural Memory Knowledge Representation (PM-KR)

**W3C Community Group** | [Join](https://www.w3.org/community/pm-kr/) | [GitHub](https://github.com/w3c-cg/pm-kr) | [Reference Implementation](https://github.com/danielcamposramos/Knowledge3D)

**Chair:** Daniel Campos Ramos (EchoSystems AI Studios)
**Co-Chair:** Milton Ponson (Rainbow Warriors Core Foundation CIAMSD)
**Status:** OPEN for participation | Published February 2026

---

## The User-Facing Problem

A single Unicode character today exists as: a font glyph, an embedding vector, accessibility metadata, a visual rendering, and an AI token — **five separate copies of the same knowledge**, maintained independently, drifting apart. Multiply by every character, formula, and concept on the web.

**For end users:**
- A blind student's screen reader, a sighted student's display, and a classroom AI each consume different representations of the same lesson — none can share context with the others
- Knowledge on the web is flat: documents, search bars, chat windows. You can't walk through it, point at it, or explore it spatially
- When AI systems reason about knowledge, users can't inspect how or why — the reasoning is hidden in opaque parameters

**For developers:**
- The same knowledge must be encoded separately for each modality (visual, semantic, tactile, audio) — massive duplication and maintenance burden
- No W3C standard exists for storing knowledge once as an executable procedure consumable by both humans and machines
- Accessibility, internationalization, and semantic meaning require separate implementation passes over the same content

**For the web platform:**
- Tim Berners-Lee's Giant Global Graph vision remains unrealized — knowledge is siloed in format-specific representations, not linked by meaning
- Accessibility is bolted on after the fact, not built into the knowledge representation itself
- AI systems and human interfaces consume fundamentally different formats for the same knowledge, making interoperability a per-integration effort

---

## Proposed Approach

PM-KR standardizes storing knowledge **once** as executable procedures (like TrueType font programs or mathematical definitions) with symlink-style composition. One procedural source renders visually for humans, executes semantically for AI, produces Braille for tactile readers, and synthesizes audio descriptions — all from the same canonical entry.

### How It Works (Conceptual Example)

The letter "A" stored as a single procedural entry:

```
Procedural Source (RPN):
  Visual:  SET_COLOR 0 0 0 1 STROKE_WIDTH 0.05 MOVE -0.3 -0.5 LINE 0.0 0.5 LINE 0.3 -0.5 STROKE
  Meaning: CONCEPT LETTER LATIN UPPERCASE PUSH
  Surface: { "en": "letter A", "pt": "letra A", "ja": "エー", "ar": "أَلِف" }

Output (from same source):
  Screen → renders the glyph
  AI     → executes the semantic identity
  Braille → drives tactile cell pattern
  Audio  → "uppercase Latin letter A"
```

**No duplication.** The visual program draws it. The meaning program identifies it. The surface forms link to language-specific words without duplicating them. Every client reads the same canonical entry.

### Core Principles

- **Zero duplication** — one procedural source, referenced everywhere (like Debian's APT package model)
- **Dual-client reality** — same source serves both humans and AI without translation layers
- **Multi-modal accessibility** — visual, semantic, tactile, auditory output from single canonical procedure
- **Meaning-centric** — knowledge is organized by meaning, not by language ("cat" = one concept with surface forms in every language)
- **Sovereign execution** — implementations can run with zero external dependencies in the hot path

---

## Use Cases

### 1. Inclusive Education
A physics teacher says "demonstrate a pulley system." The classroom AI builds a working 3D pulley — visible on screen, navigable by screen reader, explorable by touch. The blind student and sighted student share the **same** spatial lesson from the **same** procedural source, not parallel approximations maintained separately.

### 2. Knowledge Deduplication at Web Scale
A university stores "photosynthesis" once — as a procedural entry with RPN programs for the biochemical process, visual diagrams, audio explanations, and multi-language surface forms. Every course, every modality, every AI assistant references the same canonical entry. Today, this knowledge exists in dozens of incompatible formats across the institution.

### 3. Auditable AI Reasoning
When an AI reasons about "Is water an element?", PM-KR implementations make the reasoning path inspectable: navigate from "water" to "compound" to "hydrogen + oxygen" via executable procedural links. Every step is traceable and auditable — not hidden in matrix multiplications.

### 4. Multi-Modal Accessibility from Single Source
The same procedural font program that renders "A" on screen also drives a Braille cell, generates an audio description, and provides AI with semantic identity — all from one compact RPN program. No separate accessibility layer to maintain.

### 5. Cross-Platform Knowledge Sharing
A knowledge entry authored in one PM-KR implementation can be consumed by any other — human or machine. A VR application, a screen reader, a web API, and an AI agent all read the same procedural source. The standard defines the format; implementations choose their rendering.

---

## Non-Goals

- **Replacing RDF/OWL** — PM-KR complements Semantic Web standards with executable semantics, not replaces them. Bidirectional mapping is a deliverable.
- **Mandating GPU execution** — Sovereign GPU execution is a design principle of the reference implementation, not a requirement of the standard. CPU implementations are valid.
- **Defining a game engine** — PM-KR uses spatial representation concepts but standardizes knowledge representation, not entertainment rendering.
- **Constraining AI architectures** — PM-KR defines how knowledge is stored and composed, not how AI systems must reason over it.

---

## Why This Over Alternatives

### Why Not Traditional Knowledge Graphs (RDF/OWL) Alone?
Knowledge graphs describe what things ARE (declarative). PM-KR describes how things WORK (procedural). A KG says "A is a letter"; PM-KR stores the executable program that draws A, pronounces A, and reasons about A. KGs require external reasoners; PM-KR knowledge executes itself. **PM-KR interoperates with RDF/OWL** — it adds an executable layer, not a competing one.

### Why Not LLM Embeddings as Knowledge Representation?
Embeddings are opaque vectors — you can't inspect why two concepts are similar, and every model generates its own. PM-KR entries carry explicit executable programs, surface forms, and taxonomic references. The knowledge is auditable, shareable, and model-independent. Embeddings duplicate knowledge per model; PM-KR stores it once.

### Why Not Existing Multimedia Standards (SMIL, SVG, MathML)?
These standards excel at their modalities but don't compose into a unified knowledge entry. SVG draws; MathML represents formulas; SMIL sequences media. None stores the **meaning** — the executable semantic identity — that lets a single source serve all modalities and both human and machine clients.

### Why Procedural (RPN) Instead of Declarative?
Procedural programs are inherently executable: they produce output when run. Declarative descriptions require an interpreter. A procedural font program **draws the glyph**; a declarative font description **describes how someone else should draw it**. For dual-client reality (humans see, AI executes), executable procedures eliminate the translation layer.

### Why Spatial Representation?
The IT industry borrowed spatial metaphors (windows, desktop, doors, folders, addresses) and kept them flat. PM-KR's reference implementation reverses this: spatial metaphors become actual spatial objects. Research in spatial cognition (Method of Loci, hippocampal spatial memory) shows humans and AI both benefit from spatial organization. The standard accommodates but does not mandate spatial representation.

---

## Accessibility, Internationalization, Privacy, and Security Considerations

### Accessibility
Multi-modal output is architectural, not an add-on. The same procedural source renders for visual displays, Braille readers, audio synthesis, and haptic devices. The Dual-Client Contract ensures humans and AI consume identical knowledge — a blind user accesses the same semantic content as a sighted user, from the same source.

### Internationalization
Knowledge is meaning-centric, not language-centric. "Cat" is one entry containing surface forms for every language (English "cat", Portuguese "gato", Japanese "猫"). Reasoning operates on meaning, not language surface. New languages add surface forms to existing entries — they don't create new knowledge.

### Privacy
PM-KR is designed for local-first execution. The standard does not require cloud connectivity. Knowledge can remain on the user's device. Network interfaces between knowledge spaces are explicit and permissioned.

### Security
Procedural canonicalization enables content-addressed knowledge with cryptographic provenance. Sovereign execution (zero external dependencies) eliminates supply chain risk from ML frameworks. Every procedural execution is auditable via the Audit Journal pattern.

---

## Relevance Across W3C Groups

| W3C Area | PM-KR Contribution |
|----------|-------------------|
| **WebGPU** | GPU-native procedural execution patterns for compute shaders |
| **Spatial Data on the Web** | 3D spatial knowledge navigation (semantic proximity = spatial proximity) |
| **Publishing & Math** | Procedural typography (168,206 glyph-text pairs) and math symbols as RPN templates |
| **Web Performance** | 200:1 to 1000:1 compression via procedural canonicalization |
| **JSON-LD / Semantic Web** | Executable semantics complementing RDF; symlink composition reducing redundancy |
| **Immersive Web (WebXR)** | Spatial knowledge in 3D assets; dual-client reality in VR/AR |
| **Web Accessibility (WAI)** | Multi-modal rendering from single procedural source; zero dual-maintenance |
| **Verifiable Credentials / Solid** | Content-addressed knowledge with cryptographic provenance; decentralized trust |
| **Distributed Tracing** | Procedural execution audit trail bridging observability and explainability |

---

## Reference Implementation: Knowledge3D

This work is **motivated by prior work** on [**Knowledge3D**](https://github.com/danielcamposramos/Knowledge3D), which serves as the reference implementation for PM-KR concepts.

**Important**: That work does not constrain the group's discussions, nor will it be a deliverable of this group. **We welcome alternative implementations and approaches.**

| Repository | Purpose | Status |
|------------|---------|--------|
| **[Knowledge3D](https://github.com/danielcamposramos/Knowledge3D)** | Reference implementation, production system | Active development |
| **[pm-kr](https://github.com/w3c-cg/pm-kr)** (this repo) | Open standards, specifications, test suites | Standards track |

**Think of it like**: Knowledge3D is the browser; pm-kr is the spec. Like WebKit implements W3C HTML/CSS.

---

## Participants (March 2026)

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
"Users are more likely to adopt a framework that uses or simplifies existing language, concept or structure." Led to Track 6 proposal: Developer Adoption and Cognitive Load Minimization — mapping PM-KR concepts to familiar mental models (file system, OOP, graph database, 3D modeling).

### Marko Rodriguez: Graph Traversal Expertise
Apache TinkerPop founder, Gremlin creator. Ensuring PM-KR builds on established graph theory. Gremlin-style 2D graph traversal extends naturally to PM-KR's 3D spatial traversal.

### Biological Grounding: Hippocampus-Inspired Architecture
PM-KR's spatial architecture has biological roots in hippocampal function: place cells map to 3D rooms, memory consolidation maps to sleep-time protocols, episodic memory maps to procedural audit trails. This grounding informs Track 5: Ethics and Safety for AI Agents and Robots.

---

## Timeline and Deliverables

### NOW (Q1 2026)
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

## Year 1 Tracks

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

### Core Specifications (Live in Knowledge3D)
- [THREE_BRAIN_SYSTEM_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/THREE_BRAIN_SYSTEM_SPECIFICATION.md) — Cranium + Galaxy + House architecture
- [DUAL_CLIENT_CONTRACT_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/DUAL_CLIENT_CONTRACT_SPECIFICATION.md) — Form to Meaning evolution
- [MEANING_CENTRIC_STAR_SCHEMA_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/MEANING_CENTRIC_STAR_SCHEMA_SPECIFICATION.md) — Atomic knowledge unit
- [Complete Vocabulary Index](https://github.com/danielcamposramos/Knowledge3D/tree/main/docs/vocabulary)

### W3C Standardization Documentation
- [PM_KR_PROBLEM_STATEMENT.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_PROBLEM_STATEMENT.md) — Why PM-KR?
- [PM_KR_NORMATIVE_MODEL.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_NORMATIVE_MODEL.md) — RFC 2119 compliant specification
- [PM_KR_CONFORMANCE_PROFILES.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_CONFORMANCE_PROFILES.md) — Level A/B/C implementation requirements
- [PM_KR_INTEROPERABILITY_GUIDE.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_INTEROPERABILITY_GUIDE.md) — RDF/OWL/JSON-LD bidirectional mapping

### Video Presentations
- [Knowledge3D — A Universe of Meaning (6 min)](https://www.youtube.com/watch?v=D1k_uCPBjLc) — Overview
- [Multi-Language Playlist (12 languages)](https://www.youtube.com/playlist?list=PLmWTHH0cS_OgQ7h_xRMhZ6UqE5mRYAhD7)

### Deep Dive Resources
- [PM-KR NotebookLM Research Space](https://notebooklm.google.com/notebook/98ffd298-1314-477f-b1e1-8d29da4f3848) — Explore PM-KR standards and architecture
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

**"We patent nothing. We publish everything. We build in the open."**

- **No patents**: Apache 2.0 license for all contributions
- **Public mailing lists**: Transparent decision-making
- **Open collaboration**: Alternative implementations welcomed
- **Cross-domain impact**: Work benefits accessibility, XR, knowledge graphs, AI, robotics, spatial data, performance, and trust — simultaneously

---

## Repository Structure

```
pm-kr/
├── README.md                     # This file
├── CONTRIBUTING.md               # Contribution guidelines (TBD)
├── CODE_OF_CONDUCT.md            # W3C Code of Conduct
├── LICENSE                       # W3C Community Group License
├── specifications/               # Draft specifications (collaborative)
├── use-cases/                    # Use case documentation
├── interoperability/             # Interop studies and mappings
└── tests/                        # Test suites and validation
```

This structure will evolve as the group develops specifications collaboratively. Technical documentation currently lives in [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) as the reference implementation.

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

**Mailing List**: public-pm-kr@w3.org
**GitHub**: https://github.com/w3c-cg/pm-kr
**W3C Page**: https://www.w3.org/community/pm-kr/
**Reference Implementation**: https://github.com/danielcamposramos/Knowledge3D
**Questions?** Email: daniel@echosystems.ai

---

**Ready to help build the future of knowledge representation? [Join us.](https://www.w3.org/community/pm-kr/)**
