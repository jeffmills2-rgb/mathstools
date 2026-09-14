# MMT Screen

A classroom display board — timers, traffic lights, instructions, a name picker
and a drawing layer — in Mills Maths Tools styling. Live at `/mmt-screen/`.

Plain static files. No build step, no Firebase, no sign-in. It deploys with the
rest of the site.

## How it is put together

```
index.html          the shell: chrome, dock, popovers, all the CSS
app.js              THE HOST — placement, drag, resize, z-order, saving,
                    screens, backgrounds. Knows nothing about any widget.
widgets/index.js    THE REGISTRY — and the widget contract, documented in full
widgets/shared.js   fitUnit(), chime(), shuffle(), escapeHtml()
widgets/*.js        one file per widget
```

The split between the host and the widgets is the whole design. The host never
special-cases a widget type; a widget never reaches outside its own element.

## Adding a widget

1. Copy the closest existing widget in `widgets/`.
2. Give it a unique `type`, a `name`, a 24×24 `icon` and a `defaultSize`.
3. Import it in `widgets/index.js` and add it to the `ALL` array.

That is all. The dock button, the saving, the frame, the drag and the resize
all come for free.

**The one rule:** anything that should survive a reload goes through
`ctx.setState()`. The state object *is* the save file.

**The one judgement call:** save settings, not live values. The timer saves the
duration you set, not the seconds remaining — a countdown that comes back
mid-count after a reload is telling the class something untrue.

## The tool launcher

`widgets/launcher.js` has **no list of tools in it, and must never get one.**
It fetches the site's own `/index.html` and reads the resource cards out of it,
so every tool added to the homepage appears on the board automatically. The nav
is parsed too, for the destinations that have no card (Adventure, Resources by
Stage, the dashboards).

Results are ranked — title hits beat keyword hits — because the homepage's
keyword strings are generous enough that page order put *Length* above
*Circumference of a Circle* for the search "circumference".

## Sizing

Widgets scale from their own natural content size (`fitUnit(el, {nw, nh})`), so
dragging one bigger grows what is in it rather than the white space around it.

A widget can set `aspect` to lock its proportions, and `headOverlay` to float
its header instead of reserving a strip at the top. The traffic light uses both
— it is the shape of the light, at every size.

**If you add a widget:** measure the widest row in its layout and use that as
`nw`. Guessing it low is the one mistake that looks like a sizing bug later.
And anything contributing to that width — padding included — must scale with
`--u`, not sit in fixed rem.

## The text widget

Size stepper, bold/italic/underline, text colour, background colour and
alignment. **Size applies to whatever is highlighted**, or to the whole box when
nothing is.

The maths button opens a second bar: Greek, operators, relations, structures
(fractions, roots, powers, big operators with limits) and arrows. Anything from
it goes into an **equation box** — a bordered field with a maths font, italic
letters and upright digits, sitting on the mathematical axis.

Inside an equation:

| Key | Does |
| --- | --- |
| `Tab` / `Shift+Tab` | next / previous slot; past the last one, the end of the equation |
| `Esc` | leave the equation and carry on writing |

Maths is built from spans and borders, not a library — every part stays
editable, the saved state is still a string of HTML, and the board gains no
network dependency. Stored markup is sanitised when it loads. The mechanics and
the browser quirks behind them are documented at the top of
`widgets/mathfield.js`.

## Group maker

Save a class list, tick who is in today, choose how many groups, press the
button. Groups are dealt round-robin so sizes differ by at most one, and the
widget tells you what sizes you will get before you press.

The groups are **saved** — a reload brings back the same ones rather than
re-dealing and sending half the room to the wrong table.

Class lists live in their own store (`mmtScreen.lists.v1`), shared by every
screen, and are **not** uploaded when you save a screen to your account.

## Starters

43 built in — problems, "which one doesn't belong", true/false. Add your own
through **Add yours**: one per block, blank line between, answer on a line
starting `A:`.

The current problem and whether the answer is showing are both **saved**, so a
reload or a projector blink brings back the same question rather than wiping
out what half the class has already started writing.

## Saving

Everything lives in `localStorage` under `mmtScreen.v1`, on that computer, in
that browser. Screens do not follow you between machines. Writes are debounced
by 250 ms. The launcher keeps its catalogue separately under
`mmtScreen.catalogue.v1` — safe to delete, it refetches.

## Saving to a teacher account

Teachers who already have a code can press **Sign in**, then **Save**, and open
that screen on any computer. Same code as the Teacher Dashboard; no new login.

- Save is a **button**, not background sync. The local save fires on every drag
  frame — pointing that at Firestore would be hundreds of writes per widget.
- localStorage is still the authority. A saved screen is a copy; the board never
  waits on the network to paint, and it works fully signed out.
- **Drawing strokes are not uploaded.** A saved screen is the set-up; pen marks
  are this lesson's annotations. They are also the only part that can grow
  without limit — a well-drawn board measures 6.3 MB against Firestore's 1 MiB
  document ceiling.
- The name picker's class list *is* saved. That is a choice you make per screen.
- On a shared classroom machine, sign out — the session persists until you do.

`cloudSync.js` is imported dynamically inside a try/catch. If gstatic is blocked
or there is no network, the cloud buttons simply never appear and everything else
works as normal.

**This needs the Firestore `screens` rules block deployed** (see
`firestore.golive.claims.rules`). Until then Save fails with a message saying so.

## Keyboard

| Key | Does |
| --- | --- |
| `H` | hide / show the top bar and the dock |
| `F` | full screen |
| `Esc` | put the pen down, bring the bars back, close menus |

## Testing

```bash
cd "…/Mills Maths Tools"
python3 -m http.server 8000
# then open http://localhost:8000/mmt-screen/
```

The ES modules need a real server — opening `index.html` from the Finder will
fail on the imports.
