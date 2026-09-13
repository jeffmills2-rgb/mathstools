# Starting Prompts

Copy, paste, edit the parts in `[SQUARE BRACKETS]`. These aren't magic words — they
work because they carry four things: context, the specific change, the test for
"done", and the limits.

**Two ways to work — see Part 0 of `WORKSHOP.md`.** These prompts are written for
**Way B (pasting)**, because that's the version that works everywhere.

**If your folder is connected** (Claude desktop app → Add folder), replace every
`[PASTE X]` below with `read X` and name the file by its path instead:

| Written below | With the folder connected |
|---|---|
| `[PASTE CLAUDE.md]` | Read `CLAUDE.md` |
| `[PASTE THE FILE]` | Read `student-quizzes/stage-4/number/example-integers-quiz/index.html` |
| `[PASTE YOUR :root BLOCK]` | Use the `:root` tokens from `index.html` |

Start every session by getting `CLAUDE.md` in front of it, one way or the other.

---

## Starting a new tool from an example

> I'm building maths tools for [YEAR LEVEL]. Here is my project brief:
>
> [PASTE CLAUDE.md]
>
> Here is an existing tool of mine I want to use as the starting point:
>
> [PASTE THE FILE]
>
> Make me a new one that [DESCRIBE THE TOOL IN TWO SENTENCES].
>
> It works when I can [YOUR TEST SENTENCE].
>
> Keep it a single self-contained HTML file, no external libraries, reuse the same
> `:root` design tokens, and don't add features I didn't ask for.

*Folder connected? Swap the first four lines for:* "Read `CLAUDE.md` and
`[PATH TO THE EXAMPLE]`, then copy that folder to `[PATH FOR THE NEW ONE]` and…"

---

## Reporting a bug

Always lead with the failing case. It is the most useful thing you have.

> In [FILE], question 7 came out as `[THE ACTUAL BAD OUTPUT]`. It should
> [WHAT IT SHOULD DO] because [THE MATHS REASON].
>
> Fix just that. Don't change anything else in the file.

---

## When the output is too big to understand

> That's more than I can follow. Rewrite it as the simplest version that does only
> [THE ONE THING], with a short comment above each section explaining what it does
> and why. I'd rather have something I can edit than something impressive.

---

## Making it match your other tools

> Here are my design tokens:
>
> ```css
> [PASTE YOUR :root BLOCK]
> ```
>
> Restyle this file to use only these variables. Don't introduce new colours, fonts
> or shadows. The layout stays as it is.

---

## Fixing print output

> This prints badly: [DESCRIBE — e.g. "the options panel prints", "the answers are
> on the same page as the questions", "it's 12 pages when it should be 2"].
>
> Fix the `@media print` block. The options panel and any buttons should not print.
> Questions must not split across a page break. Answers go on their own final page.
> A4, sensible margins.

---

## Adding a diagram

> Add an inline SVG diagram to this tool showing [WHAT]. Not canvas, not an image —
> inline SVG so it stays sharp on a projector and can use my CSS variables.
>
> It should redraw from the existing `state` object whenever `render()` runs.
> Labels readable from the back of a classroom.

---

## Checking maths correctness

Run this on anything that generates questions, before you use it with a class.

> Look at the question generator in this file and list every input that could
> produce a mathematically invalid or pedagogically wrong question — division by
> zero, non-integer results where I want integers, negative answers where the topic
> doesn't cover them yet, questions with no valid answer, duplicates in the same set.
>
> Don't fix anything yet. Just list what you find and how each one could occur.

---

## Writing your CLAUDE.md from what already exists

> Read through this repository and draft a project brief for `CLAUDE.md`. Cover what
> this is, how the folders are structured, and the conventions you can see I'm
> following — including ones I might not have written down. Flag anything where I've
> been inconsistent.

---

## Adding a resource to the homepage

> Add my new tool to the list in `index.html`. It's at
> `[PATH]`, it belongs in the [Student Quiz / Interactive Tools / Worksheet Creator]
> section, it's [STAGE], topic [TOPIC], and it's called "[TITLE]".
>
> Match the existing `<li>` markup exactly and update that section's item count.
> Don't add any JavaScript to that page — it's deliberately a plain list.

---

## When a chat has gone off the rails

Don't fight it. Start a new one. A fresh conversation with a good brief beats a long
one that has lost the thread — and it costs you thirty seconds.

> [PASTE CLAUDE.md]
>
> [PASTE THE CURRENT FILE — the last version that worked]
>
> This is where I'm up to. I want to [THE NEXT ONE THING].

*Folder connected?* "Read `CLAUDE.md` and `[PATH]`. That's where I'm up to. I want
to [THE NEXT ONE THING]."

---

## Saving your work back (folder connected only)

Worth checking explicitly the first time, so you know it's actually happening.

> Show me which files you changed and where they are on disk. I want to confirm the
> changes are saved into my folder, not just shown in the chat.
