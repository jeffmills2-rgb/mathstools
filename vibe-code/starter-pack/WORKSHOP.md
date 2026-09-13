# Vibe Coding for Maths Teachers — Workshop Guide

A method for building classroom tools with AI when you are not a software developer.
Work through it in order. Nothing here needs prior coding knowledge, and nothing here
asks you to trust the AI further than you can check.

---

## Before you touch a keyboard

### The one idea worth taking away

You are not learning to code. You are learning to **specify, check and correct**.
The AI writes fluent code instantly and confidently, including when it is wrong.
Your value in this partnership is knowing what a Year 8 needs, and being able to
look at what came back and say "no, that's not it, because…".

That means the skill to practise today is *description*, not syntax.

### Two rules that prevent most of the pain

1. **If you can't describe it to a colleague in two sentences, you can't ask for it
   yet.** Go and write the two sentences first.
2. **If you can't tell whether the output is right, don't build it yet.** Build the
   thing where you'd spot an error immediately.

---

## Part 0 — Setting up your AI

There are two ways to work, and they change what you type. Find out which one you're
in before you start, because half the advice online assumes the other one.

### Way A — the folder is connected (best, needs the desktop app)

In the **Claude desktop app**, start a Cowork task and use **Add folder** to point it
at this folder. Claude can then read and edit the files directly — no copying, no
pasting, and your changes are saved to disk as you go.

Open your first message with:

> Read `CLAUDE.md` and `README.md` in this folder so you know what the project is,
> then wait for me.

That one line matters. Claude will find its way around the folder on its own, but
telling it to read the brief first means it starts from your rules instead of
guessing them from the files.

### Way B — you're pasting into a chat (web, mobile, or no folder connected)

Adding a whole folder needs the desktop app. On the web or on a phone you can still
attach individual files, or paste their contents in.

It works fine — it's just more manual. Open with:

> Here is my project brief: [paste `CLAUDE.md`]
>
> Here is the file I'm working on: [paste the file]

**The catch to know about:** in Way B, Claude gives you back a block of code and
*you* have to save it into the right file yourself. Get into the habit of asking for
the whole file rather than "just the changed bit" — stitching a fragment into the
middle of a file is where beginners lose an afternoon.

### Either way

- **Fill in `CLAUDE.md` first.** It ships as placeholders. Connecting the folder
  without filling it in means Claude reads a brief that says PLACEHOLDER eleven
  times, which is worse than no brief at all.
- **One tool per conversation.** When a chat gets long and starts drifting, don't
  fight it — start a new one and re-point it at `CLAUDE.md`.
- **Keep your own copy of anything that works.** Before a big change, save the
  working version. `index-working.html` is a perfectly respectable backup until
  you're comfortable with git.

---

## Part 1 — Six questions to answer before you start

Answer these on paper. Twenty minutes. Do it before opening any AI tool. Most of the
frustration people have with AI coding comes from starting with question 5.

### Q1. What is the one lesson this fixes?

Not "a maths website". A specific lesson, with a specific class, where a specific
thing is hard. *"Year 8 period 5 cannot see why −7 − (−3) isn't −10."*

If you can't name the lesson, you'll build something impressive that nobody opens.

### Q2. Who touches it — you, or the students?

This decides everything about the design, and people routinely get it backwards.

| | You drive it | Students drive it |
|---|---|---|
| Runs on | Your machine, projected | 30 devices you don't control |
| Failure mode | You improvise | 30 hands go up at once |
| Needs instructions | No | Yes, on the page, in student language |
| Needs to be robust | Somewhat | Completely |
| Build it | First | Second |

Build the teacher-facing version first even if the student one is the goal. It's
faster to make, and you learn what the thing actually needs to do.

### Q3. What does "it works" look like?

Write the test before you build. Concretely:

> *"I can set the denominator to 7, drag the point to 3/7, and the number line, the
> bar and the decimal all agree."*

If you can't write that sentence, you don't yet know what you're asking for. This
sentence is also literally what you paste to the AI, and what you check against
afterwards.

### Q4. What is the smallest version that would still be useful on Monday?

Not the version you'd be proud of. The one you'd actually use this week. Almost
always smaller than you think:

- One question type, not eight.
- One year level, not four.
- Twenty questions hardcoded, not a generator.

Ship the small one. Use it. The next version will be shaped by what actually annoyed
you, which is far better information than what you imagined in advance.

### Q5. What must never happen?

Write your hard limits down now, while you're calm and not mid-build at 11pm.
Suggested starting set — cross out what doesn't apply, add your own:

- No student names, answers or results leave the device.
- No logins, no accounts, no email addresses collected.
- Nothing that needs the internet to work in a classroom.
- Nothing my school's IT would have to approve.
- Nothing that costs money per use.

