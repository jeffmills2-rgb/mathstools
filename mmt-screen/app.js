/* ===========================================================================
   MMT Screen — the host application.

   WHAT THIS FILE OWNS, AND WHAT IT DOES NOT
   -----------------------------------------
   This file owns the BOARD: where widgets sit, how they are dragged, resized,
   stacked, saved and restored. It knows nothing about what any widget does.
   A widget is a module in ./widgets/ that exports a definition object; the
   host hands it an empty element and a small context and gets out of the way.
   That split is the whole point — adding a widget must never mean editing the
   host, or the thing stops being extensible on the second widget.

   THE STATE IS THE SAVE FILE. Everything on screen is derived from `state`,
   and `state` is what goes to localStorage. A widget that keeps something in
   a closure instead of calling ctx.setState() will lose it on reload, and
   there is no second mechanism to rescue it. Widgets store only SETTINGS
   (a duration, a list of names), never live tick values.
   =========================================================================== */

import { WIDGETS, WIDGET_ORDER } from './widgets/index.js';

const STORE_KEY = 'mmtScreen.v1';
const GRID = 8;                    /* drag/resize snap, in px */
const TOPBAR_H = 66;               /* keeps widgets clear of the chrome */
const DOCK_H = 104;

/* -------------------------------------------------------------- backgrounds */
export const BACKGROUNDS = [
  { id:'mmt',    name:'MMT',        css:'radial-gradient(circle at 12% -5%, rgba(37,99,235,.14), transparent 34rem), radial-gradient(circle at 92% 8%, rgba(20,184,166,.13), transparent 30rem), linear-gradient(180deg,#fbfdff 0%,#f6f8fb 46%,#eef2f7 100%)' },
  { id:'paper',  name:'Paper',      css:'linear-gradient(180deg,#fffdf7,#fdf6e8)' },
  { id:'mint',   name:'Mint',       css:'linear-gradient(160deg,#ecfeff 0%,#d1fae5 55%,#a7f3d0 100%)' },
  { id:'sky',    name:'Sky',        css:'linear-gradient(160deg,#eff6ff 0%,#dbeafe 55%,#bfdbfe 100%)' },
  { id:'dusk',   name:'Dusk',       css:'linear-gradient(160deg,#1e1b4b 0%,#312e81 50%,#1e3a8a 100%)' },
  { id:'slate',  name:'Slate',      css:'linear-gradient(160deg,#0f172a 0%,#1e293b 60%,#334155 100%)' },
  { id:'grid',   name:'Grid paper', css:'linear-gradient(#dbeafe 1px, transparent 1px) 0 0/28px 28px, linear-gradient(90deg,#dbeafe 1px, transparent 1px) 0 0/28px 28px, #f8fbff' },
  { id:'plain',  name:'Plain',      css:'#ffffff' },
];

/* --------------------------------------------------------------------- state */
let state = null;
let saveTimer = null;

function blankScreen(name){
  return { id:uid(), name:name||'Screen 1', background:'mmt', widgets:[] };
}
function defaultState(){
  const s = blankScreen('Screen 1');
  return { version:1, screens:[s], activeId:s.id };
}
function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if(!parsed || !Array.isArray(parsed.screens) || !parsed.screens.length) return defaultState();
    /* Drop widgets whose module no longer exists, so an old save can never
       wedge the board on a type we removed. */
    parsed.screens.forEach(sc => {
      sc.widgets = (sc.widgets||[]).filter(w => WIDGETS[w.type]);
    });
    if(!parsed.screens.some(sc => sc.id === parsed.activeId)) parsed.activeId = parsed.screens[0].id;
    return parsed;
  }catch(err){
    console.warn('[MMT Screen] save file unreadable, starting fresh', err);
    return defaultState();
  }
}
function writeNow(){
  clearTimeout(saveTimer);
  saveTimer = null;
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch(err){ console.warn('[MMT Screen] could not save', err); }
}
function save(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(writeNow, 250);
}

