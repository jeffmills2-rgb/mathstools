/* ======================================================== Group maker widget
   Deals a class into groups and puts them on the board.

   THE GROUPS ARE SAVED, like the starter's question and unlike the timer's
   countdown. They are what thirty people are reading and moving furniture
   for. A reload that re-deals them would send half the room to the wrong
   table, so `made` goes into the widget's state and comes back exactly as it
   was; only pressing the button deals again.

   GROUPS DIFFER IN SIZE BY AT MOST ONE, because they are dealt round-robin
   rather than sliced. Slicing seventeen names into seven groups gives sizes
   3,3,3,3,3,2,0 — an empty group on the board and a teacher explaining why.
   Dealing gives 3,3,3,2,2,2,2, and the widget says so before you press it.

   THE CLASS LIST LIVES OUTSIDE THE WIDGET (lists.js), so the same 8MA5 is
   there on every screen and in the name picker, rather than being re-typed
   per widget and copied into every saved screen.
   ========================================================================= */

import { fitUnit, escapeHtml, shuffle } from './shared.js';
import { allLists, getList, saveList, deleteList, parseNames } from './lists.js';

const NAT = { nw: 520, nh: 340 };

/* One colour per group, cycled. A class finds "the green table" faster than
   "group four", and seven hues is more than any class needs at once. */
const HUES = [
  { bg:'#2563eb', soft:'#eff6ff' },
  { bg:'#0f766e', soft:'#f0fdfa' },
  { bg:'#6d28d9', soft:'#f5f3ff' },
  { bg:'#c2410c', soft:'#fff7ed' },
  { bg:'#15803d', soft:'#f0fdf4' },
  { bg:'#be185d', soft:'#fdf2f8' },
  { bg:'#0369a1', soft:'#f0f9ff' },
];

const css = `
.gm{ height:100%; display:flex; flex-direction:column; position:relative; }

.gm-board{ flex:1; min-height:0; overflow:auto; padding:calc(var(--u,1) * 10px);
           display:grid; gap:calc(var(--u,1) * 10px); align-content:start; }
.gm-card{ border:1px solid var(--line); border-radius:calc(var(--u,1) * 12px);
          overflow:hidden; background:#fff; display:flex; flex-direction:column; }
.gm-head{ padding:calc(var(--u,1) * 7px) calc(var(--u,1) * 11px); color:#fff;
          font-size:calc(var(--u,1) * 15px); font-weight:750; letter-spacing:-.01em; }
.gm-names{ flex:1; }
.gm-name{ padding:calc(var(--u,1) * 5px) calc(var(--u,1) * 11px);
          font-size:calc(var(--u,1) * 14px); font-weight:600; color:var(--ink); }
.gm-name:nth-child(even){ background:var(--surface-soft); }
.gm-empty{ padding:calc(var(--u,1) * 10px) calc(var(--u,1) * 11px);
           font-size:calc(var(--u,1) * 12px); color:var(--muted-light); }

.gm-idle{ flex:1; display:grid; place-items:center; text-align:center;
          padding:1.2rem; color:var(--muted); }
.gm-idle h3{ margin:0 0 .35rem; font-size:calc(var(--u,1) * 17px); color:var(--ink); letter-spacing:-.02em; }
.gm-idle p{ margin:0 0 .8rem; font-size:calc(var(--u,1) * 13px); line-height:1.55; max-width:26rem; }

.gm-foot{ flex:none; display:flex; align-items:center; gap:6px; padding:.4rem .55rem;
          border-top:1px solid var(--line); background:var(--surface-soft);
          overflow-x:auto; scrollbar-width:none; opacity:0; transition:opacity .18s ease; }
.gm-foot::-webkit-scrollbar{ display:none; }
.w:hover .gm-foot{ opacity:1; }
.gm-foot .spacer{ flex:1; }
.gm-foot .btn{ white-space:nowrap; }
.gm-count{ display:inline-flex; align-items:center; gap:2px; }
.gm-count b{ min-width:1.4rem; text-align:center; font-size:.85rem; }
.gm-hint{ font-size:.68rem; color:var(--muted-light); white-space:nowrap; }

.gm-panel{ position:absolute; inset:0; background:#fff; z-index:5;
           display:none; flex-direction:column; }
.gm-panel.open{ display:flex; }
.gm-tabs{ flex:none; display:flex; gap:2px; padding:.5rem .6rem 0; border-bottom:1px solid var(--line); }
.gm-tab{ border:0; background:none; padding:.45rem .8rem; border-radius:8px 8px 0 0;
         font-size:.84rem; font-weight:650; color:var(--muted); cursor:pointer; }
.gm-tab.on{ color:var(--brand); box-shadow:inset 0 -2px 0 var(--brand-2); }
.gm-pane{ flex:1; min-height:0; overflow-y:auto; padding:.7rem; display:none; flex-direction:column; gap:.6rem; }
.gm-pane.on{ display:flex; }
.gm-pane h4{ margin:0; font-size:.72rem; font-weight:700; letter-spacing:.07em;
             text-transform:uppercase; color:var(--muted); }
.gm-chips{ display:flex; flex-wrap:wrap; gap:5px; }
.gm-chip{ display:inline-flex; align-items:center; gap:.35rem; padding:.3rem .7rem;
          border-radius:999px; border:1px solid var(--line-strong); background:#fff;
          font-size:.82rem; font-weight:650; cursor:pointer; }
.gm-chip.on{ border-color:var(--brand-2); background:var(--brand-soft); color:var(--brand); }
.gm-chip .x{ opacity:.45; font-weight:800; }
.gm-chip .x:hover{ opacity:1; color:var(--red); }
.gm-panel textarea{ min-height:6rem; resize:vertical; }
.gm-row{ display:flex; gap:6px; align-items:center; }
.gm-row .spacer{ flex:1; }
.gm-note{ margin:0; font-size:.74rem; color:var(--muted); line-height:1.5; }

.gm-picks{ border:1px solid var(--line); border-radius:10px; overflow:hidden; }
.gm-pick{ display:flex; align-items:center; gap:.6rem; padding:.4rem .6rem;
          font-size:.86rem; cursor:pointer; }
.gm-pick:nth-child(even){ background:var(--surface-soft); }
.gm-pick input{ width:16px; height:16px; accent-color:var(--brand-2); }
`;

