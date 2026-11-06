# Skills are procedural memory

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

PM-KR asks how knowledge can be stored once as procedures that people and AI consume alike.
The question already has a working answer in everyday use: the skill files that AI assistants read, when they are written for people too.
A skill is a procedure: how to do one kind of work, with its checks and its known traps.
What makes it procedural memory rather than a prompt is that the next person, or the next model, follows it instead of solving the problem again.

## The idea

The [public skills of Sparky Stereo OS](https://github.com/Sparky-OS/sparky-stereo-os/tree/main/skills), one per kind of work, are written so that a person without any AI client can follow the same steps.
Each carries:

- a **working recipe**: the commands, and the result to expect;
- the **traps** met on the way, each with its symptom, its cause and its fix, and how the cause was found (the log line, the tool, the command that showed it);
- the part's own **perks**, what it does well that the next worker should keep;
- the **same sources, checks and explicit limits** for people and AI partners: the specification clause, the test that can fail, and a record of what remains unverified ([ai-partners](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/skills/ai-partners/SKILL.md)).

Two rules keep the memory small: extend an existing skill before creating a new one, and keep the short recipe first with the detail in references.
A tool bundles a chosen skill for a reader without a file system, records the files' hashes, and refuses an oversized bundle instead of cutting instructions off.
The skills are indexed in a local search over the references they cite, so a worker consults the index before the web and quotes the original clause; a model's recall is the least reliable source in the chain.

## Why it is PM-KR's subject

A skill has the four layers the group discusses: a form (the Markdown file), a meaning (what work it is for, in its description), rules (the recipe and the checks) and meta-rules (when to extend it, when to leave a new one behind).
It is executed by people and by machines, from one source, and it carries its provenance (who learned the trap, on which program, with which measurement).
That is a stepping stone that exists today ([Stepping stones I can show](../talks/2026-11-03-stepping-stones/README.md)), offered for comparison with the review skills W3C is experimenting with ([AI skills input](../talks/2026-10-28-tpac-ai-skill-review/README.md)).

## Where it exists today

- Forty-eight public skills in the edition's repository, each born from a real program's work with its measurements, between September and November 2026.
- The respec-mcp [document skills](https://github.com/danielcamposramos/respec-mcp/blob/main/docs/W3C_SKILLS.md), which route a writing or review task to W3C's own guidance; this explainer was written through its explainer skill.
- The experiment [Do Agents Dream of Electric Sheep?](https://github.com/w3c/tpac2026-breakouts/issues/33) at TPAC 2026, by Simone Onofri and Marcos Cáceres, with portable skills that help people review standards.

## What to try

Take one task your group repeats, write its recipe and its first trap in one page, and give it to a newcomer with no other context.
If they finish, the page is procedural memory.

## Questions for the group

1. Which repeated task of your group has no written recipe?
2. Should a skill's vocabulary link to the defined terms editors use, so people and assistants read the same definitions?
