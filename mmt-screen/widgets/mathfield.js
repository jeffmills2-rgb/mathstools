/* ===========================================================================
   The equation box — the maths half of the text widget.

   MATHS LIVES IN ITS OWN BOX, NOT LOOSE IN THE SENTENCE. Inserting fractions
   and integrals straight into the running text was the first build and it was
   wrong in three ways at once: a fraction sat low against the words beside it,
   letters looked like prose rather than algebra, and there was no boundary
   saying where the equation stopped. One container fixes all three, because
   all three are really the same question — "is this text, or is this maths?"
   Inside `.meq` the answer is maths, so it gets a maths font, a maths baseline
   and a visible edge, exactly as it does in Google Docs.

   ALIGNMENT IS `vertical-align: middle`, NOT A HAND-TUNED em NUDGE. The first
   version used -0.45em, picked by eye against one font at one size, and it
   drifted the moment either changed. `middle` aligns an element's centre with
   the parent's baseline plus half its x-height — which IS the mathematical
   axis, the line a fraction bar and a minus sign are supposed to sit on.

   LETTERS ARE ITALIC, DIGITS ARE UPRIGHT, and that is not decoration: it is
   how algebra is set, and it is the difference between "3x" reading as a term
   and reading as a serial number. CSS cannot select digits, so `mathify()`
   wraps runs of letters in <i class="mv"> as they are typed. It re-reads the
   caret as a character offset and puts it back afterwards, because rewriting
   the DOM under a caret is the one thing that makes an editor feel broken.

   EVERY EDITABLE SLOT IS `display: inline-block`. A <sup> is a plain inline
   element, and when you select the whole of its contents and type, Chrome
   deletes the element along with them — which is why typing a power produced
   "x3" on the baseline instead of x to the n. An inline-block survives being
   emptied, which is the whole reason the slots are spans with a class.
   =========================================================================== */

export const EQ_CSS = `
/* ---- the two fonts, in one place --------------------------------------- */
.tx-body{
  --mmt-math-font:"Latin Modern Math","STIX Two Math","Cambria Math","Asana Math",
                  Cambria,"Palatino Linotype",Palatino,"Book Antiqua",
                  Georgia,"Times New Roman",serif;
  --mmt-math-var-font:"Latin Modern Math","STIX Two Math","Cambria Math",
                      "Palatino Linotype",Palatino,"Book Antiqua","URW Palladio L",
                      Georgia,"Times New Roman",serif;
}

/* ---- the box ----------------------------------------------------------- */
.tx-body .meq{
  display:inline-block; vertical-align:middle;
  padding:.1em .32em; margin:0 .14em;
  border:1px solid #c7d2fe; border-radius:5px;
  background:rgba(239,246,255,.6);
  font-family:var(--mmt-math-font);
  font-style:normal; font-weight:400; letter-spacing:0;
  line-height:1.15;
}
.tx-body .meq:focus-within{ border-color:#6366f1; background:rgba(238,242,255,.92); }

/* VARIABLES GET A CALLIGRAPHIC SERIF ITALIC OF THEIR OWN.

   The maths fonts at the front of the stack are the right answer and are what
   TeX and Google Docs draw with, but almost nobody has them installed — so on
   a stock Mac the whole thing was quietly falling through to Georgia italic,
   which is an upright-ish text italic and reads as emphasis rather than as
   algebra. Palatino is the one genuinely calligraphic serif that ships on both
   macOS and Windows, with the single-storey italic 'a' and the sloped 'x' that
   make a variable look like a variable. It goes ahead of the text serifs, and
   only for the letters — digits and operators stay in the upright face, which
   is the actual typographic rule and half of why the Docs version reads well.

   Both stacks are custom properties so the whole look can be changed in one
   line at the top of this file. */
.tx-body .meq .mv{
  font-family:var(--mmt-math-var-font);
  font-style:italic;
  padding-right:.03em;      /* italic letters lean into whatever follows */
}

/* ---- slots: every part a teacher can type into ------------------------- */
.tx-body .mslot{ display:inline-block; min-width:.62em; text-align:center; }

/* ---- fractions --------------------------------------------------------- */
.tx-body .mf{
  display:inline-flex; flex-direction:column; align-items:stretch;
  vertical-align:middle; text-align:center; margin:0 .16em;
}
.tx-body .mf-n{ padding:0 .25em .05em; border-bottom:.06em solid currentColor; }
.tx-body .mf-d{ padding:.05em .25em 0; }

/* ---- powers and indices ------------------------------------------------ */
.tx-body .mpow{ display:inline-block; vertical-align:middle; }
.tx-body .msup{ display:inline-block; font-size:.62em; vertical-align:super; margin-left:.04em; }
.tx-body .msub{ display:inline-block; font-size:.62em; vertical-align:sub;   margin-left:.04em; }
.tx-body .msupsub{
  display:inline-flex; flex-direction:column; vertical-align:middle;
  font-size:.62em; line-height:1.06; margin-left:.06em;
}

/* ---- roots ------------------------------------------------------------- */
/* THE RADICAL IS THE √ GLYPH, SCALED UP TO REACH THE OVERBAR — and how well
   the two meet depends on which font in the stack above the browser actually
   had, which is different on every machine. Two CSS-drawn strokes were tried
   instead, so it would look identical everywhere; getting the join right took
   longer than it was worth and it is not a correctness problem. IF IT LOOKS
   WRONG ON A PARTICULAR MACHINE, THE SCALE BELOW IS THE ONE NUMBER TO CHANGE
   (and margin-top on .msq-c moves the bar).
   NOTE: this comment sits inside a template literal, so it must never contain
   a backtick — one in an earlier draft ended the CSS string mid-file and took
   every style below it with it. */
.tx-body .msq{ display:inline-flex; align-items:stretch; vertical-align:middle; margin:0 .1em; }
.tx-body .msq-sign{ display:inline-block; transform:scaleY(1.25); transform-origin:bottom;
                    margin-right:-.02em; }
.tx-body .msq-c{ border-top:.055em solid currentColor; padding:0 .22em 0 .06em; margin-top:.1em; }
.tx-body .mroot{ display:inline-flex; align-items:flex-start; vertical-align:middle; }
.tx-body .mroot-i{ font-size:.55em; margin-right:-.32em; position:relative; top:.12em; }

/* ---- big operators with limits ----------------------------------------- */
.tx-body .mop{
  display:inline-flex; flex-direction:column; align-items:center;
  vertical-align:middle; line-height:1; margin:0 .16em;
}
.tx-body .mop-t, .tx-body .mop-b{ font-size:.5em; }
.tx-body .mop-s{ font-size:1.35em; }
`;

