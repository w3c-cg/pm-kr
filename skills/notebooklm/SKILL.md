---
name: notebooklm
description: >-
  Work in Google's Gemini Notebook (the product formerly called NotebookLM) through its own interface: curate the sources, set the notebook, trigger each Studio feature with the right settings and a pasted prompt, get usable slides, videos, images and tables out of it, and check every result against the sources before anyone relies on it.
---

# NotebookLM, now Gemini Notebook: the interface, its settings and how to check what it makes

## Working recipe

1. **Curate the sources.** One notebook per question. Add only sources you have read or trust, name them so a prompt can point at them, and select per output only the sources that output may use.
2. **Set the notebook.** Settings, then Output Language. Chat panel, then Configure Chat for the style and length of answers. Share only after the outputs exist.
3. **Trigger the feature.** In the Studio panel, select the pencil (Customize) on the tile before Generate; pick format, length, language and sources; paste the prompt; Generate now or Generate later. For slides and videos, turn on the review toggle and correct the plan before it renders.
4. **Check the result against the sources.** Chat answers carry citations: open each one. Studio outputs carry none: paste their claims back into chat and ask for the citation of each, as "Check the output" says. Correct, regenerate, then credit the notebook where the result is used.

**Check freshness first.**
Written on 2026-10-29 from Google's help center and blog as read that day; every fact below names the page it comes from and the date it was checked.
Google renamed NotebookLM to Gemini Notebook on 2026-07-16 ([Google blog, Josh Woodward](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/), read 2026-10-29); the help center moved to `support.google.com/gemininotebook/` and the old `support.google.com/notebooklm/` links redirect to the same article numbers.
This skill says "the notebook" for the product and keeps "NotebookLM" in its name because that is the name people still search for.
Google changes the interface often; when a button named here is missing, look under the pencil (Customize) of the tile or under the three-dot menu of the artifact, and record the difference in the skill's evidence.

## Who follows this skill, and how

- **A person using the notebook** reads it directly: the tables say where each option sits and what it changes.
- **An AI partner helping that person** cannot see the screen. It tells the person what to click, chooses the settings with them, drafts the custom prompt the person pastes into the feature, and then runs the checks in "Check the output" through questions the person pastes into chat. The person relays what the screen shows; the partner never guesses it.
- This skill covers the interface only. It does not cover the Enterprise API, automation tools, unofficial clients or browser automation; a person works in the product, with their own account, and the partner works through that person.

## What we use it for

Daniel, 2026-10-29: the killer features are Slide Deck and Video Overview, for explaining things visually, with a narrative or on images; the notebook is the tool we use to generate the images in our explainers; Data Table is useful; Mind Map is for seeing connections and derivations inside the notebook; Reports, Audio Overview, Quiz and Flashcards are nice but text analysis is done to higher quality elsewhere and study aids are not our case.
The sections below are deep where we use the feature and short where we do not.

## The interface in one screen

