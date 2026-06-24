# Mills Maths Tools — Project Brief

> Hand this file to Claude at the start of any chat to get it up to speed without
> re-uploading the whole repo. Keep it short, current, and high-signal. If a fact
> here stops being true, fix it here first.
> Last reviewed: 2026-06-23

---

## 1. What this is

A hub-and-spoke website of interactive mathematics tools for teachers and students,
built and maintained by a NSW mathematics teacher / instructional leader.

- **Audience:** Years 7–10 (NSW Stages 3, 4 and 5).
- **Curriculum framing:** NSW Mathematics syllabus; content is organised by stage and
  outcome (e.g. the "fluency portal" is grouped by syllabus outcome).
- **Live site:** https://www.millsmathstools.au (custom domain)
- **Repo / Pages mirror:** https://jeffmills2-rgb.github.io/mathstools/ (public)

## 2. Hosting & deploy pipeline

- **Source of truth:** the Git repository.
- **Workflow:** edit local files → commit/push to Git → **Netlify auto-deploys**.
- **Build step:** `netlify.toml` runs `node scripts/generate-resources-json.js`, which
  scans the `Resources/` folder for PDFs and regenerates `Resources/resources.json`
  (used to populate the resources section). Individual tools need **no build** — they
  are plain HTML.
- A GitHub Pages mirror and Cloudflare (insights beacon) are also in the picture.
  Treat **Netlify + the custom domain** as the live deployment.

## 3. Repository layout  (reorganised 2026-06-24)

The repo is now organised **by hub tab** at the top level, all lowercase-hyphenated:

```
/index.html                ← hub / catalogue (links to every tool; must stay current)
/assets/                   ← shared logos & banners (mmt.png, banner.png, fbmmt.png)
/interactive-tools/<stage>/<topic>/<tool>/   ← interactive visual tools + their lesson-plan.html
/worksheet-creators/<stage>/<topic>/         ← printable worksheet generators
/online-quizzes/<stage>/<topic>/             ← student-facing quizzes (often Firebase)
/assessment/exam-builder/  ← modular Exam-builder app (engines/, question-banks/, etc.)
/games/                    ← single-file games (several multiplayer via Firebase), flat
/flip-cards/               ← flip-card sets, flat
/dashboards/teacher/ , /dashboards/student/
```

- `<stage>` is `stage-3` / `stage-4` / `stage-5`; `<topic>` follows NSW strands:
  `number`, `algebra`, `measurement-space`, `ratios-rates`, `statistics-probability`.
- **Each interactive tool keeps its own folder** with its tool-specific images and its
  `lesson-plan.html`. Its matching worksheet/quiz live under the worksheet/quiz trees
  and are linked across tabs with relative paths.
- **Shared logo (`mmt.png`) is referenced from `/assets`** everywhere — do not
  re-duplicate it per folder.
- **Exam-builder** (`assessment/exam-builder/`) is a properly modularised app
  (`engines/`, `question-banks/` Stage 4 & 5, `renderers/`, `schemas/`, `utils/`,
  `app.js`). Edit it as a multi-file app, not a single page.
- The old `Resources/` tab + `resources.json` generator have been **removed**.

## 4. The standard tool pattern

A topic typically spans three tabs. When building/extending a topic:

- **Interactive tool** → `interactive-tools/<stage>/<topic>/<tool>/index.html`
  (plus `lesson-plan.html` and any tool-specific images in the same folder).
- **Worksheet** → `worksheet-creators/<stage>/<topic>/<tool>.html` (or `<tool>/index.html`
  if it has its own print assets, e.g. `border_page0.png`).
- **Quiz** → `online-quizzes/<stage>/<topic>/<tool>.html` (often Firebase-backed; see §6).

Cross-tab links between a tool and its worksheet/quiz are **relative** (e.g.
`../../../../online-quizzes/...`). New tools must be linked from the hub `index.html`
to be discoverable. Not every topic has all three — match whatever exists.

## 5. Design system

The hub and most tools share a consistent token-based look. Reuse these rather than
inventing new colours/spacing.

