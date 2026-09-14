/* =========================================================== Text widget
   The instructions box: what the class should be doing, with enough
   formatting to write maths on the board.

   WHY execCommand, WHICH IS DEPRECATED. Bold, italic, underline, alignment
   and text colour inside a contenteditable are exactly what it does, it is
   supported in every browser this will ever meet, and the alternative is
   hand-rolling Range surgery over a selection — several hundred lines that
   would be wrong in ways nobody notices until a teacher loses a sentence
   mid-lesson. Nothing replaces it; the Editing Context API that is meant to
   is not shipping anywhere yet. When it does, this is the one file to change.

   MATHS IS HTML, NOT AN IMAGE AND NOT A LIBRARY. A fraction is two spans and
   a border; a power is <sup>; a big operator with limits is a three-row
   stack. That keeps everything the teacher types EDITABLE — click into the
   numerator and change it — and it keeps the widget's saved state what it
   already was, a string of HTML, so nothing about saving or syncing changes.
   Pulling in MathLive or KaTeX would mean a network dependency on a board
   that has to work when the school wifi does not.

   THE STORED HTML IS SANITISED ON THE WAY IN. It is the teacher's own text on
   their own machine, but it is also the one field on this board that round
   trips through a database as markup, so scripts, event handlers and
   javascript: URLs are stripped when it is loaded. Cheap, and it means the
   answer to "what if a screen document were tampered with" is "nothing".
   ======================================================================= */

import { EQ_CSS, STRUCTS, mathify, eqBoxAt, insertMaths, leaveBox, guardSlotDelete, stepSlot, arrowStep } from './mathfield.js';

const TONES = [
  { id:'plain',  name:'White',  bg:'#ffffff', ink:'#0f172a', edge:'#e2e8f0' },
  { id:'blue',   name:'Blue',   bg:'#dbeafe', ink:'#1e3a8a', edge:'#bfdbfe' },
  { id:'green',  name:'Green',  bg:'#dcfce7', ink:'#14532d', edge:'#bbf7d0' },
  { id:'amber',  name:'Amber',  bg:'#fef3c7', ink:'#78350f', edge:'#fde68a' },
  { id:'purple', name:'Purple', bg:'#ede9fe', ink:'#4c1d95', edge:'#ddd6fe' },
  { id:'teal',   name:'Teal',   bg:'#ccfbf1', ink:'#134e4a', edge:'#99f6e4' },
  { id:'pink',   name:'Pink',   bg:'#fce7f3', ink:'#831843', edge:'#fbcfe8' },
  { id:'dark',   name:'Dark',   bg:'#0f172a', ink:'#f8fafc', edge:'#1e293b' },
];

const INKS = [
  '#0f172a','#475569','#94a3b8','#ffffff',
  '#dc2626','#ea580c','#ca8a04','#16a34a',
  '#0d9488','#2563eb','#7c3aed','#db2777',
];

/* ------------------------------------------------------- equation groups */
const GREEK = 'α β γ δ ϵ ε ζ η θ ϑ ι κ λ μ ν ξ π ϖ ρ ϱ σ ς τ υ ϕ φ χ ψ ω Γ Δ Θ Λ Ξ Π Σ Υ Φ Ψ Ω'.split(' ');
const OPS   = '× ÷ · ± ∓ ∗ ⋆ ∘ • ⊕ ⊖ ⊘ ⊗ ⊙ † ‡ ∨ ∧ ∩ ∪ ℵ ℜ ℑ ⊤ ⊥ ∞ ∂ ∀ ∃ ¬ △ ◇'.split(' ');
const RELS  = '≤ ≥ ≺ ≻ ⪯ ⪰ ≪ ≫ ≡ ∼ ≃ ≍ ≈ ≠ ⊂ ⊃ ⊆ ⊇ ∈ ∋ ∉'.split(' ');
const ARROWS= '← ↑ → ↓ ↔ ↕ ⇐ ⇑ ⇒ ⇓ ⇔ ↦ ⟶ ∴ ∵ ∝ ∠ ° ′ ″ ∥ √ π'.split(' ');