/* Slots carry data-ph so the first one can be selected after insertion. */
const slot = (cls, text, ph) =>
  `<span class="mslot ${cls}"${ph ? ' data-ph' : ''}>${text}</span>`;

function opLabel(sym){
  return `<span class="mop"><span class="mop-t">b</span><span class="mop-s">${sym}</span><span class="mop-b">a</span></span>`;
}
function opHtml(sym){
  return `<span class="mop">${slot('mop-t','b',1)}<span class="mop-s">${sym}</span>${slot('mop-b','a')}</span>`;
}

export const STRUCTS = [
  { key:'frac',
    label:'<span class="mf"><span class="mf-n">a</span><span class="mf-d">b</span></span>',
    html:`<span class="mf">${slot('mf-n','a',1)}${slot('mf-d','b')}</span>` },

  { key:'sqrt',
    label:'<span class="msq"><span class="msq-sign">√</span><span class="msq-c">x</span></span>',
    html:`<span class="msq"><span class="msq-sign">√</span>${slot('msq-c','x',1)}</span>` },

  { key:'nroot',
    label:'<span class="mroot"><span class="mroot-i">n</span><span class="msq"><span class="msq-sign">√</span><span class="msq-c">x</span></span></span>',
    html:`<span class="mroot">${slot('mroot-i','n')}<span class="msq"><span class="msq-sign">√</span>${slot('msq-c','x',1)}</span></span>` },

  { key:'pow',
    label:'<span class="mpow">x<span class="msup">n</span></span>',
    html:`<span class="mpow">${slot('mbase','x',1)}${slot('msup','n')}</span>` },

  { key:'sub',
    label:'<span class="mpow">x<span class="msub">a</span></span>',
    html:`<span class="mpow">${slot('mbase','x',1)}${slot('msub','a')}</span>` },

  { key:'subsup',
    label:'<span class="mpow">x<span class="msupsub"><span>b</span><span>a</span></span></span>',
    html:`<span class="mpow">${slot('mbase','x',1)}<span class="msupsub">${slot('mss-t','b')}${slot('mss-b','a')}</span></span>` },

  { key:'bar',  label:'x&#772;', text:'x̄' },
  { key:'hat',  label:'x&#770;', text:'x̂' },

  { key:'cap',    label:opLabel('∩'), html:opHtml('∩') },
  { key:'cup',    label:opLabel('∪'), html:opHtml('∪') },
  { key:'prod',   label:opLabel('∏'), html:opHtml('∏') },
  { key:'coprod', label:opLabel('∐'), html:opHtml('∐') },

  { key:'paren', label:'( )', text:'()' },
  { key:'brack', label:'[ ]', text:'[]' },
  { key:'brace', label:'{ }', text:'{}' },
  { key:'bars',  label:'| |', text:'||' },

  { key:'int',  label:opLabel('∫'), html:opHtml('∫') },
  { key:'oint', label:opLabel('∮'), html:opHtml('∮') },
  { key:'sum',  label:opLabel('∑'), html:opHtml('∑') },

  { key:'lim',
    label:'<span class="mop"><span class="mop-s">lim</span><span class="mop-b">a→b</span></span>',
    html:`<span class="mop"><span class="mop-s">lim</span>${slot('mop-b','a→b',1)}</span>` },
];

