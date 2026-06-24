# Mills Maths Tools — Repository Reorganisation Plan

> Status: **AWAITING APPROVAL**. Nothing has been moved yet. This document is the
> proposed structure + migration map. On your sign-off I execute the move and
> rewrite every link, then verify before you push to Netlify.
> Prepared: 2026-06-24

---

## 1. Your decisions (locked in)

1. **Lesson plans** travel *with their interactive tool* (no separate tab).
2. **Interactive Tools** are organised **by stage → topic** (same as worksheets/quizzes).
3. **Shared images** (logo `mmt.png`, banners) move to one central **`/assets`** folder;
   tool-specific images stay with their tool.
4. **Resources tab removed** entirely (nav link, tile, section, render JS, `resources.json`,
   the generator script, the Netlify build step, and the `Resources/` folder).
5. Proceed **plan-first** — this document — then execute.

---

## 2. The core problem this solves

Today the top level is a flat pile of ~25 topic folders plus a few category folders.
Each *topic* folder bundles up to four different things together:

```
collecting-like-terms/
  index.html            ← interactive tool   (Interactive Tools tab)
  worksheet-creator.html← worksheet          (Worksheet Creator tab)
  student-quiz.html     ← quiz               (Online Quizzes tab)
  lesson-plan.html      ← teacher lesson plan (no tab)
  mmt.png, lock-*.png   ← assets
```

You want the **top level to mirror the hub tabs**, and within the Worksheet and Quiz
tabs, a **Stage → Topic** hierarchy aligned to the NSW Mathematics syllabus.

That means each topic bundle gets **split by file type** across tab folders. The price
of that split is link breakage — sibling links (`index.html` → `student-quiz.html`) and
shared-asset paths stop resolving once the files no longer sit together. Rewriting those
links is the bulk of the work, and it is fully accounted for in Section 6.

---

## 3. Proposed top-level structure (by tab)

```
/
├── index.html                  ← hub (all links rewritten)
├── netlify.toml                ← build step removed (no more resources.json)
├── CLAUDE.md
├── assets/                     ← shared logos & banners (mmt.png, banner.png, fbmmt.png, swan.png)
│
├── interactive-tools/          ← TAB: Interactive Tools  (Stage → Topic)
│   └── stage-4/
│       └── algebra/
│           └── collecting-like-terms/
│               ├── index.html
│               ├── lesson-plan.html      ← lesson plan lives WITH the tool
│               └── (tool-specific images)
│
├── worksheet-creators/         ← TAB: Worksheet Creator (Stage → Topic)
│   └── stage-4/
│       └── algebra/
│           └── collecting-like-terms.html   (or /collecting-like-terms/ if it has assets)
│
├── online-quizzes/             ← TAB: Online Quizzes (Stage → Topic)
│   └── stage-4/
│       └── algebra/
│           └── collecting-like-terms.html
│
├── assessment/                 ← TAB: Exam Generator (Exam-builder app, kept intact)
│   └── exam-builder/...
│
├── games/                      ← TAB: Games (flat, unchanged internally)
├── flip-cards/                 ← TAB: Flip Cards (flat, unchanged internally)
├── dashboards/                 ← TAB: Dashboards
│   ├── teacher/
│   └── student/
└── research/                   ← TAB: Research (external links only — see §7)
```

Notes:
- **Folder names lowercased and hyphenated** consistently. This also fixes the existing
  case-mismatch bugs noted in `CLAUDE.md §9` (`./substitution/` vs `Substitution`, etc.).
- **Games & Flip Cards** keep their current internal layout (you said no stage/topic split
  needed); they just move under the tidy top-level names and get their `mmt.png` references
  repointed to `/assets`.
- **Assessment/Exam-builder** is a modular app — it is **moved as a whole unit, untouched
  inside**, only its inbound link from the hub changes.

---

## 4. Stage → Topic taxonomy (NSW Mathematics K–10)

Leaf grouping under Worksheet/Quiz/Interactive tabs:

