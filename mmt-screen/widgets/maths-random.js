/* ================================================= Random maths generator
   Numbers to teach with, made on the spot.

   WHY THIS IS NOT A DICE WIDGET. A 1–6 die answers almost no question a
   maths teacher actually has at the board. What they want is "give me two
   integers to add, and let one be negative", or "a fraction that needs
   simplifying", or "a coordinate in the third quadrant". So every mode here
   generates something you can immediately ask a question ABOUT, and the
   settings are the ones that change the mathematics rather than the
   decoration.

   THE SETTINGS ARE SAVED, THE NUMBERS ARE NOT. A reload gives you the same
   generator you set up, ready to roll — not the same numbers, which would
   be a stale answer the class has already done. That is the opposite of the
   starter widget next door, and for the opposite reason: nobody is midway
   through writing about a number that has just been rolled.

   CONSTRAINED GENERATION IS DONE BY REJECTION, WITH A CEILING. "A fraction
   that needs simplifying" is easy to ask for and easy to make impossible
   (denominator range 2–3, say). Every constrained draw retries a bounded
   number of times and then gives back the closest thing it has, so an
   awkward setting produces a slightly-wrong number rather than a frozen
   board.
   ===================================================================== */

import { fitUnit } from './shared.js';

const MODES = [
  { id:'integer',    label:'Integers' },
  { id:'dice',       label:'Dice' },
  { id:'fraction',   label:'Fractions' },
  { id:'decimal',    label:'Decimals' },
  { id:'coordinate', label:'Coordinates' },
];

const css = `
.mr{ height:100%; display:flex; flex-direction:column; }
.mr-modes{ flex:none; display:flex; gap:4px; padding:.45rem .5rem .3rem; overflow-x:auto; scrollbar-width:none; }
.mr-modes::-webkit-scrollbar{ display:none; }
.mr-modes .chip{ cursor:pointer; white-space:nowrap; font-size:calc(var(--u,1) * 12px); padding:.24rem .6rem; }
.mr-stage{ flex:1; min-height:0; display:flex; flex-direction:column; align-items:center;
           justify-content:center; gap:calc(var(--u,1) * 10px); padding:calc(var(--u,1) * 6px); }
.mr-out{ display:flex; align-items:center; justify-content:center; flex-wrap:wrap;
         gap:calc(var(--u,1) * 14px); }
.mr-val{ font-size:calc(var(--u,1) * 46px); font-weight:780; letter-spacing:-.04em; line-height:1;
         color:#0f172a; font-variant-numeric:tabular-nums; }
.mr-val.small{ font-size:calc(var(--u,1) * 32px); }
.mr-val.neg{ color:#b91c1c; }
.mr-idle{ font-size:calc(var(--u,1) * 17px); color:#94a3b8; font-weight:600; }
.mr-frac{ display:inline-flex; flex-direction:column; align-items:center; line-height:1.05;
          font-size:calc(var(--u,1) * 32px); font-weight:780; letter-spacing:-.03em; }
.mr-frac .bar{ display:block; width:100%; height:calc(var(--u,1) * 3px); background:#0f172a;
               border-radius:2px; margin:calc(var(--u,1) * 3px) 0; }
.mr-frac .whole{ margin-right:calc(var(--u,1) * 6px); }
.mr-mixed{ display:inline-flex; align-items:center; }
.mr-die{ width:calc(var(--u,1) * 62px); height:calc(var(--u,1) * 62px); border-radius:calc(var(--u,1) * 12px);
         background:#fff; border:1px solid var(--line-strong); box-shadow:var(--shadow-sm);
         display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr);
         padding:calc(var(--u,1) * 9px); }
.mr-die i{ width:calc(var(--u,1) * 10px); height:calc(var(--u,1) * 10px); border-radius:50%;
           background:#0f172a; align-self:center; justify-self:center; }
.mr-die.num{ display:grid; place-items:center; font-size:calc(var(--u,1) * 26px); font-weight:780; }
.mr-total{ font-size:calc(var(--u,1) * 13px); color:var(--muted); font-weight:650; }
.mr-go{ flex:none; display:flex; justify-content:center; padding:0 .6rem calc(var(--u,1) * 8px); }
.mr-go .btn{ font-size:calc(var(--u,1) * 15px); padding:calc(var(--u,1)*9px) calc(var(--u,1)*22px); }
.mr-set{ flex:none; display:flex; align-items:center; gap:.4rem; padding:.35rem .55rem;
         border-top:1px solid var(--line); background:var(--surface-soft);
         overflow-x:auto; scrollbar-width:none; opacity:0; transition:opacity .18s ease; }
.mr-set::-webkit-scrollbar{ display:none; }
.w:hover .mr-set{ opacity:1; }
.mr-set label{ display:inline-flex; align-items:center; gap:.3rem; font-size:.71rem;
               color:var(--muted); font-weight:650; white-space:nowrap; }
.mr-set input[type=number]{ width:56px; padding:.2rem .35rem; border-radius:7px;
                            border:1px solid var(--line-strong); font-size:.76rem; }
.mr-set select{ padding:.2rem .35rem; border-radius:7px; border:1px solid var(--line-strong); font-size:.76rem; }
.mr-prev{ font-size:calc(var(--u,1) * 11px); color:var(--muted-light); min-height:1em; }
`;

