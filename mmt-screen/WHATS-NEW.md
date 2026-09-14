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

## Files

| File | What changed |
| --- | --- |
| `app.js` | `chromeAbove` widget option (floating strip, `ctx.above`, `ctx.holdChrome()`, automatic flip); photo backgrounds; the border layer; auto-placement keeps widgets off the frame. |
| `index.html` | The floating strip, the frame layer, the Border tab and picker, the empty-state panel on a photo. |
| `widgets/text.js` | Asks for the strip and moves both toolbars into it; vertical alignment. |
| `widgets/timer.js` | Idle zoom, computed from the card's own size. |
| `borders.js` | **New.** The frame catalogue and the 9-slice maths. |
| `borders/` | **New.** Where border images go, with a README. |
| `backgrounds/` | **New.** Where photographs go, with a README. Contains `valley.webp`. |