/* THE DEBOUNCE NEEDS AN ESCAPE HATCH. Batching writes keeps a drag from
   hammering localStorage sixty times a second, but it also means the last
   quarter-second of changes is still in memory when the page goes away — and
   the way this page goes away is a teacher shutting the laptop lid at the end
   of a period, or closing the tab, which is exactly the moment they have just
   changed something. Flush on the events that fire before the page is frozen
   or discarded. `pagehide` and a hidden `visibilitychange` are the pair that
   actually fire on mobile and on a lid close; `beforeunload` alone does not. */
window.addEventListener('pagehide', () => { if(saveTimer) writeNow(); });
window.addEventListener('beforeunload', () => { if(saveTimer) writeNow(); });
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'hidden' && saveTimer) writeNow();
});
function screen(){ return state.screens.find(s => s.id === state.activeId) || state.screens[0]; }

/* ---------------------------------------------------------------- utilities */
function uid(){ return Math.random().toString(36).slice(2,10); }
function snap(n){ return Math.round(n/GRID)*GRID; }
function clamp(n,lo,hi){ return Math.max(lo, Math.min(hi,n)); }
export function el(tag, cls, html){
  const n = document.createElement(tag);
  if(cls) n.className = cls;
  if(html != null) n.innerHTML = html;
  return n;
}
let toastTimer = null;
export function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
}

/* ------------------------------------------------------------------- the DOM */
const board = document.getElementById('board');
const layerHost = document.getElementById('layerHost');
const dock = document.getElementById('dock');
const bgLayer = document.getElementById('bgLayer');
const nameInput = document.getElementById('screenName');

/* Live widget instances: id -> { def, node, ctx, destroy } */
const live = new Map();

/* =============================================================== widget host */

function widgetById(id){ return screen().widgets.find(w => w.id === id); }

function mountWidget(w){
  const def = WIDGETS[w.type];
  if(!def) return;

  /* A fullscreen widget (the drawing layer) is a different animal: no frame,
     no drag, and it lives above the board rather than on it. */
  if(def.fullscreen) return mountLayer(w, def);

  const node = el('div', 'w' + (def.bare ? ' bare' : '') + (def.headOverlay ? ' hug' : ''));
  node.dataset.id = w.id;
  node.style.left = w.x + 'px';
  node.style.top = w.y + 'px';
  node.style.width = w.w + 'px';
  node.style.height = w.h + 'px';
  node.style.zIndex = String(w.z || 1);

  const head = el('div', 'w-head');
  head.innerHTML =
    `<span class="w-title">${def.name}</span>` +
    `<button class="w-btn close" type="button" title="Remove" aria-label="Remove ${def.name}">` +
      `<svg viewBox="0 0 24 24"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3 1.4 1.4Z"/></svg>` +
    `</button>`;
  head.querySelector('.close').addEventListener('click', e => { e.stopPropagation(); removeWidget(w.id); });

  const body = el('div', 'w-body');
  const grip = el('div', 'w-resize');
  grip.setAttribute('title','Drag to resize');

  node.append(head, body, grip);
  board.appendChild(node);

  const ctx = {
    id: w.id,
    get state(){ return w.state; },
    setState(patch){
      Object.assign(w.state, patch);
      save();
    },
    setTitle(text){ head.querySelector('.w-title').textContent = text; },
    remove(){ removeWidget(w.id); },
    resize(width, height){
      w.w = Math.round(width); w.h = Math.round(height);
      node.style.width = w.w + 'px'; node.style.height = w.h + 'px';
      save(); notifyResize(w.id);
    },
    toast,
  };

  const destroy = def.render(body, ctx) || null;
  live.set(w.id, { def, node, ctx, destroy, body });

  makeDraggable(node, head, w);
  makeResizable(node, grip, w, def);
  node.addEventListener('pointerdown', () => raise(w.id), true);
}