/* ======================================================= caret bookkeeping */

/** Where the caret sits inside `root`, counted in characters. */
export function caretOffsetIn(root){
  const sel = window.getSelection();
  if(!sel || !sel.rangeCount) return null;
  const r = sel.getRangeAt(0);
  if(!root.contains(r.startContainer)) return null;
  const pre = document.createRange();
  pre.selectNodeContents(root);
  pre.setEnd(r.startContainer, r.startOffset);
  return pre.toString().length;
}

/** Put the caret back at a character offset, after the DOM has been rebuilt. */
export function setCaretOffsetIn(root, offset){
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node, seen = 0;
  while((node = walker.nextNode())){
    const len = node.nodeValue.length;
    if(seen + len >= offset){
      const r = document.createRange();
      r.setStart(node, Math.max(0, Math.min(len, offset - seen)));
      r.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(r);
      return true;
    }
    seen += len;
  }
  const r = document.createRange();
  r.selectNodeContents(root); r.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges(); sel.addRange(r);
  return false;
}

/* ============================================================== the letters */

/* Two repairs Chrome makes necessary, done together so the caret is saved and
   restored once rather than twice.

   AN EMPTIED SLOT LOSES ITS IDENTITY. Backspace out the "n" of a power and
   Chrome removes the now-empty <span class="msup"> with it, so the next
   keystroke lands on the baseline — the exact "power won't take a value" bug.
   A zero-width space keeps the slot alive and is invisible in the result.

   AND IT CARRIES THE OLD SIZE FORWARD. Emptying an element whose computed
   font-size differs from its parent's makes Chrome preserve that size as the
   typing style, so the replacement character arrives wrapped in
   <span style="font-size:16.12px"> — a superscript-sized 2 sitting on the
   baseline, which looks like the structure half-worked. Inside an equation,
   size comes from the structure, so those are stripped. */
function tidy(box){
  let changed = false;

  box.querySelectorAll('span[style*="font-size"], span[style*="font-style"]').forEach(n => {
    if(n.classList.contains('meq')) return;
    n.style.fontSize = '';
    n.style.fontStyle = '';
    if(!n.getAttribute('style')){
      const frag = document.createDocumentFragment();
      while(n.firstChild) frag.appendChild(n.firstChild);
      n.replaceWith(frag);
    }
    changed = true;
  });

  box.querySelectorAll('.mslot').forEach(slotEl => {
    if(slotEl.textContent.length === 0){
      slotEl.textContent = '\u200b';
      changed = true;
    }
  });

  return changed;
}

/** Wrap runs of letters inside an equation box so they set as variables. */
function italicise(box){
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  const texts = [];
  let n; while((n = walker.nextNode())) texts.push(n);

  let changed = false;
  texts.forEach(t => {
    const value = t.nodeValue;
    const parent = t.parentElement;
    const inVar = parent && parent.classList && parent.classList.contains('mv');

    if(!value.replace(/\u200b/g, '')) return;             /* only filler */
    if(inVar && /^[A-Za-z]+$/.test(value)) return;        /* already right */
    if(!inVar && !/[A-Za-z]/.test(value)) return;         /* nothing to do */

    const frag = document.createDocumentFragment();
    (value.match(/[A-Za-z]+|[^A-Za-z]+/g) || []).forEach(part => {
      if(/^[A-Za-z]+$/.test(part)){
        const i = document.createElement('i');
        i.className = 'mv';
        i.textContent = part;
        frag.appendChild(i);
      }else{
        frag.appendChild(document.createTextNode(part));
      }
    });

    if(inVar) parent.replaceWith(frag);   /* it had gained non-letters */
    else t.replaceWith(frag);
    changed = true;
  });

  return changed;
}

