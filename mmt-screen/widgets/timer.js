/* ============================================================ Timer widget
   Counts down, or counts up as a stopwatch.

   WHAT IS SAVED AND WHAT IS NOT: the mode and the SET duration are saved;
   how far through a run you are is not. A timer that restores itself
   mid-count after a browser reload is worse than useless in a classroom —
   the teacher has moved on and the board would be lying about the time left.
   Reload gives you the timer you set, stopped at the top.
   ========================================================================= */

import { fitUnit, chime } from './shared.js';

/* Measured, not guessed: the presets row needs 290px at --u: 1 and the panel
   adds 20px of padding either side of it. Claiming 250 (and then 285) was why
   "20m" kept dropping onto a second line — the widest row in the layout has to
   be what the natural width says, or the scale is computed against a number
   the content cannot actually fit into. */
const NAT = { nw: 310, nh: 290 };
const PRESETS = [1, 2, 5, 10, 15, 20];
const R = 52;                        /* ring radius in the 120-box viewBox */
const CIRC = 2 * Math.PI * R;

const css = `
/* THE CLOCK FILLS THE CARD UNTIL YOU REACH FOR IT.

   A timer on a classroom wall is a clock, not a control panel — the mode
   chips, the presets and the start button are all for the teacher, and for
   the other fifty-nine minutes of the lesson they are just things making the
   numbers smaller. So at rest they collapse and the face scales up to fill
   the card; hovering brings them back and the face returns to its place.

   The zoom is a TRANSFORM, not a change of layout. Scaling does not reflow
   anything, so the ring cannot shove the controls around on its way up and
   the whole thing is one cheap, smooth transition rather than a relayout
   every time the mouse crosses the card. The factor is measured in JS
   (see paintZoom below) because it depends on the card's shape, which CSS
   cannot know.

   NOTE: this comment is inside a CSS template literal, so it must not contain
   a backtick — one ends the string and silently takes every rule after it. */
.tm{ height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;
     gap:calc(var(--u,1) * 8px); padding:calc(var(--u,1) * 10px); }
.tm-face{ position:relative; display:grid; place-items:center; flex:none;
          transition:transform .3s cubic-bezier(.22,.61,.36,1); }
.tm-modes, .tm-presets, .tm-ctrl{
  transition:opacity .22s ease, max-height .3s ease, margin .3s ease;
  max-height:12rem; overflow:hidden;
}
.w:not(:hover) .tm-face{ transform:scale(var(--tmzoom, 1)); }
.w:not(:hover) .tm-modes,
.w:not(:hover) .tm-presets,
.w:not(:hover) .tm-ctrl{ opacity:0; max-height:0; margin:0; pointer-events:none; }
.tm-ring{ width:calc(var(--u,1) * 150px); height:calc(var(--u,1) * 150px); display:block; transform:rotate(-90deg); }
.tm-ring .track{ fill:none; stroke:#e2e8f0; stroke-width:7; }
.tm-ring .prog{ fill:none; stroke:#2563eb; stroke-width:7; stroke-linecap:round;
                stroke-dasharray:${CIRC.toFixed(2)}; transition:stroke-dashoffset .25s linear, stroke .3s ease; }
.tm-time{ position:absolute; font-variant-numeric:tabular-nums; font-weight:750; letter-spacing:-.04em;
          font-size:calc(var(--u,1) * 38px); line-height:1; color:#0f172a; }
.tm-time.small{ font-size:calc(var(--u,1) * 28px); }
.tm-ctrl{ display:flex; align-items:center; gap:calc(var(--u,1) * 6px); flex-wrap:wrap; justify-content:center; }
.tm-presets{ display:flex; gap:calc(var(--u,1) * 4px); flex-wrap:wrap; justify-content:center; }
/* The chip PADDING scales with --u as well as the font. Leaving it in fixed
   rem was why a dragged-out timer still looked under-filled: the numbers grew
   but the pills around them did not, so the widest row in the layout stopped
   growing and left a margin down both sides. Anything that contributes to the
   natural width has to scale, or the natural width is a lie. */
.tm-presets .chip{ cursor:pointer; padding:calc(var(--u,1) * 3px) calc(var(--u,1) * 9px);
                   font-size:calc(var(--u,1) * 12px); border-radius:999px; }
.tm-presets .chip:hover{ background:#dbeafe; color:#1d4ed8; }
.tm-modes{ display:flex; gap:calc(var(--u,1) * 4px); }
.tm-modes .chip{ cursor:pointer; font-size:calc(var(--u,1) * 12px);
                 padding:calc(var(--u,1) * 3px) calc(var(--u,1) * 10px); border-radius:999px; }
.tm .btn.round{ width:calc(var(--u,1) * 42px); height:calc(var(--u,1) * 42px); }
.tm .btn.round svg{ width:calc(var(--u,1) * 17px); height:calc(var(--u,1) * 17px); }
.tm.done .tm-time{ color:#b91c1c; }
.tm.done .tm-ring .prog{ stroke:#dc2626; }
@keyframes tm-flash{ 0%,100%{ background:transparent } 50%{ background:#fee2e2 } }
.tm.done{ animation:tm-flash .9s ease-in-out 6; border-radius:14px; }
`;

