# Feed it the right sources

Written on 2026-11-06 from the Sparky Stereo notebook (ORDER 434), after two generated decks said things the project's own texts do not say.
It extends the notebooklm skill's step 1, "Curate the sources".
The interface facts it relies on (the Source Guide, source selection per output, the review toggle, Revise not reading the sources) are in [SKILL.md](../SKILL.md) with their dates.

## The problem in one paragraph

A deck can only say what the ticked sources say, and a custom prompt cannot take a wrong fact out of a source.
The two decks of 6 November 2026 drew on a headset optics notebook and on an older research text.
They said programs render "at target resolution", tied HDMI 3D structures to single drivers, put lens correction in the compositor, called a planned display path working, and added a comfort warning the project does not make.
Each of those was fixable only in the sources, because a Revise step does not read them.

## Working recipe

1. **List the subjects.** One subject per source: what it is, the contract, a measurement or rule with a number, each display or program family, depth, colour, status, names.
   About ten sources of 400 to 900 words each; a deck about one subject then ticks one or two files.
2. **Write each source as short Markdown, one sentence per line.**
   Plain words, the source's own names, a number only with its unit and where it was measured, and the status word (built, in development, planned, proposal, registered) inside the sentence, so a deck cannot lift an item without its word.
3. **Keep a claims table beside the sources.**
   One row per sentence: id, source file, kind, the sentence as written, the document it rests on (a public page with its date, a standard's clause, or the project's decision record), the check date.
   Generate the Markdown and the table from one data file, so no sentence exists without a row, and run a script that checks both ways.
4. **Write the corrections note as source 00.**
   Date it, give the true statement first and the wrong one second ("Do not say ..."), one topic per heading, and keep the wrong phrasings few and exact.
   Name the file so that it sorts first, and say in its opening lines that it is the later correction when texts disagree.
5. **Decide what stays out of the notebook.**
   Other questions' research notebooks, generated reports and decks, private notes, anything about people or machines the deck has no business naming, and the group's explainers when a deck might present an individual's input as the project.
   Untick, or better delete, rather than rely on the prompt.
6. **Write the deck prompt from the sources.**
   Audience, purpose, tone, the credit line for every footer, the status words, the exact slide order, what to leave out, and "obey source 00 over any other text".
7. **Run the cold reader before the first render.**
   Give only the source files to a model with no project context and ask for a ten-slide outline with a source file and status word per bullet, a list of what it was tempted to add, and a list of what confused it.
   Check each bullet against the claims table.
   Every invention is a gap in a source: fix the source, not the prompt, and ask again.
8. **Render with the review toggle on, then check the deck** as SKILL.md's "Check the output" says, and add the twelve-point list the deck prompt carries for the corrections that mattered.

## Traps

| Symptom | Cause | Fix | How it was found |
| --- | --- | --- | --- |
| A deck explains the product through headset optics | The notebook still held a research text about headsets | Delete or untick every source from another question | Daniel on the first decks: the description named vergence-accommodation, pancake lenses and Lighthouse tracking |
| A deck states a wrong number or a stretched claim as fact | A source said it loosely, or two sources disagreed | One sentence per claim, one number per sentence, and the correction note naming the wrong version | Opus's review of the decks against the project's records |
| A planned feature drawn as working | Outreach or a plan sat in a source without a status word | The status word inside each sentence, and "outreach is not a built path" as a rule line | Worked pattern in SKILL.md (the 20 October architecture image) |
| A corrections note is read as new facts | Wrong statements were written as plain sentences | Wrong statements only after "Do not say", true statement first | The cold reader's outline, below |
| A source is cited as a whole | It is very short | Merge tiny notes; keep each source over a few hundred words | SKILL.md, FAQ answer 16269187 |
| A mark or name is lost in a source | Markdown links change the line | Compare after stripping links; link a trademark's first mention once and end the file with the trademark holder's notice | The verify script of this lane |

## The cold-reader check, what to look at

- Bullets that carry a source file and a status word are checkable; bullets without are where the model is free.
- The list "tempted to add" is the most useful output: each item is something a deck would have said.
- A claim the cold reader repeats with the wrong status word means the status word sits too far from the claim.
- A model from the same family as the one that wrote the sources is a weaker reader; use a different lab or a person when one is available, and say which was used.

## Credit

Where a deck made from such a set is used, credit the notebook and the check: "Slides generated with Google Gemini Notebook (NotebookLM) from the project's sources, checked against them on [date]; corrections: [one line]."
