/* ======================================================== Starter widget
   A problem on the board as the class walks in, and an answer when you
   want one.

   THE CURRENT STARTER IS SAVED, AND THAT IS THE OPPOSITE OF THE TIMER.
   The timer deliberately forgets where it was, because a countdown that
   comes back mid-run is lying. A starter is the reverse: it is what thirty
   people are looking at and writing about. If a projector blinks, or the
   browser reloads, or the laptop wakes from sleep, the SAME problem must
   come back — a new one would wipe out the work half the room has already
   started. So `current` and `revealed` both go into the saved state.

   NO-REPEATS, like the name picker: the widget deals from the bank and
   remembers what it has used, so a teacher running starters every morning
   does not see the same question twice in a fortnight.

   THE BANK IS EDITABLE AND JEFF'S OWN STARTERS RANK FIRST. The built-in
   bank exists so the widget is useful the minute it is dropped on the
   board, not because forty questions is the right number forever.
   ===================================================================== */

import { fitUnit, escapeHtml, shuffle } from './shared.js';

/* type: 'puzzle' = one answer · 'wodb' = which one doesn't belong (many
   defensible answers, which is the point) · 'tf' = true or false */
const BANK = [
  { t:'puzzle', q:'I am thinking of a number. If I double it and add 7, I get 31. What is my number?', a:'12' },
  { t:'puzzle', q:'The perimeter of a square is 36 cm. What is its area?', a:'81 cm² — the side is 9 cm.' },
  { t:'puzzle', q:'A shirt costs $40. It is reduced by 25%, and then the sale price is reduced by a further 20%. What do you pay?', a:'$24. ($40 → $30 → $24. Note it is not 45% off.)' },
  { t:'puzzle', q:'Half of a number is 3 more than a third of it. What is the number?', a:'18. n/2 − n/3 = n/6 = 3.' },
  { t:'puzzle', q:'What is the smallest whole number bigger than 1 that leaves a remainder of 1 when divided by 2, 3, 4, 5 and 6?', a:'61. The lowest common multiple of 2–6 is 60.' },
  { t:'puzzle', q:'Which is bigger: 3/7 or 4/9?', a:'4/9. Over a common denominator of 63: 27/63 against 28/63.' },
  { t:'puzzle', q:'A rectangle has an area of 48 cm² and a perimeter of 28 cm. What are its side lengths?', a:'6 cm by 8 cm.' },
  { t:'puzzle', q:'How many whole numbers from 1 to 100 are multiples of 3 or of 5?', a:'47. 33 + 20 − 6, because the 6 multiples of 15 were counted twice.' },
  { t:'puzzle', q:'Today is Wednesday. What day will it be in 100 days?', a:'Friday. 100 = 14×7 + 2.' },
  { t:'puzzle', q:'What is the angle between the hands of a clock at half past three?', a:'75°. The hour hand is at 105°, the minute hand at 180°.' },
  { t:'puzzle', q:'The mean of five numbers is 12. Four of them are 8, 10, 14 and 16. What is the fifth?', a:'12. The five must total 60, and those four total 48.' },
  { t:'puzzle', q:'A number is increased by 20%, and the result is then decreased by 20%. What percentage of the original number is left?', a:'96%. 1.2 × 0.8 = 0.96.' },
  { t:'puzzle', q:'Write 0.444… (the 4 repeating) as a fraction.', a:'4/9.' },
  { t:'puzzle', q:'The three angles of a triangle are in the ratio 2 : 3 : 4. How big is the largest one?', a:'80°. Nine parts make 180°, so one part is 20°.' },
  { t:'puzzle', q:'How many diagonals does a hexagon have?', a:'9.' },
  { t:'puzzle', q:'A bag holds 3 red and 5 blue marbles. Two are taken out without replacement. What is the probability both are red?', a:'3/28. (3/8) × (2/7).' },
  { t:'puzzle', q:'Simplify: 3(2x − 4) − 2(x − 5)', a:'4x − 2.' },
  { t:'puzzle', q:'A circle has an area of 36π. What is its circumference?', a:'12π. The radius is 6.' },
  { t:'puzzle', q:'A car covers 150 km in 2 hours. At the same speed, how long does 375 km take?', a:'5 hours, at 75 km/h.' },
  { t:'puzzle', q:'What is the 100th term of 5, 9, 13, 17, …?', a:'401. The rule is 4n + 1.' },
  { t:'puzzle', q:'Two angles are supplementary, and one is four times the other. What are they?', a:'36° and 144°.' },
  { t:'puzzle', q:'Solve: x/3 + 4 = 10', a:'x = 18.' },
  { t:'puzzle', q:'A cube has a surface area of 96 cm². What is its volume?', a:'64 cm³. Each face is 16 cm², so the edge is 4 cm.' },
  { t:'puzzle', q:'What is 1 + 2 + 3 + … + 100?', a:'5050. Fifty pairs that each add to 101.' },
  { t:'puzzle', q:'A map is drawn to a scale of 1 : 50 000. Two towns are 8 cm apart on the map. How far apart are they really?', a:'4 km. 8 × 50 000 = 400 000 cm.' },
  { t:'puzzle', q:'Expand and simplify: (x + 3)(x − 5)', a:'x² − 2x − 15.' },
  { t:'puzzle', q:'A right-angled triangle has shorter sides of 9 and 12. How long is the hypotenuse?', a:'15.' },
  { t:'puzzle', q:'A recipe for 4 people uses 300 g of flour. How much flour for 10 people?', a:'750 g.' },
  { t:'puzzle', q:'In how many different orders can four people line up?', a:'24. That is 4 × 3 × 2 × 1.' },
  { t:'puzzle', q:'The probability that it rains tomorrow is 0.3. What is the probability that it does not?', a:'0.7.' },
  { t:'puzzle', q:'What is 2 to the power of 10?', a:'1024.' },
  { t:'puzzle', q:'A rectangle is twice as long as it is wide, and its perimeter is 54 cm. What is its area?', a:'162 cm². It is 9 cm by 18 cm.' },
  { t:'puzzle', q:'I have $5 in 20c and 50c coins, 16 coins in all. How many of each?', a:'10 twenties and 6 fifties.' },

  { t:'wodb', q:'Which one doesn’t belong?\n\n16    25    36    48', a:'Every one of them can be argued. 48 is not a square number. 25 is the only odd one. 16 is the only power of 2. 36 is the only multiple of both 4 and 9. A good answer names the property, not just the number.' },
  { t:'wodb', q:'Which one doesn’t belong?\n\n2/3    4/6    6/9    3/5', a:'3/5 is not equal to the others. 2/3 is the only one already in lowest terms. 4/6 is the only one with an even numerator and an even denominator. All defensible.' },
  { t:'wodb', q:'Which one doesn’t belong?\n\n0.25    1/4    25%    2.5', a:'2.5 is not equal to the other three. 25% is the only one written as a percentage. 1/4 is the only fraction. 0.25 is the only one with a zero in it.' },
  { t:'wodb', q:'Which one doesn’t belong?\n\nsquare    rhombus    rectangle    trapezium', a:'A trapezium need not be a parallelogram. A rectangle need not have four equal sides. A rhombus need not have right angles. A square is the only one that always has both.' },
  { t:'wodb', q:'Which one doesn’t belong?\n\n3    5    9    11', a:'9 is the only one that is not prime. 9 is also the only square. 11 is the only two-digit number. 3 is the only one that is a factor of 9.' },
  { t:'wodb', q:'Which one doesn’t belong?\n\n12    18    24    30', a:'30 is the only multiple of 5. 24 is the only multiple of 8. 18 is the only one that is a multiple of neither 4 nor 5. 12 is the only one that is a factor of another number on the list.' },

  { t:'tf',  q:'True or false: every square is a rectangle.', a:'True. A rectangle is a quadrilateral with four right angles, and a square has four right angles.' },
  { t:'tf',  q:'True or false: if you double the radius of a circle, you double its area.', a:'False. The area is multiplied by 4.' },
  { t:'tf',  q:'True or false: the mean of a set of numbers is always one of the numbers in the set.', a:'False. The mean of 1 and 2 is 1.5.' },
  { t:'tf',  q:'True or false: a number with an even number of factors cannot be a square number.', a:'True. Factors pair up except when a number is a square, where one factor pairs with itself.' },
];