export default {
  type:'groups',
  name:'Group maker',
  blurb:'Deal a class into groups — pick the list, tick who is here, choose how many.',
  icon:'<svg viewBox="0 0 24 24"><path d="M3 4h8v7H3V4Zm10 0h8v7h-8V4ZM3 13h8v7H3v-7Zm10 0h8v7h-8v-7Z"/></svg>',
  css,
  defaultSize:{ w:560, h:380 },
  minSize:{ w:300, h:240 },

  initialState: () => ({
    listName:null, names:[], excluded:[], groups:4, made:null, tab:'list',
  }),

  render(el, ctx){
    const st = ctx.state;
    if(!Array.isArray(st.names)) st.names = [];
    if(!Array.isArray(st.excluded)) st.excluded = [];

    el.innerHTML = `
      <div class="gm">
        <div class="gm-board"></div>
        <div class="gm-foot">
          <button class="btn ghost listsBtn" type="button">Class list</button>
          <button class="btn ghost whoBtn" type="button">Who is in</button>
          <span class="gm-count">
            <button class="btn ghost fewer" type="button" title="Fewer groups">&minus;</button>
            <b class="num"></b>
            <button class="btn ghost more" type="button" title="More groups">+</button>
          </span>
          <span class="gm-hint"></span>
          <span class="spacer"></span>
          <button class="btn primary make" type="button">Make groups</button>
        </div>

        <div class="gm-panel">
          <div class="gm-tabs">
            <button class="gm-tab" data-tab="list" type="button">Choose list</button>
            <button class="gm-tab" data-tab="who"  type="button">Who is in</button>
            <span class="spacer" style="flex:1"></span>
            <button class="btn ghost closePanel" type="button">Done</button>
          </div>

          <div class="gm-pane" data-pane="list">
            <h4>Your class lists</h4>
            <div class="gm-chips savedLists"></div>
            <h4>Type or paste a list</h4>
            <textarea class="field namesIn" spellcheck="false"
                      placeholder="One name per line…"></textarea>
            <div class="gm-row">
              <input class="field listName" type="text" placeholder="Save as… e.g. 8MA5" style="max-width:12rem" />
              <button class="btn saveList" type="button">Save list</button>
              <span class="spacer"></span>
              <button class="btn primary useNames" type="button">Use these names</button>
            </div>
            <p class="gm-note">Lists stay on this computer and are shared by every screen. They are not uploaded when you save a screen.</p>
          </div>

          <div class="gm-pane" data-pane="who">
            <div class="gm-row">
              <h4 style="flex:1">Who is in <span class="whoCount"></span></h4>
              <button class="btn ghost allIn" type="button">All in</button>
              <button class="btn ghost noneIn" type="button">None</button>
            </div>
            <div class="gm-picks"></div>
          </div>
        </div>
      </div>`;

    const board  = el.querySelector('.gm-board');
    const panel  = el.querySelector('.gm-panel');
    const numEl  = el.querySelector('.num');
    const hintEl = el.querySelector('.gm-hint');

    const included = () => st.names.filter(n => !st.excluded.includes(n));

    /* --------------------------------------------------------- the groups */
    function deal(){
      const pool = shuffle(included());
      const n = Math.max(2, Math.min(12, st.groups));
      if(!pool.length){ ctx.toast('Add some names first'); return; }

      const made = Array.from({ length:n }, () => []);
      pool.forEach((name, i) => made[i % n].push(name));
      made.forEach(g => g.sort((a, b) => a.localeCompare(b)));
      ctx.setState({ made });
      paint();
    }

    function sizesSentence(){
      const total = included().length;
      const n = Math.max(2, Math.min(12, st.groups));
      if(!total) return 'no names yet';
      const low = Math.floor(total / n), high = Math.ceil(total / n);
      if(low === high) return `${n} groups of ${low}`;
      return `${n} groups of ${low}–${high}`;
    }

    /* ---------------------------------------------------------- painting */
    function paintBoard(){
      board.innerHTML = '';
      if(!st.made || !st.made.length){
        const idle = document.createElement('div');
        idle.className = 'gm-idle';
        idle.innerHTML = st.names.length
          ? `<div><h3>${included().length} names ready</h3><p>${escapeHtml(sizesSentence())}. Press <strong>Make groups</strong>.</p></div>`
          : `<div><h3>No class list yet</h3><p>Open <strong>Class list</strong> below to choose a saved class or paste one in.</p></div>`;
        board.appendChild(idle);
        return;
      }

      const cols = Math.max(1, Math.min(4, Math.round(Math.sqrt(st.made.length))));
      board.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

      st.made.forEach((names, i) => {
        const hue = HUES[i % HUES.length];
        const card = document.createElement('div');
        card.className = 'gm-card';
        card.style.background = hue.soft;
        const head = document.createElement('div');
        head.className = 'gm-head';
        head.style.background = hue.bg;
        head.textContent = 'Group ' + (i + 1);
        const list = document.createElement('div');
        list.className = 'gm-names';
        if(!names.length){
          list.innerHTML = '<div class="gm-empty">—</div>';
        }else{
          names.forEach(n => {
            const row = document.createElement('div');
            row.className = 'gm-name';
            row.textContent = n;
            list.appendChild(row);
          });
        }
        card.append(head, list);
        board.appendChild(card);
      });
    }

    function paint(){
      numEl.textContent = st.groups;
      hintEl.textContent = sizesSentence();
      paintBoard();
      fitUnit(el, NAT);
    }

    /* ------------------------------------------------------------ panels */
    function openPanel(tab){
      ctx.setState({ tab });
      panel.classList.add('open');
      paintPanel();
    }

    function paintPanel(){
      el.querySelectorAll('.gm-tab').forEach(t => t.classList.toggle('on', t.dataset.tab === st.tab));
      el.querySelectorAll('.gm-pane').forEach(p => p.classList.toggle('on', p.dataset.pane === st.tab));

      /* saved lists */
      const chips = el.querySelector('.savedLists');
      const lists = allLists();
      const names = Object.keys(lists).sort();
      chips.innerHTML = '';
      if(!names.length){
        chips.innerHTML = '<p class="gm-note">None saved yet — paste a class below and give it a name.</p>';
      }else{
        names.forEach(name => {
          const chip = document.createElement('button');
          chip.className = 'gm-chip' + (name === st.listName ? ' on' : '');
          chip.type = 'button';
          chip.innerHTML = `<span>${escapeHtml(name)}</span><span class="x" title="Delete this list">&times;</span>`;
          chip.addEventListener('click', e => {
            if(e.target.classList.contains('x')){
              e.stopPropagation();
              if(!confirm(`Delete the list "${name}"? Groups already on the board are not affected.`)) return;
              deleteList(name);
              if(st.listName === name) ctx.setState({ listName:null });
              paintPanel();
              return;
            }
            const people = getList(name);
            ctx.setState({ listName:name, names:people, excluded:[], made:null });
            el.querySelector('.namesIn').value = people.join('\n');
            paintPanel(); paint();
          });
          chips.appendChild(chip);
        });
      }

      /* who is in */
      const picks = el.querySelector('.gm-picks');
      picks.innerHTML = '';
      el.querySelector('.whoCount').textContent =
        st.names.length ? `(${included().length}/${st.names.length})` : '';
      if(!st.names.length){
        picks.innerHTML = '<p class="gm-note" style="padding:.6rem">Choose or paste a list first.</p>';
      }else{
        st.names.forEach(name => {
          const row = document.createElement('label');
          row.className = 'gm-pick';
          const box = document.createElement('input');
          box.type = 'checkbox';
          box.checked = !st.excluded.includes(name);
          box.addEventListener('change', () => {
            const excluded = box.checked
              ? st.excluded.filter(n => n !== name)
              : [...st.excluded, name];
            ctx.setState({ excluded });
            el.querySelector('.whoCount').textContent = `(${included().length}/${st.names.length})`;
            paint();
          });
          const span = document.createElement('span');
          span.textContent = name;
          row.append(box, span);
          picks.appendChild(row);
        });
      }
    }

    /* ----------------------------------------------------------- wiring */
    el.querySelector('.listsBtn').addEventListener('click', () => openPanel('list'));
    el.querySelector('.whoBtn').addEventListener('click', () => openPanel('who'));
    el.querySelector('.closePanel').addEventListener('click', () => panel.classList.remove('open'));
    el.querySelectorAll('.gm-tab').forEach(t =>
      t.addEventListener('click', () => { ctx.setState({ tab:t.dataset.tab }); paintPanel(); }));

    el.querySelector('.fewer').addEventListener('click', () => {
      ctx.setState({ groups: Math.max(2, st.groups - 1) }); paint();
    });
    el.querySelector('.more').addEventListener('click', () => {
      ctx.setState({ groups: Math.min(12, st.groups + 1) }); paint();
    });
    el.querySelector('.make').addEventListener('click', deal);

    el.querySelector('.useNames').addEventListener('click', () => {
      const people = parseNames(el.querySelector('.namesIn').value);
      ctx.setState({ names:people, excluded:[], made:null, listName:null });
      paintPanel(); paint();
      ctx.toast(`${people.length} name${people.length === 1 ? '' : 's'} ready`);
    });

    el.querySelector('.saveList').addEventListener('click', () => {
      const nameInput = el.querySelector('.listName');
      const label = nameInput.value.trim();
      const people = parseNames(el.querySelector('.namesIn').value);
      if(!label){ ctx.toast('Give the list a name first'); nameInput.focus(); return; }
      if(!people.length){ ctx.toast('Type some names first'); return; }
      saveList(label, people);
      ctx.setState({ listName:label, names:people, excluded:[], made:null });
      nameInput.value = '';
      paintPanel(); paint();
      ctx.toast(`Saved “${label}”`);
    });

    el.querySelector('.allIn').addEventListener('click', () => {
      ctx.setState({ excluded: [] }); paintPanel(); paint();
    });
    el.querySelector('.noneIn').addEventListener('click', () => {
      ctx.setState({ excluded: [...st.names] }); paintPanel(); paint();
    });

    el.querySelector('.namesIn').value = st.names.join('\n');
    fitUnit(el, NAT);
    paint();
  },

  onResize(el){ fitUnit(el, NAT); },
};
