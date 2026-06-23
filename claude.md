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

## 3. Repository layout

- Root `index.html` is the **hub / catalogue** — a polished landing page linking to
  every tool. New tools must be linked here to be discoverable.
- Each tool lives in **its own folder**, almost always as a **self-contained single
  HTML file** with inline CSS and JS. This is deliberate: tools are portable and one
  tool can never break another.
- **Exception — the Exam-builder** (`Assessment/Exam-builder/`) is a properly
  modularised app: `engines/`, `question-banks/` (Stage 4 & 5), `renderers/`,
  `schemas/`, `utils/`, `app.js`. Edit it as a multi-file app, not a single page.
- Other notable areas: `games/` (many single-file games, several multiplayer via
  Firebase), `fluency-portal/` (Stage 3/4 quizzes by outcome), `flip-cards/`,
  `teacher-dashboard/`, `Student-dashboard/`, `Resources/` (PDFs).

## 4. The standard tool pattern

Many topics ship as a set of sibling files in one folder. When building or extending a
topic, follow this convention:

- `index.html` — the interactive tool / teacher-facing visual.
- `lesson-plan.html` — teacher lesson plan for the concept.
- `student-quiz.html` — student-facing quiz (often Firebase-backed; see §6).
- `worksheet-creator.html` — generates printable worksheets.

Not every topic has all four — match whatever the topic already has.

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

- `mills-maths-tools` — dashboards and the fluency-portal student quizzes.
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

- **Folder-name casing is case-sensitive** on Netlify/GitHub Pages. Some existing hub
  links use lowercase (`./substitution/`, `./student-dashboard/`, `./divide-a-ratio/`,
  `./stacked-bar-ratio/`) while the actual folders are capitalised
  (`Substitution`, `Student-dashboard`, `Divide-a-ratio`, `Stacked-Bar-Ratio`).
  **Always match the real folder name exactly** in links and paths. (Existing
  mismatches are an open item to fix — see §9.)
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
- [ ] Fix **case-mismatched hub links** so they resolve on the live site.
- [ ] Decide whether to **consolidate the three Firebase projects** into one.
- [ ] Confirm which host (Netlify vs GitHub Pages) is authoritative if both deploy.