/** Repair and re-italicise an equation box, keeping the caret where it was. */
export function mathify(box, { keepCaret = true } = {}){
  const offset = keepCaret ? caretOffsetIn(box) : null;
  const changed = tidy(box) | italicise(box);
  if(changed && offset != null) setCaretOffsetIn(box, offset);
  return !!changed;
}

/* ================================================================ the box */

/**
 * Backspace inside a slot that is down to its last character.
 *
 * THIS HAS TO BE STOPPED BEFORE IT HAPPENS, not repaired afterwards. Deleting
 * the final character of <span class="msup">n</span> makes Chrome remove the
 * span along with the text, and by the time an `input` handler runs there is
 * no slot left to put anything back into — the next keystroke lands on the
 * baseline and the power silently stops being a power. Emptying it to a
 * zero-width space instead keeps the element, keeps the caret inside it, and
 * looks identical.
 *
 * Returns true if it handled the deletion.
 */
export function guardSlotDelete(){
  const sel = window.getSelection();
  if(!sel || !sel.rangeCount) return false;

  const box = eqBoxAt(sel.anchorNode);
  if(!box) return false;

  let node = sel.anchorNode;
  if(node.nodeType === 3) node = node.parentElement;
  const slotEl = node && node.closest ? node.closest('.mslot') : null;
  if(!slotEl) return false;

  const visible = slotEl.textContent.replace(/\u200b/g, '');
  const removing = sel.isCollapsed ? 1 : String(sel).replace(/\u200b/g, '').length;
  if(visible.length > removing) return false;   /* something will be left */

  slotEl.textContent = '\u200b';
  const r = document.createRange();
  r.setStart(slotEl.firstChild, 1);
  r.collapse(true);
  sel.removeAllRanges(); sel.addRange(r);
  return true;
}

/** The equation box a node sits in, or null. */
export function eqBoxAt(node){
  let n = node;
  while(n && n.nodeType === 3) n = n.parentNode;
  return n && n.closest ? n.closest('.meq') : null;
}

/**
 * Insert maths at the caret, inside an equation box, making one if needed.
 * `html` is markup for a structure; `plain` is a bare symbol.
 */
export function insertMaths(body, { html, text }){
  body.focus();
  const sel = window.getSelection();
  if(!sel.rangeCount || !body.contains(sel.anchorNode)){
    const r = document.createRange();
    r.selectNodeContents(body); r.collapse(false);
    sel.removeAllRanges(); sel.addRange(r);
  }

  let range = sel.getRangeAt(0);
  let box = eqBoxAt(range.startContainer);

  if(!box){
    /* Start a new equation where the caret is. The zero-width space gives the
       empty box something to hold, or the caret has nowhere to land inside it. */
    box = document.createElement('span');
    box.className = 'meq';
    box.appendChild(document.createTextNode('\u200b'));
    range.deleteContents();
    range.insertNode(box);
    range = document.createRange();
    range.selectNodeContents(box);
    range.collapse(false);
    sel.removeAllRanges(); sel.addRange(range);
  }

  range = sel.getRangeAt(0);
  range.deleteContents();

  if(text){
    const node = document.createTextNode(text);
    range.insertNode(node);
    const r = document.createRange();
    r.setStartAfter(node); r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
  }else{
    const frag = document.createRange().createContextualFragment(html);
    const ph = frag.querySelector('[data-ph]');
    const tail = frag.lastChild;
    range.insertNode(frag);

    /* NORMALISE FIRST, THEN SELECT. Doing it the other way round wrecked every
       insertion: italicising replaces the text node inside the placeholder, so
       the selection collapsed, and the caret was then restored by character
       offset — which counts the box's own zero-width space and lands before
       the whole structure. The first thing typed went beside the power instead
       of into it. Selecting the placeholder's contents last is immune to that,
       because the placeholder ELEMENT survives whatever happens to its text. */
    mathify(box, { keepCaret:false });

    if(ph){
      ph.removeAttribute('data-ph');
      const r = document.createRange();
      r.selectNodeContents(ph);
      sel.removeAllRanges(); sel.addRange(r);
    }else if(tail && tail.isConnected){
      const r = document.createRange();
      r.setStartAfter(tail); r.collapse(true);
      sel.removeAllRanges(); sel.addRange(r);
    }
    return box;
  }

  mathify(box);
  return box;
}

