/* ====================================================== Randomiser widget
   Picks a name (or anything else on a list) at random.

   THE NO-REPEAT MODE IS THE POINT, and it is on by default. A picker that
   can call the same student three times in a row while someone else is
   never called is worse than the teacher's own judgement — it produces a
   visibly unfair lesson and the class notices within a week. In no-repeat
   mode the widget deals from the list like a pack of cards and tells you
   how many are left; when the pack runs out it says so and offers to
   reshuffle. The used pile IS saved, so closing the laptop between periods
   does not quietly hand someone a second turn.
   ====================================================================== */

import { fitUnit, shuffle } from './shared.js';
import { renderListChips, saveList, parseNames, onListsChanged } from './lists.js';

const NAT = { nw: 230, nh: 165 };      /* name, count, buttons */
const SAMPLE = ['Amelia','Ben','Charlotte','Dev','Eli','Freya','Grace','Hamish',
                'Isla','Jack','Kiara','Liam','Mia','Noah','Olivia','Priya'];

const css = `
.rd{ height:100%; display:flex; flex-direction:column; }
.rd-stage{ flex:1; min-height:0; display:flex; flex-direction:column; align-items:center;
           justify-content:center; gap:calc(var(--u,1) * 10px); padding:calc(var(--u,1) * 10px); text-align:center; }
.rd-name{ font-size:calc(var(--u,1) * 40px); font-weight:780; letter-spacing:-.035em; line-height:1.1;
          color:#0f172a; word-break:break-word; }
.rd-name.idle{ color:#94a3b8; font-weight:600; font-size:calc(var(--u,1) * 20px); }
.rd-name.spinning{ color:#2563eb; }
.rd-left{ font-size:calc(var(--u,1) * 12px); color:#64748b; font-weight:600; }
.rd-actions{ display:flex; gap:6px; align-items:center; flex-wrap:wrap; justify-content:center; }
.rd-foot{ flex:none; display:flex; align-items:center; gap:6px; padding:.4rem .5rem;
          border-top:1px solid var(--line); background:var(--surface-soft);
          opacity:0; transition:opacity .18s ease; }
.w:hover .rd-foot{ opacity:1; }
.rd-foot .chip{ cursor:pointer; }
.rd-foot .spacer{ flex:1; }
.rd-edit{ position:absolute; inset:0; background:#fff; display:none; flex-direction:column;
          gap:.5rem; padding:.7rem; z-index:3; }
.rd-edit.open{ display:flex; }
.rd-edit textarea{ flex:1; min-height:0; font-size:.88rem; line-height:1.5; }
.rd-edit .row{ display:flex; gap:6px; align-items:center; }
.rd-edit .row .spacer{ flex:1; }
.rd-edit p{ margin:0; font-size:.75rem; color:#64748b; }

/* The saved classes, shared with the group maker. */
.rd-lists{ display:flex; flex-wrap:wrap; gap:5px; }
.rd-chip{
  display:inline-flex; align-items:center; gap:5px; flex:none;
  padding:.28rem .5rem; border-radius:999px; cursor:pointer;
  border:1px solid var(--line-strong); background:var(--surface);
  font-size:.78rem; font-weight:650; color:var(--ink);
}
.rd-chip:hover{ background:var(--surface-soft); }
.rd-chip.on{ background:var(--brand-soft); border-color:var(--brand-2); color:var(--brand); }
.rd-chip .x{ color:var(--muted-light); font-weight:700; line-height:1; }
.rd-chip .x:hover{ color:var(--red); }
.lists-none{ margin:0; font-size:.75rem; color:#64748b; }
/* Which class is loaded, on the footer beside Edit list. */
.rd-class{
  font-size:.74rem; font-weight:700; letter-spacing:.04em; color:var(--brand);
  background:var(--brand-soft); padding:.16rem .45rem; border-radius:999px;
}
.rd-class:empty{ display:none; }
`;

