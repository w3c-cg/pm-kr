# Measure energy per finished task

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 6 November 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

If a standards body wants to weigh the energy cost of AI in its work, what should it count?
Counting prompts measures the tool's activity, not the work's.
A page that takes a thousand prompts and ships is one task; a page that takes ten prompts and is rewritten by hand for a month is the same task with a different bill.

## The idea

Measure the finished task, including the human checking, the corrections and the rebound effects, and compare it with the same task done the other way.
The figures that exist have different boundaries and do not settle the question for a standards contribution ([AI policy input, point 7](../talks/2026-10-28-tpac-ai-policy/README.md#7-measure-energy-per-finished-task)):

- a peer-reviewed study by Tomlinson and colleagues estimated 130 to 1,500 times lower emissions for AI writing a page, under an accounting that allocates human emissions to the time spent and excludes rebound and wider social effects ([Scientific Reports, 2024](https://www.nature.com/articles/s41598-024-54271-x));
- Google's August 2025 measurement put its median Gemini text prompt at 0.24 Wh, including serving infrastructure and data-centre overhead and excluding training ([Google Cloud blog](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference));
- a study of 195 systematic reviews found a mean of 67.3 weeks from registration to publication ([PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5337708/)), while the otto-SR preprint reports reproducing and updating 12 reviews in about two days, not peer reviewed, its tool not public, and not a controlled comparison ([medRxiv](https://www.medrxiv.org/content/10.1101/2025.06.13.25329541v1));
- the IEA's Energy and AI report shows aggregate data-centre demand as a real concern, about 415 TWh in 2024 and around 945 TWh projected for 2030 ([IEA](https://www.iea.org/reports/energy-and-ai/executive-summary)).

So: count the whole task and its quality, and let the comparison be between finished work, not between a prompt and nothing.

## What to try

Pick one document your group finished this year.
Write down the hours of human time and the number of tool calls it took, and what a second person's check cost.
That is the unit of comparison.

## Questions for the group

1. Which finished task of yours could be measured both ways?
2. What rebound effect have you seen: more documents, longer documents, more review?
