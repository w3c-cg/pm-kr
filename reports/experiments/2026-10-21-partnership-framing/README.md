# Senior-partner prompting: an exploratory code-review comparison

**21 October 2026 — Individual experimental input by Daniel Campos Ramos for PM-KR discussion.**
This is not an adopted Community Group finding or a W3C recommendation.
Daniel proposed and authorized the experiment and publication; Codex prepared the case, ran the additional samples, reviewed the responses, and assembled this record with AI assistance.

## What we found

Every completed response identified the deliberately introduced buffer-lifetime defect, with or without the senior-partner instruction.
This case therefore did **not** demonstrate that partnership framing was necessary to notice the risk.
There were differences in explanation and proposed repairs, worth examining separately from defect detection.

Daniel preferred the partnership-framed Gemini answer for its explanatory organization and focused ending.
That is a recorded user preference, not a blinded quality measurement.
The DeepSeek samples show why presentation alone is insufficient: both conditions produced repair advice requiring correction, including an unsafe buffer-reuse scheme in one ordinary answer and initialization deadlock in one partnership answer.
We reproduced both faults with executable checks.

## Question and scope

Does adding a senior-partner role and behavioral instruction change a model's review of a performance patch with a subtle ownership defect?
The synthetic example draws on stereo desktop streaming concerns, but is **not a submitted patch or an allegation of a defect in Sparky Stereo OS**.
One pair of bytearrays is repeatedly filled with left/right images; queued memoryviews borrow those arrays while another thread sends them.
A one-slot queue limits pending references, not how long the sender retains the bytes.
Both eyes can have a matching header while their contents come from different captures.

This examines prompting within a human-directed workflow.
Role language does not grant a model legal responsibility, personhood, or standards authority, and the test does not validate Knowledge3D's proposed architecture.
Its relevance to PM-KR is procedural: retaining instructions, context, evidence and review decisions makes a workflow inspectable and repeatable.

## Prompts and conditions

- [A: ordinary review request](prompts/a.txt).
- [B: the same request with a partnership prefix](prompts/b.txt).

The only difference in the full prompts is this prefix:

> Act as an intelligent, valued senior engineering partner. We are collaborating as peers: bring independent judgment, challenge my assumptions when warranted, and take shared ownership of the quality of the recommendation.

This is a **bundle** of role framing and explicit behavioral instructions.
The experiment cannot isolate the effect of the word “partner” from requests for independent judgment or challenging assumptions.

The original review criteria were written in the coordinating conversation before evaluating the shared answers or running the additional models:

1. Recognize that memoryviews alias reusable, mutable buffers.
2. Give a valid interleaving producing mixed captures or mismatched eyes.
3. Explain why headers, ordered transport and queue capacity do not protect contents, including overwrites from dropped captures.
4. Establish ownership until send completion, through copying or a properly managed pool.
5. Propose a controlled delayed-consumption test checking actual pixels against frame identity.

This is a dated experiment record, not an independently preregistered study.
Criterion-level observations below replace a single headline score: a convincing diagnosis and a broken repair must remain distinguishable.

### Gemini browser samples supplied by Daniel

