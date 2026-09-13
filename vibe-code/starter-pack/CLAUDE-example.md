# EXAMPLE — a completed project brief

> **This file is not your brief.** It is somebody else's, filled in, so you can
> see the level of detail that makes `CLAUDE.md` useful instead of decorative.
> Read it, then go and write your own — or copy this one over `CLAUDE.md` and
> edit it, which is faster than starting from placeholders.
>
> The teacher below is invented. The conventions are the ones this pack ships with.

---

## 1. What this is

Interactive mathematics tools for Years 7 and 8 at Riverbend High, built by one
teacher. Static HTML — no accounts, no server, no data collection. Used on the
board in class and sent home as practice links.

The classes are mixed-ability with a wide spread; most tools need a way to be
used at two levels without looking like two different tools.

- **Live site:** riverbend-maths.netlify.app
- **Repository:** github.com/a-teacher/riverbend-maths
- **Local folder:** ~/Documents/riverbend-maths

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

- **The homepage has no JavaScript.** A sidebar and three lists of `<li>` rows.
  Adding a tool is a copy-paste. Don't add search or filtering.
- **One file per tool.** CSS and JavaScript inline. No shared stylesheet, no
  bundler. It must work opened straight from disk.
- **No external dependencies.** No CDN, no npm, no frameworks. School filtering
  blocks things without warning and I am not debugging that in period 3.
- **Design tokens at the top.** Every file opens with a `:root{}` block and
  colours are `var(--brand)`, never a hex code further down.
- **My tokens** — use these, don't invent new ones:
  ```css
  :root{
    --brand:#7c3aed;
    --brand-soft:#ede9fe;
    --ink:#1c1523;
    --muted:#645a70;
    --line:#e4dfea;
    --bg:#fbfaf7;
  }
  ```
- **State, then render.** One plain state object, `render()` redraws everything.
- **Generate once, render from the array.** Never regenerate questions at print
  time — the answer key must match the sheet the student is holding.
- **Print rules written first** for anything printable.
- **Every generator carries a teacher check panel** — a `<details>` block with a
  "Generate 20" button. Screen only. Non-negotiable.
- **Deal from a shuffled bag,** not independent random draws.
- **Compare whole numbers, not divisions.** Cross-multiply. Never `a/b === c/d`.
- **Say what is true.** Recurring decimals get recurring notation or `≈`.
  Recurring percentages get exact mixed numbers — 33⅓%, with the rounded decimal
  demoted to a small grey `≈` companion.
- **Minus signs are U+2212**, not hyphens. It matters on a projector.
- **Diagrams are inline SVG.** Not canvas, not images.
- **No student data leaves the device.** Hard rule.

## 4. Working agreement with Claude

- **Show me the smallest version first.** One question type working beats ten
  half-working.
- **Change one thing at a time.** If I report a bug, fix that bug — don't
  refactor around it in the same pass.
- **Don't add libraries, build steps or config files** unless I ask.
- **Curriculum: NSW Mathematics K–10 syllabus.** Get the outcome code right or
  leave it blank — a wrong code is worse than none, and you get these wrong
  more often than you think you do.
- **Tell me when I'm wrong.** If what I've asked for won't work, say so before
  building it.
- **Give me back the whole file**, not a fragment to splice in.
- **Don't touch files I didn't mention.**

## 5. Where I am up to

- **2026-03-04** — integers quiz live and used with 8M. The misconception rules
  fire correctly on the four sign cases. Left the generic "combined the sizes"
  rule out; it fired on −8 + (−5) = −13, which is the right answer.
- **2026-02-27** — settled the folder convention. Times tables went under
  `stage-3/`, not with the Stage 4 tools it was sitting beside. Filing by what a
  tool teaches rather than by which folder is open is the whole point.
- **2026-02-20** — set up from the workshop starter pack. Brand colour changed
  from green to purple; tokens above.

## 6. Open questions / next up

- A fractions-to-decimals tool for 7B — same double number line as the
  percentage one, so borrow that file rather than starting fresh.
- Decide whether the quizzes need a printable version, or whether the worksheet
  creators already cover it.
- Ask the head teacher about putting the school name in the footer.
