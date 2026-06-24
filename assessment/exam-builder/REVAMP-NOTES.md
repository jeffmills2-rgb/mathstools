# Revamp notes

A phased revamp of the NSW Stage 4 & 5 maths generator. Phase 1 reframes the
tool around worksheets and lays the framework for deeper topic work in Phase 2.

## Phase 1 — done (the "shell")

**Worksheet-first defaults** (`app.js`)
- App now opens on the **Worksheet** template (was HSC exam).
- Default title is "Mathematics Worksheet"; time-allowed blank; instructions are
  worksheet-style ("Complete all questions", "Show all working…", "Ask your
  teacher…"). Exam/test templates automatically switch to formal exam wording.
- Multiple choice still defaults to 0.

**Generic, shareable branding**
- Hardcoded "Coffs Harbour High School" replaced with an editable `[School name]`
  placeholder across the app and all templates/solutions
  (`app.js`, `renderers/exam-renderer.js`, `renderers/worked-solution-renderer.js`,
  `utils/worked-solution-builder.js`). The HSC cover and worked-solution covers
  now use the document's school instead of a fixed brand.

**Visual template picker** (`app.js`, `styles/screen.css`)
- A friendly "Choose a template style" gallery on the dashboard (worksheet,
  textbook, revision, class test, HSC) with icons, taglines and "best for"
  notes. Clicking a card sets the style and re-renders any current document.

**Friendlier interface copy** (`app.js`, `index.html`)
- New heading: "Maths Worksheet & Assessment Builder", NSW Stage 4 & 5 eyebrow,
  and clearer page title.

**Question schema upgraded** (`schemas/question.schema.js`)
- `createQuestion` now keeps `diagramSpace`, `matching`, `mcEligible`, `hint`,
  `subparts` (previously silently dropped). This fixes latent behaviour — e.g.
  number-line tasks marked `mcEligible:false` are no longer turned into multiple
  choice, and `matching`/`diagramSpace` questions now reach the renderer — and
  gives Phase 2 room for richer questions and diagrams.

**Data-driven diagram engine registry** (`renderers/question-renderer.js`)
- The 16 hand-written `if` blocks are replaced by `DIAGRAM_ENGINE_REGISTRY`.
  Adding an engine is now one registry line + one `<script>` tag in `index.html`.
- Engine render errors are caught and shown gracefully instead of crashing.
- Diagrams support an optional `caption` and `notToScale` note.

## Verify

A dependency-free regression harness lives at `tools/verify.mjs`:

```
node tools/verify.mjs
```

It generates questions from every bank (validates against the schema), loads
every engine, renders every real diagram config to check it produces SVG, and
cross-checks the engine registry. Phase 1 result: 23 banks, 2,022 questions,
0 schema errors, 431/431 diagrams OK. Re-run after any Phase 2 edits.

## Phase 1.5 — fixes & UX (done)

**Fraction-token corruption fixed** (`utils/multiple-choice.js`, `renderers/question-renderer.js`)
- Root cause: the multiple-choice distractor builder treated the fraction token
  `[[frac:5:6]]` as algebra and squared its letters, producing `[[f²r²a²c²:5:6]]`,
  which then leaked to the page as raw text. Now distractor builders skip markup
  tokens, malformed token distractors are filtered out, and `renderMathText` has a
  safety net that recovers/strips any stray token. Verified: the pre-fix backup
  leaked 457 times; the fix leaks 0 across 770 MC questions. `tools/verify.mjs`
  now scans every topic's rendered text + MC choices for token leaks.

**Textbook template** (`renderers/*`, `templates/textbook-template/…`)
- Truly two-column now: diagram questions stay inside their column (they used to
  force full width and collapse the layout) and diagrams scale to fit.
- No answer space at all — answer spaces and draw-boxes are no longer generated
  for this style (students answer in their workbooks). Diagrams are kept.

**Guided pop-up wizard** (`app.js`, `styles/screen.css`)
- The four step-cards are replaced by a wizard. Choosing a template style starts
  a chained sequence of pop-ups — Style → Details → Topics → Generate — with a
  progress stepper and Back/Next. After generating, the dashboard shows a review
  panel (print, regenerate, solutions) plus "Change setup" to relaunch the wizard.
  Choosing a different style after generating restyles the document live.

## Phase 1.6 — textbook density (done)

**Root cause of the white space / single column**: the shared `.question-list`
rule in `hsc-template.css` sets `display:flex`, which silently disables CSS
multi-column — so the textbook's `columns:2` never took effect and the 11mm flex
`gap` between every question created the white space.

**Fix** (`templates/textbook-template/textbook-template.css`, full rewrite):
- Forces `display:block` on the textbook question list so the two columns
  actually render (in screen and print; print uses `column-fill:auto` for true
  textbook flow with the least white space).
- Collapsed spacing: ~10.3pt text, 2.4mm between questions, compact headings.
- Small diagrams: capped to ~50mm wide / 42mm tall and scaled via the SVG
  `viewBox` (all 16 engines use one), so every topic's diagrams shrink cleanly.
- No marks, no answer spaces, no draw-boxes.

This is template-level, so it applies to every topic at once. Open
`textbook-preview.html` in a browser to see/print a real generated example.

## Phase 2 — next (topic depth)

Per-topic expansion of question banks and engines across all areas
(geometry/measurement, algebra/equations, trig/networks, number/finance):
more question types and difficulty spread, richer worked solutions, and fuller
diagram coverage (using the new caption / not-to-scale support).

A backup of the pre-revamp project was saved alongside this folder
(`../Exam-builder-backup-YYYYMMDD`).
