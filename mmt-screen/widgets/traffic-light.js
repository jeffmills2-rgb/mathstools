/* ===================================================== Traffic light widget
   Three lamps, and nothing else.

   It carried a caption beside it once — an editable line saying what each
   colour meant. It went because a traffic light on a classroom wall does not
   come with a paragraph: the class is told what green means in week one and
   the light is a reminder, not an explanation. On the board the text was the
   part that forced a wide white card, and most of that card was empty.

   THE WIDGET IS THE SHAPE OF THE LIGHT. `aspect` locks the card to the
   proportions of the case, so dragging it bigger grows the lamps and nothing
   else. There is no size of this widget with space going spare, which is the
   whole point — and it is the same idea behind every other widget's natural
   size, just at its most obvious here.

   The chosen lamp IS saved, unlike the timer's countdown: "we are on green"
   is a standing instruction for the lesson, not a running clock, so a reload
   or a projector reconnect must bring it back exactly as it was.
   ========================================================================= */

import { fitUnit } from './shared.js';

/* NAT is the CASE ITSELF at --u: 1 — three 56px lamps, two 10px gaps, 12px
   of padding each side. It was measured with a guess at the widget's own
   padding and header baked in, which made every u about 25% too small and
   left the light filling barely half the card it was supposed to hug. The
   border round it comes from fitUnit's `pad`, which is what that is for. */
const NAT = { nw: 80, nh: 212 };

const css = `
.tl{ height:100%; display:grid; place-items:center; }
.tl-case{
  display:flex; flex-direction:column; gap:calc(var(--u,1) * 10px);
  padding:calc(var(--u,1) * 12px);
  border-radius:calc(var(--u,1) * 18px);
  background:linear-gradient(160deg,#334155,#0f172a);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14), 0 10px 24px rgba(15,23,42,.28);
}
.tl-lamp{
  width:calc(var(--u,1) * 56px); height:calc(var(--u,1) * 56px); border-radius:50%;
  border:0; padding:0; cursor:pointer; position:relative;
  background:#1e293b; box-shadow:inset 0 3px 8px rgba(0,0,0,.6);
  transition:box-shadow .22s ease, background .22s ease, transform .16s ease;
}
.tl-lamp:hover{ transform:scale(1.04); }
.tl-lamp[data-lamp="red"].on{   background:radial-gradient(circle at 36% 30%,#fca5a5,#dc2626 62%,#991b1b);
                                box-shadow:0 0 calc(var(--u,1)*22px) rgba(239,68,68,.75), inset 0 2px 6px rgba(255,255,255,.28); }
.tl-lamp[data-lamp="amber"].on{ background:radial-gradient(circle at 36% 30%,#fde68a,#f59e0b 62%,#b45309);
                                box-shadow:0 0 calc(var(--u,1)*22px) rgba(245,158,11,.75), inset 0 2px 6px rgba(255,255,255,.28); }
.tl-lamp[data-lamp="green"].on{ background:radial-gradient(circle at 36% 30%,#86efac,#22c55e 62%,#15803d);
                                box-shadow:0 0 calc(var(--u,1)*22px) rgba(34,197,94,.75), inset 0 2px 6px rgba(255,255,255,.28); }
`;

export default {
  type:'traffic',
  name:'Traffic light',
  blurb:'Red, amber or green. Click a lamp to change it.',
  icon:'<svg viewBox="0 0 24 24"><path d="M8 2h8a2 2 0 0 1 2 2v14a6 6 0 0 1-12 0V4a2 2 0 0 1 2-2Zm4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>',
  css,
  defaultSize:{ w:140, h:371 },
  minSize:{ w:60, h:159 },
  aspect: NAT.nw / NAT.nh,
  headOverlay: true,

  initialState: () => ({ lamp:'green' }),

  render(el, ctx){
    const st = ctx.state;

    el.innerHTML = `
      <div class="tl">
        <div class="tl-case">
          <button class="tl-lamp" data-lamp="red"   type="button" aria-label="Red"></button>
          <button class="tl-lamp" data-lamp="amber" type="button" aria-label="Amber"></button>
          <button class="tl-lamp" data-lamp="green" type="button" aria-label="Green"></button>
        </div>
      </div>`;

    const lamps = [...el.querySelectorAll('.tl-lamp')];
    const paint = () => lamps.forEach(l => l.classList.toggle('on', l.dataset.lamp === st.lamp));

    lamps.forEach(l => l.addEventListener('click', () => {
      ctx.setState({ lamp: l.dataset.lamp });
      paint();
    }));

    fitUnit(el, NAT);
    paint();
  },

  onResize(el){ fitUnit(el, NAT); },
};