function mountLayer(w, def){
  const node = el('div', 'w-layer');
  node.dataset.id = w.id;
  layerHost.appendChild(node);

  const ctx = {
    id: w.id,
    get state(){ return w.state; },
    setState(patch){ Object.assign(w.state, patch); save(); },
    remove(){ removeWidget(w.id); },
    toast,
  };
  const destroy = def.render(node, ctx) || null;
  live.set(w.id, { def, node, ctx, destroy, body:node });
}

function notifyResize(id){
  const inst = live.get(id);
  if(inst && typeof inst.def.onResize === 'function'){
    inst.def.onResize(inst.body, inst.ctx);
  }
}

function unmountWidget(id){
  const inst = live.get(id);
  if(!inst) return;
  try{ if(typeof inst.destroy === 'function') inst.destroy(); }
  catch(err){ console.warn('[MMT Screen] widget cleanup failed', err); }
  inst.node.remove();
  live.delete(id);
}

export function addWidget(type, opts={}){
  const def = WIDGETS[type];
  if(!def){ toast('That widget is not available yet.'); return; }

  /* Singletons (the drawing layer) toggle rather than stack up. */
  if(def.singleton){
    const existing = screen().widgets.find(x => x.type === type);
    if(existing){ removeWidget(existing.id); return; }
  }

  const size = def.defaultSize || { w:420, h:260 };
  const pos = opts.x != null ? { x:opts.x, y:opts.y } : freeSpot(size);
  const w = {
    id: uid(), type,
    x: pos.x, y: pos.y, w: size.w, h: size.h,
    z: nextZ(),
    state: def.initialState ? def.initialState() : {},
  };
  screen().widgets.push(w);
  mountWidget(w);
  save(); syncDock(); syncEmpty();
  return w;
}

function removeWidget(id){
  unmountWidget(id);
  const sc = screen();
  sc.widgets = sc.widgets.filter(x => x.id !== id);
  save(); syncDock(); syncEmpty();
}

function nextZ(){
  const zs = screen().widgets.map(x => x.z || 1);
  return (zs.length ? Math.max(...zs) : 0) + 1;
}
function raise(id){
  const w = widgetById(id);
  const inst = live.get(id);
  if(!w || !inst) return;
  const top = nextZ() - 1;
  if(w.z === top) return;
  w.z = top + 1;
  inst.node.style.zIndex = String(w.z);
  save();
}

/* WHERE A NEW WIDGET LANDS.
   Scan the free area on a coarse grid and take the first slot that touches
   nothing already on the board. A plain cascade was the first version and it
   is wrong for this job: a teacher setting up a lesson adds four widgets in a
   row and would have to drag every one of them off the pile before the board
   was usable — and the fourth one lands over the third one's buttons, so the
   board looks broken until they do. Only when the board genuinely has no gap
   left does this fall back to cascading. */
function freeSpot(size){
  const pad = 12;
  /* Keep the left strip clear. The drawing layer's toolbar is fixed down the
     left-hand side whenever the pen is out, and a widget auto-placed at the
     left edge ends up half underneath it — with its own buttons covered. The
     toolbar only exists while drawing is on, but placement happens before
     that, so the strip is reserved always. 78px costs nothing on a board and
     the teacher can still drag a widget there deliberately. */
  const minX = pad + 66;
  const maxX = Math.max(minX, window.innerWidth - size.w - pad);
  const minY = TOPBAR_H + 10;
  const maxY = Math.max(minY, window.innerHeight - size.h - DOCK_H);

  const taken = screen().widgets
    .filter(w => { const d = WIDGETS[w.type]; return d && !d.fullscreen; })
    .map(w => ({ x:w.x, y:w.y, w:w.w, h:w.h }));

  const hits = (x, y) => taken.some(t =>
    x < t.x + t.w + 8 && x + size.w + 8 > t.x &&
    y < t.y + t.h + 8 && y + size.h + 8 > t.y);

  const step = 40;
  for(let y = minY; y <= maxY; y += step){
    for(let x = minX; x <= maxX; x += step){
      if(!hits(x, y)) return { x: snap(x), y: snap(y) };
    }
  }

  const n = screen().widgets.length;
  return {
    x: clamp(snap(70 + (n % 6) * 42), minX, maxX),
    y: clamp(snap(minY + 16 + (n % 6) * 36), minY, maxY),
  };
}