These go in your `CLAUDE.md` and you restate them whenever the AI drifts.

### Q6. How will you know if it's mathematically wrong?

The failure mode nobody warns you about. AI-generated maths tools are *plausible*
first and *correct* second. Things it gets wrong regularly:

- Fractions that display but don't simplify, or simplify to something wrong.
- Negative numbers rendered with a hyphen instead of a minus sign.
- Rounding that produces `0.30000000000000004`.
- A "random" generator that will happily produce `8 ÷ 3` in a whole-number exercise.
- Division questions where the divisor can be zero.
- Answer keys generated separately from the questions, so they don't match.
- A generator whose maths is flawless and which never produces the case you built
  it for, because the interesting option only comes up one time in eight.
- `1/3 = 0.3333` — displayed with an equals sign, on a projector, to thirty children.

**Your check, always:** generate twenty items and mark them by hand. Every time. It
takes four minutes and it is the difference between a tool and an embarrassment.

Both generators in this pack have a **Teacher check** panel that does the generating
for you — a `<details>` block on the setup screen with a "Generate 20" button. It is
this instruction turned into a button, students never open it, and it costs nothing
to leave in. Copy it into everything you build. The one in the worksheet creator
also counts how many questions on the current sheet are repeats.

It is worth knowing what a check like this actually catches, because it is never the
thing you were looking for. While the integers quiz in this pack was being written,
its marker had a rule saying "you have combined the sizes" whenever the student's
answer had size |a| + |b|. That reads as obviously correct. It also fires on
−8 + (−5) = −13, which is the *right* answer — because −13 really does have size
8 + 5. Nothing in the code looked wrong, and no amount of rereading it would have
helped. Running every rule against the correct answer and checking they all stayed
silent is what found it.

---

## Part 2 — Six constraints to hold the whole time

These are what make the difference between a repository that grows for two years
and one that becomes unmaintainable in a fortnight. They apply to *you*, not just
to the AI.

### C1. One file per tool

Everything a tool needs — HTML, CSS, JavaScript — lives in one `index.html`. It
looks unprofessional. It is exactly right for this context:

- You can email it, AirDrop it, or drop it on a USB stick.
- You can open it with no internet.
- You can hand the whole file to an AI and it has complete context.
- Nothing can break because a shared file changed somewhere else.

The moment you have shared files, a change to one tool can silently break four
others, and you will not find out until a lesson.

### C2. No dependencies

No CDN links, no npm, no React. Not because they're bad — because every one is a
thing that can be down, blocked by school filtering, or updated into breaking your
tool during period 3.

If a tool genuinely needs a library, that's a real decision. Make it deliberately,
write down why in `CLAUDE.md`, and accept the cost.

### C3. Design tokens at the top of every file

```css
:root{
  --brand:#047857;
  --ink:#10221c;
  --muted:#5b6b64;
  --line:#dde7e2;
}
```

Then use `var(--brand)` everywhere below. Now "make the whole site purple" is one
line, in every file, forever — instead of a hunt through forty hex codes. Paste your
token block into `CLAUDE.md` so every new tool starts consistent.

This is the first thing to change, and the fastest win of the session: pick your own
`--brand` colour before you build anything. The pack ships green so that nobody's
site accidentally looks like anybody else's.

### C4. State, then render

Interactive tools keep what they're showing in one plain object:

```js
const state = { num: 3, den: 4, showBar: true };
```

Every control changes `state`, then calls `render()`, which draws the whole picture
from scratch. It sounds wasteful. It means you can never have a half-updated
diagram, which is the bug that eats an evening.

Insist on this pattern by name. The AI will use it if you ask, and drift away from
it if you don't.

### C5. Print rules first, for anything printable

Write the `@media print` block before you polish the screen version, and press
Ctrl/Cmd+P after every change. Otherwise you find out at the photocopier that the
options panel prints, the answers are on page 1, and the sheet is 61 pages.

### C6. Generate once, render from the array

Worksheet generators build a list of questions into a variable, then render both the
sheet and the answer key from that same list. Never regenerate at print time. This
is the single most common bug in AI-written worksheet tools and the one your students
will find first.

---

## Part 3 — The workshop session, in order

Roughly 90 minutes. Adjust to taste.

### 0:00 — Set up (10 min)

Everyone gets a copy of this folder. Everyone opens `index.html` in a browser and
clicks all three examples. Nothing to install.

Rename the folder to your project. Delete nothing yet.

Then get your AI pointed at it — **Part 0** above. If you're on a laptop with the
Claude desktop app, connect the folder; if you're on a tablet or the web, you'll be
pasting instead, which is fine. Sort this out now rather than at 0:40.

