/* ===========================================================================
   What a saved screen actually contains, and how big it is allowed to be.

   This lives apart from cloudSync.js ON PURPOSE. cloudSync statically imports
   the Firebase SDK, so anything inside it can only run in a browser that can
   reach gstatic — which means the rules about what gets saved could otherwise
   only be checked by signing in against the live project. Here they are plain
   functions over plain objects, so they can be tested on their own.
   =========================================================================== */

/* Firestore's hard ceiling is 1 MiB per document. Stop well short of it and
   say something a teacher can act on, rather than letting the write fail with
   a Firestore error nobody can read. */
export const MAX_BYTES = 900 * 1024;

/* WHAT GETS SAVED, AND THE ONE THING THAT DOES NOT.
   Drawing strokes are dropped. A saved screen is the SET-UP — which widgets,
   where, configured how — and pen marks are this lesson's annotations on top
   of it, which nobody wants reappearing over next period's board. They are
   also the only part of a screen that can grow without limit: 400 strokes of
   several hundred points each is the one realistic way to push a document
   past the 1 MiB ceiling. Dropping them is both the right behaviour and the
   size fix, which is usually a sign it is the right call. */
export function stripForCloud(screen){
  const copy = JSON.parse(JSON.stringify(screen));
  copy.widgets = (copy.widgets || []).map(w => {
    if(w.type === 'drawing' && w.state) w.state = { ...w.state, strokes: [] };
    return w;
  });
  return copy;
}

/* Byte length of the UTF-8 JSON, without needing Blob (so this runs in Node
   for the tests as well as in the browser). */
export function payloadSize(screen){
  const json = JSON.stringify(stripForCloud(screen));
  if(typeof TextEncoder !== 'undefined') return new TextEncoder().encode(json).length;
  return unescape(encodeURIComponent(json)).length;
}

export function tooBig(screen){ return payloadSize(screen) > MAX_BYTES; }

/* THE WIDGETS GO UP AS ONE JSON STRING, NOT AS A STRUCTURED FIELD.

   This is not a micro-optimisation, it is a bug fix, and the bug was a good
   one. FIRESTORE DOES NOT ALLOW AN ARRAY INSIDE AN ARRAY. The group maker
   stores its dealt groups as exactly that — `made: [['Ava','Cam'], ['Ben']]`,
   one array per table — so the moment a teacher dealt groups and pressed Save,
   the SDK threw `invalid-argument: Nested arrays are not supported` before a
   single byte left the laptop. The screen that had never dealt groups saved
   perfectly, which made it look like a rules problem or a quota, and it was
   neither.

   Patching `made` alone would have fixed today and left the trap armed: the
   next widget to store a matrix, a list of lists, or an `undefined` walks into
   the same wall. A screen's widget list is opaque to everything outside this
   app — no rule reads it, no query filters on it, the admin console does not
   touch it — so there is nothing to gain from Firestore understanding its
   shape, and everything to gain from it not having an opinion. A string has no
   shape to object to.

   Saved documents written before this change still carry a structured
   `widgets` array, so the reader below accepts either. */
export function packWidgets(screen){
  return JSON.stringify(stripForCloud(screen).widgets || []);
}
export function unpackWidgets(docData){
  const v = docData || {};
  if(typeof v.widgetsJson === 'string'){
    try{ const a = JSON.parse(v.widgetsJson); return Array.isArray(a) ? a : []; }
    catch(_){ return []; }
  }
  return Array.isArray(v.widgets) ? v.widgets : [];   /* saved before the fix */
}
export function widgetCount(docData){
  const v = docData || {};
  if(typeof v.widgetCount === 'number') return v.widgetCount;
  return unpackWidgets(v).length;
}

/* Walks a screen looking for what Firestore will not take, so a test can prove
   the packing above is doing its job rather than trusting that it is. Returns
   the path of the first offender, or null. */
export function unsupportedValue(value, path = ''){
  if(Array.isArray(value)){
    for(let i = 0; i < value.length; i++){
      const item = value[i];
      if(Array.isArray(item)) return `${path}[${i}] is an array inside an array`;
      const inner = unsupportedValue(item, `${path}[${i}]`);
      if(inner) return inner;
    }
    return null;
  }
  if(value && typeof value === 'object'){
    for(const k of Object.keys(value)){
      if(value[k] === undefined) return `${path}.${k} is undefined`;
      const inner = unsupportedValue(value[k], `${path}.${k}`);
      if(inner) return inner;
    }
  }
  return null;
}

/* One teacher can never write into another's id space — the rules check this
   prefix too, so the two must agree. */
export function docId(teacherCode, screenId){ return `${teacherCode}__${screenId}`; }