/**
 * Tab moves to the next editable slot, and out of the structure at the end.
 *
 * Without this there is no keyboard way to leave a slot, and a slot is often
 * only a few pixels wide — so writing "3x + \u221a(2a) - 3/5" meant aiming the
 * mouse at a superscript between every term. Tab is what Google Docs uses and
 * what anyone who has filled in a form will try first.
 */
export function stepSlot(body, box, dir){
  const slots = [...box.querySelectorAll('.mslot')];
  if(!slots.length){ leaveBox(body, box); return true; }

  const sel = window.getSelection();
  let node = sel.anchorNode;
  if(node && node.nodeType === 3) node = node.parentElement;
  const here = node && node.closest ? node.closest('.mslot') : null;

  /* PAST THE LAST SLOT IS THE END OF THE EQUATION, NOT THE END OF THE BOX.
     Tabbing straight out meant every structure after the first started a NEW
     equation box, so "root(2a) - 3/5 + 5^2" came out as three separate fields
     in a row instead of one expression. Tab walks the placeholders and then
     parks at the end of the maths, ready for the next term; Escape is what
     leaves. */
  const next = (here ? slots.indexOf(here) : -1) + dir;
  if(next < 0){ caretToBoxEdge(body, box, 'start'); return true; }
  if(next >= slots.length){ caretToBoxEdge(body, box, 'end'); return true; }

  /* Select what is in the slot, so the next keystroke replaces the
     placeholder — the same bargain as straight after an insertion. */
  body.focus();
  const r = document.createRange();
  r.selectNodeContents(slots[next]);
  sel.removeAllRanges(); sel.addRange(r);
  return true;
}

/* ===================================================== moving about inside

   ARROW KEYS HAVE TO WALK OUT OF A STRUCTURE, or the equation is a trap. Tab
   already stepped between slots, but nobody reaches for Tab in the middle of
   writing "3x + 4/5 = " — they press the right arrow, and it did nothing: the
   caret sat at the end of the denominator with the browser seeing no further
   text position to move to, because a fraction is a flex column with nothing
   after it. The expression could be started and never finished.

   The rule is the one any editor uses: inside a slot the browser handles the
   arrows as normal, and only AT THE EDGE of a slot does this take over — to
   the next slot of the same structure, or out past the structure entirely.
   At the edge of the whole equation, the arrows leave the box and return to
   the sentence, so there is always a way back to plain text.
   ====================================================================== */

/** The direct child of `box` that contains this node — a whole structure. */
function topStructure(node, box){
  let n = node;
  while(n && n.parentNode && n.parentNode !== box) n = n.parentNode;
  return (n && n.parentNode === box) ? n : null;
}

/* A CARET CANNOT LIVE IN AN EMPTY TEXT NODE, and this is the third place that
   has had to learn it. Chrome leaves zero-length text nodes lying around a
   contenteditable; put the caret in one and the next keystroke is quietly
   re-homed into whatever element is nearby — which is how "type, arrow right,
   keep typing" ended up burying the rest of the expression inside the
   denominator it had just left. Every caret landing goes through here, so a
   node either holds a character or gets one. */
function usableTextNode(node){
  if(!node || node.nodeType !== 3) return null;
  if(node.nodeValue.length === 0) node.nodeValue = '\u200b';
  return node;
}

/** Put the caret at one end of a slot, without selecting it. */
function caretInSlot(body, slotEl, edge){
  body.focus();
  let t = usableTextNode(edge === 'end' ? slotEl.lastChild : slotEl.firstChild);
  if(!t){
    t = document.createTextNode('\u200b');
    if(edge === 'end') slotEl.append(t); else slotEl.prepend(t);
  }
  const r = document.createRange();
  r.setStart(t, edge === 'end' ? t.nodeValue.length : 0);
  r.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges(); sel.addRange(r);
}

/** Put the caret immediately before or after a whole structure, box level. */
function caretBeside(body, structure, where){
  body.focus();
  let t = usableTextNode(where === 'after' ? structure.nextSibling : structure.previousSibling);
  if(!t){
    t = document.createTextNode('\u200b');
    if(where === 'after') structure.after(t); else structure.before(t);
  }
  const r = document.createRange();
  r.setStart(t, where === 'after' ? Math.min(1, t.nodeValue.length) : t.nodeValue.length);
  r.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges(); sel.addRange(r);
}

