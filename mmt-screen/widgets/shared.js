/* ===========================================================================
   Helpers shared by widget modules.

   These live here rather than in index.js so that a widget importing them
   does not create an import cycle back through the registry. Cycles happen
   to work in the browser for hoisted functions, but they are a trap waiting
   for the first widget that needs a helper at module-evaluation time.
   =========================================================================== */

/* SCALE A WIDGET'S CONTENTS TO FILL ITS BOX.

   The widget declares the size its layout wants at scale 1 — `nw` by `nh`,
   measured in the same px its CSS is written in — and this works out how many
   times that fits in the box it actually has, then sets `--u` to it. The
   widget's CSS sizes everything in multiples of `--u`, so the contents grow
   with the card instead of sitting in the middle of it.

   The first version divided by a fixed `base` with a hard cap of about 2.2,
   which is why a dragged-out widget left a lake of white space: past roughly
   double, the contents simply stopped growing. Scaling from the natural size
   has no such ceiling — the ratio IS the answer — and `pad` leaves the small
   border rather than letting text touch the edge.

   Done in JS rather than with container-query units so it still works on the
   older Chrome and Edge builds sitting on school desktops. */
export function fitUnit(el, { nw = 240, nh = 240, pad = 0.94, min = 0.3, max = 14 } = {}){
  const w = el.clientWidth  || nw;
  const h = el.clientHeight || nh;
  const u = Math.max(min, Math.min(max, Math.min(w / nw, h / nh) * pad));
  el.style.setProperty('--u', u.toFixed(3));
  return u;
}

/* A short, soft chime — no audio files to ship, and nothing to 404. */
let audioCtx = null;
export function chime(times = 2){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    for(let i = 0; i < times; i++){
      const t = now + i * 0.42;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i % 2 ? 784 : 988, t);   /* G5 / B5 */
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t); osc.stop(t + 0.4);
    }
  }catch(err){ /* a muted lab machine is not an error worth surfacing */ }
}

export function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* Fisher–Yates. Returns a new array; never mutates the caller's list. */
export function shuffle(list){
  const a = list.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