const TYPE_LABEL = { puzzle:'Problem', wodb:'Which one doesn’t belong?', tf:'True or false', custom:'Yours' };
const FILTERS = [
  { id:'all',    label:'All' },
  { id:'puzzle', label:'Problems' },
  { id:'wodb',   label:'Doesn’t belong' },
  { id:'tf',     label:'True / false' },
  { id:'custom', label:'Mine' },        /* hidden until he has some */
];

const css = `
.st{ height:100%; display:flex; flex-direction:column; position:relative; }
.st-kind{ flex:none; padding:.5rem .8rem .2rem; font-size:calc(var(--u,1) * 11px); font-weight:700;
          letter-spacing:.09em; text-transform:uppercase; color:var(--muted-light); }
.st-body{ flex:1; min-height:0; overflow-y:auto; padding:.2rem 1rem 0; display:flex;
          flex-direction:column; justify-content:center; gap:calc(var(--u,1) * 12px); }
.st-q{ font-size:calc(var(--u,1) * 23px); font-weight:680; line-height:1.35; letter-spacing:-.02em;
       color:var(--ink); white-space:pre-wrap; }
.st-a{ font-size:calc(var(--u,1) * 16px); font-weight:600; line-height:1.45; color:#14532d;
       background:var(--green-soft); border:1px solid #bbf7d0; border-radius:12px;
       padding:calc(var(--u,1) * 10px) calc(var(--u,1) * 12px); white-space:pre-wrap; }
.st-ctrl{ flex:none; display:flex; align-items:center; gap:.45rem; padding:.55rem .8rem .7rem; }
.st-ctrl .spacer{ flex:1; }
.st-foot{ flex:none; display:flex; align-items:center; gap:4px; padding:.35rem .6rem;
          border-top:1px solid var(--line); background:var(--surface-soft);
          overflow-x:auto; scrollbar-width:none; opacity:0; transition:opacity .18s ease; }
.st-foot::-webkit-scrollbar{ display:none; }
.w:hover .st-foot{ opacity:1; }
.st-foot .chip{ cursor:pointer; white-space:nowrap; font-size:.72rem; padding:.22rem .55rem; }
.st-foot .spacer{ flex:1; }
.st-left{ font-size:.68rem; color:var(--muted-light); white-space:nowrap; }
.st-edit{ position:absolute; inset:0; background:#fff; display:none; flex-direction:column;
          gap:.5rem; padding:.75rem; z-index:4; }
.st-edit.open{ display:flex; }
.st-edit textarea{ flex:1; min-height:0; font-size:.85rem; line-height:1.5; }
.st-edit .row{ display:flex; gap:6px; align-items:center; }
.st-edit .row .spacer{ flex:1; }
.st-edit p{ margin:0; font-size:.74rem; color:var(--muted); line-height:1.5; }
`;

