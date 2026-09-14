/* ===========================================================================
   SCREEN BORDERS — a decorative frame around the whole board.

   THE SET IS FIXED, AND JEFF OWNS IT. Teachers choose from what is shipped;
   nobody uploads. That single decision removes the whole difficult half of
   this feature: a screen stores only an id (and a colour), about forty bytes,
   so a border costs nothing to keep, syncs to an account without a thought,
   can never push a saved screen past Firestore's 1 MiB ceiling, and can never
   put an image on the site that we do not have the rights to.

   There are two kinds of border in the set, and they work the same way to
   everything outside this file.

   DRAWN borders are SVG written below, in code. They stay razor-sharp on a
   projector at any size because there are no pixels in them, they weigh
   nothing, and they can be re-coloured on the fly — which is why they carry a
   tint swatch and the file ones do not.

   FILE borders are images dropped into `mmt-screen/borders/`. Add the file,
   add a line to FILES, and it appears in the picker. See the note there for
   the one number each image needs.

   ------------------------------------------------------------------------
   HOW A FRAME IMAGE BECOMES A FRAME: `border-image` and the 9-slice.

   The image is cut by four lines into nine pieces. The four CORNERS are placed
   in the corners at a fixed size. The four EDGE pieces are repeated (or
   stretched) along the sides. The middle is thrown away. That is what lets one
   square image frame a 16:9 projector without the corners going oval — which
   is exactly what happens if you just stretch a picture behind everything.

   The slice is a PERCENTAGE of the image, so it does not care what size the
   image file is: a frame a quarter of the way in is `slice: 25` whether the
   picture is 600px or 3000px across.
   =========================================================================== */

/* ---------------------------------------------------------------- the files */
/* IMAGES SHIPPED WITH THE SITE. Put the file in `mmt-screen/borders/`, then
   add a line here:

     { id:'gum-leaves', name:'Gum leaves', file:'gum-leaves.png', slice:24, width:54 }

   `slice` is the only one that needs thought: how far in from the edge, as a
   percentage of the image, the decorated frame reaches — the line where the
   corner piece ends and the repeating edge piece begins. On an image whose
   frame is 150px thick on a 600px square, that is 25. Get it wrong and the
   corners look cut off or duplicated; there is no way to work it out from the
   file, which is why it is written down beside it.

   `width` is how thick the frame is drawn ON SCREEN by default, in pixels.
   The teacher can change that with the thickness slider; this is the starting
   point that looks right.

   `repeat` is optional: 'round' (the default) scales the edge tiles so a whole
   number of them fits, which suits a repeating motif. 'stretch' suits a frame
   whose edges are a plain band or a gradient.

   The image needs a TRANSPARENT MIDDLE — PNG or WebP. The middle is discarded
   by the slice, so a JPEG works too, but only if its frame goes right to the
   edge of the picture. */
const FILES = [
  /* (none yet — Jeff's images go here) */
];

/* ----------------------------------------------------------- the drawn ones */
/* Every one draws into a 300×300 box, sliced into nine 100×100 pieces, so the
   slice is always a third. Keeping that uniform means the thickness slider
   behaves identically whichever border is chosen.

   A MOTIF BELONGS TO ONE TILE AND MUST NOT CROSS INTO THE NEXT. The cuts fall
   at 100 and 200; anything drawn across one of those lines is sliced in half,
   and the two halves then land in different places on screen. So the pattern
   along the top is exactly three motifs — one in each of the corner, edge and
   corner pieces, at x = 46, 150, 254. The middle one is the piece that gets
   repeated along the whole edge, which is why three motifs in the image
   becomes a row of them across a projector.

   AND A MOTIF SHOULD FILL ITS BAND. The first version drew everything on a
   thin line inside the 100-wide band, so four-fifths of the frame's thickness
   was empty and the whole thing read as a dotted hairline however thick the
   slider was pushed. Motifs now span roughly 20–75 of the 100, which is what
   makes them legible from the back of a classroom. */

const svg = body =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">${body}</svg>`;

/* One motif per tile, all the way round: the four corners and the middle of
   each side. `draw(x, y, rotation)` gets the rotation the motif needs to face
   inward, for the designs that care. */
const RING = 46, STEP = 104;          /* 46, 150, 254 — see the note above */
function perimeter(draw){
  const out = [];
  const a = RING, b = 300 - RING;
  for(let x = a; x <= b; x += STEP){ out.push(draw(x, a, 0)); out.push(draw(x, b, 180)); }
  out.push(draw(a, 150, 270)); out.push(draw(b, 150, 90));
  return out.join('');
}
/* The faint line the motifs are threaded on. Drawn through their centres, so
   it never crosses a slice line at an awkward angle. */