/**
 * Handle one arrow press inside an equation box.
 * Returns true if it moved the caret (and the key should be swallowed),
 * false to let the browser do its normal thing inside a slot.
 */
export function arrowStep(body, box, dir){
  const sel = window.getSelection();
  if(!sel.rangeCount) return false;
  const range = sel.getRangeAt(0);
  if(!range.collapsed) return false;      /* a highlight collapses as usual */

  let node = range.startContainer;
  if(node.nodeType === 3) node = node.parentElement;
  const slotEl = node && node.closest ? node.closest('.mslot') : null;

  /* At box level: the arrows only matter at the two ends, where they leave. */
  if(!slotEl){
    const offset = caretOffsetIn(box);
    if(offset == null) return false;
    const text = box.textContent;
    if(dir > 0 && offset >= text.length){ leaveBox(body, box); return true; }
    /* The box carries a zero-width space at the front so the caret has
       somewhere to sit; being just after it still counts as the start. */
    const lead = text.startsWith('\u200b') ? 1 : 0;
    if(dir < 0 && offset <= lead){ leaveBox(body, box, 'before'); return true; }
    return false;
  }

  /* Inside a slot, but not at its edge — the browser handles it. */
  const offset = caretOffsetIn(slotEl);
  if(offset == null) return false;
  const len = slotEl.textContent.length;
  if(dir > 0 && offset < len) return false;
  if(dir < 0 && offset > 0) return false;

  const structure = topStructure(slotEl, box);
  if(!structure) return false;

  const slots = [...structure.querySelectorAll('.mslot')];
  const next = slots.indexOf(slotEl) + dir;

  if(next >= 0 && next < slots.length){
    caretInSlot(body, slots[next], dir > 0 ? 'start' : 'end');
  }else{
    caretBeside(body, structure, dir > 0 ? 'after' : 'before');
  }
  return true;
}

/** Put the caret at the very start or end of an equation, still inside it. */
export function caretToBoxEdge(body, box, edge){
  body.focus();

  /* A CARET NEEDS A TEXT NODE TO SIT IN. Collapsing a range to (box, childCount)
     looks right and does not survive: Chrome normalises that position into the
     deepest inline descendant, which is the structure the teacher just tabbed
     out of — so the next term was typed back inside the square root. Giving the
     box a real, if invisible, text node at the edge gives the caret somewhere
     of its own to be. */
  const sel = window.getSelection();
  const r = document.createRange();

  if(edge === 'start'){
    let first = box.firstChild;
    if(!first || first.nodeType !== 3 || !first.nodeValue.length){
      first = document.createTextNode('\u200b');
      box.prepend(first);
    }
    r.setStart(first, 0);
  }else{
    let last = box.lastChild;
    if(!last || last.nodeType !== 3 || !last.nodeValue.length){
      last = document.createTextNode('\u200b');
      box.append(last);
    }
    r.setStart(last, last.nodeValue.length);
  }

  r.collapse(true);
  sel.removeAllRanges(); sel.addRange(r);
}

/** Move the caret out of the equation box and back into the sentence. */
export function leaveBox(body, box, where){
  /* Focus FIRST. Calling focus() after setting a range makes the browser
     restore whatever selection the element had before, which silently undoes
     the move. */
  body.focus();

  /* AN EMPTY TEXT NODE IS NOT SOMEWHERE THE CARET CAN LIVE. Chrome leaves
     zero-length text nodes lying around a contenteditable, and the first
     version of this reused whatever sibling it found as long as it was a text
     node — so Tab dropped the caret into an empty one, and the next keystroke
     was quietly re-homed back inside the structure the teacher had just left.
     A sibling only counts if it actually holds a character. */
  const sideways = node => {
    if(!node || node.nodeType !== 3) return null;
    /* Outside the equation a visible space is right — this is the sentence. */
    if(node.nodeValue.length === 0) node.nodeValue = '\u00a0';
    return node;
  };

  const sel = window.getSelection();
  const r = document.createRange();

  if(where === 'before'){
    let prev = sideways(box.previousSibling);
    if(!prev){
      prev = document.createTextNode('\u00a0');
      box.before(prev);
    }
    r.setStart(prev, prev.nodeValue.length);
  }else{
    let after = sideways(box.nextSibling);
    if(!after){
      after = document.createTextNode('\u00a0');
      box.after(after);
    }
    r.setStart(after, Math.min(1, after.nodeValue.length));
  }

  r.collapse(true);
  sel.removeAllRanges(); sel.addRange(r);
}


