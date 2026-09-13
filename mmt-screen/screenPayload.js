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

/* One teacher can never write into another's id space — the rules check this
   prefix too, so the two must agree. */
export function docId(teacherCode, screenId){ return `${teacherCode}__${screenId}`; }