/* ---------------------------------------------------------- drag and resize */
function makeDraggable(node, handle, w){
  let sx=0, sy=0, ox=0, oy=0, on=false;
  handle.addEventListener('pointerdown', e => {
    if(e.target.closest('.w-btn')) return;
    on = true; sx = e.clientX; sy = e.clientY; ox = w.x; oy = w.y;
    node.classList.add('dragging');
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  handle.addEventListener('pointermove', e => {
    if(!on) return;
    const maxX = window.innerWidth - 60;         /* always leave a grab edge */
    const maxY = window.innerHeight - 44;
    w.x = clamp(snap(ox + e.clientX - sx), -(w.w - 60), maxX);
    w.y = clamp(snap(oy + e.clientY - sy), 4, maxY);
    node.style.left = w.x + 'px';
    node.style.top = w.y + 'px';
  });
  const end = e => {
    if(!on) return;
    on = false; node.classList.remove('dragging');
    try{ handle.releasePointerCapture(e.pointerId); }catch(_){}
    save();
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

/* A WIDGET MAY LOCK ITS OWN PROPORTIONS. `def.aspect` is width ÷ height for
   the whole card, and a widget sets it when its contents have a real shape —
   a traffic light is a tall rectangle and there is no size of white card
   around it that is not wasted space. Whichever axis the teacher drags
   furthest drives the size and the other follows, so a diagonal drag does the
   obvious thing and a purely vertical one still works. */
function makeResizable(node, grip, w, def){
  const min = def.minSize || { w:220, h:140 };
  const aspect = def.aspect || null;
  const maxW = () => window.innerWidth - 20;
  const maxH = () => window.innerHeight - 20;
  let sx=0, sy=0, ow=0, oh=0, on=false;
  grip.addEventListener('pointerdown', e => {
    on = true; sx = e.clientX; sy = e.clientY; ow = w.w; oh = w.h;
    grip.setPointerCapture(e.pointerId);
    e.preventDefault(); e.stopPropagation();
  });
  grip.addEventListener('pointermove', e => {
    if(!on) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;

    if(aspect){
      const driven = Math.abs(dx) >= Math.abs(dy) ? (ow + dx) : (oh + dy) * aspect;
      let width = clamp(snap(driven), min.w, maxW());
      let height = width / aspect;
      /* If the height hits a limit, re-derive the width from it rather than
         clamping the two separately — that is what silently breaks the ratio
         at the top and bottom of the screen. */
      if(height < min.h){ height = min.h; width = height * aspect; }
      if(height > maxH()){ height = maxH(); width = height * aspect; }
      w.w = Math.round(width);
      w.h = Math.round(height);
    }else{
      w.w = clamp(snap(ow + dx), min.w, maxW());
      w.h = clamp(snap(oh + dy), min.h, maxH());
    }

    node.style.width = w.w + 'px';
    node.style.height = w.h + 'px';
    notifyResize(w.id);
  });
  const end = e => {
    if(!on) return;
    on = false;
    try{ grip.releasePointerCapture(e.pointerId); }catch(_){}
    save(); notifyResize(w.id);
  };
  grip.addEventListener('pointerup', end);
  grip.addEventListener('pointercancel', end);
}

/* ================================================================ the screen */
function renderScreen(){
  [...live.keys()].forEach(unmountWidget);
  board.querySelectorAll('.w').forEach(n => n.remove());
  layerHost.innerHTML = '';

  const sc = screen();
  nameInput.value = sc.name;
  applyBackground(sc.background);
  sc.widgets.slice().sort((a,b) => (a.z||1) - (b.z||1)).forEach(mountWidget);
  syncDock(); syncEmpty();
}
function syncEmpty(){
  document.body.classList.toggle('has-widgets', screen().widgets.length > 0);
}
function applyBackground(id){
  const bg = BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0];
  bgLayer.style.background = bg.css;
  const dark = id === 'dusk' || id === 'slate';
  document.body.classList.toggle('dark-bg', dark);
}

/* ==================================================================== the dock */
function buildDock(){
  dock.innerHTML = '';
  WIDGET_ORDER.forEach(type => {
    const def = WIDGETS[type];
    if(!def) return;
    const b = el('button', 'dock-btn');
    b.type = 'button';
    b.dataset.type = type;
    b.title = def.blurb || def.name;
    b.innerHTML = `<span class="ico">${def.icon}</span><span>${def.name}</span>`;
    b.addEventListener('click', () => addWidget(type));
    dock.appendChild(b);
  });
  dock.appendChild(el('div','dock-sep'));
  const clear = el('button','dock-btn');
  clear.type = 'button';
  clear.title = 'Take everything off this screen';
  clear.innerHTML = `<span class="ico"><svg viewBox="0 0 24 24"><path d="M6 7h12l-1 12.1a2 2 0 0 1-2 1.9H9a2 2 0 0 1-2-1.9L6 7Zm3.5-3h5l.8 1.5H19V7H5V5.5h3.7L9.5 4Z"/></svg></span><span>Clear</span>`;
  clear.addEventListener('click', () => {
    if(!screen().widgets.length) return;
    if(!confirm('Take every widget off this screen? Your other screens are not affected.')) return;
    [...live.keys()].forEach(unmountWidget);
    screen().widgets = [];
    save(); syncDock(); syncEmpty(); toast('Screen cleared');
  });
  dock.appendChild(clear);
}
function syncDock(){
  const types = new Set(screen().widgets.map(w => w.type));
  dock.querySelectorAll('.dock-btn[data-type]').forEach(b => {
    const def = WIDGETS[b.dataset.type];
    b.classList.toggle('on', !!(def && def.singleton && types.has(b.dataset.type)));
  });
}

/* ================================================================= popovers */
function openPop(pop, anchor){
  document.querySelectorAll('.pop.open').forEach(p => { if(p !== pop) p.classList.remove('open'); });
  pop.classList.add('open');
  const r = anchor.getBoundingClientRect();
  pop.style.top = (r.bottom + 10) + 'px';
  const width = pop.offsetWidth;
  pop.style.left = clamp(r.right - width, 12, window.innerWidth - width - 12) + 'px';
}
function closePops(){ document.querySelectorAll('.pop.open').forEach(p => p.classList.remove('open')); }
document.addEventListener('pointerdown', e => {
  if(e.target.closest('.pop') || e.target.closest('#screensBtn') ||
     e.target.closest('#bgBtn') || e.target.closest('#cloudBtn')) return;
  closePops();
});

const screensPop = document.getElementById('screensPop');
const bgPop = document.getElementById('bgPop');

function buildScreensPop(){
  screensPop.innerHTML = '<h4>Saved screens</h4>';
  state.screens.forEach(sc => {
    const row = el('button','pop-row');
    row.type = 'button';
    row.innerHTML = `<span>${escapeHtml(sc.name)}</span><span class="spacer"></span>` +
      `<small>${sc.widgets.length} widget${sc.widgets.length===1?'':'s'}</small>` +
      (sc.id === state.activeId ? '<span style="color:var(--brand)">&#10003;</span>' : '');
    row.addEventListener('click', () => {
      if(sc.id !== state.activeId){ state.activeId = sc.id; renderScreen(); save(); }
      closePops();
    });
    screensPop.appendChild(row);
  });
  screensPop.appendChild(el('div','pop-div'));

  const add = el('button','pop-row');
  add.type = 'button';
  add.innerHTML = '<span>+ New screen</span>';
  add.addEventListener('click', () => {
    const sc = blankScreen('Screen ' + (state.screens.length + 1));
    state.screens.push(sc); state.activeId = sc.id;
    renderScreen(); save(); buildScreensPop(); closePops();
    toast('New screen created');
  });
  screensPop.appendChild(add);

  const dup = el('button','pop-row');
  dup.type = 'button';
  dup.innerHTML = '<span>Duplicate this screen</span>';
  dup.addEventListener('click', () => {
    const copy = JSON.parse(JSON.stringify(screen()));
    copy.id = uid(); copy.name = screen().name + ' copy';
    copy.widgets.forEach(w => { w.id = uid(); });
    state.screens.push(copy); state.activeId = copy.id;
    renderScreen(); save(); buildScreensPop(); closePops();
  });
  screensPop.appendChild(dup);

  if(state.screens.length > 1){
    const del = el('button','pop-row danger');
    del.type = 'button';
    del.innerHTML = '<span>Delete this screen</span>';
    del.addEventListener('click', () => {
      if(!confirm(`Delete "${screen().name}"?`)) return;
      state.screens = state.screens.filter(s => s.id !== state.activeId);
      state.activeId = state.screens[0].id;
      renderScreen(); save(); buildScreensPop(); closePops();
    });
    screensPop.appendChild(del);
  }
}

function buildBgPop(){
  bgPop.innerHTML = '<h4>Background</h4>';
  const grid = el('div','bg-grid');
  BACKGROUNDS.forEach(bg => {
    const sw = el('button','bg-swatch' + (screen().background === bg.id ? ' on' : ''));
    sw.type = 'button';
    sw.title = bg.name;
    sw.setAttribute('aria-label', bg.name);
    sw.style.background = bg.css;
    sw.addEventListener('click', () => {
      screen().background = bg.id;
      applyBackground(bg.id); save(); buildBgPop();
    });
    grid.appendChild(sw);
  });
  bgPop.appendChild(grid);
}

document.getElementById('screensBtn').addEventListener('click', e => {
  buildScreensPop(); openPop(screensPop, e.currentTarget);
});
document.getElementById('bgBtn').addEventListener('click', e => {
  buildBgPop(); openPop(bgPop, e.currentTarget);
});

nameInput.addEventListener('input', () => { screen().name = nameInput.value || 'Untitled'; save(); });
nameInput.addEventListener('keydown', e => { if(e.key === 'Enter') nameInput.blur(); });

/* ============================================================ chrome + keys */
document.getElementById('hideBtn').addEventListener('click', () => toggleChrome());
function toggleChrome(){
  document.body.classList.toggle('chrome-hidden');
  if(document.body.classList.contains('chrome-hidden')) toast('Bars hidden — press H to bring them back');
}
document.getElementById('fsBtn').addEventListener('click', () => toggleFullscreen());
function toggleFullscreen(){
  if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen().catch(()=>{});
}

document.addEventListener('keydown', e => {
  const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if(e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if(k === 'h'){ e.preventDefault(); toggleChrome(); }
  else if(k === 'f'){ e.preventDefault(); toggleFullscreen(); }
  else if(e.key === 'Escape'){ closePops(); document.body.classList.remove('chrome-hidden'); }
});

/* Keep widgets on screen when the window shrinks (projector swaps do this). */
window.addEventListener('resize', () => {
  let moved = false;
  screen().widgets.forEach(w => {
    const inst = live.get(w.id);
    if(!inst || inst.def.fullscreen) return;
    const nx = clamp(w.x, -(w.w - 60), window.innerWidth - 60);
    const ny = clamp(w.y, 4, window.innerHeight - 44);
    if(nx !== w.x || ny !== w.y){
      w.x = nx; w.y = ny; moved = true;
      inst.node.style.left = nx + 'px';
      inst.node.style.top = ny + 'px';
    }
  });
  if(moved) save();
});

/* ============================================ saving to a teacher account ==

   The cloud module is imported DYNAMICALLY and inside a try/catch. It pulls
   the Firebase SDK from gstatic; as a static import, a gstatic outage, a
   school proxy blocking it, or simply having no network would stop this whole
   page from loading — a timer and a traffic light taken out by a sign-in
   feature nobody was using. If it does not load, the two cloud buttons stay
   hidden and the board behaves exactly as it did before any of this existed.
   ========================================================================= */

let cloud = null;        /* the module, once it loads */
let teacher = null;      /* the signed-in teacher code, or null */

const saveBtn   = document.getElementById('saveBtn');
const cloudBtn  = document.getElementById('cloudBtn');
const cloudPop  = document.getElementById('cloudPop');
const cloudLabel= document.getElementById('cloudLabel');

(async function loadCloud(){
  try{
    cloud = await import('./cloudSync.js');
    cloud.initCloud();
    cloudBtn.hidden = false;
    paintCloudChrome();     /* signed out until Firebase says otherwise */
    /* Custom-token sessions persist, so a teacher who signed in last period is
       still signed in — but only once Firebase has restored the session. */
    cloud.onCloudAuth(code => { teacher = code; paintCloudChrome(); });
  }catch(err){
    console.warn('[MMT Screen] saving to an account is unavailable here', err);
  }
})();

/* `teacher` is set ONLY by a successful sign-in or by the auth callback, and
   this function just paints what it is told. An earlier version re-derived it
   here from the cached profile (`teacher || cloud.currentTeacher()`), which
   meant the callback could never clear it: a cached session whose token had
   since expired showed a Save button forever, and every press failed with a
   permission error nobody could explain. The live token is the authority; the
   cache is only there so the label does not flicker. */
function paintCloudChrome(){
  if(!cloud) return;
  cloudLabel.textContent = teacher || 'Sign in';
  saveBtn.hidden = !teacher;
}

function fmtWhen(d){
  if(!d) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
  return sameDay ? time : d.toLocaleDateString([], { day:'numeric', month:'short' }) + ' ' + time;
}

async function buildCloudPop(){
  if(!cloud) return;

  if(!teacher){
    cloudPop.innerHTML = `
      <h4>Save to your account</h4>
      <div class="pop-form">
        <input id="teacherCode" type="text" placeholder="Teacher code" autocomplete="off"
               spellcheck="false" aria-label="Teacher code" />
        <button class="btn primary" id="signInBtn" type="button">Sign in</button>
        <p class="pop-note">The same teacher code you use for the Teacher Dashboard. Signing in lets you save a screen and open it on any computer. On a shared classroom machine, sign out when you are done — the session stays until you do.</p>
        <p class="pop-msg" id="cloudMsg"></p>
      </div>`;
    const input = cloudPop.querySelector('#teacherCode');
    const msg = cloudPop.querySelector('#cloudMsg');
    const go = async () => {
      const btn = cloudPop.querySelector('#signInBtn');
      btn.disabled = true; btn.textContent = 'Signing in…';
      msg.className = 'pop-msg'; msg.textContent = '';
      const res = await cloud.signIn(input.value);
      if(res.ok){
        teacher = res.code;
        paintCloudChrome();
        buildCloudPop();
        toast('Signed in as ' + teacher);
      }else{
        btn.disabled = false; btn.textContent = 'Sign in';
        msg.className = 'pop-msg err'; msg.textContent = res.error;
      }
    };
    cloudPop.querySelector('#signInBtn').addEventListener('click', go);
    input.addEventListener('keydown', e => { if(e.key === 'Enter') go(); });
    setTimeout(() => input.focus(), 30);
    return;
  }

  cloudPop.innerHTML = `
    <div class="pop-who">Signed in as <strong>${escapeHtml(teacher)}</strong></div>
    <h4>Your saved screens</h4>
    <div id="cloudList"><div class="pop-note">Loading…</div></div>
    <div class="pop-div"></div>
    <button class="pop-row" id="cloudSignOut" type="button"><span>Sign out</span></button>
    <p class="pop-msg" id="cloudMsg"></p>`;

  cloudPop.querySelector('#cloudSignOut').addEventListener('click', async () => {
    await cloud.signOutTeacher();
    teacher = null;
    paintCloudChrome();
    buildCloudPop();
    toast('Signed out — your screens are still on this computer');
  });

  const list = cloudPop.querySelector('#cloudList');
  const res = await cloud.listScreens();
  if(!res.ok){
    list.innerHTML = `<p class="pop-msg err">${escapeHtml(res.error)}</p>`;
    return;
  }
  if(!res.screens.length){
    list.innerHTML = `<p class="pop-note">Nothing saved yet. Press <strong>Save</strong> to put this screen on your account.</p>`;
    return;
  }

  list.innerHTML = '';
  res.screens.forEach(sc => {
    const wrap = el('div', 'cloud-item');
    const open = el('button', 'pop-row');
    open.type = 'button';
    open.innerHTML = `<span>${escapeHtml(sc.name)}</span><span class="spacer"></span>` +
                     `<small>${sc.widgets} · ${escapeHtml(fmtWhen(sc.updatedAt))}</small>`;
    open.addEventListener('click', async () => {
      const got = await cloud.loadScreen(sc.id);
      if(!got.ok){ toast(got.error); return; }
      openCloudScreen(got.screen);
      closePops();
    });

    const del = el('button', 'pop-del');
    del.type = 'button';
    del.title = 'Delete from your account';
    del.setAttribute('aria-label', 'Delete ' + sc.name);
    del.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 12.1a2 2 0 0 1-2 1.9H9a2 2 0 0 1-2-1.9L6 7Zm3.5-3h5l.8 1.5H19V7H5V5.5h3.7L9.5 4Z"/></svg>';
    del.addEventListener('click', async e => {
      e.stopPropagation();
      if(!confirm(`Delete "${sc.name}" from your account? The copy on this computer is not touched.`)) return;
      const r = await cloud.deleteScreen(sc.id);
      if(!r.ok){ toast(r.error); return; }
      buildCloudPop();
      toast('Deleted from your account');
    });

    wrap.append(open, del);
    list.appendChild(wrap);
  });
}

/* A cloud screen OVERWRITES the local screen of the same id, rather than
   arriving as a second copy with the same name. Two screens both called
   "Year 8 Period 3", one of them stale, is the confusion this avoids — and it
   is what makes "save at home, open at school" behave the way it reads. */
function openCloudScreen(incoming){
  const existing = state.screens.findIndex(s => s.id === incoming.id);
  if(existing >= 0) state.screens[existing] = incoming;
  else state.screens.push(incoming);
  state.activeId = incoming.id;
  renderScreen();
  save();
  toast('Opened “' + incoming.name + '”');
}

cloudBtn.addEventListener('click', e => {
  buildCloudPop();
  openPop(cloudPop, e.currentTarget);
});

saveBtn.addEventListener('click', async () => {
  if(!cloud || !teacher) return;
  saveBtn.disabled = true;
  const label = saveBtn.querySelector('span');
  label.textContent = 'Saving…';
  const res = await cloud.saveScreen(screen());
  saveBtn.disabled = false;
  label.textContent = 'Save';
  toast(res.ok ? `“${screen().name}” saved to ${teacher}` : res.error);
});

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ====================================================================== boot */
state = load();
buildDock();
renderScreen();

/* A first-run screen that is not empty is friendlier than an empty board and
   a paragraph of instructions. One timer, one traffic light, nothing else. */
if(!localStorage.getItem(STORE_KEY) && !screen().widgets.length){
  addWidget('timer');
  addWidget('traffic');
  save();
}