### 0:10 — Answer the six questions (20 min)

On paper, individually. Then pair up and read Q1 and Q3 to each other. If your
partner can't picture the tool from your two sentences, rewrite them. This is the
highest-value twenty minutes of the session and the one people most want to skip.

### 0:30 — Write your CLAUDE.md (10 min)

Open `CLAUDE.md`, fill in sections 1 and 3 with the answers from Q1, Q2 and Q5.
Leave the rest as placeholders. Ten minutes, not thirty — you'll improve it as you go.

### 0:40 — Build one thing (35 min)

Pick the example closest to your Q1 answer. Copy the folder. Rename it.

Then, in the AI, open with this shape. **The four parts matter more than the
wording** — context, the change, the test, the limits. Miss one and you'll spend the
next twenty minutes correcting.

**If the folder is connected (Way A):**

> **[Context]** Read `CLAUDE.md`, then read
> `worksheet-creators/stage-3/number/example-times-tables/index.html`.
>
> **[The change]** Copy that folder to
> `worksheet-creators/[STAGE]/[TOPIC]/[YOUR-TOOL]/` and change it from times tables
> to [YOUR THING].
>
> **[The test]** It works when I can [YOUR Q3 SENTENCE].
>
> **[The limits]** Keep it one self-contained file, no libraries, keep the existing
> design tokens, and don't add anything I didn't ask for.

**If you're pasting (Way B):** same four parts, but hand over the material yourself
and ask for the whole file back.

> **[Context]** I'm building a maths tool for Year 8. Here is my project brief
> [paste `CLAUDE.md`] and here is the file I'm starting from [paste the example].
>
> **[The change]** I want to change it from times tables to [YOUR THING].
>
> **[The test]** It works when I can [YOUR Q3 SENTENCE].
>
> **[The limits]** Keep it one self-contained file, no libraries, keep the existing
> design tokens, don't add anything I didn't ask for, and give me back the complete
> file so I can save over mine.

Then **check it**. Twenty items, marked by hand, before you ask for anything else.

When something is wrong, report it the way you'd report it to a colleague:

> *"Question 7 was 8 ÷ 3, which isn't a whole number. All divisions should come out
> exactly."*

Not *"fix the divisions"*. The specific failing case is the most useful thing you
own.

### 1:15 — Add it to the homepage (10 min)

Open `index.html` and copy one `<li>` block in the right section. Change the `href`,
the title, the meta line and the description. Reload.

The homepage has no JavaScript on purpose — it is a list you can read and edit
without being afraid of it. Ten minutes of unglamorous copy-paste, and it's the step
that turns a folder of files into something a colleague can use.

### 1:25 — Share and close (5 min)

Everyone opens their one tool on the projector for sixty seconds.

---

## Part 4 — The things people get stuck on

**"It gave me something huge and I don't understand any of it."**
Ask for less. *"Rewrite this as the simplest version that does only X, with comments
explaining each section."* Then ask it to explain any block you can't read. Never
keep code you can't follow at all — you won't be able to fix it in front of a class.

**"It keeps breaking things that were working."**
Change one thing per request. Save a working copy before a big change (literally
`index-working.html` is fine before you're comfortable with git). If it's drifting,
start a fresh chat and paste in `CLAUDE.md` plus the current file.

**"It looks nothing like my other tools."**
Paste your `:root` token block into the request and say "use these variables, don't
introduce new colours". Then put the block in `CLAUDE.md` so it's automatic.

**"It confidently told me something wrong about the syllabus."**
It will. Outcome codes, stage boundaries and the exact wording of content
descriptors are the most reliably wrong things it produces. Look them up yourself.
Leave a code blank rather than guess.

**"I've made forty tools and can't find anything."**
That's the folder convention doing its job, or not. `<section>/<stage>/<topic>/<name>/`,
lowercase, hyphens, every time — including when you have three tools and it feels
like overkill.

**"Should we all use one shared repository?"**
No. One each. Merging is a whole separate skill and it is not what today is about.
Swap files or copy each other's folders.

---

## Part 5 — What to do in week two

1. **Use the thing in a lesson.** Before building anything else. The list of what to
   fix writes itself, and it will not match what you predicted.
2. **Update `CLAUDE.md` section 5** with what you decided and why. Future-you has
   forgotten already.
3. **Build the second tool.** It'll take a third of the time.
4. **Only then** think about putting it online — see `DEPLOY.md`.

---

## The honest summary

The AI is very good at the part you find slow — typing correct syntax, laying things
out, remembering how print CSS works. It is not good at the part you're good at:
knowing that this particular representation is the one that makes it click for the
kid in the third row.

Keep hold of that half of the job. Delegate the other half aggressively.