const ICON_PLAY  = '<svg viewBox="0 0 24 24"><path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.1-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 4h4v16H7V4Zm6 0h4v16h-4V4Z"/></svg>';
const ICON_RESET = '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z"/></svg>';

function fmt(totalSeconds){
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
}

export default {
  type:'timer',
  name:'Timer',
  blurb:'A countdown or a stopwatch, with a ring that empties as the time goes.',
  icon:'<svg viewBox="0 0 24 24"><path d="M9 2h6v2H9V2Zm2 5h2v6h-2V7Zm1-2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm6.3 1.1 1.4-1.4 1.8 1.8-1.4 1.4a10 10 0 0 0-1.8-1.8Z"/></svg>',
  css,
  /* The layout at scale 1 is about 250 x 290 — ring, mode chips, the control
     row and the presets. Locking to that ratio means growing the widget grows
     the clock, instead of parking a fixed clock in a bigger white box. */
  defaultSize:{ w:390, h:365 },
  minSize:{ w:240, h:225 },
  aspect: NAT.nw / NAT.nh,

  initialState: () => ({ mode:'countdown', duration:600 }),

  render(el, ctx){
    const st = ctx.state;

    /* Live run values live here, deliberately outside ctx.state. */
    let remaining = st.duration;
    let elapsed = 0;
    let running = false;
    let lastTick = 0;
    let raf = null;
    /* Presets STACK (teacher request 2026-09-23): the first press sets the
       time, and each further preset press in a row adds to it — 10m, 10m,
       5m is 25:00. Anything else (start, reset, +/−, a mode change) ends the
       run of presses, so the next preset sets afresh. */
    let stacking = false;

    el.innerHTML = `
      <div class="tm">
        <div class="tm-modes">
          <button class="chip" data-mode="countdown" type="button">Countdown</button>
          <button class="chip" data-mode="stopwatch" type="button">Stopwatch</button>
        </div>
        <div class="tm-face">
          <svg class="tm-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="track" cx="60" cy="60" r="${R}"></circle>
            <circle class="prog" cx="60" cy="60" r="${R}"></circle>
          </svg>
          <div class="tm-time" role="timer" aria-live="off">00:00</div>
        </div>
        <div class="tm-ctrl">
          <button class="btn ghost adj" data-delta="-60" type="button" title="One minute less">&minus;</button>
          <button class="btn primary round go" type="button" aria-label="Start">${ICON_PLAY}</button>
          <button class="btn round reset" type="button" aria-label="Reset" title="Reset">${ICON_RESET}</button>
          <button class="btn ghost adj" data-delta="60" type="button" title="One minute more">+</button>
        </div>
        <div class="tm-presets"></div>
      </div>`;

    const root    = el.querySelector('.tm');
    const timeEl  = el.querySelector('.tm-time');
    const progEl  = el.querySelector('.prog');
    const goBtn   = el.querySelector('.go');
    const presets = el.querySelector('.tm-presets');
    const adjBtns = [...el.querySelectorAll('.adj')];
    const modeBtns= [...el.querySelectorAll('[data-mode]')];

    PRESETS.forEach(min => {
      const b = document.createElement('button');
      b.className = 'chip'; b.type = 'button'; b.textContent = min + 'm';
      b.title = `Set ${min} minutes — press again to add ${min} more`;
      b.addEventListener('click', () => {
        stop();
        const next = stacking ? Math.min(5 * 3600, st.duration + min * 60) : min * 60;
        stacking = true;
        ctx.setState({ duration: next });
        remaining = next; elapsed = 0;
        root.classList.remove('done');
        paint();
      });
      presets.appendChild(b);
    });

    function paint(){
      const countdown = st.mode === 'countdown';
      const value = countdown ? remaining : elapsed;
      const label = fmt(value);
      timeEl.textContent = label;
      timeEl.classList.toggle('small', label.length > 5);

      let frac;
      if(countdown) frac = st.duration > 0 ? remaining / st.duration : 0;
      else frac = (elapsed % 60) / 60;                 /* stopwatch: one sweep a minute */
      progEl.style.strokeDashoffset = String(CIRC * (1 - Math.max(0, Math.min(1, frac))));

      goBtn.innerHTML = running ? ICON_PAUSE : ICON_PLAY;
      goBtn.setAttribute('aria-label', running ? 'Pause' : 'Start');

      modeBtns.forEach(b => b.classList.toggle('on', b.dataset.mode === st.mode));
      adjBtns.forEach(b => { b.style.visibility = countdown ? 'visible' : 'hidden'; });
      presets.style.visibility = countdown ? 'visible' : 'hidden';

      ctx.setTitle(countdown ? 'Timer' : 'Stopwatch');
    }

    function frame(now){
      if(!running) return;
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      if(st.mode === 'countdown'){
        remaining -= dt;
        if(remaining <= 0){
          remaining = 0;
          stop();
          root.classList.add('done');
          chime(3);
          paint();
          return;
        }
      }else{
        elapsed += dt;
      }
      paint();
      raf = requestAnimationFrame(frame);
    }

    function start(){
      stacking = false;
      if(st.mode === 'countdown' && remaining <= 0) remaining = st.duration;
      running = true;
      root.classList.remove('done');
      lastTick = performance.now();
      raf = requestAnimationFrame(frame);
      paint();
    }
    function stop(){
      running = false;
      if(raf) cancelAnimationFrame(raf);
      raf = null;
      paint();
    }

    goBtn.addEventListener('click', () => running ? stop() : start());

    el.querySelector('.reset').addEventListener('click', () => {
      stop();
      stacking = false;
      remaining = st.duration; elapsed = 0;
      root.classList.remove('done');
      paint();
    });

    adjBtns.forEach(b => b.addEventListener('click', () => {
      const delta = Number(b.dataset.delta);
      stacking = false;
      const next = Math.max(60, Math.min(5 * 3600, st.duration + delta));
      ctx.setState({ duration: next });
      if(!running){ remaining = next; root.classList.remove('done'); }
      paint();
    }));

    modeBtns.forEach(b => b.addEventListener('click', () => {
      stop();
      stacking = false;
      ctx.setState({ mode: b.dataset.mode });
      remaining = st.duration; elapsed = 0;
      root.classList.remove('done');
      paint();
    }));

    /* How far the face can grow once the controls have collapsed. offsetWidth,
       not getBoundingClientRect — the rect already has the transform applied,
       so measuring it would feed the scale back into itself and the clock
       would creep bigger on every resize. */
    function paintZoom(){
      const face = el.querySelector('.tm-face');
      if(!face) return;
      const fw = face.offsetWidth, fh = face.offsetHeight;
      if(!fw || !fh) return;
      const zoom = Math.max(1, Math.min(
        (el.clientWidth  * 0.92) / fw,
        (el.clientHeight * 0.92) / fh,
        2.6));                                  /* a ring bigger than this is
                                                   all line and no numbers */
      el.querySelector('.tm').style.setProperty('--tmzoom', zoom.toFixed(3));
    }

    fitUnit(el, NAT);
    paint();
    paintZoom();

    return () => { if(raf) cancelAnimationFrame(raf); };
  },

  onResize(el){
    fitUnit(el, NAT);
    const face = el.querySelector('.tm-face'), tm = el.querySelector('.tm');
    if(!face || !tm) return;
    const fw = face.offsetWidth, fh = face.offsetHeight;
    if(!fw || !fh) return;
    tm.style.setProperty('--tmzoom', Math.max(1, Math.min(
      (el.clientWidth * 0.92) / fw, (el.clientHeight * 0.92) / fh, 2.6)).toFixed(3));
  },
};
