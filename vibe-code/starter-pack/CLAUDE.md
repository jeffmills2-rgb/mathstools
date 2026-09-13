# PLACEHOLDER — Project Brief

> **What this file is for.** Hand it to Claude at the start of any chat and it knows
> your project without you re-explaining it. Keep it short, current and high-signal.
> When a fact here stops being true, fix it here **first**, then make the change.
>
> **How to fill it in.** Don't write it from a blank page. Build something small
> first, then ask: *"Read the repository and draft a project brief for CLAUDE.md
> covering what this is, how it's structured, and the conventions you can see me
> following."* Then correct what it got wrong. Correcting is far easier than writing.

---

## 1. What this is

PLACEHOLDER: two or three sentences. What the site is, who uses it, what year levels.

Example of the right level of detail:
> A collection of interactive mathematics tools for Years 7–8 at PLACEHOLDER School,
> built by one teacher. Static HTML — no accounts, no server, no data collection.
> Used on the board in class and sent home as practice links.

- **Live site:** PLACEHOLDER (or "not deployed yet")
- **Repository:** PLACEHOLDER
- **Local folder:** PLACEHOLDER

## 2. Structure

```
index.html                    homepage — sidebar + three plain lists, no JavaScript
student-quizzes/              self-marking practice
interactive-tools/            whole-class teaching tools
worksheet-creators/           printable generators
```

Folder convention: `<section>/<stage>/<topic>/<tool-name>/index.html`,
all lowercase, hyphens, no spaces. Every tool is one self-contained file.

## 3. Conventions I follow

Delete any of these that aren't true for you, and add the ones you discover.

- **The homepage has no JavaScript.** It is a sidebar and three lists of `<li>`
  rows. Adding a tool is a copy-paste, not a config change. Don't add search,
  filtering or sorting to it unless the list genuinely gets too long to read.
- **One file per tool.** CSS and JavaScript inline in the same `index.html`. No
  shared stylesheet, no imports, no bundler. A tool must work when opened directly
  from disk.
- **No external dependencies.** No CDN links, no npm, no frameworks. If a tool needs
  a library, that's a decision to make deliberately, not a default.
- **Design tokens at the top.** Every file starts with a `:root{}` block of CSS
  variables. Colours are referenced as `var(--brand)`, never as hex codes further
  down.
- **Colours match the homepage.** PLACEHOLDER: paste your `:root` block here so
  every new tool starts consistent.
- **State, then render.** Interactive tools keep their state in one plain object and
  redraw everything from it. No partial DOM updates.
- **Generate once, render from the array.** Worksheet creators build a list of
  questions into a variable and render from it. Never regenerate on print — the
  answer key must match the sheet the student is holding.
- **Print rules written first.** Any printable page has its `@media print` block
  written before the screen styling is polished.
- **Every generator carries a teacher check panel.** A `<details>` block on the
  setup screen with a "Generate 20" button showing questions and answers.
  Screen-only, never printed, no student will open it. Non-negotiable in anything
  that generates questions.
- **Deal question types from a shuffled bag.** Not independent random draws, or
  the case the tool exists for turns up one time in eight and a ten-question run
  can miss it entirely. "Random questions" nearly always means *without
  replacement*.
- **Compare whole numbers, not divisions.** Cross-multiply to test whether two
  fractions are equal. Never `a/b === c/d`.
- **Say what is true.** Recurring decimals get recurring notation, or `≈`. Never
  `1/3 = 0.3333`. Recurring *percentages* get exact mixed numbers — 33⅓%, not
  33.33% — with the rounded decimal demoted to a small grey `≈` companion.
- **Classify by reducing, not by dividing.** Whether 100n/d terminates or recurs
  is decided by reducing it as whole numbers and looking at what is left on the
  bottom, never by inspecting the decimal. Any threshold you pick to test
  33.33333333333333 is wrong for some other fraction.
- **Don't measure text you didn't draw.** Guessing glyph widths to lay out an
  SVG label fails silently at some font size. Anchor around a piece whose
  width you control, or use one text element.
- **Wrong answers get named, not just marked.** A quiz says what mistake was made
  where it can work it out. That is teacher knowledge and it is the reason the
  tool is worth having.
- **Diagrams are inline SVG.** Not canvas, not images. Scales to a projector,
  styleable with the same CSS variables.
- **No student data leaves the device.** No analytics, no logging, no storage of
  typed answers. This is a hard rule, not a preference.

## 4. Working agreement with Claude

- **Show me the smallest version first.** One question type working beats ten
  half-working. I'll ask for more.
- **Change one thing at a time.** If I report a bug, fix that bug — don't
  refactor the surrounding code in the same pass.
- **Don't add libraries, build steps or config files** unless I ask. If you think
  one is needed, say why and wait.
- **Ask before assuming syllabus content.** PLACEHOLDER: name your curriculum
  (e.g. NSW Mathematics K–10 syllabus, Stage 4). Get the outcome code right or
  leave it blank — a wrong code is worse than none.
- **Tell me when I'm wrong.** If what I've asked for won't work, or there's a
  simpler way, say so before building it.
- **Give me back the whole file**, not a fragment to splice in — unless you're
  editing my folder directly, in which case tell me which files you changed.
- **Don't touch files I didn't mention.** If a change needs an edit somewhere else,
  say so and wait.

## 5. Where I am up to

PLACEHOLDER: keep a short running log. Newest at the top. This is the section that
earns the file its keep — it's what stops you re-litigating decisions you already made.

- **2026-08-19** — added a second example to each section, all three the SAME
  topic (Fraction to Percentage, MA4-FRC-C-01), adapted from the live tool on
  millsmathstools.au but rebuilt to this pack's conventions rather than copied.
  The point of doing one topic three ways is that a teacher can read across
  them and see what changes when the audience changes.
  - Kept from the original: one number line read from both sides (never two
    lines); estimate before value; the unit fraction (100 ÷ d) as its own
    named step; recurring percentages written as exact mixed numbers with the
    rounded decimal demoted to a grey ≈; the model printed on the worksheet.
  - Dropped: Percentage → Fraction mode, the settings menus, tier randomisers
    on every surface. Each file is readable end to end, which the originals
    are not.
  - Changed to match this pack: 10 questions and two attempts with the mistake
    named (the original gives 15 and one attempt); a seeded sheet code and
    A/B/C versions on the worksheet (the original has neither).
- **2026-08-19** — deepened the first three examples rather than adding more. The quiz
  now deals its four sign cases from a shuffled bag, names the misconception
  behind a wrong answer, shows the jump on a number line and gives two attempts;
  the fraction bar can pin a fraction to show equivalence and reports recurring
  decimals exactly; the worksheet creator prints A/B/C versions from one seed.
  Both generators gained a teacher check panel. Syllabus codes filled in
  (MA4-INT-C-01, MA4-FRC-C-01, MA3-MR-01).
- **2026-08-19** — moved times tables to `worksheet-creators/stage-3/`. It is
  multiplicative relations, which is Stage 3, and filing it with the Stage 4
  examples because they were already there is how the convention dies.
- **PLACEHOLDER-DATE** — set up the repository from the workshop template.

## 6. Open questions / next up

PLACEHOLDER: the running list. Delete things as you do them.

- Replace the three example tools with real ones.
- Decide on the stage/topic labels I actually use.
- Pick a hosting option (see `DEPLOY.md`).
- The misconception rules in the integers quiz are the generic ones. Replace them
  with the errors my classes actually make.
