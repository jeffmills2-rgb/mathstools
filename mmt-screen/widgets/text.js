/* =========================================================== Text widget
   The instructions box: what the class should be doing, in large type.

   TWO THINGS MAKE THIS USEFUL RATHER THAN A STICKY NOTE. First, the type
   scales with the box, so the same widget works as a headline across the
   top of the board and as a small note in a corner — a fixed font size
   would force a compromise that is wrong at both ends of a classroom.
   Second, the text is edited in place: no modal, no save button. A teacher
   changing the task mid-lesson is standing at the board, not sitting down.
   ======================================================================= */

import { fitUnit } from './shared.js';

const TONES = [
  { id:'plain',  name:'Plain',  bg:'#ffffff', ink:'#0f172a', edge:'#e2e8f0' },
  { id:'blue',   name:'Blue',   bg:'#dbeafe', ink:'#1e3a8a', edge:'#bfdbfe' },
  { id:'green',  name:'Green',  bg:'#dcfce7', ink:'#14532d', edge:'#bbf7d0' },
  { id:'amber',  name:'Amber',  bg:'#fef3c7', ink:'#78350f', edge:'#fde68a' },
  { id:'purple', name:'Purple', bg:'#ede9fe', ink:'#4c1d95', edge:'#ddd6fe' },
  { id:'dark',   name:'Dark',   bg:'#0f172a', ink:'#f8fafc', edge:'#1e293b' },
];

const css = `
.tx{ height:100%; display:flex; flex-direction:column; }
.tx-bar{ display:flex; align-items:center; gap:4px; padding:.3rem .45rem; flex:none;
         border-bottom:1px solid var(--line); background:var(--surface-soft);
         opacity:0; transition:opacity .18s ease; }
.w:hover .tx-bar{ opacity:1; }
.tx-tone{ width:18px; height:18px; border-radius:50%; border:1px solid rgba(15,23,42,.18); cursor:pointer; padding:0; }
.tx-tone.on{ box-shadow:0 0 0 2px #2563eb; }
.tx-sizes{ margin-left:auto; display:flex; gap:3px; }
.tx-sizes button{ border:0; background:none; border-radius:6px; padding:.15rem .4rem;
                  font-size:.72rem; font-weight:700; color:#94a3b8; cursor:pointer; }
.tx-sizes button:hover{ background:#e2e8f0; color:#0f172a; }
.tx-sizes button.on{ background:#dbeafe; color:#1d4ed8; }
.tx-body{ flex:1; min-height:0; overflow:auto; padding:calc(var(--u,1) * 14px);
          font-size:calc(var(--u,1) * var(--txs,26) * 1px); font-weight:650; line-height:1.34;
          letter-spacing:-.02em; outline:none; }
.tx-body:empty::before{ content:attr(data-placeholder); color:#94a3b8; font-weight:550; }
.tx-body.center{ display:flex; flex-direction:column; justify-content:center; text-align:center; }
`;

export default {
  type:'text',
  name:'Instructions',
  blurb:'A box of text in large type — the task, the page, the reminder.',
  icon:'<svg viewBox="0 0 24 24"><path d="M4 4h16v3h-6v13h-4V7H4V4Z"/></svg>',
  css,
  defaultSize:{ w:520, h:260 },
  minSize:{ w:220, h:130 },

  initialState: () => ({ text:'', tone:'plain', size:26, center:true }),

  render(el, ctx){
    const st = ctx.state;

    el.innerHTML = `
      <div class="tx">
        <div class="tx-bar">
          ${TONES.map(t => `<button class="tx-tone" data-tone="${t.id}" type="button" title="${t.name}" aria-label="${t.name}" style="background:${t.bg}"></button>`).join('')}
          <div class="tx-sizes">
            <button data-size="18" type="button" title="Small">S</button>
            <button data-size="26" type="button" title="Medium">M</button>
            <button data-size="40" type="button" title="Large">L</button>
            <button data-size="58" type="button" title="Huge">XL</button>
          </div>
        </div>
        <div class="tx-body" contenteditable="true" spellcheck="false"
             data-placeholder="Type the instructions for the class…"></div>
      </div>`;

    const body = el.querySelector('.tx-body');
    body.innerHTML = st.text || '';

    function paint(){
      const tone = TONES.find(t => t.id === st.tone) || TONES[0];
      body.style.background = tone.bg;
      body.style.color = tone.ink;
      el.closest('.w').style.borderColor = tone.edge;
      body.style.setProperty('--txs', st.size);
      body.classList.toggle('center', !!st.center);
      el.querySelectorAll('.tx-tone').forEach(b => b.classList.toggle('on', b.dataset.tone === st.tone));
      el.querySelectorAll('.tx-sizes button').forEach(b => b.classList.toggle('on', Number(b.dataset.size) === st.size));
    }

    el.querySelectorAll('.tx-tone').forEach(b =>
      b.addEventListener('click', () => { ctx.setState({ tone:b.dataset.tone }); paint(); }));
    el.querySelectorAll('.tx-sizes button').forEach(b =>
      b.addEventListener('click', () => { ctx.setState({ size:Number(b.dataset.size) }); paint(); }));

    /* innerHTML, not textContent: line breaks are the one bit of structure a
       teacher actually uses here. Nothing else is pasted in as markup —
       paste is forced to plain text just below. */
    body.addEventListener('input', () => ctx.setState({ text: body.innerHTML }));
    body.addEventListener('paste', e => {
      e.preventDefault();
      const plain = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, plain);
    });

    fitUnit(el, { base: 260, min: 0.7, max: 2.2 });
    paint();
  },

  onResize(el){ fitUnit(el, { base: 260, min: 0.7, max: 2.2 }); },
};