/* --------------------------------------------------------------- helpers */
const ri = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while(b){ [a, b] = [b, a % b]; } return a || 1; };

/* Try to satisfy `ok`, but never spin forever on a setting that cannot be
   met — e.g. "needs simplifying" with denominators only 2 and 3. */
function draw(make, ok, tries = 80){
  let last = make();
  for(let i = 0; i < tries; i++){
    if(ok(last)) return last;
    last = make();
  }
  return last;
}

const PIPS = {
  1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8],
};

export default {
  type:'mathsrandom',
  name:'Random maths',
  blurb:'Integers, dice, fractions, decimals and coordinates — made for asking questions about.',
  /* Two dice, tilted — distinct at dock size from the Name picker's people. */
  icon:'<svg viewBox="0 0 24 24"><path d="M4 8.5 9.5 3l5.5 5.5L9.5 14 4 8.5Zm5.5-2.2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 12h8a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Zm1.8 2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm4.4 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm-4.4 3.8a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm4.4 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"/></svg>',
  css,
  defaultSize:{ w:440, h:330 },
  minSize:{ w:270, h:230 },

  initialState: () => ({
    mode:'integer',
    integer:{ count:2, min:-10, max:10 },
    dice:{ count:2, sides:6 },
    fraction:{ count:1, maxDen:12, kind:'proper', simplify:'any' },
    decimal:{ count:1, min:0, max:10, places:2 },
    coordinate:{ count:1, range:6, quadrants:'all' },
  }),

  render(el, ctx){
    const st = ctx.state;
    let out = null;        /* the numbers themselves are NOT saved */
    let prev = null;

    el.innerHTML = `
      <div class="mr">
        <div class="mr-modes">
          ${MODES.map(m => `<button class="chip" data-m="${m.id}" type="button">${m.label}</button>`).join('')}
        </div>
        <div class="mr-stage">
          <div class="mr-out"><span class="mr-idle">Press the button.</span></div>
          <div class="mr-total"></div>
          <div class="mr-prev"></div>
        </div>
        <div class="mr-go"><button class="btn primary roll" type="button">Generate</button></div>
        <div class="mr-set"></div>
      </div>`;

    const outEl   = el.querySelector('.mr-out');
    const totalEl = el.querySelector('.mr-total');
    const prevEl  = el.querySelector('.mr-prev');
    const setEl   = el.querySelector('.mr-set');
    const rollBtn = el.querySelector('.roll');

    const cfg = () => st[st.mode];

    /* ------------------------------------------------------- generation */
    function generate(){
      const c = cfg();
      switch(st.mode){
        case 'integer': {
          const lo = Math.min(c.min, c.max), hi = Math.max(c.min, c.max);
          return Array.from({ length:c.count }, () => ri(lo, hi));
        }
        case 'dice':
          return Array.from({ length:c.count }, () => ri(1, Math.max(2, c.sides)));
        case 'fraction':
          return Array.from({ length:c.count }, () => draw(
            () => {
              const d = ri(2, Math.max(2, c.maxDen));
              let n;
              if(c.kind === 'proper')        n = ri(1, d - 1) || 1;
              else if(c.kind === 'improper') n = ri(d + 1, d * 3);
              else                           n = ri(1, d * 3);
              return { n, d };
            },
            f => {
              if(c.kind === 'proper' && f.n >= f.d) return false;
              if(c.kind === 'improper' && f.n <= f.d) return false;
              const g = gcd(f.n, f.d);
              if(c.simplify === 'needs')  return g > 1;
              if(c.simplify === 'lowest') return g === 1;
              return true;
            }));
        case 'decimal': {
          const lo = Math.min(c.min, c.max), hi = Math.max(c.min, c.max);
          const p = Math.max(0, Math.min(4, c.places));
          return Array.from({ length:c.count }, () =>
            (Math.random() * (hi - lo) + lo).toFixed(p));
        }
        case 'coordinate': {
          const r = Math.max(1, c.range);
          return Array.from({ length:c.count }, () => draw(
            () => {
              if(c.quadrants === 'first') return { x: ri(1, r), y: ri(1, r) };
              return { x: ri(-r, r), y: ri(-r, r) };
            },
            /* A point on an axis is not in any quadrant, so when the class is
               naming quadrants it is the one thing that must not come up. */
            pt => c.quadrants === 'all' ? true : (pt.x !== 0 && pt.y !== 0)));
        }
      }
    }

    /* ---------------------------------------------------------- drawing */
    function fracNode(f){
      const whole = Math.floor(f.n / f.d);
      const rem = f.n % f.d;
      const box = document.createElement('span');
      box.className = 'mr-mixed';
      if(st.fraction.kind === 'mixed' && whole >= 1 && rem !== 0){
        const w = document.createElement('span');
        w.className = 'mr-val small whole';
        w.textContent = String(whole);
        box.appendChild(w);
        box.appendChild(frac(rem, f.d));
      }else{
        box.appendChild(frac(f.n, f.d));
      }
      return box;
    }
    function frac(n, d){
      const s = document.createElement('span');
      s.className = 'mr-frac';
      s.innerHTML = `<span>${n}</span><span class="bar"></span><span>${d}</span>`;
      return s;
    }
    function dieNode(v){
      const d = document.createElement('div');
      if(v <= 6 && PIPS[v]){
        d.className = 'mr-die';
        for(let i = 0; i < 9; i++){
          const cell = document.createElement('span');
          if(PIPS[v].includes(i)) cell.innerHTML = '<i></i>';
          d.appendChild(cell);
        }
      }else{
        d.className = 'mr-die num';
        d.textContent = String(v);
      }
      d.setAttribute('aria-label', String(v));
      return d;
    }
    function valNode(text, negative){
      const s = document.createElement('span');
      s.className = 'mr-val' + (negative ? ' neg' : '') + (String(text).length > 4 ? ' small' : '');
      s.textContent = text;
      return s;
    }

    function paintOut(){
      outEl.innerHTML = '';
      totalEl.textContent = '';
      if(!out){
        outEl.innerHTML = '<span class="mr-idle">Press the button.</span>';
        return;
      }
      if(st.mode === 'dice'){
        out.forEach(v => outEl.appendChild(dieNode(v)));
        if(out.length > 1) totalEl.textContent = 'Total ' + out.reduce((a, b) => a + b, 0);
      }else if(st.mode === 'fraction'){
        out.forEach(f => outEl.appendChild(fracNode(f)));
      }else if(st.mode === 'coordinate'){
        out.forEach(p => outEl.appendChild(valNode(`(${p.x}, ${p.y})`, false)));
      }else{
        out.forEach(v => outEl.appendChild(valNode(String(v), Number(v) < 0)));
        if(st.mode === 'integer' && out.length > 1){
          totalEl.textContent = 'Sum ' + out.reduce((a, b) => a + b, 0);
        }
      }
    }

    function asText(list){
      if(!list) return '';
      if(st.mode === 'fraction')   return list.map(f => `${f.n}/${f.d}`).join('   ');
      if(st.mode === 'coordinate') return list.map(p => `(${p.x}, ${p.y})`).join('   ');
      return list.join('   ');
    }

    function roll(){
      prev = out;
      out = generate();
      paintOut();
      prevEl.textContent = prev ? 'Before: ' + asText(prev) : '';
    }

    /* --------------------------------------------------------- settings */
    function num(label, key, min, max, step){
      const l = document.createElement('label');
      l.innerHTML = `<span>${label}</span>`;
      const i = document.createElement('input');
      i.type = 'number'; i.min = min; i.max = max; i.step = step || 1;
      i.value = cfg()[key];
      i.addEventListener('change', () => {
        const v = Number(i.value);
        if(Number.isNaN(v)) { i.value = cfg()[key]; return; }
        cfg()[key] = Math.max(min, Math.min(max, v));
        i.value = cfg()[key];
        ctx.setState({ [st.mode]: cfg() });
      });
      l.appendChild(i);
      return l;
    }
    function pick(label, key, options){
      const l = document.createElement('label');
      l.innerHTML = `<span>${label}</span>`;
      const sel = document.createElement('select');
      options.forEach(([v, t]) => {
        const o = document.createElement('option');
        o.value = v; o.textContent = t;
        sel.appendChild(o);
      });
      sel.value = cfg()[key];
      sel.addEventListener('change', () => {
        cfg()[key] = sel.value;
        ctx.setState({ [st.mode]: cfg() });
      });
      l.appendChild(sel);
      return l;
    }

    function buildSettings(){
      setEl.innerHTML = '';
      if(st.mode === 'integer'){
        setEl.append(num('How many', 'count', 1, 6), num('From', 'min', -1000, 1000), num('To', 'max', -1000, 1000));
      }else if(st.mode === 'dice'){
        setEl.append(num('Dice', 'count', 1, 6), num('Sides', 'sides', 2, 100));
      }else if(st.mode === 'fraction'){
        setEl.append(
          num('How many', 'count', 1, 4),
          num('Denominator up to', 'maxDen', 2, 100),
          pick('Kind', 'kind', [['proper','Proper'], ['improper','Improper'], ['mixed','Mixed number']]),
          pick('Simplifying', 'simplify', [['any','Either'], ['needs','Needs simplifying'], ['lowest','Already simplest']]));
      }else if(st.mode === 'decimal'){
        setEl.append(num('How many', 'count', 1, 4), num('From', 'min', -1000, 1000),
                     num('To', 'max', -1000, 1000), num('Places', 'places', 0, 4));
      }else{
        setEl.append(num('How many', 'count', 1, 4), num('Up to ±', 'range', 1, 50),
                     pick('Where', 'quadrants', [['all','Anywhere'], ['first','First quadrant only']]));
      }
    }

    el.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
      if(b.dataset.m === st.mode) return;
      ctx.setState({ mode: b.dataset.m });
      out = null; prev = null;
      prevEl.textContent = '';
      paintMode();
      roll();
    }));
    function paintMode(){
      el.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === st.mode));
      rollBtn.textContent = st.mode === 'dice' ? 'Roll' : 'Generate';
      ctx.setTitle('Random ' + (MODES.find(m => m.id === st.mode) || {}).label.toLowerCase());
      buildSettings();
    }

    rollBtn.addEventListener('click', roll);

    fitUnit(el, { base: 300, min: 0.55, max: 2.2 });
    paintMode();
    roll();
  },

  onResize(el){ fitUnit(el, { base: 300, min: 0.55, max: 2.2 }); },
};
