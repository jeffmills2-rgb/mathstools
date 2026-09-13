# Worksheet Creators

Generators that produce a printable page.

## The pattern

1. **Options panel** — teacher choices, on screen only (`class="no-print"`).
2. **`generate()`** — builds an array of `{prompt, answer}` objects, once.
3. **The sheet** — plain HTML laid out for A4, printed by the browser.

See `stage-3/number/example-times-tables/index.html`.

## Rules for this section

- **Generate once, render from the array.** Never regenerate at print time. If the
  questions are rebuilt when you click Print, the answer key stops matching the
  sheet the student is holding. This is the most common bug in AI-written worksheet
  tools.
- **Print rules first.** Write the `@media print` block before you polish the screen
  version, and press Ctrl/Cmd+P after every change. Otherwise you find out at the
  photocopier.
- **A seed, so you can reprint.** The example uses a four-character sheet code that
  reproduces the identical sheet. Worth having the first time a student loses theirs.
- **Answers on their own page**, and printable separately.
- **Check the maths by hand.** Twenty questions, marked yourself, before it goes near
  a photocopier.

## Print checklist

- [ ] Options panel and buttons don't print
- [ ] No question splits across a page break
- [ ] Answers start on a new page
- [ ] Sensible A4 margins, no content in the gutter
- [ ] Answer key matches the printed sheet exactly
- [ ] Prints in black and white legibly

## Folder convention

```
worksheet-creators/<stage>/<topic>/<creator-name>/index.html
```

Lowercase, hyphens, no spaces.
