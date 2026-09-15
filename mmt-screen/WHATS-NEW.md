# MMT Screen — this update

## 1. The instructions panel is nothing but text

The gap above the first line was the formatting toolbar and the header holding
their space whether they were showing or not. They have moved out of the card
altogether: hover the card and they float **above** it as their own little
panel; move the mouse away and they go, leaving a card that is pure text.

They stay up while you are typing, even with the mouse elsewhere, so you never
lose the toolbar mid-sentence — they only drop away once you click off. A card
parked at the top of the screen has nowhere above it to put them, so the strip
flips underneath instead rather than sliding behind the blue header.

This is a general option in the host (`def.chromeAbove`), not a text-panel
special case, so any future widget with its own toolbar can ask for the same
treatment in one line.

## 2. The timer fills its card

At rest the clock zooms up to fill the card with a small white margin, and the
mode tabs, presets and transport controls collapse away — on a projector, from
the back of the room, that is the difference between readable and not.

Move the mouse over the card and it zooms back out with every control where it
was. The zoom is measured from the card, so it works at any size you drag it
to, and the clock never overflows.

## 3. Vertical alignment in the instructions panel

The text was always centred in its card. The toolbar now has a vertical
alignment dropdown beside the horizontal one — **Top**, **Middle**, **Bottom**.

Unlike horizontal alignment, which belongs to each paragraph, this one belongs
to the whole panel: there is no sensible meaning to aligning one paragraph to
the top of a column it shares with others. It is per-panel and it is saved, so
two instruction panels on the same screen can differ.

## 4. Screen borders

The Background button now opens two tabs: **Background** and **Border**. Eight
frames ship, most of them recolourable, all with a thickness slider. A screen
stores only the id, colour and thickness — about forty bytes — so a border can
never push a saved screen near Firestore's 1 MiB ceiling, and it syncs to your
account like everything else. Each screen keeps its own.

The frame is its own layer: above the background, below the widgets, and deaf
to the mouse. It frames the **board** rather than the monitor, so it starts
below the blue bar — and takes the whole screen once you hide the chrome (H) or
go fullscreen.

**Adding your own:** put the image in `mmt-screen/borders/` and add a line to
`FILES` in `borders.js`. See `borders/README.md` — the one number that needs
care is `slice`.

## 5. Photograph backgrounds

Backgrounds are no longer only gradients. Drop an image into
`mmt-screen/backgrounds/`, add a line to `PHOTOS` near the top of `app.js`, and
it appears in the picker. Each photo carries a light veil by default so white
widget cards still read against a busy picture, and the empty-state message
gets a panel of its own.

Ships with one: **Valley**.

See `backgrounds/README.md` for how to size an image before it goes in — the
short version is 1920×1080 WebP at quality 78.

## 6. Fixed: a screen with dealt groups could not be saved to your account

Firestore does not allow an array inside an array. The group maker stores its
dealt groups as exactly that — one array per table — so the moment you dealt
groups and pressed Save, the write was rejected on the laptop, before anything
left it. A screen that had never dealt groups saved perfectly, which made it
look like a rules problem or a quota. It was neither.

The widget list now travels as a single JSON string, so Firestore has no
opinion about its shape and no future widget can walk into the same wall.
Documents saved before this change still open.

Two things came out of the same look:

- **Borders now save with the screen.** They were added after the sync code was
  written and never wired into it, so a saved screen came back without its
  frame.
- **The error message told the wrong story.** Anything Firestore refused said
  "Could not reach the server", which sends you looking at rules and network
  for a bug in the data. A rejected shape now says so.

No change to the Firestore rules is needed.

## 7. The name picker and the group maker share your class lists

Save a class in either one and the other has it. The chips at the top of the
name picker's **Edit list** panel are the same saved classes the group maker
offers, and **Save class** in either puts a list where both can reach it.

The footer of the picker now shows which class is loaded, so you can see at a
glance whether it is picking from 8MA5 or from something you typed once.

Two details that matter in a lesson:

- **Switching class resets the pack.** Someone who had already had a turn in
  8MA5 does not stay used up when you change to 9MX2.
- **A one-off list stays a one-off.** *Use these names* applies a list to that
  widget only — a list of table numbers or topics has no business becoming a
  saved class. Only *Save class* creates one.

Saving or deleting a class shows up immediately in the other widget, even with
both panels open. Class lists still live in their own store on the computer
they were typed on, and are still never uploaded with a saved screen.

## 8. The Save button now says where things stand

It used to say nothing. You pressed Save, a toast appeared for two seconds, and
after that there was no way to tell whether what you were looking at had ever
reached your account — which is exactly how a save that was failing every time
went unnoticed for days.

Now the button itself carries the answer: **Saved** with a tick when the screen
matches the copy in your account, **Save** with an amber dot when it does not.
Hovering it says which, and why.

It only counts what actually travels — the name, background, border and
widgets — so a running timer does not make a saved screen look unsaved, and
neither does drawing on it (ink is never uploaded). And a refused save never
claims success.

## 9. Class lists follow you between computers

Sign in on another computer and your saved classes come down with you: 8MA5 and
9MX2 are in the group maker and the name picker on every machine you use, with
no re-typing.

They are stored as **one document per teacher**, keyed by your teacher code —
not copied into every screen you save. A class that exists only on the computer
in front of you is kept and pushed up rather than dropped, and if the same class
exists in both places the account's copy wins, so nothing is ever lost to two
machines disagreeing.

Signing out stops that computer pushing lists, which matters on a shared
classroom machine. With no account, or on a network that cannot reach Firestore,
class lists work exactly as they always did — on that computer.

**This needs a Firestore rules update.** A new `teacherLists` block is in
`firestore.golive.claims.rules`; paste the file into the Firebase Console before
this goes live, or saving a class will be refused.

## Files

| File | What changed |
| --- | --- |
| `app.js` | `chromeAbove` widget option (floating strip, `ctx.above`, `ctx.holdChrome()`, automatic flip); photo backgrounds; the border layer; auto-placement keeps widgets off the frame. |
| `index.html` | The floating strip, the frame layer, the Border tab and picker, the empty-state panel on a photo. |
| `widgets/text.js` | Asks for the strip and moves both toolbars into it; vertical alignment. |
| `widgets/timer.js` | Idle zoom, computed from the card's own size. |
| `screenPayload.js` | Widgets packed as one JSON string; a fingerprint for the Save state; a checker for shapes Firestore refuses. |
| `cloudSync.js` | Saves and restores the border; packs the widgets; names a rejected shape honestly; reads and writes the class lists document. |
| `borders.js` | **New.** The frame catalogue and the 9-slice maths. |
| `widgets/lists.js` | Draws the chooser both widgets use, tells them when a class changes, and syncs to the account when signed in. |
| `widgets/randomiser.js` | Picks from your saved classes; shows which one is loaded. |
| `widgets/group-maker.js` | Uses the shared chooser instead of its own copy. |
| `borders/` | **New.** Where border images go, with a README. |
| `backgrounds/` | **New.** Where photographs go, with a README. Contains `valley.webp`. |
