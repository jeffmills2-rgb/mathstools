/* ===================================================== Traffic light widget
   Three lamps that say how the room should be working.

   The light is SAVED, unlike the timer's countdown: "we are on green" is a
   standing instruction for the lesson, not a running clock, so a reload or a
   projector reconnect must bring it back exactly as it was.

   Each lamp carries a short caption the teacher can rewrite. The captions
   are the reason the widget earns its space — a bare green circle means
   whatever the class last decided it meant.
   ========================================================================= */

import { fitUnit } from './shared.js';

const DEFAULTS = {
  red:   'Silent — work on your own',
  amber: 'Quiet — partner talk only',
  green: 'Work together — ask each other first',
};

const css = `
.tl{ height:100%; display:flex; align-items:center; justify-content:center;
     gap:calc(var(--u,1) * 14px); padding:calc(var(--u,1) * 12px); }
.tl-case{ display:flex; flex-direction:column; gap:calc(var(--u,1) * 10px);
          padding:calc(var(--u,1) * 12px); border-radius:calc(var(--u,1) * 18px);
          background:linear-gradient(160deg,#334155,#0f172a);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.14), 0 10px 24px rgba(15,23,42,.28); flex:none; }
.tl-lamp{ width:calc(var(--u,1) * 56px); height:calc(var(--u,1) * 56px); border-radius:50%;
          border:0; padding:0; cursor:pointer; position:relative;
          background:#1e293b; box-shadow:inset 0 3px 8px rgba(0,0,0,.6);
          transition:box-shadow .22s ease, background .22s ease, transform .16s ease; }
.tl-lamp:hover{ transform:scale(1.04); }
.tl-lamp[data-lamp="red"].on{   background:radial-gradient(circle at 36% 30%,#fca5a5,#dc2626 62%,#991b1b);
                                box-shadow:0 0 calc(var(--u,1)*22px) rgba(239,68,68,.75), inset 0 2px 6px rgba(255,255,255,.28); }
.tl-lamp[data-lamp="amber"].on{ background:radial-gradient(circle at 36% 30%,#fde68a,#f59e0b 62%,#b45309);
                                box-shadow:0 0 calc(var(--u,1)*22px) rgba(245,158,11,.75), inset 0 2px 6px rgba(255,255,255,.28); }
.tl-lamp[data-lamp="green"].on{ background:radial-gradient(circle at 36% 30%,#86efac,#22c55e 62%,#15803d);
                                box-shadow:0 0 calc(var(--u,1)*22px) rgba(34,197,94,.75), inset 0 2px 6px rgba(255,255,255,.28); }
.tl-say{ min-width:0; flex:1; }
.tl-cap{ font-size:calc(var(--u,1) * 19px); font-weight:700; line-height:1.28; letter-spacing:-.02em;
         color:#0f172a; border:1px solid transparent; border-radius:10px; padding:.3rem .45rem;
         cursor:text; outline:none; }
.tl-cap:hover{ border-color:#e2e8f0; }
.tl-cap:focus{ border-color:#2563eb; background:#fff; }
.tl-hint{ margin-top:calc(var(--u,1) * 6px); font-size:calc(var(--u,1) * 11px); color:#94a3b8; }
.tl.compact .tl-say{ display:none; }
`;

export default {
  type:'traffic',
  name:'Traffic light',
  blurb:'Red, amber or green — with a caption that says what each one means.',
  icon:'<svg viewBox="0 0 24 24"><path d="M8 2h8a2 2 0 0 1 2 2v14a6 6 0 0 1-12 0V4a2 2 0 0 1 2-2Zm4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>',
  css,
  defaultSize:{ w:460, h:280 },
  minSize:{ w:150, h:220 },

  initialState: () => ({ lamp:'green', captions:{ ...DEFAULTS } }),

  render(el, ctx){
    const st = ctx.state;
    if(!st.captions) st.captions = { ...DEFAULTS };

    el.innerHTML = `
      <div class="tl">
        <div class="tl-case">
          <button class="tl-lamp" data-lamp="red"   type="button" aria-label="Red"></button>
          <button class="tl-lamp" data-lamp="amber" type="button" aria-label="Amber"></button>
          <button class="tl-lamp" data-lamp="green" type="button" aria-label="Green"></button>
        </div>
        <div class="tl-say">
          <div class="tl-cap" contenteditable="true" spellcheck="false"></div>
          <div class="tl-hint">Click a lamp to change it. Click the words to rewrite them.</div>
        </div>
      </div>`;

    const root = el.querySelector('.tl');
    const cap  = el.querySelector('.tl-cap');
    const lamps = [...el.querySelectorAll('.tl-lamp')];

    function paint(){
      lamps.forEach(l => l.classList.toggle('on', l.dataset.lamp === st.lamp));
      if(document.activeElement !== cap) cap.textContent = st.captions[st.lamp] || '';
      root.classList.toggle('compact', el.clientWidth < 260);
    }

    lamps.forEach(l => l.addEventListener('click', () => {
      ctx.setState({ lamp: l.dataset.lamp });
      paint();
    }));

    cap.addEventListener('input', () => {
      st.captions[st.lamp] = cap.textContent.trim();
      ctx.setState({ captions: st.captions });
    });
    /* Enter should commit, not open a second line inside a one-line caption. */
    cap.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); cap.blur(); } });
    cap.addEventListener('blur', paint);

    fitUnit(el, { base: 280 });
    paint();
  },

  onResize(el, ctx){
    fitUnit(el, { base: 280 });
    const root = el.querySelector('.tl');
    if(root) root.classList.toggle('compact', el.clientWidth < 260);
  },
};