export default {
  type:'randomiser',
  name:'Name picker',
  blurb:'Picks a name at random — and by default nobody comes up twice until everyone has.',
  /* People, not dice — the dice belong to Random maths, and two identical
     icons side by side in the dock is a coin toss every time you reach for
     one of them. */
  icon:'<svg viewBox="0 0 24 24"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 1.8c-3.3 0-6 1.7-6 3.9V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2.3c0-2.2-2.7-3.9-6-3.9ZM17 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm.4 1.8c-.6 0-1.1.1-1.6.2 1.4.9 2.2 2.3 2.2 3.9V19a1 1 0 0 1-.1.5H21a1 1 0 0 0 1-1v-1.8c0-1.9-2.1-3.4-4.6-3.4Z"/></svg>',
  css,
  defaultSize:{ w:420, h:300 },
  minSize:{ w:240, h:200 },

  initialState: () => ({ names: SAMPLE.slice(0, 8), noRepeat: true, used: [], picked: null, listName: null }),

  render(el, ctx){
    const st = ctx.state;
    let spinTimer = null;

    el.innerHTML = `
      <div class="rd">
        <div class="rd-stage">
          <div class="rd-name idle">Press Pick to choose someone</div>
          <div class="rd-left"></div>
          <div class="rd-actions">
            <button class="btn primary pick" type="button">Pick</button>
            <button class="btn again" type="button" title="Put everyone back in">Reshuffle</button>
          </div>
        </div>
        <div class="rd-foot">
          <button class="chip norep" type="button" title="Stop the same person coming up twice">No repeats</button>
          <span class="rd-class"></span>
          <span class="spacer"></span>
          <button class="btn ghost editBtn" type="button">Edit list</button>
        </div>
        <div class="rd-edit">
          <p>Your saved classes — the same ones the group maker uses.</p>
          <div class="rd-lists"></div>
          <p>Or type them here, one name per line.</p>
          <textarea class="field" spellcheck="false"></textarea>
          <div class="row">
            <input class="field saveAs" type="text" placeholder="Save as… e.g. 8MA5" style="max-width:12rem" />
            <button class="btn saveList" type="button">Save class</button>
          </div>
          <div class="row">
            <button class="btn ghost cancel" type="button">Cancel</button>
            <span class="spacer"></span>
            <button class="btn primary done" type="button">Use these names</button>
          </div>
        </div>
      </div>`;

    const nameEl = el.querySelector('.rd-name');
    const leftEl = el.querySelector('.rd-left');
    const editEl = el.querySelector('.rd-edit');
    const area   = el.querySelector('textarea');

    function remaining(){
      if(!st.noRepeat) return st.names;
      const used = new Set(st.used || []);
      return st.names.filter(n => !used.has(n));
    }

    function paint(){
      if(st.picked){
        nameEl.textContent = st.picked;
        nameEl.classList.remove('idle');
      }else{
        nameEl.textContent = st.names.length ? 'Press Pick to choose someone' : 'Add some names first';
        nameEl.classList.add('idle');
      }
      const left = remaining().length;
      leftEl.textContent = st.noRepeat
        ? `${left} of ${st.names.length} still to come`
        : `${st.names.length} on the list`;
      el.querySelector('.norep').classList.toggle('on', !!st.noRepeat);
      el.querySelector('.again').style.display = (st.noRepeat && (st.used||[]).length) ? '' : 'none';
      el.querySelector('.pick').disabled = st.names.length === 0;
      el.querySelector('.rd-class').textContent = st.listName || '';
    }

    /* The saved classes are shared with the group maker, so choosing one here
       and choosing it there load the same names. Picking a class REPLACES the
       list and resets the pack — someone who had already had a turn in 8MA5
       should not stay used up when the teacher switches to 9MX2. */
    function paintLists(){
      renderListChips(el.querySelector('.rd-lists'), {
        selected: st.listName,
        chipClass: 'rd-chip',
        emptyHtml: '<p class="lists-none">None saved yet — type a list below and give it a name, and the group maker will have it too.</p>',
        onChoose(name, people){
          ctx.setState({ listName: name, names: people, used: [], picked: null });
          area.value = people.join('\n');
          el.querySelector('.saveAs').value = name;
          paintLists(); paint();
        },
        onDelete(name){
          if(st.listName === name) ctx.setState({ listName: null });
          paintLists(); paint();
        },
      });
    }

    function pick(){
      const pool = remaining();
      if(!st.names.length) return;
      if(!pool.length){
        nameEl.classList.add('idle');
        nameEl.textContent = 'Everyone has had a turn — reshuffle to go again';
        return;
      }

      /* A short shuffle before the answer. It is not decoration: it buys the
         class a second to look up, and it makes plain that the choice was
         not made by the teacher. */
      const reel = shuffle(st.names);
      let i = 0, ticks = Math.min(14, 6 + pool.length);
      nameEl.classList.remove('idle');
      nameEl.classList.add('spinning');
      el.querySelector('.pick').disabled = true;

      clearInterval(spinTimer);
      spinTimer = setInterval(() => {
        nameEl.textContent = reel[i++ % reel.length];
        if(i > ticks){
          clearInterval(spinTimer); spinTimer = null;
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          nameEl.classList.remove('spinning');
          const used = st.noRepeat ? [...(st.used||[]), chosen] : [];
          ctx.setState({ picked: chosen, used });
          paint();
        }
      }, 55);
    }

    el.querySelector('.pick').addEventListener('click', pick);

    el.querySelector('.again').addEventListener('click', () => {
      ctx.setState({ used: [], picked: null });
      paint();
    });

    el.querySelector('.norep').addEventListener('click', () => {
      ctx.setState({ noRepeat: !st.noRepeat, used: [] });
      paint();
    });

    el.querySelector('.editBtn').addEventListener('click', () => {
      area.value = st.names.join('\n');
      el.querySelector('.saveAs').value = st.listName || '';
      paintLists();
      editEl.classList.add('open');
      area.focus();
    });
    el.querySelector('.cancel').addEventListener('click', () => editEl.classList.remove('open'));

    /* "Save class" puts the list in the shared store, where the group maker
       finds it. "Use these names" applies them to this widget only — a one-off
       list of topics or table numbers has no business becoming a class. */
    el.querySelector('.saveList').addEventListener('click', () => {
      const label = el.querySelector('.saveAs').value.trim();
      const people = parseNames(area.value);
      if(!label) return ctx.toast('Give the class a name first');
      if(!people.length) return ctx.toast('Add some names first');
      saveList(label, people);
      ctx.setState({ listName: label, names: people, used: [], picked: null });
      paintLists(); paint();
      ctx.toast(`Saved “${label}” — the group maker can use it too`);
    });

    el.querySelector('.done').addEventListener('click', () => {
      const names = parseNames(area.value);
      /* Typing over a loaded class makes this a list of its own, not a silent
         edit of 8MA5 — the class only changes when Save class is pressed. */
      const same = st.listName && names.join('\n') === (st.names || []).join('\n');
      ctx.setState({ names, used: [], picked: null, listName: same ? st.listName : null });
      editEl.classList.remove('open');
      paint();
      ctx.toast(`${names.length} name${names.length === 1 ? '' : 's'} ready`);
    });

    fitUnit(el, NAT);
    paint();

    /* Same as the group maker: a class saved or deleted over there shows up
       here without the panel having to be closed and reopened. */
    const offLists = onListsChanged(() => {
      if(editEl.classList.contains('open')) paintLists();
    });

    return () => { clearInterval(spinTimer); offLists(); };
  },

  onResize(el){ fitUnit(el, NAT); },
};