Three panels (help, "Create a notebook", [answer 16206563](https://support.google.com/gemininotebook/answer/16206563), read 2026-10-29):

- **Sources** on the left: Add sources, Discover sources, the list with checkboxes, the Source Guide of each source, Create note.
- **Chat** in the middle: the summary of the sources, the question box, Configure Chat, suggested chips such as Mind Map, and Save to note on each answer.
- **Studio** on the right: one tile per feature (Audio Overview, Video Overview, Mind Map, Reports, Flashcards, Quiz, Infographic, Slide Deck, Data Table), each with a pencil to customize before generating, and the list of generated artifacts, each with a three-dot menu (rename, download, share, View custom prompt, delete).
- **Settings** at the top right: Output Language, Usage, Connected apps, appearance (Light, Dark, Device).
- **Share** at the top right: people with Viewer or Editor access, Anyone with a link, Copy link to chat view, Allow copies, Analytics.

Each notebook is independent: the notebook cannot read across notebooks ([answer 16206563](https://support.google.com/gemininotebook/answer/16206563), read 2026-10-29).

## Step 1: Curate the sources

### What a source can be

From "Add or discover new sources" ([answer 16215270](https://support.google.com/gemininotebook/answer/16215270), read 2026-10-29) and the FAQ ([answer 16269187](https://support.google.com/gemininotebook/answer/16269187), read 2026-10-29).

| Source type | What is imported | Traps |
| --- | --- | --- |
| PDF, TXT, Markdown, DOCX, PPTX, CSV, EPUB | The text | Copy-protected PDFs fail; there is no page limit, only the word and size limits below |
| Google Docs, Slides (up to 100 slides), Sheets (up to 100k tokens) | The text; Drive sources re-sync every few minutes, or by "Click to sync with Google Drive" | Footnotes and comments are not imported; several tabs become one source; losing view access makes the source inaccessible while it still counts toward the limit |
| Web URL | Only the text of the HTML page | No images, embedded videos or nested pages; paywalled pages fail; a URL to a PDF is treated as a PDF; separate several URLs with a space or new line |
| YouTube URL | Only the transcript, from uploaded or automatic captions | Public videos only; videos uploaded less than 72 hours earlier may fail; no speech means no source; a deleted or private video removes the source within 30 days |
| Audio file (MP3, WAV and others) | A transcription, in about 90 languages | No speech or low quality fails |
| Images (PNG, JPEG, HEIC, WebP) | The content, read by the model | "Certain types of images may not work as well" |
| Copied text, Notes | The text, as a note that can be converted to a source | A note is used by chat only when it is selected |
| Play Books ebook you own | The text, text only | Downloads of artifacts made from it may be blocked; such notebooks cannot be shared publicly; collaborators must own the book ([Expert Intelligence post, 2026-08-27](https://blog.google/innovation-and-ai/products/gemini-notebook/expert-intelligence-leading-sources/), read 2026-10-29) |
| Gemini chats | The chat, as context | Notebooks that contain Gemini chats are private and cannot be shared ([answer 17003757](https://support.google.com/gemininotebook/answer/17003757), read 2026-10-29) |

Limits per source: 500,000 words, or 200 MB for an uploaded file ([answer 16215270](https://support.google.com/gemininotebook/answer/16215270), read 2026-10-29).
Sources per notebook by plan: 50 (Standard), 100 (Plus), 300 (Pro), 500 (Ultra 20 TB), 600 (Ultra 30 TB) ([plans, answer 16213268](https://support.google.com/gemininotebook/answer/16213268), read 2026-10-29).
A source is read once at import; only Drive sources re-sync. For a web page that changes, delete the source and add the URL again, and put the import date in the source title.

### Discover sources: Fast Research and Deep Research

In the Sources panel, Discover sources, choose Web or Drive, type the query ([answer 16215270](https://support.google.com/gemininotebook/answer/16215270); [Google blog, 2025-11-13](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-deep-research-file-types), both read 2026-10-29).

| Mode | What it does | Settings and limits |
| --- | --- | --- |
| Fast Research | A quick scan; results show a title, why each relates to the query, and a link; select the ones to import | Web or Drive; also from the home prompt box in the mobile app |
| Deep Research | Plans, browses "up to hundreds of websites", and writes a multi-page report; shows the report plus cited and uncited sources; you choose what to import | Toggle Web and Deep Research; takes a few minutes; 18+ only; cancelling or minimizing discards what was not imported; results may import partially when usage limits are exceeded |

Read an imported report as a secondary source, because it was written from pages you have not read.
Import the primary pages it cites rather than the report alone, then ask chat to compare the report with those pages.

### Curation rules that change the output

- **One notebook per question.** The notebook answers from everything selected; unrelated sources dilute every artifact.
- **Name the sources.** Edit the title when adding pasted text; rename files so a prompt can say "use only the source named X". The help page says to name the source in the question for focused answers ([answer 16215270](https://support.google.com/gemininotebook/answer/16215270), read 2026-10-29).
- **Select sources per output.** Checkboxes in the Sources panel decide what chat and each artifact use; Slide Deck, Video Overview, Infographic, Audio, Flashcards and Quiz also take a source choice in their customize panel ([mobile features, answer 16296687](https://support.google.com/gemininotebook/answer/16296687), read 2026-10-29). For a visual about one component, select that component's sources only.
- **Convert notes to sources** when they must be citable: open the note in Studio and select Convert, or More, then Convert all notes to source ([answer 16262519](https://support.google.com/gemininotebook/answer/16262519), read 2026-10-29). A short note that states what is implemented and what is planned, converted to a source, is the cheapest way to stop a visual from presenting a plan as done.
- **Five or more sources** get automatic labels; add, rename or move them to group sources by topic ([answer 16215270](https://support.google.com/gemininotebook/answer/16215270), read 2026-10-29).
- **Very short sources** are cited as a whole, without a passage ([FAQ, answer 16269187](https://support.google.com/gemininotebook/answer/16269187), read 2026-10-29); merge tiny notes into one source when passage citations matter.
- **Read the Source Guide** of each source after import (open the source on the left); it is the model's summary, and a wrong summary is the first sign of a bad import.

## Step 2: Set the notebook

| Setting | Where | What it does | Source |
| --- | --- | --- | --- |
| Output Language | Settings, then Output Language | Language of chat answers and generated text, Audio and Video Overviews included; the default is the Google Account language; 80 languages listed; features differ in which languages they support | [answer 16261963](https://support.google.com/gemininotebook/answer/16261963), read 2026-10-29 |
| Configure Chat: style | Chat panel, Configure Chat | Default ("general purpose research and brainstorming"), Learning Guide ("educational content, helping you grasp new concepts and skills"), Custom (a role or style you write) | [answer 16179559](https://support.google.com/gemininotebook/answer/16179559), read 2026-10-29 |
| Configure Chat: response length | Same dialog | Three lengths; the help page does not name them; third parties report Default, Longer and Shorter | Boston College CDIL guide, updated 2026-10-14, read 2026-10-29 |
| Connected apps | Settings, then Connected apps; per notebook in Configure Chat | Chat can use a connected app when the prompt names it; web only; a new app is enabled for all notebooks until turned off per notebook | [answer 18784282](https://support.google.com/gemininotebook/answer/18784282), read 2026-10-29 |
| Chat history | Three-dot menu of the chat panel, Delete Chat History | Conversations save automatically and are private to you, even in shared notebooks | [answer 16179559](https://support.google.com/gemininotebook/answer/16179559); [Workspace Updates, 2026-03-20](https://workspaceupdates.googleblog.com/2026/03/new-ways-to-customize-and-interact-with-your-content-in-NotebookLM.html), read 2026-10-29 |
| Appearance | Settings | Light, Dark or Device (default) | [answer 16225229](https://support.google.com/gemininotebook/answer/16225229), read 2026-10-29 |
| Usage | Settings, then Usage; also at the bottom of chat, and an expected-cost bar before a Studio generation | Remaining usage and the reset time | [answer 17670842](https://support.google.com/gemininotebook/answer/17670842), read 2026-10-29 |

### Writing a Custom chat configuration

Google's own examples ([blog, 2025-10-29](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-custom-personas-engine-upgrade/), read 2026-10-29): a research advisor who "challenges assumptions, asks probing questions, identifies logical fallacies"; a lead marketing strategist who returns an action plan; a three-perspective review (strict academic, creative strategist, skeptical reviewer); a game master with a goal and a step limit.
Google's tips from the same post: describe how the chat should behave and the goal; give it a role; say what kind of output you want.
A pattern that keeps answers checkable:

```
You answer only from the selected sources.
Cite a source for every claim; when the sources do not cover something, say "not in the sources" instead of guessing.
When two sources disagree, show both with their citations.
Mark every feature or component as implemented or planned, as the sources say.
Audience: [who reads the answers]. Output: [bullets | short paragraphs | a table].
```

The custom text is a system prompt for that notebook; Android Authority reported the limit rose from 500 to 10,000 characters (secondary, 2025, read 2026-10-29).

### Sharing and roles

From "Create a notebook" ([answer 16206563](https://support.google.com/gemininotebook/answer/16206563)) and "Public notebooks" ([answer 16322204](https://support.google.com/gemininotebook/answer/16322204)), both read 2026-10-29.

- **Viewer** reads sources and notes and chats; **Editor** adds and removes sources and notes and can share further; only owners and editors generate or delete Studio artifacts and make them public.
- **Copy link to chat view** hides sources and artifacts for a focused view, but the help page says it "does not completely revoke a viewer's underlying access"; never use it as privacy.
- **Anyone with a link** needs a Google sign-in for the notebook; a link to one artifact (slide deck, report, audio, infographic) opens without sign-in.
- **Allow copies** lets shared users duplicate the notebook (sources and Studio content, not chats or notes).
- Personal Gmail accounts share with up to 50 people and not with Google Groups; public sharing is for consumer accounts only, disabled for Workspace Enterprise and Education.
- **Analytics** (paid plans): users and queries per day for the last seven days, once four or more other users have chatted.
- Deleting an artifact breaks its share link.

### Plans and usage limits

Plans ([answer 16213268](https://support.google.com/gemininotebook/answer/16213268), read 2026-10-29):

| | Standard (no cost) | Plus | Pro | Ultra 20 TB | Ultra 30 TB |
| --- | --- | --- | --- | --- | --- |
| Notebooks | 100 | 200 | 500 | 500 | 500 |
| Sources per notebook | 50 | 100 | 300 | 500 | 600 |
| Gemini model access | Access | Access | Higher | Highest | Highest |
| Visible watermark removal on generated images | No | No | Yes* | Yes* | Yes* |

*A visible watermark stays for users in India, South Korea or Vietnam; generated images also carry an invisible SynthID watermark ([answer 16337734](https://support.google.com/gemininotebook/answer/16337734), read 2026-10-29).
Custom chat and analytics are on every tier; "advanced sharing" is for paid users.
Enterprise access comes through Google Cloud with its own plans; this skill does not cover it.

How consumer usage is counted since September 2026 ([answer 17670842](https://support.google.com/gemininotebook/answer/17670842); [Google blog, 2026-08-28](https://blog.google/innovation-and-ai/products/gemini-notebook/new-flexible-usage-limits/), both read 2026-10-29): limits are compute based and depend on prompt complexity, chat length, number of sources and the features used; quota refreshes every five hours, up to a weekly limit; AI Plus is two times the standard limit, AI Pro four times, AI Ultra five or twenty times AI Pro depending on the subscription; when a generation would exceed the limit, the notebook proposes a cheaper output or Generate later (web only; the output arrives within a couple of hours, with a notification if enabled).
The plans page still says "daily quotas reset after 24 hours, monthly quotas after 30 days" (read 2026-10-29); the two Google pages disagree, so read the Usage screen rather than either page.

Work and school accounts keep a per-feature table ([answer 16337734](https://support.google.com/gemininotebook/answer/16337734), read 2026-10-29), which is also the clearest statement of what each feature costs at the entry tier: Standard access gives 50 chats a day, 3 Audio Overviews, 3 Video Overviews, 10 Deep Research a month, 10 each of Reports, Flashcards, Quizzes and Mind Maps a day, and "limited" Data Tables, Infographics and Slide Decks; the highest tier gives 5,000 chats, 200 Audio Overviews, 200 Deep Research and 1,000 of each study output a day, and slide decks "with length controls".
Google for Education publishes the same shape for schools: 3 a day for audio, video, infographics and slide decks and 10 for quizzes and flashcards at no cost, 20 and 15 and 100 with Google AI Pro for Education ([edu.google.com/ai-notebooklm](https://edu.google.com/ai-notebooklm/), read 2026-10-29).
Video renders and slide revisions are the expensive items: every slide revision renders a whole new deck and counts ([answer 16757456](https://support.google.com/gemininotebook/answer/16757456), read 2026-10-29), so get the outline right in review before rendering.

Artifacts the notebook creates by itself when sources are added do not count toward limits ([answer 16213268](https://support.google.com/gemininotebook/answer/16213268), read 2026-10-29).

## Step 3: Trigger a feature

What every Studio feature shares (help articles 16212820, 16454555, 16758265, 16757456, 18323649, read 2026-10-29):

- You need **edit access** to generate or delete.
- Select the tile to generate with defaults, or the **pencil** on the tile to customize first; generation runs in the background, and the Studio list shows the artifact when done.
- **View custom prompt** in the artifact's three-dot menu shows the prompt that made it; copy it into your notes so a partner can compare prompt and result.
- **Generate now** or **Generate later**; a video can take more than 30 minutes.
- **Share** three ways: a link to the artifact (the notebook must be shared with that person or set to Anyone with a link, with access to the full notebook), the whole notebook, or Download.
- **18+ only**: Infographic, Slide Deck, Cinematic video, visual styles for video, Deep Research, some interactive report content, voice chat.
- Downloads can be blocked when a Play Books ebook is among the sources.
- Every help page carries Google's own warning: outputs are "AI-generated and may contain inaccuracies"; read "Check the output" before sharing anything.
- Slides and videos can also be requested in chat ("Make me a slide deck about [topic]"); since 2026-10-19 chat proposes topics from the sources first, and a review toggle lets you correct the plan before rendering ([Google blog, 2026-10-19](https://blog.google/innovation-and-ai/products/gemini-notebook/co-create-slides-videos/), read 2026-10-29).

### Prompt pattern for every custom prompt

The custom prompt steers what the notebook picks from the sources and how it presents it; it cannot add facts that are not in the sources, and it should not try to.
Fill the parts you need, in this order, and keep it short:

```
Audience: [who, and what they already know].
Purpose: [what they should be able to do or decide after this].
Focus on: [the sections, sources or questions to cover; name the sources].
Leave out: [what to skip].
Structure: [the order of parts, or the number of items].
Use only the selected sources; where they are silent, say so rather than filling in.
Keep every number, date, name and label exactly as the sources give them.
Mark each component or feature as implemented or planned, as the sources say.
```

The person pastes it into the prompt box of the customize panel; the partner drafts it from the person's answers to "who is it for, what is it for, what must it include, what must it leave out".

### Slide Deck

Help: [answer 16757456](https://support.google.com/gemininotebook/answer/16757456), read 2026-10-29 (quotes below are from it); format and length names from 9to5Google, 2026-02-06 (secondary, read 2026-10-29); revisions, PPTX export and age gate from [Workspace Updates, 2026-03-20](https://workspaceupdates.googleblog.com/2026/03/new-ways-to-customize-and-interact-with-your-content-in-NotebookLM.html), read 2026-10-29; review flow from [Google blog, 2026-10-19](https://blog.google/innovation-and-ai/products/gemini-notebook/co-create-slides-videos/), read 2026-10-29.
Produces a deck of slides with generated text and illustrations, viewable in the notebook, presentable full screen, downloadable as PDF or PPTX. 18+ only.

**Every setting, and what it does to the deck**

| Setting | Where | Options | Effect on the result |
| --- | --- | --- | --- |
| Format | Pencil on the Slide Deck tile | Detailed Deck ("a full-text deck meant for emailing or reading without a presenter") or Presenter Slides ("visual slides with key talking points to support a speaker") | Detailed Deck puts the explanation on the slide; Presenter Slides puts a picture and a few words on the slide and expects a speaker. For an explainer image, Presenter Slides gives the larger picture; for a document people read alone, Detailed Deck |
| Output language | Same panel | The 80 listed languages | Text on the slides |
| Length | Same panel | Short, Default, Long (Long was reported as Ultra only; the work-and-school table says the highest tier has "length controls") | Number of slides; there is no "one slide" option, see below |
| Sources | Same panel | Checkboxes | The only facts the deck may use; select the sources about the thing you are drawing, nothing else |
| Prompt | Same panel; the help page's example: "Create a deck for beginners using a bold and playful style with a focus on step-by-step instructions." | Free text | Audience, structure, style, what each slide shows; the main lever |
| Review outline notes | Toggle in the panel, then Generate now; or in chat, "Review outline before final rendering" | On or off | With it on, the notebook writes the outline first; select Review, "add all of your feedback at once", then Proceed; after Proceed the outline cannot be refined. Generate later skips the outline. The help page says Ultra; the 2026-10-19 post says the toggle is rolling out to all users |
| Revise | The Revise icon at the top of the generated deck | A text instruction per slide; "your instructions will be grouped under 'Pending Changes'"; Generate revised deck | Changes text, layout and visuals. "At this time, sources are not taken into account during revisions", so a revision cannot add or fix a fact; each revision renders a whole new deck and counts toward your quota |
| Delete slide, Restore slide | Hover a slide, More | Pending deletions are grayed out with a trash icon | The way to keep one slide out of a short deck |
| Reorder | Drag a thumbnail in the deck preview | | |
| Start slideshow | In the viewer | Full screen; arrows or clicks; Esc | Presenting from the notebook |
| Download | Three-dot menu of the artifact | "Download PDF Document (.pdf)" or "Download PowerPoint (.pptx)" | PDF for sharing as is; PPTX for editing and for taking the pictures out, see "Images for explainers" |
| View custom prompt | Three-dot menu | | Shows the prompt that made this deck |

**How the prompt shapes the deck**

- The notebook writes one slide per idea it finds in the prompt's structure; a numbered list of slides in the prompt comes back as that list of slides. A per-slide list ("Slide 1: ... Slide 2: ...") with what each slide says and shows is the most reliable prompt when you already know the story (pattern also used by Robo Nuggets' NotebookLM skill for branded decks, read 2026-10-29).
- Style words ("bold and playful", "plain technical, white background, labelled schematics") change the illustrations and the layout; a style line that says "the same style on every slide" keeps the deck consistent.
- Naming the sources ("from the source named X only") narrows what the slides may say; the rest of the selected sources still feed the model, so deselect them too.
- Audience and purpose decide the vocabulary and the number of words per slide; "for a reader with no background" produces definitions, "for the team that built it" produces status and numbers.
- A line about status ("mark each component implemented or planned as the sources say") makes the deck say which parts exist, which the 20 October architecture image did not do by itself (see the worked pattern).

**One strong single slide**

There is no one-slide length. Three routes, each a user option:

1. **Default: Slide Deck, Short, Presenter Slides, with a prompt that asks for one slide**, then Delete slide for the others and Download PDF or PPTX. The prompt:

```
One slide only. Title: [the claim the slide makes, in one sentence from the sources].
Picture: [what to draw, which components, how they connect, left to right or top to bottom], labelled with the exact names used in the source named [X].
Below the picture, three lines: [fact 1], [fact 2], [fact 3], each as the source words it.
Mark anything the sources call planned as planned. No other slides, no agenda, no summary.
```

2. **Infographic, Landscape or Square, Concise**, when you want one picture and no slide frame (see Infographic); it downloads as a PNG.
3. **Chat image generation** (Google AI Pro and Ultra, web): ask chat for an image with detailed instructions; the output can be edited after generation and downloaded from the Studio panel ([Google blog, 2026-06-08](https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/); help [answer 16179559](https://support.google.com/gemininotebook/answer/16179559), both read 2026-10-29).

**Prompt patterns for a deck**

```
Presenter Slides, Default, for [audience] at [occasion], [N] minutes of talk. One idea per slide.
Order: the problem; what the sources show, one slide per source, named; the open questions; the ask.
Numbers exactly as in the sources, with the source name in a footer line on each slide. Same plain visual style throughout.
```

```
Detailed Deck for readers who will not hear a presenter. Each slide: a full-sentence title that states the finding, three supporting lines from the sources, and the source name.
Mark implemented and planned items as the sources do. No decorative images; diagrams only where a source has one.
```

```
Slide 1: [title]; picture of [A] feeding [B] feeding [C], labelled as in [source]. Slide 2: [what A does, in the source's words]. Slide 3: [what B does]. Slide 4: [what C does]. Slide 5: status table, implemented versus planned, from [source].
```

Revision prompts (Revise icon) are for words, layout and pictures only: "replace the illustration on slide 1 with a plain block diagram, same labels", "shorten the title of slide 3 to the first clause".
When a fact or label is wrong, fix the sources or the custom prompt and generate again; a revision will not read the sources.

### Video Overview

Help: [answer 16454555](https://support.google.com/gemininotebook/answer/16454555), read 2026-10-29 (quotes below are from it); Nano Banana illustrations and the six first styles from [Google blog, 2025-10-13](https://blog.google/innovation-and-ai/models-and-research/google-labs/video-overviews-nano-banana/); Cinematic from [Google blog, 2026-03-04](https://blog.google/innovation-and-ai/products/notebooklm/generate-your-own-cinematic-video-overviews-in-notebooklm/); Short from [Google blog, 2026-09-15](https://blog.google/innovation-and-ai/products/gemini-notebook/new-study-tools-september-2026/); review flow from [Google blog, 2026-10-19](https://blog.google/innovation-and-ai/products/gemini-notebook/co-create-slides-videos/); all read 2026-10-29.
Produces a narrated video: a voice reads a script written from the sources over generated illustrations (Nano Banana), or in Cinematic, generated animation (Veo); downloadable as a video file.

**Every setting, and what it does to the video**

| Setting | Where | Options | Effect on the result |
| --- | --- | --- | --- |
| Format | Pencil on the Video Overview tile | Explainer: "A structured, comprehensive overview that connects the dots within your sources"; Short: "Quickly grasp key concepts from your sources in ~60 second videos", 80+ languages; Cinematic: "an immersive experience with visuals and storytelling", English only, 18+, Google AI Ultra at launch | Length and kind. Explainer is the narrated slideshow with sections; Short is one concept in about a minute; Cinematic is the "creative director" video with animation. The short format was called Brief in October 2025 and is Short on the help page today |
| Language | Same panel | The feature's own list; Cinematic English only | Narration language |
| Visual Style | Same panel; "only for 18+ users, excluding Cinematic and Short" | "Classic, Whiteboard, Watercolor, Retro Print, Heritage, Paper-craft, Kawaii, and Anime", Auto-select, or Custom with "a description" | The look of every illustration in an Explainer; Whiteboard and Classic read best for technical diagrams; Custom takes a one-line description of the look |
| Steering prompt | Same panel; "Select a suggested topic for the overview to focus on, or provide a custom topic" | A suggested topic chip, or free text | What the video is about and in what order; the main lever |
| Sources | Same panel | Checkboxes | The facts the script may use |
| Review producer notes | Toggle in the panel, then Generate now; or in chat, "Review producer notes" | On or off | The notebook writes the producer notes (the plan of the video) first, "may take multiple minutes"; select Review, "add all of your feedback at once", Proceed; "You will not be able to further refine your producer notes." Generate later schedules "without producer notes". Ultra on the help page; rolling out to all users per the 2026-10-19 post |
| Generate now or later | Same panel | | A video can take more than 30 minutes; Generate later runs when quota allows |
| Playback | In the player | Speed from "1x", scrub, rewind, skip, full screen | |
| Download | Three-dot menu of the artifact, Download | "Share the downloaded video file." The help page does not name the container or resolution; third-party guides report an MP4 (read 2026-10-29) | The file for use elsewhere; check its properties after download |
| Rename, delete, View custom prompt | Three-dot menu | | |

**How the prompt shapes the video**

- The steering prompt sets the topic and the order; the script follows it section by section. Without one, the notebook picks the main topics of the selected sources.
- A sentence per scene ("first show A, then how B uses A, then the status table") comes back as that sequence of scenes.
- "Read every number and label exactly as the source gives it" reduces rounding in the narration; it does not stop misspellings on the pictures, so check them.
- The Visual Style changes only the pictures; the narration and the script come from the sources and the prompt.
- Review producer notes is where to fix the plan: the notes list the scenes and what each says; correct a wrong purpose, remove an unsupported claim, add "planned" where it belongs, then Proceed. After Proceed, the only fix is a new generation.

**A short narrated explainer**

Default route: Format Short, sources limited to the one thing being explained, a steering prompt of one concept, review on, Download.

```
Short. One concept: [concept], as defined in the source named [X].
Open with the question it answers in one sentence. Show [the diagram or formula in the source] with the source's labels. Close with the one sentence to remember, in the source's words.
No history, no comparisons, no other concepts.
```

For a two to five minute piece: Format Explainer, Visual Style Whiteboard or Classic (or Custom: "flat technical schematics on white, plain sans-serif labels"), review on, and a steering prompt with the scene list:

```
Explainer for [audience] who will [use it for]. Scenes in this order: 1) the problem, from [source]; 2) [component A] and what it does, in the source's words; 3) how [B] uses [A]; 4) what is implemented today and what is planned, from [source]; 5) where to read more.
Read numbers, names and labels exactly as the sources give them. Do not add examples that are not in the sources.
```

Cinematic is for storytelling, English only, Ultra; its prompt should describe the story arc and the mood, and the review step matters more because it decides the scenes.

### Infographic

Help: [answer 16758265](https://support.google.com/gemininotebook/answer/16758265), read 2026-10-29 (quotes below are from it); the ten styles from [Workspace Updates, 2026-03-20](https://workspaceupdates.googleblog.com/2026/03/new-ways-to-customize-and-interact-with-your-content-in-NotebookLM.html), read 2026-10-29.
Produces one generated picture that lays out the sources' content with text and icons. 18+ only.

**Output format, confirmed on 2026-10-29:** the help page says "Use the three dots menu next to your generated Infographic to rename, download as a PNG file, share, or delete", and "Share the downloaded image file"; no sentence on the page mentions HTML or interactive.
A shared link opens the infographic in a web viewer page, and an Interactive Report (Learning Overview) embeds infographics in a web page, which is where an "interactive HTML" impression comes from; the artifact itself is a PNG.
Our record of 2026-10-20 shows the same: the infographic came out as a PNG.

| Setting | Where | Options | Effect on the result |
| --- | --- | --- | --- |
| Output language | Pencil on the Infographic tile | Per the panel | Language of the text drawn in the image |
| Level of detail | Same panel | "Concise, Standard, or Detailed (beta)" | How many panels and how much text; Concise for one message, Detailed for a dense poster |
| Orientation | Same panel | Square, Portrait, Landscape | The shape; Landscape for a slide or a page header, Portrait for a phone or a poster |
| Visual style (18+) | Same panel | Auto-select (default), or "Sketch Note, Kawaii, Professional, etc."; the full March 2026 list: Sketch Note, Kawaii, Professional, Scientific, Anime, Clay, Editorial, Instructional, Bento Grid, Bricks | The look; Professional, Scientific and Instructional read best for technical explainers |
| Prompt | Same panel; the help page's example: "Use a blue color theme and highlight the 3 key stats" | Free text | Content, emphasis, colours |
| Sources | Same panel | Checkboxes | The facts the image may show |
| Viewer | Expanded viewer | Zoom in and out, share, download; minimize or exit | Reading every label before download |
| Three-dot menu | Studio list | Rename, "download as a PNG file", share, delete, View custom prompt | |

Prompt patterns:

```
Landscape, Professional, Standard. Title: [title]. Show exactly these [N] numbers from the source named [X], each with its unit and the source's label: [list]. One short caption per number. No other statistics, no decorative text.
```

```
Portrait, Instructional, Concise. The [N] steps of [process] as described in [source], in order, one icon per step, step names in the source's own words, an arrow between steps. Colour theme [colour]. Mark step [k] as planned, as the source does.
```

```
Square, Scientific. A block diagram of [system]: blocks [A], [B], [C] with the source's names, arrows labelled with what flows between them as the source says. Nothing the source does not say.
```

Generated text in images is the weakest part: it misspells, rounds and merges labels; see "Images for explainers" and the worked pattern.

### Data Table

Blog: [Google, 2025-12-18](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-data-tables/), read 2026-10-29; the help center had no article for it on 2026-10-29; mobile note from [answer 16296687](https://support.google.com/gemininotebook/answer/16296687), read 2026-10-29; the limits row from [answer 16337734](https://support.google.com/gemininotebook/answer/16337734), read 2026-10-29.
Produces a structured table from the sources, in Studio, exportable to Google Sheets; Google's own examples are action items from meeting transcripts grouped by owner and priority, a competitor comparison of pricing and strategies, clinical trial outcomes across papers with years, sample sizes and statistics, historical events by date, destinations by cost.

| Setting | Where | Options | Effect on the result |
| --- | --- | --- | --- |
| Trigger | The Data Table tile in Studio; the pencil opens "Customize Data Table" | | |
| Prompt | The text box for "the table you want", with suggested examples | Free text | Decides the rows and the columns; the only lever on content besides the sources |
| Language | Same panel | Per the panel | Language of headers and cells |
| Sources | Checkboxes | | What the rows may be drawn from |
| Export | Three-dot menu | To Google Sheets; chat answers saved to notes and reports that contain tables also export to Sheets | Sorting, filtering and keeping the table outside the notebook |
| Availability | | Pro and Ultra at launch, then all users; "limited" at Standard access; not in the mobile app on 2026-10-29 | |

How to prompt it well: say what one row is, list the columns with their units, and add two columns that make the table its own check sheet, the source name and the exact quote the row rests on.

```
Rows: one per [source | study | component | event] in the selected sources.
Columns: [name]; [date]; [figure, with unit]; [method or purpose, in the source's words]; status (implemented or planned, as the source says); source name; exact quote the row is based on.
Leave a cell empty when the source does not give the value; never estimate or infer.
```

```
Compare [A] and [B] across [criteria list], one criterion per row, one column per option, a last column naming the source and the section for each cell. Where the sources disagree, put both values with their sources.
```

```
Every claim in the source named [X] about [topic], one per row: the claim in the source's words; the page or section; whether another selected source confirms, contradicts or is silent, with that source's name.
```

Export to Sheets, then sort by the status or the source column; an empty quote cell is a row to check or delete.

### Mind Map

Help: [answer 16212283](https://support.google.com/gemininotebook/answer/16212283), read 2026-10-29.
Produces a branching map of the topics in the selected sources, saved as a note in Studio; it stays inside the notebook and each node links back into the sources through chat. We use it for seeing connections and derivations, not for export.

| Setting | Where | Options | Effect on the result |
| --- | --- | --- | --- |
| Trigger | The Mind Map chip in chat (the help page's wording) or the Studio tile | No customization panel | |
| Sources | The selected sources | | The only lever on content: select the sources of one subject to get a map of that subject |
| Interaction | In the map | Zoom and scroll; expand or collapse branches; "Select a node to ask the chat questions about that topic"; expand or collapse the view, download, exit at the top right | A node question is the link from a branch to the passages behind it |
| Regenerate | More, then Delete note, which "restarts the generation process" | | A new map after sources changed |
| Mobile | Not supported on 2026-10-29 | | |

How to use it for connections and derivations:

1. Select only the sources of one subject, generate, then collapse everything and expand one branch at a time.
2. For a branch that connects two ideas, select the node and ask the chat where the connection is stated:

```
[selected node] Which passages connect this to [the parent node]? Quote them with their sources. If no passage states the connection, say so.
```

3. For a derivation (a result that follows from premises), ask the chain:

```
[selected node] List the steps the sources give to arrive at this, in order, each with its citation. Mark any step that the sources assume but do not state.
```

4. For the whole map, ask chat which branches lack support:

```
Which branches of the mind map have no supporting passage in the selected sources? List them with the nearest related passage.
```

A node that the sources do not support is the model's grouping, not a finding; delete the note and regenerate with fewer sources if the map is full of them.

### Reports

Help: [answer 18323649](https://support.google.com/gemininotebook/answer/18323649), read 2026-10-29; formats from the [Google blog, 2025-09-08](https://blog.google/technology/google-labs/notebooklm-student-features/) and [2026-09-15](https://blog.google/innovation-and-ai/products/gemini-notebook/new-study-tools-september-2026/), read 2026-10-29.
Produces a written document with inline citations (Reports, then Document), or an interactive web page with a table of contents that embeds slides, quizzes, flashcards and infographics (Reports, then Interactive, template Learning Overview, web only, some embedded content 18+).
Document templates: Briefing Doc, Study Guide, Blog Post, Create your own, plus formats the notebook suggests from the sources' theme; the Edit icon next to a template opens the instructions; Generate now or later; export to Google Docs from the three-dot menu; Share, then Copy link to Report.
We adapt or adopt a report when its structure fits; text analysis itself is done to higher quality elsewhere, so the one prompt worth keeping is the check sheet:

```
Create your own: for each claim you make, the sentence, then the citation, then whether another selected source confirms or contradicts it. Nothing without a citation. Under [N] words.
```

### Audio Overview

Help: [answer 16212820](https://support.google.com/gemininotebook/answer/16212820), read 2026-10-29.
Produces a spoken piece from the sources: Deep Dive (default, two hosts), The Brief (one speaker, under two minutes), The Critique (two hosts evaluate "an essay or design doc"), The Debate (two hosts, formal back-and-forth); Length Shorter, Default or Longer (Longer English only); Language from the 80 listed; a custom prompt to "focus on specific topics or adjust the expertise level"; Interactive mode (English, new overviews only) lets you select Join and ask the hosts a question answered from the sources; playback speed in the three-dot menu; Download gives the audio file.
Not everyone will listen to it; when we make one, the useful prompt is the critique of our own text:

```
The Critique of the source named [X]. Judge clarity, evidence for each claim, and what is missing, as a reviewer for [venue] would. End with the three changes that matter most. Quote the source when you name a problem.
```

### Quiz and Flashcards

Help: [answer 16958963](https://support.google.com/gemininotebook/answer/16958963), read 2026-10-29; new quiz formats and editing from the [Google blog, 2026-09-15](https://blog.google/innovation-and-ai/products/gemini-notebook/new-study-tools-september-2026/), read 2026-10-29.
Two tiles with the same panel: Difficulty (easy, medium, hard), Number (fewer, standard, more), Language, Sources, and a prompt for topic, audience and style; quizzes take multiple choice, short answer, multiple select and fill in the blank when asked; Explain on a card or a wrong answer cites the source; flashcards keep Got it and Missed it across sessions and retake only the missed cards; both can be edited; flashcards download as CSV.
Study use, not our case; a quiz on our own document is a cheap reading test of that document:

```
Ten questions on the source named [X], mixed formats, each answerable from the source alone, the source's wording in the correct answer. No trick questions.
```

### Chat, the base of everything

Help: [answer 16179559](https://support.google.com/gemininotebook/answer/16179559), read 2026-10-29.

- Answers use only the selected sources; each answer carries citations; hover shows the quoted passage, clicking opens it in the source.
- Save to note keeps an answer with its tables and citations; Add a note generates a note.
- "Gemini Notebook can't answer this question" appears for creative requests or when the sources do not hold the answer; rephrase, or add the missing source.
- Stop during generation, then revise the prompt or Keep generating.
- Chat can also "search the web, run code, and create downloadable files, charts, and images" (charts as PNG or SVG; PDF, Word, Markdown and text documents; PNG, JPG and GIF images; CSV and JSON; XLSX; PPTX), labelled experimental on the help page; this is the "secure cloud computer" announced on 2026-06-08 for Google AI Ultra and Workspace AI Expanded Access and extended to Pro on the web from 2026-07-16 ([Google blog, 2026-06-08](https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/) and [2026-07-16](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/), read 2026-10-29). A web-search answer is no longer grounded only in your sources; ask for the URL of each web claim and add the page as a source before relying on it.
- In the mobile app, the Audio button starts a spoken conversation with the notebook (18+).

Prompt patterns for chat:

```
Using only the source named [X]: what does it say about [topic]? Quote the passages and give the section for each.
```

```
Compare how [source A] and [source B] treat [topic]. Table: claim, A's wording, B's wording, do they agree. Add a row for anything one covers and the other does not.
```

```
List every date, number, label and proper name in your previous answer and cite the source of each one.
```

## Images for explainers

The notebook is the tool we use to generate the images in our explainers. Three routes, each a user option; the default is the Infographic because it gives one picture at the shape you choose.

| Route | Settings | What you get | How to take the picture out |
| --- | --- | --- | --- |
| Infographic (default) | Orientation for the shape, Concise for one message, Professional, Scientific or Instructional style, a prompt that names every label | One PNG | Three-dot menu, download as a PNG file ([answer 16758265](https://support.google.com/gemininotebook/answer/16758265), read 2026-10-29) |
| Slide Deck, one slide | Presenter Slides, Short, the one-slide prompt above, Delete slide for the rest | A slide with a picture and few words | Download PowerPoint (.pptx) and open it in LibreOffice Impress or any editor to save the picture, or extract it: a .pptx is a zip and its pictures are stored as media parts under `ppt/media/` (ECMA-376, Office Open XML; check the folder after unzipping). Download PDF for the whole slide as a page |
| Chat image (Pro and Ultra, web) | Ask chat for an image "with detailed instructions"; edit after generation; download from the Studio panel ([Google blog, 2026-06-08](https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/), read 2026-10-29) | PNG, JPG or GIF | The Studio panel's download |

Rules that hold for all three:

- Every label on the picture is a claim. Name the labels in the prompt, in the source's words, and check each one after generation.
- Ask for one picture per idea; a dense picture has more labels to misspell.
- State status in the prompt ("mark planned items as planned"); a picture presents everything as existing unless told otherwise.
- Generated images carry an invisible SynthID watermark, and a visible one on Standard and Plus plans and in some countries ([answer 16337734](https://support.google.com/gemininotebook/answer/16337734), read 2026-10-29); the Pro and Ultra "Visible watermarking" toggle removes the visible one.
- Credit the tool where the picture is used (see the worked pattern).

### Worked pattern from our own experience: the architecture image of 2026-10-20

1. **Generate.** An Infographic (it came out as a PNG) of the stereo stack's architecture from the sources selected for it, with a prompt naming the components.
2. **Check every label and claim against the sources.** We pasted the labels and captions back into chat and asked for the citation of each. Five kinds of error came up, all of a kind a picture invites:
   - a component's **purpose** stated wrongly (the picture gave it a role the sources give to another part);
   - an **unsupported guarantee** (a colour claim the sources do not make);
   - **depth labels** that did not match the sources' terms;
   - **driver claims** beyond what the sources say the drivers do;
   - **implemented versus planned** blurred: planned parts drawn as done.
3. **Correct before publishing.** The fixes were in the inputs, not in the picture: a short status note (implemented, planned) converted to a source; the prompt rewritten to name each component with the source's purpose for it and to say "mark planned items as planned"; the unsupported guarantee left out of the prompt; then a new generation and the same check again. When only wording or layout is wrong on a slide, the Revise step is enough; when a fact or a label is wrong, regenerate, because revisions do not read the sources.
4. **Credit.** Where the picture is used, one line: "Diagram generated with Google Gemini Notebook (NotebookLM) from [the sources], checked against them on [date]; corrections: [one line]." The check line is part of the credit, so a reader knows the picture was verified and by what.

## Step 4: Check the output

The notebook's own pages say it "can be inaccurate", that Audio and Video "may contain inaccuracies or audio glitches", and that Infographics "may contain visual or factual inaccuracies" (help articles 16212283, 16212820, 16454555, 16758265, read 2026-10-29).
A study of document-grounded answers in a newsroom task found NotebookLM wrong in 13% of outputs against about 40% for ChatGPT and Gemini; most errors were not invented names or numbers but "interpretive overconfidence", unsupported characterizations of a source and attributed opinions turned into general statements (Hagar, Agustianto and Diakopoulos, [arXiv 2509.25498](https://arxiv.org/abs/2509.25498), 2025-09-29, read 2026-10-29).
So the check is not only "is the number right" but "does the cited passage say this".

### For a chat answer

1. Open every citation. Read the passage, not just its existence. Ask: would the author of the source agree with the sentence that cites them?
2. For each sentence without a citation, ask chat where it comes from. If no source, delete it or mark it as the model's inference.
3. Ask the contradiction question: "Do any selected sources contradict this answer? Quote them."
4. Ask the coverage question: "What part of my question is not covered by the sources?"

### For a Studio output (no citations inside)

Slides, videos, infographics, data tables, audio and mind maps carry no citations.
Turn them back into text and check the text:

1. Copy the claims out. Slides and reports: Download PDF and read. Data Table: export to Sheets. Flashcards: Download CSV. Infographic: read every label in the expanded viewer, zoomed in. Audio and Video: write down every figure, date, name and on-screen label while playing, or ask chat to "write the script of the Video Overview you generated, with a citation for each claim" while the artifact is in Studio.
2. Paste the claims into chat: "For each of the following statements and labels, cite the source passage that supports it, or say 'not in the sources': [list]."
3. For each "not in the sources", remove the claim from what you share, or fix the sources and regenerate.
4. Compare the prompt with the result: View custom prompt in the artifact's menu; a result that ignores a "leave out" or a named source is a sign to regenerate with fewer sources selected.
5. For pictures (Infographic, slide visuals, video frames): read every number and label on the picture against the source; generated text in images rounds and misspells; a label that is almost the source's term is still wrong.
6. Status: for each component or feature drawn, ask "does the source say this exists today or that it is planned?"; fix the status in the inputs and regenerate.

### The partner's check before the person relies on it

A partner that helped produce an output does this, in words the person can paste:

1. Asks the person for the artifact's text (PDF, CSV, Sheet, the labels read off the picture, or their notes from the audio or video) and the list of selected sources from the Sources panel.
2. Drafts the "for each statement and label, cite or say not in the sources" question for the person to paste into chat, and reads the answer the person pastes back.
3. Lists the statements that failed, the statements that rest on one source only, the statements where sources disagree, and every component drawn as implemented that a source calls planned.
4. Says plainly which parts are safe to share and which need a source, a corrected prompt or a rewrite; never certifies an output whose text it has not seen.
5. Drafts the credit line with the check date and the corrections made.

### Known failure modes and how to catch them

| Failure | How it looks | Catch it | Evidence |
| --- | --- | --- | --- |
| The notebook denies a source it shows | "The sources do not mention X" while X is in a selected source; answers filled from general knowledge or from another source | Deselect every source but the right one and ask again; if that works, the retrieval failed, not the source; report it with Bad content | Regression after the 2026-02-19 model update, confirmed by two users, fix announced by Google staff on 2026-02-27 ([Google AI Developers Forum thread](https://discuss.ai.google.dev/t/critical-regression-gemini-3-1-pro-update-feb-19-completely-broke-notebooklm-s-rag-grounding/126857), read 2026-10-29) |
| Wrong purpose or role | A picture or script gives a component a job the sources give to another | Ask "what does the source named X say [component] does? Quote it" per component | Our 2026-10-20 architecture image |
| Unsupported guarantee | A property stated as certain that no source states | Ask "which source says [property]?"; leave it out of the prompt | Our 2026-10-20 architecture image |
| Implemented versus planned | Planned parts drawn or narrated as done | A status note converted to a source; "mark planned as planned" in the prompt; a status column in a Data Table | Our 2026-10-20 architecture image |
| Misattribution | Names from a footnote or a table presented as a paper's authors | Ask "who wrote the source named X, quoting the title page" | Forum thread above |
| Language bias | With sources in two languages, a question in one language draws mostly from sources in that language | Ask once per language, or name the sources | Forum thread above |
| Stale web page | A URL source is the page as it was at import; a change on the site does not reach the notebook | Date the import in the source title; delete and re-add the URL before a dated answer | Help page: only Drive sources sync ([answer 16215270](https://support.google.com/gemininotebook/answer/16215270), read 2026-10-29) |
| Deep Research report as fact | The imported report summarizes pages you have not read, and may carry their errors and dates | Import the cited primary pages; ask chat to compare the report with them | [Google blog, 2025-11-13](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-deep-research-file-types), read 2026-10-29 |
| Merged sources | A Doc or Sheet with several tabs becomes one source; a citation points at the file, not the tab | Split tabs into separate files when the tab matters | [answer 16215270](https://support.google.com/gemininotebook/answer/16215270), read 2026-10-29 |
| Whole-document citation | A very short source is cited as a whole, with no passage | Merge tiny notes, or accept the weaker citation | [FAQ, answer 16269187](https://support.google.com/gemininotebook/answer/16269187), read 2026-10-29 |
| Images without text | A web page's charts and images are not imported; a YouTube video without captions gives nothing | Add the chart as an image source or a PDF | [answer 16215270](https://support.google.com/gemininotebook/answer/16215270), read 2026-10-29 |
| Revision cannot add facts | A slide revision changes words and visuals only; "sources are not taken into account during revisions" | Fix facts in the sources or the custom prompt and regenerate | [answer 16757456](https://support.google.com/gemininotebook/answer/16757456), read 2026-10-29 |
| Web-search answers | Since chat can search the web, an answer may rest on a page that is not a source | Ask for the URL and add it as a source | [answer 16179559](https://support.google.com/gemininotebook/answer/16179559), read 2026-10-29 |
| Text in pictures | Misspelled, rounded or merged labels in infographics, slide visuals and video frames | Read every label zoomed in; name labels in the prompt | Our 2026-10-20 image; help page warning on Infographics |
| Audio glitches | A third voice, a speaker switch, distortion, above all in Interactive mode | Regenerate; do not share a glitched file | [answer 16212820](https://support.google.com/gemininotebook/answer/16212820), read 2026-10-29 |
| Too many sources | Quality drops as the notebook fills; the help page's own advice is to select sources per question | Keep one notebook per question; select, do not accumulate | [answer 16215270](https://support.google.com/gemininotebook/answer/16215270), read 2026-10-29 |

## The mobile app

From [answer 16296687](https://support.google.com/gemininotebook/answer/16296687), read 2026-10-29.
Android 10 or later, and iPhone and iPad.
Supported: chat, Audio Overview (language, length, sources, prompt; offline download; Interactive mode in beta, English), Video Overview (format, sources, visual style, prompt), Flashcards and Quiz (language, number, difficulty, sources, prompt), Infographic (orientation, sources, language, prompt; PNG), Slide Deck (format, language, length, sources, prompt; revisions, without adding or removing slides), sources of type PDF, website, YouTube, audio and copied text, sharing a page into the app as a source, Fast Research.
Not supported on 2026-10-29: notes, mind maps, reports, data tables, chat configuration and analytics, the featured notebooks tab, exporting audio as a file, other source types.
Google recommends the desktop for the full experience; make slides, videos and images on the web.

## Where the notebook also appears

- **Gemini app**: notebooks sync both ways; the Gemini app can use a notebook as context together with web search and other tools, so its answers are not grounded only in the sources; it cannot generate Studio outputs; since 2026-10-23 "@Gemini Notebook" in a Gemini chat creates and edits notebooks, sources and notes ([answer 17003757](https://support.google.com/gemininotebook/answer/17003757); [Workspace Updates, 2026-10-23](https://workspaceupdates.googleblog.com/2026/10/take-actions-on-your-notebooks-from-Gemini-Notebook-directly-in-the-Gemini-app.html), read 2026-10-29).
- **AI Mode in Google Search**: the same notebooks, English only, not in the EEA; chats there "may be used for ads monetization, personalization, and to improve Google generative AI models", unlike notebook data ([answer 17513891](https://support.google.com/gemininotebook/answer/17513891), read 2026-10-29). Keep private material out of AI Mode chats.
- **Google Docs**: type "@" in the Gemini side panel and pick a notebook; drafts carry inline citations; Workspace Business Standard and Plus, Enterprise Standard and Plus, Education Plus, and consumer Google AI Pro and Ultra ([Workspace Updates, 2026-09-23](https://workspaceupdates.googleblog.com/2026/09/ground-ai-prompts-in-google-docs-on-existing-sources-from-Gemini-Notebook.html), read 2026-10-29).
- **Data use**: the notebook does not use your data to train unless you send feedback; Workspace and Education data is never human reviewed; a thumbs down may lead to a review of the whole interaction on consumer accounts ([answer 16213268](https://support.google.com/gemininotebook/answer/16213268), read 2026-10-29).

## What changed, newest first

All read 2026-10-29.

- 2026-10-23: Gemini Notebook as a Connected App in the Gemini app ([Workspace Updates](https://workspaceupdates.googleblog.com/2026/10/take-actions-on-your-notebooks-from-Gemini-Notebook-directly-in-the-Gemini-app.html)).
- 2026-10-19: topic suggestions in chat and the review toggle (outline notes, producer notes) for Slide Decks and Video Overviews, rolling out to all users ([Google blog](https://blog.google/innovation-and-ai/products/gemini-notebook/co-create-slides-videos/)).
- 2026-09-23: a notebook as a source in Google Docs ([Workspace Updates](https://workspaceupdates.googleblog.com/2026/09/ground-ai-prompts-in-google-docs-on-existing-sources-from-Gemini-Notebook.html)).
- 2026-09-15: voice conversations in the app (Ultra first), audio recorder, interactive learning overviews under Reports, quiz formats short answer, multiple select and fill in the blank, editing of quiz and flashcard items, Short Video Overviews in 80+ languages ([Google blog](https://blog.google/innovation-and-ai/products/gemini-notebook/new-study-tools-september-2026/)).
- 2026-09-02: flexible, compute-based usage limits with a five-hour refresh for consumer accounts ([Google blog, 2026-08-28](https://blog.google/innovation-and-ai/products/gemini-notebook/new-flexible-usage-limits/)).
- 2026-08-27: Expert Intelligence, purchased Play Books ebooks as sources ([Google blog](https://blog.google/innovation-and-ai/products/gemini-notebook/expert-intelligence-leading-sources/)).
- 2026-08-07: a Workspace Studio step that adds sources to a notebook automatically, Workspace editions only ([Workspace Updates](https://workspaceupdates.googleblog.com/2026/08/automatically-add-sources-to-your-Gemini-Notebooks-in-Workspace-Studio.html)).
- 2026-07-16: NotebookLM renamed Gemini Notebook; the cloud computer reaches Pro on the web ([Google blog](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/)).
- 2026-06-08: chat on Gemini 3.5, a secure cloud computer per notebook, research from chat with Google Search, charts, images and files as outputs, for Ultra and Workspace AI Expanded Access ([Google blog](https://blog.google/innovation-and-ai/products/notebooklm/better-research-notebooklm/)).
- 2026-03-20: slide revisions, ten infographic styles, PPTX export, EPUB sources, saved private chat history, artifacts from chat ([Workspace Updates](https://workspaceupdates.googleblog.com/2026/03/new-ways-to-customize-and-interact-with-your-content-in-NotebookLM.html)).
- 2026-03-04: Cinematic Video Overviews, English, Ultra, 18+ ([Google blog](https://blog.google/innovation-and-ai/products/notebooklm/generate-your-own-cinematic-video-overviews-in-notebooklm/)).
- 2026-02-19 to 2026-02-27: retrieval regression after a model update, fixed ([forum thread](https://discuss.ai.google.dev/t/critical-regression-gemini-3-1-pro-update-feb-19-completely-broke-notebooklm-s-rag-grounding/126857)).
- 2026-02-06: Slide Deck and Infographic customization in the mobile app, with the format and length names Detailed Deck, Presenter Slides, Short, Default, Long (9to5Google, secondary).
- 2026-01-27: a notebook as a source in the Gemini app for Workspace users ([Workspace Updates](https://workspaceupdates.googleblog.com/2026/01/take-notebooks-further-notebooklm-gemini.html)).
- 2025-12-18: Data Tables; Gemini 3 ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-data-tables/)).
- 2025-11-13: Deep Research and Fast Research; Sheets, Drive URLs, Word and images as sources ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-deep-research-file-types)).
- 2025-10-29: Configure Chat with goals and personas; the full one-million-token context in chat ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-custom-personas-engine-upgrade/)).
- 2025-10-13: Nano Banana illustrations in Video Overviews, the Brief format (now Short), six visual styles ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/video-overviews-nano-banana/)).
- 2025-09-08: Flashcards and Quiz, redesigned Reports with Blog Post and suggested formats, Learning Guide, the Brief, Critique and Debate audio formats ([Google blog](https://blog.google/technology/google-labs/notebooklm-student-features/)).

## Sources

Every page this skill relies on, with the date read and what it supports, is in [references/sources.md](references/sources.md).
