# Background photographs

Drop an image in here, then add one line to `PHOTOS` near the top of
`../app.js`:

```js
{ id:'valley', name:'Valley', file:'valley.webp' }
```

Optional on each line:

- **`scrim`** — a white veil over the picture, `0` to `1`. Widgets are white
  cards, and a busy photograph under them makes every edge fight for attention;
  a light wash settles it without washing the picture out. `0.22` is the
  default. Set `0` for a photo that is already pale.
- **`dark`** — `true` for a photo dark enough that the board's own text needs
  to go light.

## Size them before they go in

The board loads the file on every visit, and it ends up mostly behind widgets,
so there is nothing to gain from shipping the original.

**Target: 1920×1080 WebP at quality 78** — sharp on any classroom projector,
and a few hundred kilobytes.

```bash
# needs: pip install pillow
python3 - <<'EOF'
from PIL import Image
src, out = 'original.jpg', 'valley.webp'
im = Image.open(src)
w = 1920; h = round(im.size[1] * w / im.size[0])
im.resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=78, method=6)
EOF
```

For reference, the drone shot that became `valley.webp` was 3840×2160 JPEG at
1.6 MB. The same picture at 1920×1080 WebP q78 is 386 KB — a quarter of the
size, and indistinguishable on a projector.

Dense foliage compresses badly, so a landscape like that one will always be
larger than a photo with big flat areas of sky or water. If something lands
over about 600 KB, drop the quality to 72 before dropping the dimensions —
the detail is behind widgets either way.