const EQ_GROUPS = [
  { id:'greek',  label:'αβΔ',   cols:6, items: GREEK.map(c => ({ text:c })) },
  { id:'ops',    label:'×÷∃',   cols:6, items: OPS.map(c => ({ text:c })) },
  { id:'rels',   label:'&lt;≠⊃', cols:6, items: RELS.map(c => ({ text:c })) },
  { id:'struct', label:'√()x',  cols:6, items: STRUCTS },
  { id:'arrows', label:'←↑⇒',   cols:6, items: ARROWS.map(c => ({ text:c })) },
];

/* ------------------------------------------------------------------- icons */
const I = {
  bold:   '<svg viewBox="0 0 24 24"><path d="M7 4h6.2a4.3 4.3 0 0 1 2.9 7.5A4.6 4.6 0 0 1 14 20H7V4Zm3 2.6v4h3a2 2 0 1 0 0-4h-3Zm0 6.6v4.2h3.7a2.1 2.1 0 0 0 0-4.2H10Z"/></svg>',
  italic: '<svg viewBox="0 0 24 24"><path d="M10 4h8v2.4h-2.8l-3.1 11.2H15V20H7v-2.4h2.8l3.1-11.2H10V4Z"/></svg>',
  under:  '<svg viewBox="0 0 24 24"><path d="M7 3v7.5a5 5 0 0 0 10 0V3h-2.5v7.5a2.5 2.5 0 0 1-5 0V3H7Zm-1 16h12v2H6v-2Z"/></svg>',
  left:   '<svg viewBox="0 0 24 24"><path d="M3 4h18v2.3H3V4Zm0 4.8h12V11H3V8.8ZM3 13.6h18v2.3H3v-2.3Zm0 4.8h12v2.3H3v-2.3Z"/></svg>',
  centre: '<svg viewBox="0 0 24 24"><path d="M3 4h18v2.3H3V4Zm3 4.8h12V11H6V8.8ZM3 13.6h18v2.3H3v-2.3Zm3 4.8h12v2.3H6v-2.3Z"/></svg>',
  right:  '<svg viewBox="0 0 24 24"><path d="M3 4h18v2.3H3V4Zm6 4.8h12V11H9V8.8ZM3 13.6h18v2.3H3v-2.3Zm6 4.8h12v2.3H9v-2.3Z"/></svg>',
  fill:   '<svg viewBox="0 0 24 24"><path d="M9.4 2 8 3.4l2.1 2.1-6 6a2 2 0 0 0 0 2.8l4.8 4.8a2 2 0 0 0 2.8 0l6.1-6.1a2 2 0 0 0 0-2.8L9.4 2Zm2.1 5.1 5.1 5.1H6.4l5.1-5.1ZM19.5 15s-2 2.4-2 3.8a2 2 0 1 0 4 0c0-1.4-2-3.8-2-3.8Z"/></svg>',
  /* Vertical alignment: a bar showing which edge the text is pinned to, with
     the lines of text beneath, above, or either side of it. */
  vtop:   '<svg viewBox="0 0 24 24"><path d="M3 3h18v2.4H3V3Zm2 5h14v2.3H5V8Zm3 4.8h8V15H8v-2.2Z"/></svg>',
  vmid:   '<svg viewBox="0 0 24 24"><path d="M5 4h14v2.3H5V4Zm-2 6.8h18v2.4H3v-2.4ZM5 17.7h14V20H5v-2.3Z"/></svg>',
  vbot:   '<svg viewBox="0 0 24 24"><path d="M8 9h8v2.2H8V9Zm-3 4.7h14V16H5v-2.3ZM3 18.6h18V21H3v-2.4Z"/></svg>',
  caret:  '<svg viewBox="0 0 24 24" class="cx"><path d="M7 10h10l-5 6-5-6Z"/></svg>',
};

