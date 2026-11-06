# The group's rules in its repository: respec-mcp

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

A small Community Group has two volunteers and little time.
The formal work of a report, its status wording, required sections and links, is the same every time and easy to get wrong.
And when an AI assistant helps draft, the group's rules should bind it the same way they bind a person, with results a reviewer can read without an AI account.

## The idea

Keep the group's editorial rules in its repository, and run them through the same tool everywhere: in a GitHub Action, in a local command and through an AI assistant's tool interface.
[respec-mcp](https://github.com/danielcamposramos/respec-mcp) does that with ReSpec underneath:

- a **profile** per document, in the repository: allowed statuses, required sections, required links, forbidden phrases ([this repository's profiles](../respec-mcp/profiles));
- **preflight** on the source, then **validate** on the rendered page, with JSON evidence a reviewer can read;
- the same checks in the [editorial workflow](../.github/workflows/editorial-checks.yml), whose job summary needs no AI client;
- document **skills** that route a writing task to W3C's own guidance for explainers, reports, reviews and charters, with the [editorial principles](https://github.com/danielcamposramos/respec-mcp/blob/main/docs/EDITORIAL_PRINCIPLES.md) that let an author explain in their own language.

A passing result covers the configured checks.
It does not validate consensus or technical claims, and it is said so on every page that uses it.

## Where it exists today

- Every report in this repository is checked that way ([reports and their checks](../reports/README.md)).
- Marcos Cáceres, ReSpec's lead, reviewed the proposal in [speced/respec#5168](https://github.com/speced/respec/pull/5168): the profile and policy pattern "a genuinely interesting idea ... a clean way to handle CG governance without forking ReSpec", with security and packaging concerns that led to standalone incubation; the pull request was closed without merging, and he asked for experience from real use before any transfer.
- Brought as a candidate to the [W3C Open Source Program](https://github.com/w3c-oss/open-source-program) at TPAC 2026, with the questions a small tool has for the pilot process: what evidence to bring, what ownership a donation leaves, and how to present the usage and the remaining review work ([open source program input](../talks/2026-10-28-tpac-open-source-program/README.md)).
- The Community Group redesign plans new report types and a validator; the question raised there is whether this tool can carry those requirements into each group's repository ([Community Group tools input, point 1](../talks/2026-10-28-tpac-cg-redesign/README.md#1-tooling-that-does-the-formal-work)).

## What to try

Place a checkout of respec-mcp beside this repository, run `npm run check:reports`, and read the JSON it leaves in `reports/build/`.
That is the whole review surface, open to anyone.

## Questions for the group

1. Which of your group's rules could be written as a profile?
2. What should a reviewer be able to read, without any AI client, before trusting a check?