const thread = (c, w = 5, o = 0.3) =>
  `<rect x="${RING}" y="${RING}" width="${300 - RING * 2}" height="${300 - RING * 2}"` +
  ` fill="none" stroke="${c}" stroke-width="${w}" opacity="${o}"/>`;

const DRAWN = [
  {
    id: 'rule', name: 'Double rule', tintable: true, width: 40,
    draw: c => svg(
      `<rect x="18" y="18" width="264" height="264" rx="14" fill="none" stroke="${c}" stroke-width="24"/>` +
      `<rect x="64" y="64" width="172" height="172" rx="8" fill="none" stroke="${c}" stroke-width="9" opacity=".6"/>`
    ),
  },
  {
    id: 'dots', name: 'Dots', tintable: true, width: 46,
    draw: c => svg(
      thread(c) +
      perimeter((x, y) => `<circle cx="${x}" cy="${y}" r="24" fill="${c}"/>`)
    ),
  },
  {
    id: 'squares', name: 'Squares', tintable: true, width: 46,
    draw: c => svg(
      thread(c) +
      perimeter((x, y) =>
        `<rect x="${x - 21}" y="${y - 21}" width="42" height="42" rx="6" fill="${c}"` +
        ` transform="rotate(45 ${x} ${y})"/>`)
    ),
  },
  {
    id: 'stars', name: 'Stars', tintable: true, width: 50,
    draw: c => {
      const star = (x, y, r) => {
        const pts = [];
        for(let i = 0; i < 10; i++){
          const a = (Math.PI / 5) * i - Math.PI / 2;
          const rad = i % 2 ? r * 0.45 : r;
          pts.push((x + Math.cos(a) * rad).toFixed(1) + ',' + (y + Math.sin(a) * rad).toFixed(1));
        }
        return `<polygon points="${pts.join(' ')}" fill="${c}"/>`;
      };
      return svg(thread(c, 4, 0.25) + perimeter((x, y) => star(x, y, 30)));
    },
  },
  {
    id: 'waves', name: 'Waves', tintable: true, width: 44,
    draw: c => {
      /* One full period per 100-unit tile, so the cut at 100 lands exactly
         where the curve crosses the centre line going the same way. */
      const s = `fill="none" stroke="${c}" stroke-width="15" stroke-linecap="round"`;
      const h = Array.from({ length: 3 }, () => 'q 25 -34 50 0 q 25 34 50 0').join(' ');
      const v = Array.from({ length: 3 }, () => 'q -34 25 0 50 q 34 25 0 50').join(' ');
      return svg(
        `<path d="M0 ${RING} ${h}" ${s}/>` +
        `<path d="M0 ${300 - RING} ${h}" ${s}/>` +
        `<path d="M${RING} 0 ${v}" ${s}/>` +
        `<path d="M${300 - RING} 0 ${v}" ${s}/>`
      );
    },
  },
  {
    id: 'notebook', name: 'Notebook', tintable: false, width: 54,
    draw: () => svg(
      `<rect x="0" y="0" width="300" height="300" fill="#fdf8ea"/>` +
      `<rect x="78" y="78" width="144" height="144" fill="#ffffff"/>` +
      `<rect x="10" y="10" width="280" height="280" fill="none" stroke="#ddd3b6" stroke-width="4"/>` +
      `<rect x="78" y="78" width="144" height="144" fill="none" stroke="#e8746a" stroke-width="6" opacity=".75"/>` +
      /* ruled lines running the length of each side, inside the band */
      [30, 48, 66].map(i =>
        `<rect x="0" y="${i}" width="300" height="3" fill="#c4d6ee" opacity=".85"/>` +
        `<rect x="0" y="${300 - i - 3}" width="300" height="3" fill="#c4d6ee" opacity=".85"/>` +
        `<rect x="${i}" y="0" width="3" height="300" fill="#c4d6ee" opacity=".85"/>` +
        `<rect x="${300 - i - 3}" y="0" width="3" height="300" fill="#c4d6ee" opacity=".85"/>`
      ).join('')
    ),
  },
  {
    id: 'chalk', name: 'Chalk', tintable: false, width: 52,
    draw: () => svg(
      `<rect x="0" y="0" width="300" height="300" fill="#22384a"/>` +
      `<rect x="72" y="72" width="156" height="156" fill="#1b2d3c"/>` +
      `<rect x="22" y="22" width="256" height="256" rx="8" fill="none" stroke="#f2f6f4" stroke-width="11"` +
        ` stroke-linecap="round" stroke-dasharray="52 9 24 7 68 11" opacity=".85"/>` +
      `<rect x="58" y="58" width="184" height="184" rx="5" fill="none" stroke="#f2f6f4" stroke-width="5"` +
        ` stroke-dasharray="18 13 36 9" opacity=".45"/>`
    ),
  },
  {
    id: 'tape', name: 'Corners', tintable: true, width: 56,
    draw: c => svg(
      `<rect x="50" y="50" width="200" height="200" fill="none" stroke="${c}" stroke-width="9" opacity=".5"/>` +
      /* Corners only: the edge tiles are the bare rule above, so nothing in
         the repeating pieces has a motif in it and nothing can seam.
         EACH STRIP MUST STAY INSIDE ITS OWN 100×100 CORNER PIECE. Drawn any
         longer, the overhang is clipped at the slice line and the tape reads
         as a stub — which is exactly what the first version did. */
      [[50,50,-45],[250,50,45],[50,250,45],[250,250,-45]].map(([x,y,r]) =>
        `<g transform="rotate(${r} ${x} ${y})">` +
          `<rect x="${x-34}" y="${y-22}" width="68" height="44" fill="${c}" opacity=".26"/>` +
          `<rect x="${x-34}" y="${y-22}" width="68" height="44" fill="none" stroke="${c}" stroke-width="4" opacity=".6"/>` +
        `</g>`).join('')
    ),
  },
];

