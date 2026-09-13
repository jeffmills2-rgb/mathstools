# Interactive Tools

Things you drive on the board in front of a class.

## The pattern

1. **`state`** — one plain object holding everything the picture depends on.
2. **`render()`** — draws the whole picture from `state`, from scratch, every time.
3. **Controls** — every control edits `state`, then calls `render()`. Nothing else.

Redrawing everything is slower in theory and much easier to reason about in
practice: you can never end up with a half-updated diagram.

See `stage-4/number/example-fraction-bar/index.html`.

## Rules for this section

- **Inline SVG for diagrams.** Not canvas, not images. Scales to any projector
  without blurring, and can use the same CSS variables as everything else.
- **Readable from the back of the room.** Test it at full screen from three metres
  away before you use it.
- **No text so small it needs squinting**, no colour distinctions that don't survive
  a washed-out projector.
- **Keyboard shortcuts help.** Arrow keys to nudge means you can adjust the display
  without turning your back on the class.
- **It has to work offline.** Assume the wifi drops in period 5.

## Folder convention

```
interactive-tools/<stage>/<topic>/<tool-name>/index.html
```

Lowercase, hyphens, no spaces.
