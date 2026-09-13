# Mathematics Vibe Coding Starter Pack

A blank-slate repository for a teacher-built mathematics website. Three sections,
two working examples in each, and nothing you have to configure.

The second example in each section — **Fraction to Percentage** — is deliberately
the same topic three ways: a tool you drive on the board, a quiz the student does
on a device, and a worksheet you print. Read them side by side before you build
your own. They share one page of arithmetic, one palette and one set of
conventions, and the differences between them are all differences of *purpose*,
not of style.

> **PLACEHOLDER:** replace this file's title and the paragraph above with your own
> project's name and purpose. That single act — describing your project in your own
> words — is what makes the AI useful for the rest of the build.

---

## In a hurry?

Open **`maths-tool-starter.html`**, then open **`START-HERE.html`** and read the
first section. That one file is
a working tool, it carries its own instructions, and you can drag it into a chat on
a phone, a tablet or a school laptop with nothing installed. Everything else here
is for after you've made one thing work.

---

## Open it

Double-click `index.html`. That's it. There is no build step, no install, no
account and no server.

If you'd rather serve it properly (some browsers restrict local files):

```bash
cd path/to/test
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## What's in the box

```
index.html                        the homepage — a sidebar and three lists. No JavaScript.
maths-tool-starter.html           ONE FILE. A working tool that carries its own brief.
                                  Drag it into any AI chat, on any device. Start here.
START-HERE.html                   all of the guides below, readable in a browser.
                                  Double-click this if the .md files won't open.
TEN-MINUTES.md                    the compressed path, if that's all the time you have
CLAUDE.md                         the brief you hand to Claude at the start of a chat
CLAUDE-example.md                 the same brief, filled in, so you can see the shape
WORKSHOP.md                       the questions and constraints to work through
DEPLOY.md                         putting it on the internet, later
PROMPTS.md                        copy-paste starting prompts
.gitignore

student-quizzes/                  SECTION 1 — self-marking practice on a device
  stage-4/number/example-integers-quiz/index.html
  stage-4/number/example-fraction-to-percentage/index.html

interactive-tools/                SECTION 2 — things you drive on the board
  stage-4/number/example-fraction-bar/index.html
  stage-4/number/example-fraction-to-percentage/index.html

worksheet-creators/               SECTION 3 — generators that produce a printable page
  stage-3/number/example-times-tables/index.html
  stage-4/number/example-fraction-to-percentage/index.html

assets/                           images, logos, anything shared
docs/                             your own notes — syllabus references, decisions
```

### The folder convention

```
<section>/<stage>/<topic>/<tool-name>/index.html
```

All lowercase, hyphens between words, no spaces. One folder per tool, always named
`index.html`. This matters more than it looks like it does: it means a URL is
`/interactive-tools/stage-4/number/fraction-bar/` rather than
`/tools/Fraction%20Bar%20FINAL%20v3.html`, and it means you can find anything
without searching.

Keep the stage/topic layer even when you only have two tools. Retrofitting it at
forty is miserable.

Note that the times tables example sits under `stage-3/`, not `stage-4/` — times
tables are multiplicative relations, which is Stage 3 content. It would have been
easier to leave it filed with the other two. Filing by what a tool actually
teaches, rather than by which folder is already open, is the entire point of the
convention, and the first time you break it is the day it stops working.

---

## Adding your first resource

1. Copy the example folder nearest to what you want.
2. Rename it. Edit the file.
3. Open `index.html` in the repository root, find the section it belongs to, and
   copy one `<li>` block from the list.
4. Change four things on the copy: the `href`, the title, the meta line and the
   description.

That's the whole system:

```html
<li>
  <a href="student-quizzes/stage-4/number/YOUR-TOOL/index.html" target="_blank" rel="noopener">
    <span class="t">Your Tool's Name</span>
    <span class="m">Stage 4 · Number · YOUR-OUTCOME-CODE</span>
    <span class="d">One sentence a colleague would understand.</span>
  </a>
</li>
```

Then bump the `1 item` count in that section's heading, or delete it.

---

## What this template deliberately does not have

- **No analytics.** Nothing reports anywhere.
- **No search or filtering on the homepage.** It's a plain list with no JavaScript.
  Three items don't need a search engine, and a page you can read end to end is a
  page you'll actually edit. Add search when the list genuinely gets long.
- **No accounts or logins.** No student data is collected, stored or transmitted.
- **No database.** Scores live in a variable and vanish when the tab closes.
- **No framework, no npm, no build step.** Plain HTML, CSS and JavaScript.

Every one of these can be added later, and each has a real cost — in setup, in
privacy obligations, and in the number of things that can break in front of a class.
Start without them. Add one only when you can name the specific problem it solves.

---

## Working with AI on this

Two ways to work, and they change what you type:

- **Folder connected** — in the Claude desktop app, start a Cowork task and use
  **Add folder** on this folder. Claude reads and edits the files directly and saves
  to disk. Open with *"Read `CLAUDE.md` and `README.md`, then wait for me."*
- **Pasting** — on the web or a phone you can't connect a whole folder, so you paste
  file contents in and save the results back yourself. Works fine, just more manual.
  Ask for the **whole file** back, not just the changed part.

`WORKSHOP.md` Part 0 covers both properly. `CLAUDE.md` is the brief you hand over so
you don't re-explain the project every time — **fill it in before you start**, or
Claude reads a page that says PLACEHOLDER eleven times.
