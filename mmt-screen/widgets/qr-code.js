/* ======================================================= QR code widget
   Type a link, press Generate, and the class points their phones at the board.

   THE CODE IS GENERATED ON THE LAPTOP, NOT BY A WEBSITE. The encoder is
   vendored in ./vendor/qrcodegen.js, so there is no QR API to be blocked by
   the school filter, nothing to go down mid-lesson, and — the one that
   matters — the link a teacher types is never sent to a third party. A class
   Google Classroom or Forms link is not something to hand to a free QR site.

   A BARE DOMAIN GETS https:// IN FRONT OF IT. Typed as `mathstools.com.au`,
   most phone cameras read the code as plain TEXT and offer to search for it
   rather than open it, which looks exactly like the code being broken. Only
   something that is unmistakably a web address is touched: no spaces, and a
   last label of letters (so `3.14` stays a number). Anything with a scheme of
   its own (`mailto:`, `tel:`, `https:`) and anything that is ordinary text is
   encoded exactly as typed. The hint under the box says what phones will open
   before Generate is pressed, so the teacher is never surprised.

   THE GENERATED TEXT IS SAVED, not only what is in the box. A code on the
   board is what thirty phones are pointed at — a projector blink or a lid-open
   must bring back the SAME code, not an empty box. Edit keeps the old code
   until Generate is pressed again, and Cancel goes straight back to it.

   DARK ON WHITE, SQUARE MODULES, ALWAYS. Rounded dots, brand-coloured eyes and
   inverted codes all scan on a phone held against a monitor and then fail from
   the back row off a washed-out projector. The MMT styling is on the card, not
   in the code.
   ====================================================================== */

import { fitUnit, escapeHtml } from './shared.js';
import qrcodegen from './vendor/qrcodegen.js';

const { QrCode } = qrcodegen;
const NAT_EDIT = { nw: 250, nh: 250 };   /* badge, box, hint, button */
const NAT_SHOW = { nw: 240, nh: 270 };   /* the code and its caption */

/* Past this many characters the code gets dense enough that the back of a
   classroom struggles to read it off a projector. It still works — it just
   deserves a heads-up. */
const DENSE = 180;

/* The MMT badge: the dock's blue-to-teal tile with a white code in it. Drawn
   for this widget, not taken from anywhere, and deliberately the same gradient
   as a switched-on dock button so it reads as part of the board. */
const GLYPH = 'M4 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm.6 2a.6.6 0 0 0-.6.6v2.8a.6.6 0 0 0 .6.6h2.8a.6.6 0 0 0 .6-.6V4.6a.6.6 0 0 0-.6-.6H4.6ZM5 5h2v2H5Z' +
  'M16 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm.6 2a.6.6 0 0 0-.6.6v2.8a.6.6 0 0 0 .6.6h2.8a.6.6 0 0 0 .6-.6V4.6a.6.6 0 0 0-.6-.6h-2.8ZM17 5h2v2h-2Z' +
  'M4 14h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Zm.6 2a.6.6 0 0 0-.6.6v2.8a.6.6 0 0 0 .6.6h2.8a.6.6 0 0 0 .6-.6v-2.8a.6.6 0 0 0-.6-.6H4.6ZM5 17h2v2H5Z' +
  'M13 13h3v3h-3Zm5.5 0H22v2.5h-3.5ZM16 16h2.5v3H16Zm-3 3.5h3V22h-3Zm6-1h3V22h-3Z';

const BADGE = `
  <svg class="qr-badge" viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="qrBadgeFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#14b8a6"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#qrBadgeFill)"/>
    <rect x="2" y="2" width="60" height="30" rx="16" fill="#fff" opacity=".08"/>
    <g transform="translate(14 14) scale(1.5)"><path fill="#fff" fill-rule="evenodd" d="${GLYPH}"/></g>
  </svg>`;

