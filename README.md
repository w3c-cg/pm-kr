# Procedural Memory Knowledge Representation (PM-KR) Community Group

**W3C Community Group**: https://www.w3.org/community/pm-kr/
**Published**: February 20, 2026
**Status**: OPEN for participation

---

## 🎯 Mission

Develop **open standards** for storing knowledge as **executable procedures** (like font programs or mathematical formula definitions) with **symlink-style composition**, enabling both humans and AI systems to consume the same procedural source.

**Core Problem**: Current knowledge representation systems suffer from **massive duplication and fragmentation**. The same knowledge (e.g., a Unicode character, mathematical symbol, or spatial concept) is duplicated across fonts, embeddings, accessibility metadata, and visual renderings. This creates maintenance, performance, security, and licensing issues.

**PM-KR Solution**: Knowledge stored **once** as executable procedures, referenced via symlink-style composition (like Debian's APT package system), enabling:
- **70% compression** (zero duplication)
- **Dual-client reality** (same procedural source → human visual + AI executable)
- **Sovereign execution** (zero external dependencies in runtime hot path)
- **Multi-modal accessibility** (visual, semantic, tactile, auditory from single source)

---

## 📚 Key Specifications (Phase 1: Foundation)

These documents establish the scope, technical depth, and biological inspiration for PM-KR:

1. **[INTERCONNECTEDNESS_MAP_v3.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/INTERCONNECTEDNESS_MAP_v3.md)**
   - **103+ cross-disciplinary connections** spanning 586 years (1440-2026)
   - **22 synthesis chains**: Operating systems, GPU computing, typography, game industry, robotics, neuroscience, accessibility, video compression, carbon impact, philosophy
   - **Rarity estimate**: Top 0.001-0.01% (1 in 10,000 to 1 in 100,000) for cross-disciplinary synthesis at this scale
   - **Why it matters**: Shows PM-KR builds on giants' shoulders while contributing unique architectural innovations

2. **[KNOWLEDGEVERSE_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/KNOWLEDGEVERSE_SPECIFICATION.md)**
   - **7-region unified VRAM architecture**: Cranium (reasoning), Galaxy Universe (active memory), House Universe (persistent memory), TRM (routing), Audit Journal, Routing Metadata, I/O Buffers
   - **Sovereign execution**: PTX-only hot path, zero numpy/cupy/scipy/torch
   - **Persistent memory**: Unified context across tasks (Grammar Galaxy grows during use)
   - **Why it matters**: Technical foundation for procedural knowledge representation

3. **[ROBOTIC_EMBODIMENT_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/ROBOTIC_EMBODIMENT_SPECIFICATION.md)**
   - **Hippocampus-inspired spatial memory**: Biological precedent for PM-KR architecture
   - **Hardware-agnostic avatar**: Human VR, AI agent, or physical robot use same code
   - **Form→Meaning bridge**: Sensors (FORM) → Galaxy (MEANING) → RPN (ACTION)
   - **Zero robot-specific training**: "Same architecture, different actuators"
   - **Why it matters**: Shows biological grounding and practical applications beyond traditional knowledge graphs

---

## 🌟 Reference Implementation: Knowledge3D

This work is **motivated by prior work** on [**Knowledge3D**](https://github.com/danielcamposramos/Knowledge3D), which serves as the **reference implementation** for PM-KR concepts.

**Important**: That work does not constrain the group's discussions, nor will it be a deliverable of this group. **We welcome alternative implementations and approaches!**

### Knowledge3D → PM-KR Relationship

| Repository | Purpose | Status | Link |
|------------|---------|--------|------|
| **Knowledge3D** | Reference implementation, production system | Active development | [GitHub](https://github.com/danielcamposramos/Knowledge3D) |
| **pm-kr** (this repo) | Open standards, specifications, test suites | Standards track | [W3C CG](https://www.w3.org/community/pm-kr/) |

**Think of it like**:
- **WebKit/Chromium** → standards-compliant browser implementations
- **W3C HTML/CSS specs** → open standards everyone can implement
- **Knowledge3D** is the browser; **pm-kr** is the spec

---

## 🤝 Who's Participating (February 2026)

### Founding Members
- **Manu Sporny** (JSON-LD co-creator, Digital Bazaar CTO) → CBOR-LD compression, procedural canonicalization
- **Adam Sobieski** → WICG #188 (5-year-old stateful procedural execution proposal), audit message schema
- **Jonathan DeRouchie** → Persistent memory AI architecture, public/private knowledge separation
- **Nitin Pasumarthy** (LinkedIn LLM/GNN) → Production-scale systems perspective
- **Hanna Abi Akl** → W3C Community Group expertise
- **OpenFn Organization** → Real-world validation (40+ countries, 10M+ transactions/year)

### Key Contributors
- **Marko Rodriguez** (Apache TinkerPop founder, Gremlin creator) → Graph traversal expertise, repository collaborator
- **Milton Ponson** (Mathematician) → Godelian critique of LLM scaling, Domains of Discourse
- **José Vázquez-Jaramillo** (Philosopher) → Epistemology and philosophical grounding
- **Damir Cavar** (Indiana University) → Computational linguistics, AI energy efficiency, Quantum AI, NLP (20+ years)
- **Henrique Santos** (RPI/Tetherless World Constellation) → Director of Semantic Applications, DARPA Machine Common Sense, knowledge graphs + LLMs
- **Anisa Rula** (University of Brescia) 🇮🇹 → **CO-AUTHOR OF THE KNOWLEDGE GRAPHS BOOK** (Springer 2021), KG quality & validation expert, Linked Data quality, data profiling
- **Oserebameh Beckley** → WebGPU compute shaders expert, GPU memory management, ray tracing, graphics programming (Medium technical writer)
- **Majid Babaei** (McGill University) 🇨🇦 → AI explainability via knowledge graphs, LLMs & AI agents research, Software Engineering (6 funded research internships May-Oct 2026, top-tier publications: ICSE, ICPE, MODELS)
- **Charles Waweru** → W3C Meta-Layer Infrastructure CG supporter, contextual annotation & semantic overlays, Web Annotation standards, layering interpretable meaning on existing content, decentralized civic infrastructure

### Institutions
- **Rensselaer Polytechnic Institute** (Tetherless World Constellation - world's top knowledge graph center, led by Deborah McGuinness)
- **Indiana University** (Computational linguistics program, founded by Damir Cavar)
- **University of Brescia** 🇮🇹 (Knowledge graph validation, semantic web research)
- **LinkedIn** (Production-scale GNNs)
- **Digital Bazaar** (Semantic Web technologies)
- **INRIA** (Hanna Abi Akl - neuro-symbolic AI)
- **McGill University** 🇨🇦 (Majid Babaei - AI explainability, LLM/AI agent research)

---

## 🎯 Relevance Across W3C Groups

### For GPU for the Web (WebGPU)
**Sovereign GPU-Native Execution**: PM-KR demonstrates PTX (CUDA) kernels with zero external dependencies, showing GPU-first knowledge representation patterns relevant for WebGPU compute shaders.

### For Spatial Data on the Web
**3D Spatial Knowledge Navigation**: Semantic proximity = spatial proximity in 3D workspace. Hippocampus-inspired architecture enables humans and AI to navigate knowledge spatially.

### For Publishing & Math on the Web
**Procedural Typography & Math Symbols**: 2,713 fonts stored as procedural programs (168,206 glyph-text pairs), mathematical symbols as RPN templates. One procedural source → multiple client modalities.

### For Distributed Tracing
**Procedural Execution Audit Trail**: Audit Journal traces every procedural execution: "at point X during procedure Y, observed Z." Bridges observability and explainability.

### For Web Performance
**Extreme Compression & Carbon Impact**: 200:1 to 1000:1 compression via procedural canonicalization. Projected 2.2 Gt CO₂e/year savings by 2035 (6% global emissions).

### For Verifiable Credentials & Solid
**Sovereign Audit + Decentralized Trust**: Zero external dependencies aligns with decentralized identity. Procedural canonicalization enables content-addressed knowledge with cryptographic provenance.

### For JSON-LD & Semantic Web
**Procedural Canonicalization**: Complements RDF/JSON-LD with executable semantics. Symlink-style composition reduces knowledge graph redundancy while preserving semantic fidelity.

### For Immersive Web (WebXR)
**Spatial Knowledge in XR**: Extends glTF's `extras.k3d` field for spatial knowledge in 3D assets. Dual-client reality where humans (VR) and AI (Galaxy) navigate same workspace.

### For Web Accessibility (WAI)
**Multimodal Accessibility from Single Source**: Procedural sources render as visual glyphs, semantic descriptions, tactile patterns, all from same canonical procedure. No dual-maintenance overhead.

### For AI & Machine Learning
**AI Knowledge Representation Integration**: Explainability, sovereignty, multi-modal reasoning. Symlink composition (not black-box embeddings), zero external dependencies, auditable procedural sources.

### For Knowledge Graphs
**Graph Compression + Procedural Execution**: Procedural canonicalization stores graph patterns as reusable procedures. Collaboration with Apache TinkerPop founder brings graph traversal expertise.

### For Cognitive AI
**Hippocampus-Inspired Architecture**: Spatial memory mirrors biological hippocampus (episodic memory, spatial mapping, memory consolidation). Same spatial substrate for temporary reasoning + long-term knowledge.

---

## 🤝 Early Collaborative Insights (Pre-Launch Discussions)

Even before the official PM-KR launch, deep technical discussions with founding members have shaped the group's direction:

### Jonathan DeRouchie: Cognitive Load & Familiar Technical Concepts

**Key Insight**: "Users are more likely to adopt a framework that uses or simplifies existing language, concept or structure."

**Contributions**:
- **Form→Meaning Framework**: Recognized that K3D mirrors 40,000 years of human knowledge evolution (cave paintings → letters → words → grammar → philosophy)
- **Familiar Technical Labels**: Recommended mapping K3D concepts to universal terms (tree, node, file system, OOP, graph database, 3D modeling)
- **Multiple Mental Models**: Proposed explaining K3D through multiple lenses:
  - **File System**: House = directories, Rooms = folders, Objects = files
  - **OOP**: Classes, inheritance, procedural composition
  - **Graph Database**: Gremlin-style traversal (with Marko Rodriguez collaboration)
  - **3D Modeling**: Blender/Maya/Unity analogy (scenes, objects, materials, animation)

**Impact**: Led to **Track 6 proposal** for Year 1: "Developer Adoption & Cognitive Load Minimization"
- Familiar Technical Labels Mapping
- Multiple Mental Models Guide (file system, OOP, graph DB, 3D modeling)
- Getting Started for Different Roles (designers, devs, PMs)
- Gremlin → K3D Migration Guide

### Adam Sobieski: Hippocampus, Execution State Embeddings, Ethics/Safety

**Key Insight**: "Based on your interest in spatial approaches, I assume you've also studied the hippocampus?"

**Biological Grounding**:
- **Hippocampus Connection**: Validated K3D's biological inspiration (spatial navigation, episodic memory, memory consolidation)
- **Computational Analogue**: K3D House Universe mirrors hippocampus functions (place cells → 3D rooms, memory consolidation → SleepTime protocol)

**Technical Contributions**:
- **Execution State Embeddings**: Predicted (and K3D already implements!) 768-dim vectors encoding procedural state + semantic context
- **Incremental Validation**: "At point X during procedure Y, is candidate action A_i correct, efficient, safe, and ethical?"
- **Faith Engine**: K3D's 0.70 confidence threshold for safety validation
- **Audit Message Schema**: "at point X during Y, observed Z" (credited to Adam in PM-KR spec)
- **OpenTelemetry Mapping**: Traces, spans, context propagation for procedural execution

**Track 5 Proposal**: "Ethics & Safety for AI Agents and Robots"
- Multi-agent coordination via Galaxy Universe (centralized trusted resource)
- Safety predicates in procedural forms (MUST/MUST NOT constraints)
- Policy compliance validation (building on his Schema.org work, GitHub #4569)
- Structured validation reports for audit compliance

**Multimodal Narrative Vision**:
- Natural language narration (Galaxy introspection mode)
- Procedural video generation (K3D-VID, 200:1 compression)
- 3D visualization (humans walk through robot's "memory palace")
- Structured audit trail (machine-verifiable + human-readable)

### Marko Rodriguez: Graph Traversal Expertise

**Role**: Apache TinkerPop founder, Gremlin creator, Knowledge3D repository collaborator

**Contribution**:
- **Gremlin → K3D Mapping**: K3D Galaxy navigation = 3D graph traversal (extends Gremlin concepts to spatial reasoning)
- **Familiar Technical Concept**: Gremlin is industry-standard (DataStax, Neo4j, major graph databases)
- **Validation**: Ensures K3D builds on established graph theory, not inventing unfamiliar abstractions

**Connection**:
```
Gremlin (2D graph traversal)  →  K3D Galaxy (3D graph traversal)
Graph nodes                   →  K3D Nodes (stars in 3D space)
Graph edges                   →  Semantic proximity (spatial distance)
g.V().has('name','X')        →  galaxy.query(embedding, top_k=10)
```

### Year 1 Tracks (Shaped by Early Discussions)

**Track 1**: OpenFn Integration Architecture (production validation)
**Track 2**: BPMN → PM-KR Compilation Strategy (workflow verification)
**Track 3**: State/Context Ontology (Adam's audit schema)
**Track 4**: Lean4 Formalization (theorem proving for correctness)
**Track 5**: Ethics & Safety for AI Agents/Robots (Adam's proposal)
**Track 6**: Developer Adoption & Cognitive Load (Jonathan's proposal)

---

## 📖 Technical Documentation

### Core Specifications (Live in Knowledge3D)
- **[THREE_BRAIN_SYSTEM_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/THREE_BRAIN_SYSTEM_SPECIFICATION.md)** — Cranium + Galaxy + House architecture
- **[DUAL_CLIENT_CONTRACT_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/DUAL_CLIENT_CONTRACT_SPECIFICATION.md)** — Form→Meaning evolution (40,000 years)
- **[MATH_CORE_SPECIFICATION.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/vocabulary/MATH_CORE_SPECIFICATION.md)** — 3-tier sovereign architecture example
- **[Complete Vocabulary Index](https://github.com/danielcamposramos/Knowledge3D/tree/main/docs/vocabulary)**

### W3C Standardization Documentation
- **[PM_KR_PROBLEM_STATEMENT.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_PROBLEM_STATEMENT.md)** — Why PM-KR? (70%+ knowledge duplication crisis)
- **[PM_KR_NORMATIVE_MODEL.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_NORMATIVE_MODEL.md)** — RFC 2119 compliant specification
- **[PM_KR_CONFORMANCE_PROFILES.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_CONFORMANCE_PROFILES.md)** — Level A/B/C implementation requirements
- **[PM_KR_INTEROPERABILITY_GUIDE.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/W3C/PM_KR_INTEROPERABILITY_GUIDE.md)** — RDF/OWL/JSON-LD bidirectional mapping

### Video Presentations
- **[Knowledge3D — A Universe of Meaning (6 min)](https://www.youtube.com/watch?v=D1k_uCPBjLc)** — Perfect for W3C PM-KR members
- **[Multi-Language Playlist](https://www.youtube.com/playlist?list=PLmWTHH0cS_OgQ7h_xRMhZ6UqE5mRYAhD7)** — 12 languages (English, Portuguese, Spanish, French, German, Italian, Mandarin, Japanese, Korean, Russian, Hindi, Arabic)

### Deep Dive Resources
- **[NotebookLM Research Space](https://notebooklm.google.com/notebook/1bd10bda-8900-4c41-931e-c9ec67ac865f)** — Best place to explore Knowledge3D/PM-KR in depth

---

## 🚀 How to Participate

### Join the Community Group
1. **Visit**: https://www.w3.org/community/pm-kr/
2. **Create W3C account** (free): https://www.w3.org/accounts/request
3. **Join the group** (no membership fees, open participation)

### Contribute to Discussions
- **Review specifications** and share feedback
- **Propose use cases** from your domain (accessibility, XR, knowledge graphs, AI, robotics, spatial data, GPU computing, performance, trust)
- **Participate in interoperability studies** (RDF/OWL/JSON-LD mapping, WebGPU integration, glTF extensions)
- **Help shape conformance levels** and test suites

### For Implementers
- **Explore procedural canonicalization** patterns
- **Test bidirectional mapping** (RDF ↔ PM-KR, glTF ↔ PM-KR)
- **Validate compression claims** (200:1-1000:1 ratios)
- **Contribute sovereign execution patterns** (zero external dependencies)

---

## 📅 Timeline and Deliverables

### NOW (February 2026)
- ✅ Community Group published and open
- ✅ Phase 1 foundation documents available
- ✅ World-class experts participating
- ⏳ First working sessions upcoming

### Q1-Q2 2026
- Public comment period, gather use cases
- First collaborative working sessions
- Interoperability studies (RDF/JSON-LD mapping, WebGPU integration, spatial data standards)

### Q3-Q4 2026
- Draft specifications (data models, execution semantics, audit journal, conformance levels)
- Test suites and validation frameworks
- Reference implementations beyond Knowledge3D

### Potential Outputs (Subject to Group Consensus)
- Data model specification (procedural composition, symlink references, content-addressing)
- Execution semantics (dual-client rendering, canonical procedures, sovereign runtime)
- Audit & tracing specification (temporal metadata, provenance, explainability)
- Compression guidelines (procedural canonicalization, carbon impact assessment)
- Interoperability guidelines (RDF/OWL/JSON-LD, WebGPU compute, glTF extensions, Trace Context)
- Accessibility specification (multimodal rendering from procedural sources)
- Use case documentation (accessibility, XR, knowledge graphs, AI systems, robotics, spatial data)

---

## 💡 Philosophy

**"We patent nothing. We publish everything. We build in the open."**

- **No patents**: Apache 2.0 license for all contributions
- **Public mailing lists**: Transparent decision-making
- **Open collaboration**: Alternative implementations welcomed
- **Cross-domain impact**: Work benefits accessibility, XR, knowledge graphs, AI, robotics, spatial data, performance, trust—simultaneously

---

## 📞 Contact

**Mailing List** (once launched): public-pm-kr@w3.org
**GitHub**: https://github.com/w3c-cg/pm-kr
**W3C Page**: https://www.w3.org/community/pm-kr/
**Reference Implementation**: https://github.com/danielcamposramos/Knowledge3D

**Questions?** Email: daniel@echosystems.ai

---

## 🙏 Acknowledgments

### W3C Leadership
- **Ian Jacobs** (W3C Head of Communications) → PM-KR CG launch, editorial guidance

### Inspiration & Heritage
- **Gutenberg Press** (1440) → Democratized knowledge
- **Aaron Swartz** → Guerrilla Open Access Manifesto, open knowledge philosophy
- **Tim Berners-Lee** → Giant Global Graph vision, Semantic Web
- **Nikola Tesla** → 3-6-9 sacred geometry, ternary logic inspiration

### Technical Foundations
- **NVIDIA** → CUDA, PTX ISA
- **W3C Semantic Web Community** → RDF, OWL, JSON-LD foundations
- **Game Industry** → glTF, spatial rendering, procedural generation
- **Unicode Consortium** → Character representation standards
- **Khronos Group** → Vulkan, OpenGL, GPU standards

**Complete Attributions**: [Knowledge3D ATTRIBUTIONS.md](https://github.com/danielcamposramos/Knowledge3D/blob/main/ATTRIBUTIONS.md)

---

**Built with collective intelligence. Shared with open hearts. For a sovereign, spatial future.** ✨

---

## Repository Structure

```
pm-kr/
├── README.md                      # This file
├── CONTRIBUTING.md                # Contribution guidelines (TBD)
├── CODE_OF_CONDUCT.md            # W3C Code of Conduct
├── LICENSE                        # W3C Community Group License
├── specifications/                # Draft specifications (collaborative)
│   └── (TBD - group will develop together)
├── use-cases/                     # Use case documentation
│   └── (TBD - contributions welcome)
├── interoperability/              # Interop studies and mappings
│   └── (TBD - RDF/JSON-LD/glTF mappings)
└── tests/                         # Test suites and validation
    └── (TBD - conformance tests)
```

**Note**: This repository structure will evolve as the group develops specifications collaboratively. For now, all technical documentation lives in [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) as the reference implementation.

---

**Ready to help build the future of knowledge representation? [Join us!](https://www.w3.org/community/pm-kr/)** 🚀