- **stage-3/** (bridging, Years 5–6): `number/`
- **stage-4/** (Years 7–8): `number/`, `algebra/`, `measurement-space/`, `ratios-rates/`,
  `statistics-probability/`
- **stage-5/** (Years 9–10): `measurement-space/`, `statistics-probability/`

Topic folders are created only where content exists. The hub's existing `data-topic`
tags (`Number`, `Algebra`, `Measurement`, `Ratio`, `Probability`) drive the mapping.

---

## 5. Full migration map (old path → new path)

### 5a. Interactive Tools  (`interactive-tools/<stage>/<topic>/<tool>/`)

| Current | New |
|---|---|
| `collecting-like-terms/` (index, lesson-plan + assets) | `interactive-tools/stage-4/algebra/collecting-like-terms/` |
| `collecting-like-terms/number-groups/` | `interactive-tools/stage-4/algebra/number-groups/` |
| `equations/double-numberline/` (index, lesson-plan + assets) | `interactive-tools/stage-4/algebra/double-numberline/` |
| `Substitution/` (index, lesson-plan + image.png, logo.png) | `interactive-tools/stage-4/algebra/substitution/` |
| `factor-circles/` (index, lesson-plan + number pngs, pdfs) | `interactive-tools/stage-4/number/factor-circles/` |
| `integer-addition/` | `interactive-tools/stage-4/number/integer-addition/` |
| `integer-combined-signs/` (+ walk pngs) | `interactive-tools/stage-4/number/integer-combined-signs/` |
| `negatives-on-the-number-line/` | `interactive-tools/stage-4/number/negatives-on-the-number-line/` |
| `timestable-chart/` (index) | `interactive-tools/stage-3/number/timestable-chart/` |
| `timestable-chart/fraction-of-amount/` | `interactive-tools/stage-4/number/fraction-of-amount/` |
| `multiply-divide-by-ten/` | `interactive-tools/stage-3/number/multiply-divide-by-ten/` |
| `partition-splitter/` (+ place-value pngs) | `interactive-tools/stage-3/number/partition-splitter/` |
| `additive-strategies/` *(orphan)* | `interactive-tools/stage-3/number/additive-strategies/` |
| `addition-subtraction/` *(orphan)* | `interactive-tools/stage-3/number/addition-subtraction/` |
| `Number-and-Algebra/rounding-decimals/` *(orphan)* | `interactive-tools/stage-4/number/rounding-decimals/` |
| `Divide-a-ratio/` | `interactive-tools/stage-4/ratios-rates/divide-a-ratio/` |
| `Stacked-Bar-Ratio/` | `interactive-tools/stage-4/ratios-rates/stacked-bar-ratio/` |
| `partition-splitter/` ratio? → no, stays Number | — |
| `financial-expectation-spinner/` | `interactive-tools/stage-5/statistics-probability/financial-expectation-spinner/` |
| `perimeter-area-rectangle/` (index, lesson-plan) | `interactive-tools/stage-4/measurement-space/perimeter-area-rectangle/` |
| `Measurement/Geometry/Reading a protractor/` | `interactive-tools/stage-4/measurement-space/reading-a-protractor/` |
| `Measurement/Geometry/angles-parallel-lines.html` | `interactive-tools/stage-4/measurement-space/angles-parallel-lines/index.html` |
| `Measurement/Geometry/angles-engine.html` *(orphan)* | `interactive-tools/stage-4/measurement-space/angles-engine/index.html` |
| `Measurement/Pythagoras-theorem/diagram-engine.html` *(orphan)* | `interactive-tools/stage-5/measurement-space/pythagoras-diagram-engine/index.html` |

### 5b. Worksheet Creators  (`worksheet-creators/<stage>/<topic>/`)

Pulls every `worksheet-creator.html` / `*worksheet*.html` from topic folders **and** the
carded fluency-portal worksheets into one tree.

| Current | New |
|---|---|
| `fluency-portal/Stage 3/Multiplicative Strategies/using-factors.html` | `worksheet-creators/stage-3/number/multiplicative-strategies-using-factors.html` |
| `fluency-portal/Stage 4/computation-with-integers/index.html` (worksheet) | `worksheet-creators/stage-4/number/computation-with-integers/` |
| `fluency-portal/Stage 4/fractions-decimals-percentages/worksheet-creator.html` | `worksheet-creators/stage-4/number/fractions-decimals-percentages/` |
| `fluency-portal/Stage 4/Algebraic-techniques/index.html` (worksheet) | `worksheet-creators/stage-4/algebra/algebraic-techniques/` |
| `fluency-portal/Stage 4/Equations/index.html` (worksheet) | `worksheet-creators/stage-4/algebra/equations/` |
| `fluency-portal/Stage 4/angle-relationships/index.html` (worksheet) | `worksheet-creators/stage-4/measurement-space/angle-relationships/` |
| `collecting-like-terms/worksheet-creator.html` | `worksheet-creators/stage-4/algebra/collecting-like-terms.html` |
| `collecting-like-terms/number-groups/worksheet-creator.html` | `worksheet-creators/stage-4/algebra/number-groups.html` |
| `equations/double-numberline/worksheet-creator.html` | `worksheet-creators/stage-4/algebra/double-numberline.html` |
| `Substitution/worksheet-creator.html` | `worksheet-creators/stage-4/algebra/substitution.html` |
| `factor-circles/worksheet-creator.html` | `worksheet-creators/stage-4/number/factor-circles.html` |
| `integer-addition/student-worksheet.html` | `worksheet-creators/stage-4/number/integer-addition.html` |
| `negatives-on-the-number-line/integerworksheet.html` | `worksheet-creators/stage-4/number/negatives-on-the-number-line.html` |
| `multiply-divide-by-ten/teacher-worksheet.html` | `worksheet-creators/stage-3/number/multiply-divide-by-ten.html` |
| `timestable-chart/fraction-of-amount/worksheet-creator.html` | `worksheet-creators/stage-4/number/fraction-of-amount.html` |
| `perimeter-area-rectangle/worksheet-creator.html` | `worksheet-creators/stage-4/measurement-space/perimeter-area-rectangle.html` |
| `percentages/worksheet-creator.html` *(orphan)* | `worksheet-creators/stage-4/number/percentages.html` |

### 5c. Online Quizzes  (`online-quizzes/<stage>/<topic>/`)

| Current | New |
|---|---|
| `fluency-portal/Stage 4/computation-with-integers/student-quiz.html` | `online-quizzes/stage-4/number/computation-with-integers.html` |
| `fluency-portal/Stage 4/fractions-decimals-percentages/student-quiz.html` | `online-quizzes/stage-4/number/fractions-decimals-percentages.html` |
| `fluency-portal/Stage 4/Algebraic-techniques/student-quiz.html` | `online-quizzes/stage-4/algebra/algebraic-techniques.html` |
| `fluency-portal/Stage 4/Equations/student-quiz.html` | `online-quizzes/stage-4/algebra/equations.html` |
| `fluency-portal/Stage 4/angle-relationships/student-quiz.html` | `online-quizzes/stage-4/measurement-space/angle-relationships.html` |
| `collecting-like-terms/student-quiz.html` | `online-quizzes/stage-4/algebra/collecting-like-terms.html` |
| `collecting-like-terms/number-groups/student-quiz.html` | `online-quizzes/stage-4/algebra/number-groups.html` |
| `equations/double-numberline/student-quiz.html` (+ add-subtract, mult-div variants) | `online-quizzes/stage-4/algebra/double-numberline/` |
| `Substitution/student-quiz.html` | `online-quizzes/stage-4/algebra/substitution.html` |
| `factor-circles/student-quiz.html` | `online-quizzes/stage-4/number/factor-circles.html` |
| `integer-addition/student-quiz.html` | `online-quizzes/stage-4/number/integer-addition.html` |
| `integer-combined-signs/student-quiz.html` | `online-quizzes/stage-4/number/integer-combined-signs.html` |
| `negatives-on-the-number-line/studentquiz.html` | `online-quizzes/stage-4/number/negatives-on-the-number-line.html` |
| `timestable-chart/fraction-of-amount/student-quiz.html` | `online-quizzes/stage-4/number/fraction-of-amount.html` |
| `perimeter-area-rectangle/student-quiz.html` | `online-quizzes/stage-4/measurement-space/perimeter-area-rectangle.html` |
| `Measurement/Geometry/Reading a protractor/Student-quiz.html` | `online-quizzes/stage-4/measurement-space/reading-a-protractor.html` |

### 5d. Other tabs (move whole, internals unchanged)

| Current | New |
|---|---|
| `games/` (all) | `games/` (renamed assets refs to `/assets`) |
| `flip-cards/` (all) | `flip-cards/` (assets refs to `/assets`) |
| `Assessment/Exam-builder/` | `assessment/exam-builder/` |
| `teacher-dashboard/` | `dashboards/teacher/` |
| `Student-dashboard/` / `student-dashboard/` | `dashboards/student/` |

### 5e. Removed entirely

- `Resources/` (incl. `Stage-4/.../*.pdf`)
- `scripts/generate-resources-json.js`
- `Resources/resources.json` (generated)
- Resources nav link, category tile, `#resources` section, and the resource-render JS in `index.html`
- The `command` line in `netlify.toml` that runs the generator

### 5f. Standalone PDFs currently inside tool folders

`factor-circles/*.pdf`, `perimeter-area-rectangle/Matchstick-troubles.pdf` etc. travel
**with their tool** (they are linked from inside the tool, not from the Resources tab),
so they are not deleted — only the `Resources/` folder is.

---

## 6. Link-rewrite strategy (the hard part)

Three classes of links must be rewritten:

1. **Hub links in `index.html`** (~56 cards + nav). Every `href` repointed to its new
   path; URwith spaces (`%20`) disappear because new paths are hyphenated.
2. **Sibling cross-links inside tools** — e.g. `collecting-like-terms/index.html` links to
   `student-quiz.html`, `worksheet-creator.html`, `lesson-plan.html`. After the split,
   `lesson-plan.html` stays beside the tool (relative link survives) but the quiz and
   worksheet now live in other tabs, so those links become relative paths like
   `../../../../online-quizzes/stage-4/algebra/collecting-like-terms.html`.
3. **Asset references** — ~64 files reference `mmt.png` locally. All repointed to
   `/assets/mmt.png` (root-relative). Tool-specific images keep relative paths and move
   with the tool.

Method: a migration script builds an explicit old→new lookup table, copies files to new
locations, then runs a controlled find-and-replace across all `.html`/`.js`/`.css` using
that table (exact-path matching, not blind string replace) so no link is missed and none
is wrongly rewritten. The reverse-direction links (quiz → back to tool) are handled the
same way.

**Decision flagged:** the `fluency-portal/index.html` landing page is a *secondary hub*
that currently lists worksheets/quizzes by stage. Once those move out, it is redundant.
**Recommendation: delete it** and rely on the main hub's tabs + search. (Tell me if you'd
rather keep and rewire it.)

**Orphan tools** (`addition-subtraction`, `additive-strategies`, `percentages`,
`rounding-decimals`, `angles-engine`, `pythagoras diagram-engine`) are placed in the new
tree but are **not currently carded on the hub**. **Recommendation: add hub cards for them**
so they become discoverable. (Tell me if you'd rather leave them unlinked.)

---

## 7. Research tab

All Research cards are **external URLs** (NSW/VIC education, scispace, teachermagazine) —
no local files. The `research/` folder stays empty of files; the tab keeps working from
the hub markup unchanged. Nothing to move.

---

## 8. Risks & how they're contained

- **Live site breakage** — work happens on a branch/copy; you review locally before
  pushing. Git makes it fully revertible.
- **Case-sensitivity** — new structure is uniformly lowercase-hyphenated, which *removes*
  the existing live-link case bugs rather than adding risk.
- **Firebase tools** — quizzes/dashboards use inline `firebaseConfig`; moving files does
  not change config, only relative asset paths, which the rewrite handles.
- **Missed link** — final verification (Section 9) crawls every local href and fails loudly
  on any 404 before you push.

---

## 9. Verification plan (before you push)

1. Build the old→new table and assert every source file maps to exactly one destination.
2. After rewrite, **crawl every local `href`/`src`** in all HTML and report any path that
   doesn't resolve on disk — target: **zero broken local links**.
3. Confirm `Resources/`, the generator script, and the netlify build line are gone and no
   file still references `resources.json`.
4. Spot-open 4–5 representative tools (one per tab) to confirm assets + sibling links load.
5. Produce a short `MIGRATION-REPORT.md` listing every move and every rewritten link.

---

## 10. What I need from you to proceed

Approve as-is, or tell me your call on the two flagged items:
- **fluency-portal landing page**: delete (recommended) or keep & rewire?
- **orphan tools**: add hub cards (recommended) or leave unlinked?

On approval I execute Sections 5–6 and run the Section 9 verification.