const css = `
.qr{ height:100%; position:relative; }

/* ---- typing ---- */
.qr-edit{ height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:calc(var(--u,1) * 10px); padding:calc(var(--u,1) * 12px); box-sizing:border-box; }
.qr-badge{ width:calc(var(--u,1) * 54px); height:calc(var(--u,1) * 54px); flex:none;
           filter:drop-shadow(0 calc(var(--u,1)*4px) calc(var(--u,1)*8px) rgba(37,99,235,.28)); }
.qr-input{ width:100%; flex:1; min-height:calc(var(--u,1) * 60px); max-height:calc(var(--u,1) * 110px);
           box-sizing:border-box; font-size:calc(var(--u,1) * 15px); line-height:1.4;
           padding:calc(var(--u,1) * 9px) calc(var(--u,1) * 11px); border-radius:calc(var(--u,1) * 12px); }
.qr-hint{ min-height:1.3em; width:100%; text-align:center; font-size:calc(var(--u,1) * 11.5px);
          color:var(--muted); font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.qr-hint b{ color:var(--brand); font-weight:700; }
.qr-hint.warn{ color:var(--orange); white-space:normal; }
.qr-row{ display:flex; gap:calc(var(--u,1) * 6px); align-items:center; }
.qr-row .btn{ font-size:calc(var(--u,1) * 14px); padding:calc(var(--u,1) * 8px) calc(var(--u,1) * 16px);
              border-radius:999px; white-space:nowrap; }

/* ---- showing ---- */
.qr-show{ height:100%; display:flex; flex-direction:column; align-items:center;
          padding:calc(var(--u,1) * 8px); gap:calc(var(--u,1) * 4px); box-sizing:border-box; }
.qr-code{ flex:1; min-height:0; width:100%; position:relative; }
.qr-code svg{ position:absolute; inset:0; width:100%; height:100%; display:block; }
.qr-cap{ flex:none; max-width:100%; font-size:calc(var(--u,1) * 12px); font-weight:700; color:var(--ink);
         letter-spacing:-.01em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.qr-cap:empty{ display:none; }
.qr-foot{ position:absolute; left:0; right:0; bottom:0; display:flex; align-items:center; gap:5px;
          padding:.4rem .5rem; border-top:1px solid var(--line); background:rgba(248,250,252,.96);
          opacity:0; pointer-events:none; transition:opacity .18s ease; z-index:3; }
.w:hover .qr-foot{ opacity:1; pointer-events:auto; }
.qr-foot .spacer{ flex:1; }
.qr-foot .chip{ cursor:pointer; }
.qr-foot .btn.icon{ padding:.3rem; width:32px; height:32px; display:inline-grid; place-items:center; }
`;

/* What phones will actually receive. See the note at the top. */
export function toPayload(raw){
  const s = String(raw || '').trim();
  if(!s) return '';
  if(/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
  if(/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]\S*)?$/i.test(s)) return 'https://' + s;
  return s;
}

const looksLikeLink = p => /^https?:\/\//i.test(p);
const shortLink = p => p.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');

/* Throws when the text is too long for any QR code (about 2,300 characters
   of ordinary text at the error correction used here). */
function encode(payload){
  return QrCode.encodeText(payload, QrCode.Ecc.MEDIUM);
}