const css = EQ_CSS + `
.tx{ height:100%; display:flex; flex-direction:column; }

/* The toolbars sit in the card's floating strip, styled as their own panel. */
.tx-bars{
  border:1px solid var(--line); border-radius:12px;
  background:var(--surface); box-shadow:var(--shadow-md); overflow:hidden;
}
.tx-bar, .tx-eqbar{
  display:flex; align-items:center; gap:2px;
  padding:.3rem .4rem; background:var(--surface);
  overflow-x:auto; scrollbar-width:none;
}
.tx-eqbar{ border-top:1px solid var(--line); background:var(--surface-soft); }
.tx-bar::-webkit-scrollbar, .tx-eqbar::-webkit-scrollbar{ display:none; }
.tx-eqbar{ display:none; }
.tx-bars.eq .tx-eqbar{ display:flex; }

.tx-btn{
  display:inline-flex; align-items:center; gap:1px; flex:none;
  height:26px; min-width:26px; padding:0 .3rem;
  border:0; background:none; border-radius:6px; cursor:pointer;
  color:var(--muted); font-size:.78rem; font-weight:700;
}
.tx-btn:hover{ background:var(--line); color:var(--ink); }
.tx-btn.on{ background:var(--brand-soft); color:var(--brand); }
.tx-btn svg{ width:15px; height:15px; fill:currentColor; }
.tx-btn svg.cx{ width:11px; height:11px; margin-left:-2px; opacity:.7; }
.tx-sep{ width:1px; height:18px; background:var(--line-strong); margin:0 .25rem; flex:none; }

.tx-size{ display:inline-flex; align-items:center; gap:1px; flex:none; }
.tx-size input{
  width:34px; height:22px; text-align:center; font-size:.76rem; font-weight:650;
  border:1px solid var(--line-strong); border-radius:6px; background:#fff; padding:0;
}
.tx-ink{ display:flex; flex-direction:column; align-items:center; line-height:1; }
.tx-ink b{ font-size:.8rem; }
.tx-ink i{ display:block; width:13px; height:3px; border-radius:2px; margin-top:1px; }
.tx-swatch{ width:14px; height:14px; border-radius:4px; box-shadow:inset 0 0 0 1px rgba(15,23,42,.2); }

/* THE EDITABLE AREA IS A PLAIN BLOCK, AND THE CENTRING IS DONE BY A WRAPPER
   AROUND IT. Making .tx-body itself a grid (or a flex column) to centre the
   text vertically turns every element child into a grid item stretched to the
   full width — so an inserted fraction drew its dividing bar right across the
   box and forced a line break after itself. The wrapper centres; the editable
   block stays a block and inline maths stays inline.

   THE BASE WEIGHT MUST NOT ALREADY BE BOLD. It was 650, which looks punchy and
   completely broke the Bold button: the browser judges "is this bold?" from the
   computed weight, decided 650 already was, and so the first press UN-bolded the
   selection to font-weight:normal. 500 still reads weighty on a projector. */
.tx-mid{
  flex:1; min-height:0; overflow:auto; cursor:text; border-radius:var(--radius-sm);
  padding:calc(var(--txp,14) * 1px);
  display:flex; flex-direction:column; justify-content:var(--txv,center);
}
.tx-body{
  font-size:calc(var(--txs,26) * 1px); font-weight:500; line-height:1.34;
  letter-spacing:-.02em; outline:none; min-height:1em;
}
.tx-body:empty::before{ content:attr(data-placeholder); color:#94a3b8; font-weight:550; }

/* The maths-symbols BUTTON draws a fraction as its icon, and it is not inside
   .tx-body, so it missed the rules below and rendered as a flat "ab". */
.tx-bar .mf, .tx-menu .cell .mf{ display:inline-flex; flex-direction:column; line-height:1.05; text-align:center; }
.tx-bar .mf-n{ border-bottom:1px solid currentColor; padding:0 .18em; }
.tx-bar .mf-d{ padding:0 .18em; }

/* ---- dropdowns, fixed so they escape the widget's overflow -------------- */
.tx-menu{
  position:fixed; z-index:9600;
  background:var(--surface); border:1px solid var(--line);
  border-radius:14px; box-shadow:var(--shadow-lg); padding:.5rem;
}
.tx-menu .grid{ display:grid; gap:2px; }
.tx-menu .cell{
  min-width:32px; min-height:40px; display:grid; place-items:center;
  border:0; background:none; border-radius:7px; cursor:pointer;
  font-size:1rem; color:var(--ink); padding:.2rem .25rem; line-height:1.1;
}
.tx-menu .cell:hover{ background:var(--brand-soft); }
.tx-menu .cell .mf{ display:inline-flex; flex-direction:column; text-align:center; font-size:.78rem; }
.tx-menu .cell .mf-n{ border-bottom:1px solid currentColor; padding:0 .2em; }
.tx-menu .cell .mop{ display:inline-flex; flex-direction:column; align-items:center; line-height:1; }
.tx-menu .cell .mop-t, .tx-menu .cell .mop-b{ font-size:.5rem; line-height:1; }
.tx-menu .cell .mop-s{ font-size:1.05rem; line-height:1; }
.tx-menu .cell .msq{ display:inline-flex; }
.tx-menu .cell .msq-c{ border-top:1px solid currentColor; padding:0 .15em; }
.tx-menu .cell .mroot{ display:inline-flex; align-items:flex-start; }
.tx-menu .cell .mroot-i{ font-size:.55em; margin-right:-.3em; }
.tx-menu .ink{ width:26px; height:26px; border-radius:7px; border:1px solid rgba(15,23,42,.15); cursor:pointer; }
.tx-menu .ink.on{ box-shadow:0 0 0 2px var(--brand-2); }
.tx-menu .row{
  display:flex; align-items:center; gap:.5rem; width:100%; padding:.4rem .5rem;
  border:0; background:none; border-radius:8px; cursor:pointer; font-size:.85rem; text-align:left;
}
.tx-menu .row:hover{ background:var(--surface-soft); }
.tx-menu .row.on{ background:var(--brand-soft); color:var(--brand); font-weight:650; }
.tx-menu .row.on svg{ fill:var(--brand); }
.tx-menu .row svg{ width:15px; height:15px; fill:var(--muted); }
`;

