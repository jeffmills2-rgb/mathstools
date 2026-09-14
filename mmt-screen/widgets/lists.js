/* ===========================================================================
   Named lists of people, shared by every widget that needs a class.

   THIS IS A SEPARATE STORE FROM THE SCREENS, AND ON PURPOSE. A class list is
   not part of a board layout — it belongs to the teacher, and they want the
   same 8MA5 in the group maker that they have in the name picker, on every
   screen. Keeping it in the screen file would mean re-typing twenty-four names
   for each new screen, and would put those names into every saved copy.

   IT IS ALSO WHY THE LISTS ARE NOT UPLOADED with a saved screen. Screens sync
   to a teacher account when they press Save; lists stay on the computer they
   were typed on, which keeps a class roll out of the database unless the
   teacher puts it there deliberately by naming a list inside a widget.
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

function write(all){
  try{ localStorage.setItem(KEY, JSON.stringify(all)); }
  catch(err){ console.warn('[MMT Screen] could not save the class list', err); }
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
