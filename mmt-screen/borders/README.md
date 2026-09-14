# Border images

Drop a frame image in here, then add one line to `FILES` in `../borders.js`:

```js
{ id:'gum-leaves', name:'Gum leaves', file:'gum-leaves.png', slice:24, width:54 }
```

- **`slice`** — how far in from the edge the decorated frame reaches, as a
  percentage of the image. On a 600×600 picture whose frame is 150px thick,
  that is `25`. This is the one number that cannot be worked out from the file,
  and getting it wrong is what makes corners look cut off or doubled.
- **`width`** — how thick the frame is drawn on screen by default, in pixels.
  The teacher can change it with the thickness slider.
- **`repeat`** — optional. `round` (default) scales the repeating edge pieces
  so a whole number fits, which suits a motif. `stretch` suits a plain band or
  a gradient.

The middle of the image is thrown away, so the picture only ever needs to be
right around its edges. **PNG or WebP with a transparent middle** is the format
to aim for. A square image is easiest to reason about but not required.
