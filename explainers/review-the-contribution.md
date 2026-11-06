# Review the contribution, not the tool

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

Rules about AI in standards work tend to be written about the tool: how large an AI-assisted change may be, whether it was discussed in advance, what counts as AI.
Reviewers, though, have one scarce resource, their time, and one question, whether the contribution is sound and the contributor understands it.
Can the rules be written about that?

## The idea

- **Make the size rule about reviewability.**
  A large AI-assisted update that was not discussed in advance may still be a good contribution: a person may have prepared substantial work before arriving, or needed AI to get through Git and the submission workflow.
  The guidance can help turn it into something reviewers can assess, with its scope and purpose made clear ([AI policy input, point 4](../talks/2026-10-28-tpac-ai-policy/README.md#4-make-the-size-rule-about-reviewability)).
- **Understanding and quality apply to every contribution.**
  A contributor who cannot answer questions about the material should not submit it, with or without an AI label; the standard is the same whatever tools helped ([point 5](../talks/2026-10-28-tpac-ai-policy/README.md#5-understanding-and-quality-apply-to-every-contribution)).
  On 22 October 2026 curl's maintainer described the harder current challenge as high volume at high quality, after poor AI reports had largely receded ([Daniel Stenberg](https://daniel.haxx.se/blog/2026/10/22/ignore-the-slop/)).
- **Define the concern more narrowly than ordinary software.**
  A definition that covers any software that "evaluates, transforms or generates content a person would otherwise review" also covers spell checkers, screen readers, the engineering tools that turn survey points into terrain, and W3C's own Specberus, Echidna, ReSpec and scribe.perl ([point 6](../talks/2026-10-28-tpac-ai-policy/README.md#6-define-the-concern-more-narrowly-than-ordinary-software)).
  Name the risks that need extra review instead.
- **Give a reason and a chance to correct.**
  When a contribution is set aside, say which requirement it failed and allow one fix ([point 13](../talks/2026-10-28-tpac-ai-policy/README.md#13-give-a-reason-and-a-chance-to-correct)).
- **Each finding of a review tool, checkable by a person.**
  Its source, a way to test it, and what remains uncertain; several models agreeing still leaves the reviewer needing that evidence ([AI skills input, point 2](../talks/2026-10-28-tpac-ai-skill-review/README.md#2-evidence-a-person-can-check)).
- **Draft the rules in the open.**
  W3C is writing its AI policy with a public draft and a session for feedback; KDE's first draft "got rather heated" and was made confidential, and in that discussion David Edmundson wrote "We can't solve that by excluding them from a conversation" ([point 14](../talks/2026-10-28-tpac-ai-policy/README.md#14-drafting-in-the-open)).

## Where it exists today

- The practice behind these points: every change arrives small, tested and explained, and a report to another project carries the fix and the test that fails before and passes after ([the sparky-stereo skill](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/skills/sparky-stereo/SKILL.md), Part three).
- Linus Torvalds's AI-assisted drm/xe fix, [818bebeb63dd](https://github.com/torvalds/linux/commit/818bebeb63dd6bf5f4e07e145f6cdbace520a34c): a person directing, a verified result, and the disclosure in the commit.

## Questions for the group

1. Which of your group's rules about AI could be rewritten as a rule about reviewability?
2. What would you need from a review tool's finding before you act on it?
