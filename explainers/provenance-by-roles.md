# Provenance by roles: record the tools' part, keep the responsibility whole

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

W3C's [draft AI policy](https://www.w3.org/2026/10/draft-ai-policy.html) says AI tools "may not be treated as contributors".
Two things hide in that phrase: whether a tool's part may be recorded at all, and whether recording it gives the tool any standing.
Projects that work with AI partners every day need to say what the tools did, as a paper says what each author did, without anyone reading the record as a claim that the tool is a person or answers for anything.

## The idea

**Human-like provenance, not human-like status.**

- The tools' part is recorded by role, as science records authors' contributions: the fourteen CRediT roles of [ANSI/NISO Z39.104-2022](https://www.niso.org/publications/z39104-2022-credit), who investigated, drafted, checked.
  CRediT was written for people; applying its roles to tools is our use of it, said as such.
- The record confers no standing.
  A tool cannot make a contributor's commitments, and responsibility stays entirely with the human contributor of record, who conceives, supervises, validates and answers for the whole.
- One disclosure line at the point of work, not a score.
  Commit counts and line counts do not measure a partner's part ([the provenance page](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/ai-provenance.md)).
- A role in a prompt, "act as a partner", is a technique that sets the standard of the work, not a claim about what the AI is ([AI policy input, points 1, 9 and 16](../talks/2026-10-28-tpac-ai-policy/README.md#1-record-the-tools-part-without-giving-them-standing)).

The wording offered for the policy: "AI tools may assist with a contribution, and their part may be recorded by role, as provenance. That record confers no standing: an AI tool cannot make a contributor's commitments, and responsibility for the contribution stays entirely with the human contributor. AI tools may not act as unsupervised participants in W3C work."

**One simple disclosure form across W3C.**
Debian encourages disclosure, Mesa requires it for creative AI involvement, VideoLAN asks for it in the merge request, and the Linux kernel describes an `Assisted-by` trailer; a contributor to several projects follows each ([point 10](../talks/2026-10-28-tpac-ai-policy/README.md#10-one-simple-disclosure-form-across-w3c)).
One form across W3C, with language and accessibility help handled as the draft's slides already suggest, would serve contributors and reviewers alike.

## Where it exists today

- Every page in this repository ends with one line, "AI partners were leveraged in the production of this work", and the project pages credit people and partners by CRediT role.
- A finished case: in October 2026 IANA registered nine Matroska values for a stereo picture with its depth, Track Plane Types 3 to 5 and Stereo Modes 15 to 20, the latter after review by the registry's designated experts ([IANA Matroska registry](https://www.iana.org/assignments/matroska)).
  The specification the registry cites was written with AI partners, its history labels that commit by commit, and one person is the change controller who answers for the values ([point 15](../talks/2026-10-28-tpac-ai-policy/README.md#15-a-finished-case-a-registry-entry-written-with-ai-partners)).
- The [Synthetic User](synthetic-user.md) explainer gives the same rule for an AI acting on the web: declared, delegated, bounded, and credited by roles.

## Earlier work

The Advisory Board's Note [Use of Large Language Models in Standards Work](https://www.w3.org/TR/llms-standards/) (24 March 2026) asks for a responsible person, labelled output and checked content; this record is one way to do exactly that.

## Questions for the group

1. Would a role-based record satisfy your group's need to know what a tool did?
2. Which wording would you use for the "no standing" line?
