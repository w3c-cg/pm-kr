<!-- Input to the PM-KR Community Group from an individual participant. Not a work item or output of the group. -->
> **Status:** input from an individual participant, Daniel Campos Ramos, to the TPAC 2026 breakout [#38, "CG specification redesign and more program updates"](https://github.com/w3c/tpac2026-breakouts/issues/38), 28 October 2026. It is also offered as input to the PM-KR Community Group; it is not a work item or output of either. Licence: CC BY 4.0.

# Community Group tools: ten points from a small group

I co-chair the PM-KR Community Group with Milton Ponson; we are two volunteers.
The group was motivated by [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D), my design for storing knowledge once, as procedures, for people and AI.
That design does not constrain the group's discussions or become its deliverable, as the [group page](https://www.w3.org/community/pm-kr/) makes clear.
These are the points I would raise in the session, with their sources, in case the time runs out.
I welcome Ian Jacobs and Denis Ah-Kang's work to make the status of CG specifications easier to understand.

## 1. Tooling that does the formal work

For our small group, the checks are the help we need most, so our time can go to participants.
We built [respec-mcp](https://github.com/danielcamposramos/respec-mcp) to run ReSpec with each group's own rules through repository checks and editor workflows.
[Marcos Cáceres reviewed the proposal](https://github.com/speced/respec/pull/5168), and we have offered to donate it to W3C.
Could it help carry the [new requirements and validator](https://github.com/w3c/cg-program/blob/main/beta-2026/README.md) into each CG repository?
That is a proposed connection; our existing checks do not validate consensus or technical claims.

## 2. Specifications beyond browser APIs

The [candidate use cases we discuss in PM-KR](https://github.com/w3c-cg/pm-kr#candidate-use-cases) concern a knowledge model, for which evidence would include conformance tests, test corpora and independent implementations.
The [metadata documentation](https://github.com/w3c/cg-spec-metadata/blob/main/metadata.md) says a shortname unknown to browser-specs is reported as an error.
The [redesign overview](https://github.com/w3c/cg-program/blob/main/beta-2026/cg-redesign-overview.md) also recognises that the existing collectors suit browser APIs and that more collectors are expected.
What status signals would a knowledge-model specification show?

## 3. Evidence outside the browser

I see browser examples such as intent to prototype and origin trial in the [progress-bar criteria](https://github.com/w3c/cg-program/blob/main/proposals/spec-lifecycle.md).
Some of the implementation experience I bring comes from a desktop compositor and media players, alongside the [IANA Matroska registrations](https://www.iana.org/assignments/matroska): Track Plane Types 3 through 5 assigned on 20 October 2026 and StereoMode 15 through 20 on 26 October for separate depth tracks and packed picture-and-depth layouts, respectively.
Will the display have a way to show those kinds of evidence with their different meanings?
A registry assignment records a type; it does not itself prove an implementation or adoption.

## 4. A label for individual input

My [stereo report](https://www.w3.org/publications/spec-generator/?type=respec&url=https://raw.githubusercontent.com/w3c-cg/pm-kr/main/reports/source/stereo-3d-adoption-report.html#sotd) is marked as an individual's proposal, offered as input to the group.
The proposed statuses describe group work.
Is there a place in the design for input that the group has not adopted?
I want readers to see that distinction as clearly as they see a specification's maturity.

## 5. Activity where the group works

Our group's activity is on [GitHub](https://github.com/w3c-cg/pm-kr/issues) and the mailing list, rather than on the blog.
Will the new group pages show that activity?
I would like someone arriving at the group page to find the questions participants can help answer.

## 6. A path between groups

I would like a clear route to the groups a Community Group's work touches.
A chair could send a note to the chairs of related groups, who approve it for their own lists, and a shared space could let those groups cooperate while each list stays focused.
Working Groups already have [horizontal review](https://www.w3.org/Guide/documentreview/) across concerns such as accessibility, internationalization, privacy and security.
Is a comparable route available or planned for CGs?

## 7. Decisions that can be recorded in the meeting

I would find a simple voting tool helpful for chairs and members, with public participation when the group chooses it.
W3C has [WBS questionnaires](https://www.w3.org/wbs/1/), but can CG chairs use them for this, or is another route planned?
Could a poll connect to the IRC channel and video call so a question asked in a meeting becomes a recorded decision in the minutes?
A documented route would help us use it.

## 8. Consideration as well as a count of contributors

One question in the draft [transfer considerations](https://github.com/w3c/cg-program/blob/main/transfer-considerations.md) asks whether multiple independent parties contribute or one individual drives the effort.
I understand the value of independent participation, and I would also like the assessment to show whether newcomers' contributions received an answer and consideration.
Could it record that evidence alongside the number of parties?
That would help a small group explain how it invites and responds to participation.

## 9. Vocabulary tools in the templates

I need vocabulary tools that help authors find and use defined terms.
[Webref](https://github.com/w3c/webref) collects definitions from browser specifications, and [ReSpec](https://respec.org/docs/) can link to defined terms.
Could CG templates suggest terms and feed the same guidance to the skill files AI assistants read?
In [respec-mcp](https://github.com/danielcamposramos/respec-mcp), people and assistants already use rules maintained in the group's repository; I would like vocabulary guidance to work the same way.

## 10. Connected vocabularies with their history

I would like people to find who defined a term, where and when, including the terms of small groups.
A connected registry could link close concepts using [SKOS](https://www.w3.org/TR/skos-reference/) and retain their origins and dates using [PROV-O](https://www.w3.org/TR/prov-o/).
[Webref](https://github.com/w3c/webref) already connects terms to their defining browser specifications; could that approach extend to every group?
It would make related groups easier to find and earlier work easier to build on.

---

Daniel Campos Ramos · [PM-KR Community Group](https://www.w3.org/community/pm-kr/) · [Knowledge3D](https://github.com/danielcamposramos/Knowledge3D) · [Sparky Stereo OS](https://github.com/Sparky-OS/sparky-stereo-os)

AI partners were leveraged in the production of this work.