export default {
  type:'starter',
  name:'Starter',
  blurb:'A problem on the board as they walk in, with the answer when you want it.',
  icon:'<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2Zm-2 18h4v1a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 10 21v-1Z"/></svg>',
  css,
  defaultSize:{ w:620, h:330 },
  minSize:{ w:300, h:220 },

  initialState: () => ({ current:null, revealed:false, used:[], filter:'all', custom:[] }),

  render(el, ctx){
    const st = ctx.state;
    if(!Array.isArray(st.used)) st.used = [];
    if(!Array.isArray(st.custom)) st.custom = [];

    /* Jeff's own starters come first and are keyed 'c<n>', the built-ins
       'b<n>', so adding one of his never renumbers the bank and invalidates
       the used pile. `everything()` is the whole list; `pool()` is the part
       the current filter is dealing from — and byId looks in EVERYTHING, or
       switching filters would blank the problem already on the board. */
    function everything(){
      return [
        ...st.custom.map((c, i) => ({ ...c, t:'custom', id:'c' + i })),
        ...BANK.map((b, i) => ({ ...b, id:'b' + i })),
      ];
    }
    function pool(){
      const all = everything();
      return st.filter === 'all' ? all : all.filter(x => x.t === st.filter);
    }
    function byId(id){ return everything().find(x => x.id === id) || null; }

    el.innerHTML = `
      <div class="st">
        <div class="st-kind"></div>
        <div class="st-body">
          <div class="st-q"></div>
          <div class="st-a" hidden></div>
        </div>
        <div class="st-ctrl">
          <button class="btn primary reveal" type="button">Show the answer</button>
          <span class="spacer"></span>
          <button class="btn next" type="button">Next starter</button>
        </div>
        <div class="st-foot">
          ${FILTERS.map(f => `<button class="chip" data-f="${f.id}" type="button">${f.label}</button>`).join('')}
          <span class="spacer"></span>
          <span class="st-left"></span>
          <button class="btn ghost addBtn" type="button">Add yours</button>
        </div>
        <div class="st-edit">
          <p>One starter per block. Put the answer on a line starting with <strong>A:</strong>. Blank line between starters.</p>
          <textarea class="field" spellcheck="false" placeholder="What is the sum of the first ten odd numbers?&#10;A: 100 — it is 10².&#10;&#10;Which one doesn't belong? 4, 9, 16, 20&#10;A: 20 is not square; 9 is the only odd one…"></textarea>
          <div class="row">
            <button class="btn ghost cancel" type="button">Cancel</button>
            <span class="spacer"></span>
            <button class="btn primary save" type="button">Save my starters</button>
          </div>
        </div>
      </div>`;

    const kindEl = el.querySelector('.st-kind');
    const qEl    = el.querySelector('.st-q');
    const aEl    = el.querySelector('.st-a');
    const leftEl = el.querySelector('.st-left');
    const editEl = el.querySelector('.st-edit');
    const area   = el.querySelector('textarea');

    /* DON'T LABEL A QUESTION WITH ITS OWN FIRST WORDS. "Which one doesn't
       belong?" and "True or false:" are both the kind of starter AND the
       opening of the prompt, so printing the label above them says the same
       thing twice in two sizes. One rule covers every such type: if the
       question already opens with what the label would say, the label goes. */
    function labelFor(item){
      const label = TYPE_LABEL[item.t] || 'Problem';
      const norm = t => String(t).toLowerCase().replace(/[^a-z]/g, '');
      return norm(item.q).startsWith(norm(label).slice(0, 10)) ? '' : label;
    }

    function remaining(){
      const used = new Set(st.used);
      return pool().filter(x => !used.has(x.id));
    }

    function next(){
      if(!pool().length){
        ctx.setState({ filter:'all' });
        ctx.toast('No starters of that kind yet — showing all of them');
      }
      let left = remaining();
      /* Round the bank rather than stopping at the end: a starter widget that
         announces it has run out at 8:55am is no use to anybody. */
      if(!left.length){
        ctx.setState({ used: [] });
        left = pool();
        if(!left.length) return;
      }
      const pick = shuffle(left)[0];
      ctx.setState({ current: pick.id, revealed: false, used: [...st.used, pick.id] });
      paint();
    }

    function paint(){
      const item = st.current ? byId(st.current) : null;
      if(!item){
        kindEl.textContent = '';
        qEl.textContent = 'Press “Next starter” for a problem.';
        aEl.hidden = true;
      }else{
        kindEl.textContent = labelFor(item);
        qEl.textContent = item.q;
        aEl.textContent = item.a || '';
        aEl.hidden = !st.revealed || !item.a;
      }
      el.querySelector('.reveal').textContent = st.revealed ? 'Hide the answer' : 'Show the answer';
      el.querySelector('.reveal').disabled = !item || !item.a;
      el.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', b.dataset.f === st.filter));
      const mineChip = el.querySelector('[data-f="custom"]');
      if(mineChip) mineChip.hidden = st.custom.length === 0;
      const left = remaining().length, total = pool().length;
      leftEl.textContent = `${left} of ${total} unseen`;
    }

    el.querySelector('.next').addEventListener('click', next);
    el.querySelector('.reveal').addEventListener('click', () => {
      ctx.setState({ revealed: !st.revealed });
      paint();
    });
    el.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
      ctx.setState({ filter: b.dataset.f });
      paint();
    }));

    el.querySelector('.addBtn').addEventListener('click', () => {
      area.value = st.custom.map(c => c.q + (c.a ? '\nA: ' + c.a : '')).join('\n\n');
      editEl.classList.add('open');
      area.focus();
    });
    el.querySelector('.cancel').addEventListener('click', () => editEl.classList.remove('open'));
    el.querySelector('.save').addEventListener('click', () => {
      const blocks = area.value.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
      const custom = blocks.map(b => {
        const lines = b.split('\n');
        const ai = lines.findIndex(l => /^A:\s*/i.test(l.trim()));
        if(ai === -1) return { q: b, a: '' };
        return {
          q: lines.slice(0, ai).join('\n').trim(),
          a: lines.slice(ai).join('\n').replace(/^A:\s*/i, '').trim(),
        };
      }).filter(x => x.q);
      /* The used pile is cleared: custom ids are positional, so keeping it
         would mark the wrong starters as already seen. */
      ctx.setState({ custom, used: [], current: null, revealed: false });
      editEl.classList.remove('open');
      paint();
      ctx.toast(`${custom.length} starter${custom.length === 1 ? '' : 's'} saved`);
    });

    fitUnit(el, { base: 300, min: 0.6, max: 2 });
    if(!st.current) next(); else paint();
  },

  onResize(el){ fitUnit(el, { base: 300, min: 0.6, max: 2 }); },
};