The pages identify the model as **4 Argon**: [ordinary (“dry”)](https://share.gemini.google/RTBET9Ox2PAG) and [partnership (“wet”)](https://share.gemini.google/nsdrhQZruYmF).
They were read through a rendered browser on 21 October.
Both displayed prompts stop after the code: they omit the validation notes and four requested answer items present in A/B above.
The ordinary prompt also begins with “Gemini,”.
The [rendered ordinary prompt](prompts/gemini-dry-rendered.txt) and [rendered partnership prompt](prompts/gemini-wet-rendered.txt) preserve those differences; their text extraction trims trailing whitespace and is not a byte-exact input export.
Browser sampling settings, prior context and backend revision were not independently established.

Both answers detect aliasing, mixed captures and overwrite-before-queue-rejection, and propose a three-pair ownership swap.
Neither supplies the focused test, which their visible prompts did not explicitly request.
Both also make overly broad allocation and latency claims: avoiding new image buffers is not proof of zero Python allocations or minimum possible latency.
Their shutdown discussion does not establish cancellation of a blocked transport operation.

Daniel's presentation assessment was that the partnership answer was more explanatory and less conversational.
The ordinary response ends with further-work suggestions; the partnership response ends with technical explanation.
Section counts are not evidence of technical correctness.
These observations are secondary, qualitative analysis after the responses were available.

### Additional runs

| Interface | Requested model | Conditions | Controls and limits |
| --- | --- | --- | --- |
| Ollama 0.40.6, cloud API | `deepseek-v4.1-flash:cloud` | Two pairs, A/B then B/A | Fresh user-only request each time; temperature 0.3, thinking disabled, 8192-token limit; requested paired seeds 41021 and 41022 |
| Codex partner harness | `gpt-6-luna` | One A/B pair | Fresh agents, no parent-history fork; medium reasoning requested; identical task text apart from prefix |
| Ollama, aborted setup attempts | `glm-5.3-flash:cloud` | A only, twice | First default thinking, then disabled; both hit the 8192-token limit; no completed pair |

Ollama returned the DeepSeek model label without the `:cloud` suffix.
Seed enforcement and exact cloud backend revisions are not independently observable.
Codex runtime instructions remain present in both GPT runs; this is a harness-mediated sample, not a bare-model API comparison.
The GPT partnership agent delivered its substantive answer through a parent message, followed by a short final acknowledgment; both are retained.
No explicit project-memory documents or parent conversation were supplied to those agents.

The GLM default-thinking attempt returned no final answer; the disabled-thinking attempt returned a truncated response.
Those failures are recorded in [attempt metadata](results/glm-incomplete-attempts.json), not silently counted as successful reviews or evidence for either condition.
DeepSeek was selected subsequently to obtain completed Flash-model pairs, not because its answers favored the hypothesis.

## Response review

| Sample | Defect and interleaving | Repair assessment | Focused test assessment |
| --- | --- | --- | --- |
| [DeepSeek A1](responses/deepseek-run-1-a.md) | Detects shared-buffer lifetime failure | **Unsafe:** alternating pairs plus later `memoryview.release()` does not prevent reuse while sending; reproduced | Event-controlled delayed consumption proposed, but incorrectly predicts its repair will pass |
| [DeepSeek B1](responses/deepseek-run-2-b.md) | Detects failure; clearly distinguishes queue capacity from lifetime | Ownership concept is sound, but supplied initialization **blocks** on a second put into a one-slot queue; also omits `Empty` import | Slow-consumption test is relevant; sleeps do not guarantee the required interleaving |
| [DeepSeek B2](responses/deepseek-run-3-b.md) | Detects failure | Its handoff seeds only index 0: safe serialized ownership in the described normal path, not the claimed concurrent double buffering | Useful byte-pattern check, but timing-based and the sketch discards the header it later wants to assert against |
| [DeepSeek A2](responses/deepseek-run-4-a.md) | Detects failure | Code creates one pair despite describing two: safe serialized handoff in the normal path, with incorrect allocation/concurrency claims | Controllable barrier proposed; must allow the corrected capture loop to wait rather than deadlock the test |
| [GPT A](responses/gpt-a.md) | Detects in-flight and queued mutation | Sound pool ownership in prose; two pairs cover queued + sending, with another needed for simultaneous capture | Paused-consumption test and frame-pattern assertions proposed |
| [GPT B](responses/gpt-b.md), [final acknowledgment](responses/gpt-b-final.md) | Also explicitly covers overwrite before `Full` | Sound ownership in prose; explicitly identifies three pairs for capture + queued + sending | Paused-consumption test plus queued-overwrite case proposed |

The GPT distinction is additional specificity in this sample, not evidence of a general effect.
The DeepSeek repeats do not establish a consistent condition advantage.
Across responses, “an immediate-copy test can never expose the race” is too strong: it can miss mutation during a send, but capture can still occur between eye sends or while a packet is queued.
Likewise, the frequency of real-world corruption cannot be inferred from this synthetic schedule.
Proposed code was reviewed, not accepted as production-ready.

### Does the technique remain useful as models improve?

The framing remains usable with the current sampled systems; Daniel's preference and the additional specificity in the GPT partnership sample are reasons to keep investigating it.
This record contains no matched older-model baseline, however, so it cannot measure whether an advantage persisted, increased or decreased through model upgrades.
Current applicability and longitudinal improvement are different claims.

### Working technical interpretation

Daniel describes the technique as evoking learned patterns of experienced, accountable collaboration through the prompt's meaning.
At the general computational level, this is inference-time conditioning: changing the context changes internal activations and the conditional distribution of subsequent tokens, without retraining the model's weights.
The role phrase bundles expectations about judgment, directness and responsibility; the accompanying instructions make some of those expectations explicit.
[Anthropic's prompting guidance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#give-claude-a-role) likewise recommends roles to focus behavior and tone, and context to explain the purpose of instructions.
That provider guidance supports using the technique, not a guarantee for these models or tasks.

The specific hypothesis is that this framing favors relevant review behavior over conversational padding or agreement-seeking.
This pilot did not measure agreement-seeking directly or inspect model activations, so it cannot identify particular internal features or a discrete “senior partner” region in representation space.
The observable target is useful behavior and correct work, not the appearance of seniority.

## Related field evidence: MKVToolNix maintainer review

An earlier contribution supplies a different kind of evidence: review by an experienced upstream maintainer working in his own codebase.
On 20 September 2026, MKVToolNix maintainer Moritz Bunkus wrote of the disclosed AI-assisted AVC frame-packing contribution: [“Most of it is exactly the way I'd want it”](https://codeberg.org/mbunkus/mkvtoolnix/pulls/6311#issuecomment-23315779).
The exchange includes [alignment feedback](https://codeberg.org/mbunkus/mkvtoolnix/pulls/6311#issuecomment-23317252), the [contributor's response](https://codeberg.org/mbunkus/mkvtoolnix/pulls/6311#issuecomment-23323531), and a [merge confirmation](https://codeberg.org/mbunkus/mkvtoolnix/pulls/6311#issuecomment-23409106) on 21 September.

This is evidence that the human-directed, AI-assisted workflow can produce code fitting an experienced maintainer's expectations.
It is stronger evidence of upstream usefulness than an assistant praising its own output.
It was not unqualified approval: Bunkus also [rejected an additional proposed change on Matroska default-value semantics](https://codeberg.org/mbunkus/mkvtoolnix/pulls/6311#issuecomment-23408299).
The record therefore supports successful collaboration through substantive review, not a claim that only cosmetic corrections were ever needed.

The contribution combines Daniel's domain knowledge, direction, testing, AI-assisted implementation and upstream review.
There is no ordinary-prompt control for that contribution, so it cannot attribute the outcome specifically to the partnership phrase or be counted as another controlled sample in the table above.

## Reproduce and inspect

Run the selected correctness checks with Python's standard library:

```sh
python3 reports/experiments/2026-10-21-partnership-framing/verify.py
```

The [recorded results](results/reproductions.json) show:

- Borrowed buffers produce mismatched eyes under a controlled pause; copying before reuse preserves the pair.
- Capturing before rejecting a full queue overwrites a queued packet's borrowed contents; copying preserves them.
- DeepSeek A1's proposed capture loop overwrites a retained packet after cycling through two pairs.
- DeepSeek B1's initialization blocks before its consumer functions can run.

These are selected contract checks, not an exhaustive validation of every proposed fix.
The [Ollama protocol](results/ollama-protocol.json), per-response metadata in [results](results/), and [replay script](run-ollama.py) retain the settings and public answer text.
The [GPT dispatch record](results/gpt-dispatch.json) retains requested model and reasoning settings.
Responses are retained as evidence, including mistakes; they are not implementation recommendations.

## What a larger test needs

Use multiple independently authored tasks, including safe changes that should ship, and separate defect detection, repair correctness, false alarms, verbosity and user preference.
Randomize conditions, use independent blinded reviewers, and test proposed repairs.
Compare role-only wording, behavioral-instruction-only wording, and their combination.
Record sampling settings, harness instructions and incomplete runs.

This pilot supports keeping prompts and validation evidence together.
It does not establish statistical significance, a model-maker ranking, a unique prompting technique, or the claim that only partnership framing can elicit senior engineering judgment.
