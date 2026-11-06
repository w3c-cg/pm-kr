# Models that check each other, a person who decides

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** several models reading one procedure and a person deciding is the charter's dual consumption at work, the same source read by people and AI, with a log that makes every step inspectable.

## The question

The usual picture of AI in standards work is a coding assistant that writes demos and tests.
In practice the help starts earlier: reading specifications, research, design and review.
And one model's answer is one opinion; the useful thing is what happens when several models read the same work and a person weighs what they say.

## The idea

**Multi-Vibe Code In Chain (MVCIC)**: a person directs several models in turn, each checking the previous one's work, and the steps are logged so anyone can follow the chain ([technical note](https://github.com/danielcamposramos/Knowledge3D/blob/main/docs/MVCIC_TECH_NOTE.md); the [first public commit](https://github.com/danielcamposramos/Knowledge3D/commit/55218533), October 2025).
The person's part does not shrink: the models disagree, miss things and agree on wrong things, and the record of who said what is what the person reviews.
Three rules keep it useful:

- every finding names its source and a way to test it, and says what remains uncertain;
- several models agreeing is not evidence, a check that can fail is;
- the person conceives, supervises, validates and answers for the result ([Provenance by roles](provenance-by-roles.md)).

## Where it exists today

- FFmpeg's [Fairy](https://code.ffmpeg.org/michaelni/Fairies) runs several models with stated review scopes; its [review of pull request #24628](https://code.ffmpeg.org/FFmpeg/FFmpeg/pulls/24628#issuecomment-67908) covered code and design, and the record includes an approval on 6 October 2026 ([AI policy input, point 8](../talks/2026-10-28-tpac-ai-policy/README.md#8-ai-helps-before-the-code-too)).
- An individual pilot in this repository, [Senior-partner prompting](../reports/experiments/2026-10-21-partnership-framing/README.md): ordinary and partnership-framed code reviews across three providers, with the prompts, the samples and executable checks; all completed answers caught the defect, and repair quality varied.
- The same habit in the daily work on Sparky Stereo OS, where the public [ai-partners](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/skills/ai-partners/SKILL.md) skill asks every partner for the same sources, checks and explicit limits.

## Questions for the group

1. Have you had two models disagree on a specification question, and how did you settle it?
2. What would make a model's review finding worth your time: its source, a test, or both?