/* Strip anything executable out of stored markup before it goes on screen. */
function sanitise(html){
  const box = document.createElement('div');
  box.innerHTML = String(html || '');
  box.querySelectorAll('script,style,iframe,object,embed,link,meta').forEach(n => n.remove());
  box.querySelectorAll('*').forEach(n => {
    [...n.attributes].forEach(a => {
      const name = a.name.toLowerCase();
      if(name.startsWith('on')) n.removeAttribute(a.name);
      if((name === 'href' || name === 'src') && /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
    });
  });
  return box.innerHTML;
}

let openMenuEl = null;
function closeMenu(){ if(openMenuEl){ openMenuEl.remove(); openMenuEl = null; } }
document.addEventListener('pointerdown', e => {
  if(openMenuEl && !e.target.closest('.tx-menu') && !e.target.closest('.tx-btn')) closeMenu();
}, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });

function showMenu(anchor, build){
  const wasMine = openMenuEl && openMenuEl.dataset.for === anchor.dataset.menu;
  closeMenu();
  if(wasMine) return;
  const m = document.createElement('div');
  m.className = 'tx-menu';
  m.dataset.for = anchor.dataset.menu || '';
  build(m);
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
  m.style.top = (r.bottom + 6 + h > window.innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px';
  openMenuEl = m;
}

export default {
  type:'text',
  name:'Instructions',
  blurb:'A box of text in large type, with formatting and maths.',
  icon:'<svg viewBox="0 0 24 24"><path d="M4 4h16v3h-6v13h-4V7H4V4Z"/></svg>',
  css,
  defaultSize:{ w:560, h:300 },
  minSize:{ w:260, h:160 },
  chromeAbove:true,

  initialState: () => ({ text:'', tone:'plain', size:26, ink:'#0f172a', eq:false, valign:'middle' }),

  render(el, ctx){
    const st = ctx.state;
    if(!st.ink) st.ink = '#0f172a';

    el.innerHTML = `
      <div class="tx">
        <div class="tx-mid">
          <div class="tx-body" contenteditable="true" spellcheck="false"
               data-placeholder="Type the instructions for the class…"></div>
        </div>
      </div>`;

    /* The two toolbars live in the strip above the card, so the panel itself
       is nothing but the text — no reserved band at the top waiting for a
       hover that has not happened. */
    const bars = document.createElement('div');
    bars.className = 'tx-bars';
    bars.innerHTML = `<div class="tx-bar"></div><div class="tx-eqbar"></div>`;
    (ctx.above || el.querySelector('.tx')).appendChild(bars);

    const root = el.querySelector('.tx');
    const bar  = bars.querySelector('.tx-bar');
    const eqbar= bars.querySelector('.tx-eqbar');
    const mid  = el.querySelector('.tx-mid');
    const body = el.querySelector('.tx-body');

    /* Clicking the padding around the text should put the caret in it, the
       way clicking the margin of any document does. */
    mid.addEventListener('mousedown', e => {
      if(e.target === mid){
        e.preventDefault();
        body.focus();
        const r = document.createRange();
        r.selectNodeContents(body); r.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(r);
      }
    });

    body.innerHTML = sanitise(st.text || '');
    /* SIZING THE FIRST WORDS IN THE BOX LEAVES A BLANK LINE ABOVE THEM.
       Chrome materialises the pending style as a placeholder block —
       <div><span style="font-size:64px"><br></span></div> — at the top of the
       editable, and it does it a moment AFTER the command returns, so checking
       for it inline (which is what the first attempt did) is too early to see
       it. Checking on every commit catches it whenever it shows up.

       The `sized span` test is what makes this safe: a blank line the teacher
       typed with Enter is <div><br></div> with no styling inside, so it is
       left exactly where they put it. */
    function dropPhantomLine(){
      const first = body.firstChild;
      if(!first || first.nodeType !== 1) return false;
      if(first.textContent !== '') return false;
      if(!first.querySelector('br')) return false;
      if(!first.querySelector('span[style*="font-size"]')) return false;
      first.remove();
      return true;
    }

    const commit = () => {
      dropPhantomLine();
      ctx.setState({ text: body.innerHTML });
    };

    /* CSS styling rather than <font> tags, so colour comes back as inline
       style and survives the sanitiser above. */
    try{ document.execCommand('styleWithCSS', false, true); }catch(_){}

    function cmd(name, value){
      body.focus();
      try{ document.execCommand(name, false, value === undefined ? null : value); }
      catch(err){ console.warn('[MMT Screen] formatting command failed', name, err); }
      commit(); paintStates();
    }

    /* Where the caret was before the toolbar was touched. Buttons cancel their
       own mousedown so focus should never leave, but a menu that opens over
       the text can still lose it, and silently inserting at the wrong place
       is worse than any amount of defensiveness here. */
    let lastRange = null;
    function saveRange(){
      const sel = window.getSelection();
      if(sel.rangeCount && body.contains(sel.anchorNode)) lastRange = sel.getRangeAt(0).cloneRange();
    }

    /* All maths goes through mathfield.js, which puts it in an equation box
       (making one if the caret is not already inside one) and re-italicises
       the letters around it. Plain prose still uses execCommand. */
    function insertMathItem(item){
      const box = insertMaths(body, item);
      saveRange();
      commit();
      return box;
    }

    /* ------------------------------------------------------- toolbar bits */
    function btn(html, title, onClick, opts = {}){
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tx-btn' + (opts.cls ? ' ' + opts.cls : '');
      b.title = title;
      b.setAttribute('aria-label', title);
      b.innerHTML = html;
      if(opts.menu) b.dataset.menu = opts.menu;
      /* Keep the selection: a toolbar press must not blur the text first. */
      b.addEventListener('mousedown', e => e.preventDefault());
      b.addEventListener('click', onClick);
      return b;
    }
    const sep = () => { const d = document.createElement('span'); d.className = 'tx-sep'; return d; };

    /* size stepper */
    const sizeWrap = document.createElement('span');
    sizeWrap.className = 'tx-size';
    const minus = btn('&minus;', 'Smaller', () => setSize(shownSize() - 2));
    const sizeIn = document.createElement('input');
    sizeIn.type = 'text'; sizeIn.inputMode = 'numeric'; sizeIn.setAttribute('aria-label', 'Font size');
    const plus = btn('+', 'Bigger', () => setSize(shownSize() + 2));
    sizeIn.addEventListener('change', () => setSize(parseInt(sizeIn.value, 10)));
    sizeIn.addEventListener('keydown', e => { if(e.key === 'Enter') sizeIn.blur(); });
    sizeWrap.append(minus, sizeIn, plus);
    /* SIZE APPLIES TO THE SELECTION WHEN THERE IS ONE, AND TO THE WHOLE BOX
       WHEN THERE ISN'T — which is what people expect from a toolbar, and what
       lets one panel hold a heading and a line of detail.

       execCommand('fontSize') only understands the seven legacy HTML sizes, so
       the reliable way to get an arbitrary px value is to let it mark the
       selection with size 7 and then rewrite those elements. styleWithCSS has
       to be turned OFF for that one call, or it emits <span style="font-size:
       xx-large"> and there is no <font size="7"> left to find. */
    function applySize(px){
      const size = Math.max(8, Math.min(200, Math.round(px)));
      body.focus();
      const sel = window.getSelection();
      let hasSelection = sel && sel.rangeCount && !sel.isCollapsed &&
                         body.contains(sel.anchorNode);

      /* TYPING IN THE SIZE BOX DESTROYS THE SELECTION IT IS MEANT TO RESIZE.
         The +/- buttons cancel their own mousedown so the highlight survives,
         but a real <input> has to take focus to be typed in, and Chrome moves
         the selection into it — so "highlight a heading, type 64" silently
         resized the whole panel instead. The last real highlight is put back
         before the size is applied. */
      if(!hasSelection && lastRange && !lastRange.collapsed &&
         body.contains(lastRange.startContainer)){
        sel.removeAllRanges();
        sel.addRange(lastRange.cloneRange());
        hasSelection = true;
      }

      if(!hasSelection){
        ctx.setState({ size });
        paint();
        return;
      }

      try{
        document.execCommand('styleWithCSS', false, false);
        document.execCommand('fontSize', false, '7');
        document.execCommand('styleWithCSS', false, true);
      }catch(err){ console.warn('[MMT Screen] could not size the selection', err); }

      body.querySelectorAll('font[size="7"]').forEach(f => {
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        while(f.firstChild) span.appendChild(f.firstChild);
        f.replaceWith(span);
      });

      dropPhantomLine();

      saveRange();
      commit();
      paintStates();
    }

    function setSize(n){
      if(!Number.isFinite(n)){ sizeIn.value = shownSize(); return; }
      applySize(n);
    }

    /* What the stepper shows: the size of the text under the caret, which is
       the box's own size until some of it has been sized individually. */
    function shownSize(){
      const sel = window.getSelection();
      if(sel && sel.rangeCount && body.contains(sel.anchorNode)){
        let node = sel.anchorNode;
        if(node.nodeType === 3) node = node.parentElement;
        if(node && body.contains(node)){
          const px = parseFloat(getComputedStyle(node).fontSize);
          if(Number.isFinite(px)) return Math.round(px);
        }
      }
      return st.size;
    }

    const boldBtn   = btn(I.bold,   'Bold (Ctrl+B)',      () => cmd('bold'));
    const italicBtn = btn(I.italic, 'Italic (Ctrl+I)',    () => cmd('italic'));
    const underBtn  = btn(I.under,  'Underline (Ctrl+U)', () => cmd('underline'));

    const inkBtn = btn(`<span class="tx-ink"><b>A</b><i></i></span>` + I.caret, 'Text colour',
      e => showMenu(e.currentTarget, m => {
        const g = document.createElement('div');
        g.className = 'grid';
        g.style.gridTemplateColumns = 'repeat(4, 26px)';
        INKS.forEach(hex => {
          const c = document.createElement('button');
          c.type = 'button'; c.className = 'ink' + (hex === st.ink ? ' on' : '');
          c.style.background = hex; c.title = hex;
          c.addEventListener('mousedown', ev => ev.preventDefault());
          c.addEventListener('click', () => {
            ctx.setState({ ink: hex });
            cmd('foreColor', hex);
            closeMenu(); paint();
          });
          g.appendChild(c);
        });
        m.appendChild(g);
      }), { menu:'ink' });

    const bgBtn = btn(`<span class="tx-swatch"></span>` + I.caret, 'Background colour',
      e => showMenu(e.currentTarget, m => {
        const g = document.createElement('div');
        g.className = 'grid';
        g.style.gridTemplateColumns = 'repeat(4, 26px)';
        TONES.forEach(t => {
          const c = document.createElement('button');
          c.type = 'button'; c.className = 'ink' + (t.id === st.tone ? ' on' : '');
          c.style.background = t.bg; c.title = t.name;
          c.addEventListener('mousedown', ev => ev.preventDefault());
          c.addEventListener('click', () => { ctx.setState({ tone: t.id }); closeMenu(); paint(); });
          g.appendChild(c);
        });
        m.appendChild(g);
      }), { menu:'bg' });

    const alignBtn = btn(I.left + I.caret, 'Alignment',
      e => showMenu(e.currentTarget, m => {
        [['justifyLeft', I.left, 'Left'], ['justifyCenter', I.centre, 'Centre'],
         ['justifyRight', I.right, 'Right']].forEach(([c, ic, name]) => {
          const r = document.createElement('button');
          r.type = 'button'; r.className = 'row';
          r.innerHTML = ic + '<span>' + name + '</span>';
          r.addEventListener('mousedown', ev => ev.preventDefault());
          r.addEventListener('click', () => { cmd(c); closeMenu(); });
          m.appendChild(r);
        });
      }), { menu:'align' });

    /* VERTICAL ALIGNMENT IS A PROPERTY OF THE BOX, NOT OF THE SELECTION.
       Horizontal alignment above is an execCommand, because each paragraph can
       be aligned differently. There is no equivalent for the vertical axis —
       "align this paragraph to the top" is meaningless when the paragraphs
       share one column — so this is widget state, applied to the whole panel,
       and it does not need the selection restoring afterwards. */
    const VALIGNS = [
      ['top',    'flex-start', I.vtop, 'Top'],
      ['middle', 'center',     I.vmid, 'Middle'],
      ['bottom', 'flex-end',   I.vbot, 'Bottom'],
    ];
    const valignIcon = () => (VALIGNS.find(v => v[0] === st.valign) || VALIGNS[1])[2];

    const valignBtn = btn(I.vmid + I.caret, 'Vertical alignment',
      e => showMenu(e.currentTarget, m => {
        VALIGNS.forEach(([id, , ic, name]) => {
          const r = document.createElement('button');
          r.type = 'button'; r.className = 'row' + (st.valign === id ? ' on' : '');
          r.innerHTML = ic + '<span>' + name + '</span>';
          r.addEventListener('mousedown', ev => ev.preventDefault());
          r.addEventListener('click', () => { ctx.setState({ valign: id }); closeMenu(); paint(); });
          m.appendChild(r);
        });
      }), { menu:'valign' });

    const eqBtn = btn('<span class="mf" style="font-size:.68rem"><span class="mf-n">a</span><span class="mf-d">b</span></span>',
      'Maths symbols', () => { ctx.setState({ eq: !st.eq }); paint(); });

    bar.append(sizeWrap, sep(), boldBtn, italicBtn, underBtn, sep(), inkBtn, bgBtn,
               sep(), alignBtn, valignBtn, sep(), eqBtn);

    /* ------------------------------------------------------- equation bar */
    EQ_GROUPS.forEach(group => {
      const b = btn(group.label + I.caret, group.id, e => showMenu(e.currentTarget, m => {
        const g = document.createElement('div');
        g.className = 'grid';
        g.style.gridTemplateColumns = `repeat(${group.cols}, minmax(30px, auto))`;
        group.items.forEach(item => {
          const c = document.createElement('button');
          c.type = 'button'; c.className = 'cell';
          c.innerHTML = item.label || item.text;
          c.title = item.key || item.text;
          c.addEventListener('mousedown', ev => ev.preventDefault());
          c.addEventListener('click', () => {
            insertMathItem(item);
            closeMenu();
          });
          g.appendChild(c);
        });
        m.appendChild(g);
      }), { menu: group.id });
      eqbar.appendChild(b);
    });

    /* ------------------------------------------------------------- paint */
    function paint(){
      const tone = TONES.find(t => t.id === st.tone) || TONES[0];
      mid.style.background = tone.bg;
      body.style.color = tone.ink;
      const card = el.closest('.w');
      if(card) card.style.borderColor = tone.edge;
      body.style.setProperty('--txs', st.size);
      mid.style.setProperty('--txp', Math.max(10, Math.round(st.size * 0.55)));
      const va = VALIGNS.find(v => v[0] === st.valign) || VALIGNS[1];
      mid.style.setProperty('--txv', va[1]);
      valignBtn.innerHTML = valignIcon() + I.caret;
      sizeIn.value = shownSize();
      inkBtn.querySelector('.tx-ink i').style.background = st.ink;
      bgBtn.querySelector('.tx-swatch').style.background = tone.bg;
      eqBtn.classList.toggle('on', !!st.eq);
      bars.classList.toggle('eq', !!st.eq);
      paintStates();
    }

    /* Bold/italic/underline light up for whatever the caret is sitting in. */
    function paintStates(){
      const q = n => { try{ return document.queryCommandState(n); }catch(_){ return false; } };
      if(document.activeElement === body){
        boldBtn.classList.toggle('on', q('bold'));
        italicBtn.classList.toggle('on', q('italic'));
        underBtn.classList.toggle('on', q('underline'));
        const icon = q('justifyCenter') ? I.centre : q('justifyRight') ? I.right : I.left;
        alignBtn.innerHTML = icon + I.caret;
        sizeIn.value = shownSize();
      }
    }

    body.addEventListener('input', () => {
      /* Typing inside an equation re-italicises its letters. Only that box is
         touched, so prose outside it is never rewritten under the caret. */
      const box = eqBoxAt(window.getSelection().anchorNode);
      if(box) mathify(box);
      saveRange();
      commit();
    });

    body.addEventListener('beforeinput', e => {
      if(!/^delete/.test(e.inputType)) return;
      if(guardSlotDelete()){ e.preventDefault(); commit(); }
    });

    /* Escape steps out of an equation and back into the sentence. Without it
       the only way out of a box that fills the line is the mouse. */
    /* Inside an equation: the arrows walk in and out of structures, Tab jumps
       between slots selecting each one, Escape leaves. Outside an equation all
       three keep their ordinary meaning. */
    const EQ_KEYS = ['Escape', 'Tab', 'ArrowRight', 'ArrowLeft'];
    body.addEventListener('keydown', e => {
      if(!EQ_KEYS.includes(e.key)) return;
      if(e.metaKey || e.ctrlKey || e.altKey) return;
      const box = eqBoxAt(window.getSelection().anchorNode);
      if(!box) return;

      if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        /* Only swallow the key when this actually moved the caret — inside a
           slot with room left, the browser's own arrow handling is correct
           and taking it over would break selecting and word jumps. */
        if(e.shiftKey) return;
        const moved = arrowStep(body, box, e.key === 'ArrowRight' ? 1 : -1);
        if(!moved) return;
        e.preventDefault(); e.stopPropagation();
      }else{
        e.preventDefault(); e.stopPropagation();
        if(e.key === 'Tab') stepSlot(body, box, e.shiftKey ? -1 : 1);
        else leaveBox(body, box);
      }

      saveRange();
      commit();
    });
    /* Track the selection from the document, not only from this element's own
       key and mouse events. A highlight can change without either firing — a
       double-click drag that ends outside the box, a programmatic selection,
       Select All from the menu — and the size button needs the real one. */
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if(sel && sel.rangeCount && body.contains(sel.anchorNode)) saveRange();
    };
    document.addEventListener('selectionchange', onSelectionChange);

    body.addEventListener('keyup', () => { saveRange(); paintStates(); });
    body.addEventListener('mouseup', () => { saveRange(); paintStates(); });
    body.addEventListener('focus', () => {
      root.classList.add('focused');
      if(ctx.holdChrome) ctx.holdChrome(true);
    });
    /* Clean the invisible filler out of slots that now hold something, but only
       once the teacher has clicked away. Doing it while they are typing would
       mean shifting the caret's character offset every time a placeholder is
       replaced, which is exactly the kind of fix that introduces a worse bug
       than the one it solves. Empty slots keep their filler — that is what
       stops the browser deleting them. */
    function stripFiller(){
      el.querySelectorAll('.meq .mslot').forEach(slotEl => {
        if(!slotEl.textContent.replace(/\u200b/g, '')) return;
        const walker = document.createTreeWalker(slotEl, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let n; while((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(t => {
          if(t.nodeValue.includes('\u200b')) t.nodeValue = t.nodeValue.replace(/\u200b/g, '');
        });
      });
    }

    body.addEventListener('blur', () => {
      root.classList.remove('focused');
      if(ctx.holdChrome) ctx.holdChrome(false);
      stripFiller();
      commit();
    });

    /* Paste arrives as plain text — nothing else on this board wants a
       stylesheet pasted in from a web page. */
    body.addEventListener('paste', e => {
      e.preventDefault();
      const plain = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, plain);
      commit();
    });

    paint();

    return () => document.removeEventListener('selectionchange', onSelectionChange);
  },
};
