/* ===========================================================================
   Named lists of people, shared by every widget that needs a class.

   THIS IS A SEPARATE STORE FROM THE SCREENS, AND ON PURPOSE. A class list is
   not part of a board layout — it belongs to the teacher, and they want the
   same 8MA5 in the group maker that they have in the name picker, on every
   screen. Keeping it in the screen file would mean re-typing twenty-four names
   for each new screen, and would put those names into every saved copy.

   THE LISTS ARE NOT PART OF A SAVED SCREEN, and they still are not. They do
   now follow a signed-in teacher to their other computers, but as their own
   document under their own teacher code — not baked into every screen they
   save. One roll, kept once, rather than a copy inside each board.

   The store never talks to Firebase itself. app.js is the only file that may
   touch cloudSync.js (which statically imports the Firebase SDK and therefore
   cannot be allowed to break the board when gstatic is unreachable), so it
   hands this module a `remote` through setRemote() and the sync goes through
   that. A store that imported the SDK would take the whole board down on a
   school network that blocks Google's CDN.
   =========================================================================== */

const KEY = 'mmtScreen.lists.v1';

function read(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  }catch(err){
    console.warn('[MMT Screen] class lists unreadable, starting fresh', err);
    return {};
  }
}

/* WHOEVER IS SHOWING A LIST OF CLASSES NEEDS TELLING WHEN THAT LIST CHANGES.
   Both widgets can be open at once — the group maker's panel on one side of
   the board, the name picker's on the other — and a class saved or deleted in
   one used to leave a stale chip sitting in the other. A stale chip is not
   cosmetic: clicking one for a class that has been deleted loads nothing and
   looks broken. The store is the only thing that knows a change happened, so
   the store is what announces it. */
const watchers = new Set();
export function onListsChanged(fn){
  watchers.add(fn);
  return () => watchers.delete(fn);
}
function announce(){
  watchers.forEach(fn => { try{ fn(); }catch(err){ console.warn('[MMT Screen] list listener failed', err); } });
}

/* Set by app.js once a teacher is signed in: { push(lists) }. Null when signed
   out, offline, or on a machine where the cloud module never loaded — and in
   every one of those cases the store carries on locally exactly as before. */
let remote = null;
export function setRemote(r){ remote = r || null; }

function write(all, { push = true } = {}){
  try{ localStorage.setItem(KEY, JSON.stringify(all)); }
  catch(err){ console.warn('[MMT Screen] could not save the class list', err); }
  /* Best effort, and deliberately not awaited: a class list that saved on this
     computer must never look like it failed because the network did. */
  if(push && remote){
    try{ Promise.resolve(remote.push(all)).catch(err => console.warn('[MMT Screen] class lists did not reach the account', err)); }
    catch(err){ console.warn('[MMT Screen] class lists did not reach the account', err); }
  }
  announce();
}

/* WHAT SIGNING IN ON A NEW COMPUTER DOES. The account's copy wins for any
   class that exists in both — it is the one the teacher has been curating —
   and a class that exists only on this computer is kept and pushed up rather
   than quietly dropped. That converges without ever losing a list, which is
   the only property worth having here: a teacher who loses 8MA5 because two
   machines disagreed will not trust the feature again. */
export function mergeRemote(remoteLists){
  const merged = { ...read() };
  Object.keys(remoteLists || {}).forEach(k => {
    if(Array.isArray(remoteLists[k])) merged[k] = remoteLists[k];
  });
  write(merged, { push: false });
  return merged;
}

/** Every list, as { name: [names] }. */
export function allLists(){ return read(); }

/** The names in one list, or an empty array. */
export function getList(name){
  const all = read();
  return Array.isArray(all[name]) ? all[name] : [];
}

/** Save (or replace) a list. Blank lines and duplicates are dropped. */
export function saveList(name, names){
  const clean = String(name || '').trim();
  if(!clean) return false;
  const seen = new Set();
  const tidy = (names || [])
    .map(n => String(n).trim())
    .filter(n => n && !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase()));
  const all = read();
  all[clean] = tidy;
  write(all);
  return true;
}

export function deleteList(name){
  const all = read();
  delete all[name];
  write(all);
}

/** Split a pasted block into names — one per line, or comma separated. */
export function parseNames(text){
  return String(text || '')
    .split(/[\n,]/)
    .map(n => n.trim())
    .filter(Boolean);
}

/* ===========================================================================
   THE PICKER LIVES HERE TOO, SO TWO WIDGETS CANNOT DISAGREE ABOUT IT.

   The group maker and the name picker both offer "choose a saved class", and
   the moment that was written out twice the two would start drifting — one
   sorts, the other does not; one asks before deleting, the other does not; a
   fix lands in one and is forgotten in the other. Neither widget owns the
   concept of a class list, so neither should own the control for choosing one.

   The caller supplies its own chip class, because each widget styles its own
   chrome, and gets back nothing: this paints into the element it is given.
   =========================================================================== */
export function renderListChips(host, opts){
  const {
    selected = null,
    chipClass = 'chip',
    emptyHtml = '<p class="lists-none">None saved yet — paste a list below and give it a name.</p>',
    onChoose = () => {},
    onDelete = null,
  } = opts || {};

  const lists = allLists();
  const names = Object.keys(lists).sort((a, b) => a.localeCompare(b));
  host.innerHTML = '';
  if(!names.length){ host.innerHTML = emptyHtml; return names; }

  names.forEach(name => {
    const chip = document.createElement('button');
    chip.className = chipClass + (name === selected ? ' on' : '');
    chip.type = 'button';
    chip.dataset.list = name;
    const label = document.createElement('span');
    label.textContent = name;                    /* textContent, so a class
                                                    called "8 & 9" is safe */
    chip.appendChild(label);
    chip.setAttribute('aria-label', name + ' (' + (lists[name] || []).length + ' names)');
    if(onDelete){
      const x = document.createElement('span');
      x.className = 'x';
      x.title = 'Delete this list';
      x.textContent = '×';
      chip.appendChild(x);
    }
    chip.addEventListener('click', e => {
      if(onDelete && e.target.classList.contains('x')){
        e.stopPropagation();
        if(!confirm(`Delete the list "${name}"? It disappears from every widget that uses it. Anything already on the board stays.`)) return;
        deleteList(name);
        onDelete(name);
        return;
      }
      onChoose(name, getList(name));
    });
    host.appendChild(chip);
  });
  return names;
}