/* ------------------------------------------------------------ the whole set */
/* One list, so the picker and everything downstream never has to care which
   kind a border is. */
export const BORDERS = [
  ...DRAWN.map(b => ({ ...b, kind: 'drawn', repeat: 'round' })),
  ...FILES.map(b => ({
    kind: 'file', tintable: false, repeat: 'round', width: 48, slice: 25, ...b,
    url: 'borders/' + b.file,
  })),
];

export const TINTS = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a', '#e11d48', '#16a34a'];

export function borderDef(id){ return BORDERS.find(b => b.id === id) || null; }

/* An SVG goes into CSS as a data URL. encodeURIComponent rather than base64:
   it is smaller for text, and it keeps the markup readable in devtools. */
export function borderUrl(id, tint){
  const def = borderDef(id);
  if(!def) return null;
  if(def.kind === 'file') return def.url;
  return 'data:image/svg+xml,' + encodeURIComponent(def.draw(def.tintable ? (tint || TINTS[0]) : null));
}

/* ------------------------------------------------ what a screen stores ----- */
/* null                          no border
   { id, tint, width, repeat }   about forty bytes, whichever kind it is       */

export function normaliseBorder(b){
  if(!b || typeof b !== 'object') return null;
  const def = borderDef(b.id);
  if(!def) return null;                       /* a border we no longer ship */
  return {
    id: def.id,
    tint: def.tintable ? (TINTS.includes(b.tint) ? b.tint : TINTS[0]) : null,
    width: clampNum(b.width, 8, 160, def.width),
    repeat: b.repeat === 'stretch' ? 'stretch' : (b.repeat === 'repeat' ? 'repeat' : def.repeat || 'round'),
  };
}
function clampNum(v, lo, hi, fallback){
  const n = Number(v);
  if(!isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

/* The CSS for the frame element. Returned as a plain object so it can be
   checked in a test without a browser. */
export function frameStyle(border){
  const b = normaliseBorder(border);
  if(!b) return null;
  const def = borderDef(b.id);
  const url = borderUrl(b.id, b.tint);
  if(!url) return null;
  const slice = def.kind === 'file' ? def.slice + '%' : '33.333%';
  /* No `fill` keyword — the middle slice is discarded, which is what leaves
     the board (and the background behind it) showing through the frame. */
  return {
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: b.width + 'px',
    borderImageSource: `url("${url}")`,
    borderImageSlice: slice,
    borderImageWidth: '1',
    borderImageRepeat: b.repeat,
    borderImageOutset: '0',
  };
}

/* How far in from each edge the frame reaches, so widgets can be kept off it.
   The thickness, and nothing else — the frame does not bleed outward. */
export function frameInset(border){
  const b = normaliseBorder(border);
  return b ? b.width : 0;
}