**Core tokens (from root `index.html` `:root`):**
- Surfaces: `--bg:#f6f8fb`, `--surface:#ffffff`, `--surface-soft:#f8fafc`
- Text: `--ink:#0f172a`, `--muted:#64748b`, `--muted-light:#94a3b8`
- Lines: `--line:#e2e8f0`, `--line-strong:#cbd5e1`
- Brand: `--brand:#1d4ed8`, `--brand-2:#2563eb`, `--brand-soft:#dbeafe`
- Accents: green `#15803d`, orange `#c2410c`, purple `#6d28d9`, teal `#0f766e`,
  amber `#92400e` (each with a matching `-soft` tint)
- Shape: `--radius:22px`, `--radius-sm:16px`; shadows `--shadow-sm`, `--shadow-md`
- Layout: `--max:1180px`

**Type:**
- UI / hub: **Inter** (`ui-sans-serif` fallback).
- "Classroom / chalkboard" tools use handwriting fonts via Google Fonts:
  Kalam, Patrick Hand, Schoolbell, Gloria Hallelujah, Shadows Into Light, Caveat.

**Baseline UX:** accessible nav (skip link), responsive (`width=device-width`),
sticky blurred header. Keep new tools mobile-friendly and keyboard-navigable.

## 6. Firebase (data layer)

Several tools use **Firebase (Auth + Firestore)**, loaded via the `firebasejs`
v10.x compat CDN scripts. There are currently **three separate Firebase projects**:

- `mills-maths-tools` — dashboards and the `online-quizzes/` student quizzes.
- `mmt-firebase-games` — multiplayer games.
- `coordinate-connect-4` — (its own project).

> Consolidating onto one project is a possible future cleanup — note before doing so.

**Config:** each Firebase tool holds its `firebaseConfig` inline. The web API key in
that config is **not a secret** (Firebase web keys are public by design); it only
identifies the project.

**Auth:** **anonymous sign-in** (`signInAnonymously` + `onAuthStateChanged`). No
student passwords or emails are collected — good for privacy.

**Firestore collections seen:** `students`, `mastery`, `badges`.

**⚠️ Security note (important):** because auth is anonymous, **Firestore Security
Rules are the only thing protecting student data.** Confirm the rules are locked down
(not left in test/open mode) before relying on them. Review these whenever touching
anything that reads/writes student records.

## 7. Conventions & gotchas

- **Folder-name casing is case-sensitive** on Netlify/GitHub Pages. The 2026-06-24
  reorg made every folder **lowercase-hyphenated**, which resolved the old
  case-mismatch bugs. Keep new folders lowercase-hyphenated and match paths exactly.
- Prefer **self-contained single HTML files** for new standalone tools.
- New Firebase tools should **reuse the existing config + the `students`/`mastery`/
  `badges` patterns** from current files so they plug into the same project.
- `localStorage` is used widely for local/offline state (quiz progress, game state).
- Curriculum/enrichment links out to Polypad, NRICH, OpenMiddle, Youcubed are an
  intentional part of the site — keep them.

## 8. Working agreement with Claude

- **For edits:** the user uploads/pastes the **current** version of the file. Claude
  works from that, never from memory of an older copy.
- **Claude returns one complete, ready-to-drop-in file** as a **download**, and always
  states the **exact folder path** it belongs in (e.g. `./factor-circles/index.html`).
- Whole files, not snippets.
- Single self-contained tools can be **previewed by double-clicking** the downloaded
  file locally (Firebase/online-font features need the live site).
- Match existing design tokens, file-naming conventions, and folder casing.

## 9. Open items / to verify

- [ ] Confirm **Firestore Security Rules** are locked down for all three projects.
- [x] ~~Fix case-mismatched hub links~~ — resolved by the 2026-06-24 tab-based reorg.
- [ ] Decide whether to **consolidate the three Firebase projects** into one.
- [ ] Confirm which host (Netlify vs GitHub Pages) is authoritative if both deploy.
- [ ] Fix 4 **pre-existing broken refs** (predate the reorg): `factor-circles` →
      `amplifylogo.png`; `reading-a-protractor` → missing `lesson-plan.html`;
      `integer-combined-signs` → missing `worksheet-creator.html`; `double-numberline`
      lesson-plan → `IMG_0325.jpeg`. See `MIGRATION-REPORT.md`.