function svgFor(qr, border){
  const n = qr.size + border * 2;
  let d = '';
  for(let y = 0; y < qr.size; y++){
    for(let x = 0; x < qr.size; x++){
      if(qr.getModule(x, y)) d += `M${x + border} ${y + border}h1v1h-1z`;
    }
  }
  return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="QR code">` +
         `<rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="#0f172a"/></svg>`;
}

/* A proper file for slides and worksheets: full four-module quiet zone, and
   big enough (≥ 1000px) not to blur when stretched across a slide. */
function pngBlob(qr){
  const border = 4, n = qr.size + border * 2;
  const scale = Math.max(8, Math.ceil(1024 / n));
  const c = document.createElement('canvas');
  c.width = c.height = n * scale;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#0f172a';
  for(let y = 0; y < qr.size; y++){
    for(let x = 0; x < qr.size; x++){
      if(qr.getModule(x, y)) g.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
    }
  }
  return new Promise(res => c.toBlob(res, 'image/png'));
}

export default {
  type:'qr',
  name:'QR code',
  blurb:'Turn a link into a QR code the class can scan with their phones.',
  icon:`<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="${GLYPH}"/></svg>`,
  css,
  defaultSize:{ w:340, h:380 },
  minSize:{ w:200, h:220 },
  headOverlay: true,

  initialState: () => ({ text:'', code:null, caption:true }),

  render(el, ctx){
    const st = ctx.state;
    let editing = !st.code;
    let qr = null;

    function paint(){
      if(editing) paintEdit(); else paintShow();
    }

    function paintEdit(){
      el.innerHTML = `
        <div class="qr"><div class="qr-edit">
          ${BADGE}
          <textarea class="field qr-input" spellcheck="false" autocomplete="off"
            placeholder="Paste a link or type some text…"></textarea>
          <div class="qr-hint"></div>
          <div class="qr-row">
            ${st.code ? '<button class="btn ghost cancel" type="button">Cancel</button>' : ''}
            <button class="btn primary go" type="button">Generate QR code</button>
          </div>
        </div></div>`;

      const input = el.querySelector('.qr-input');
      const hint  = el.querySelector('.qr-hint');
      const go    = el.querySelector('.go');
      input.value = st.text || '';

      const update = () => {
        const p = toPayload(input.value);
        go.disabled = !p;
        hint.classList.remove('warn');
        if(!p){ hint.textContent = ''; return; }
        if(p.length > DENSE){
          hint.classList.add('warn');
          hint.textContent = 'That is a lot of text — the code will be dense and harder to scan from the back of the room.';
        }else if(looksLikeLink(p)){
          hint.innerHTML = `Phones will open <b>${escapeHtml(p)}</b>`;
        }else{
          hint.textContent = 'Phones will show this as text';
        }
      };

      const generate = () => {
        const p = toPayload(input.value);
        if(!p) return;
        try{ encode(p); }
        catch(err){
          hint.classList.add('warn');
          hint.textContent = 'Too long to fit in a QR code. Try a shorter link.';
          return;
        }
        ctx.setState({ text: input.value, code: p });
        editing = false;
        paint();
      };

      input.addEventListener('input', () => { ctx.setState({ text: input.value }); update(); });
      /* Enter makes the code — a link never needs a new line. Shift+Enter
         still gives one for anyone encoding a few lines of text. */
      input.addEventListener('keydown', e => {
        if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); generate(); }
      });
      go.addEventListener('click', generate);
      const cancel = el.querySelector('.cancel');
      if(cancel) cancel.addEventListener('click', () => { editing = false; paint(); });

      update();
      fitUnit(el, NAT_EDIT);
      requestAnimationFrame(() => { if(el.isConnected && !st.code) input.focus(); });
    }

    function paintShow(){
      try{ qr = encode(st.code); }
      catch(err){ editing = true; return paintEdit(); }

      const cap = looksLikeLink(st.code) ? shortLink(st.code) : st.code.split('\n')[0];
      el.innerHTML = `
        <div class="qr"><div class="qr-show">
          <div class="qr-code">${svgFor(qr, 1)}</div>
          <div class="qr-cap"></div>
        </div>
        <div class="qr-foot">
          <button class="chip capBtn" type="button" title="Show the link under the code">Show link</button>
          <span class="spacer"></span>
          <button class="btn ghost icon copy" type="button" title="Copy the QR code as a picture" aria-label="Copy">
            <svg viewBox="0 0 24 24"><path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1Zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16h-9V7h9v14Z"/></svg>
          </button>
          <button class="btn ghost icon save" type="button" title="Download as a picture" aria-label="Download">
            <svg viewBox="0 0 24 24"><path d="M11 3h2v9.2l3.3-3.3 1.4 1.4L12 16l-5.7-5.7 1.4-1.4 3.3 3.3V3ZM5 18h14v2H5v-2Z"/></svg>
          </button>
          <button class="btn edit" type="button">Edit</button>
        </div></div>`;

      const capEl = el.querySelector('.qr-cap');
      const capBtn = el.querySelector('.capBtn');
      const paintCap = () => {
        capEl.textContent = st.caption ? cap : '';
        capEl.title = st.code;
        capBtn.classList.toggle('on', !!st.caption);
      };
      capBtn.addEventListener('click', () => { ctx.setState({ caption: !st.caption }); paintCap(); });

      el.querySelector('.edit').addEventListener('click', () => { editing = true; paint(); });

      el.querySelector('.save').addEventListener('click', async () => {
        const blob = await pngBlob(qr);
        const a = document.createElement('a');
        let name = 'qr-code';
        try{ if(looksLikeLink(st.code)) name = 'qr-' + new URL(st.code).hostname.replace(/^www\./, ''); }catch(e){}
        a.href = URL.createObjectURL(blob);
        a.download = name.replace(/[^a-z0-9.-]+/gi, '-') + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      });

      el.querySelector('.copy').addEventListener('click', async () => {
        try{
          await navigator.clipboard.write([ new ClipboardItem({ 'image/png': pngBlob(qr) }) ]);
          ctx.toast('QR code copied — paste it into your slides');
        }catch(err){
          ctx.toast('This browser will not copy pictures — use Download instead');
        }
      });

      paintCap();
      fitUnit(el, NAT_SHOW);
    }

    paint();
  },

  onResize(el, ctx){
    fitUnit(el, el.querySelector('.qr-edit') ? NAT_EDIT : NAT_SHOW);
  },
};
