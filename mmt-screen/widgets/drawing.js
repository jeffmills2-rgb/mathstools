/* ========================================================= Drawing widget
   A full-board annotation layer: pen, highlighter, eraser.

   THIS IS NOT A PANEL. It covers the whole board and sits above every
   widget, which is the only arrangement that lets a teacher ring a number
   on the timer or underline a word in the instructions box. Because of
   that it is a SINGLETON and it has an explicit OFF mode: a transparent
   full-screen canvas that always swallows clicks would make every other
   widget unusable the moment the pen came out. Off is the default whenever
   the pen is put down.

   STROKES ARE STORED AS POINTS, NOT PIXELS. A canvas bitmap would have to
   be thrown away or stretched every time the window changed size — and the
   window changes size every time this is plugged into a projector. Points
   are re-drawn crisply at any size and survive a reload, at a fraction of
   the storage. The list is capped so a whole day of annotation cannot
   silently fill the browser's quota.
   ======================================================================= */

const MAX_STROKES = 400;

const COLOURS = [
  { id:'ink',    hex:'#0f172a' },
  { id:'red',    hex:'#dc2626' },
  { id:'blue',   hex:'#2563eb' },
  { id:'green',  hex:'#16a34a' },
  { id:'amber',  hex:'#f59e0b' },
  { id:'purple', hex:'#7c3aed' },
];
const WIDTHS = [3, 6, 12];

const css = `
.dw-canvas{ position:fixed; inset:0; z-index:1; pointer-events:none; touch-action:none; }
.dw-canvas.live{ pointer-events:auto; cursor:crosshair; }
.dw-bar{ position:fixed; left:1rem; top:50%; transform:translateY(-50%); z-index:4;
         display:flex; flex-direction:column; gap:.3rem; padding:.5rem;
         border-radius:18px; background:rgba(15,23,42,.9); backdrop-filter:blur(12px);
         border:1px solid rgba(255,255,255,.12); box-shadow:0 26px 60px rgba(15,23,42,.34); }
.dw-bar button{ width:34px; height:34px; display:grid; place-items:center; border:0;
                border-radius:10px; background:rgba(255,255,255,.1); color:#fff; cursor:pointer;
                transition:background .16s ease, transform .16s ease; }
.dw-bar button:hover{ background:rgba(255,255,255,.24); transform:translateY(-1px); }
.dw-bar button.on{ background:linear-gradient(135deg,#2563eb,#14b8a6); }
.dw-bar button svg{ width:18px; height:18px; fill:currentColor; }
.dw-bar .sep{ height:1px; background:rgba(255,255,255,.18); margin:.25rem .2rem; }
.dw-swatch{ position:relative; }
.dw-swatch i{ display:block; width:16px; height:16px; border-radius:50%;
              box-shadow:inset 0 0 0 1px rgba(255,255,255,.35); }
.dw-swatch.on{ background:rgba(255,255,255,.3); }
.dw-w i{ display:block; background:#fff; border-radius:99px; }
`;

const I = {
  pen:   '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25ZM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg>',
  mark:  '<svg viewBox="0 0 24 24"><path d="M4 17.5 12.8 8.7l2.5 2.5L6.5 20H4v-2.5Zm13.6-9.1 2.5 2.5 1.3-1.3a1.8 1.8 0 0 0 0-2.5l-.1-.1a1.8 1.8 0 0 0-2.4 0l-1.3 1.4ZM3 21.5h18V23H3v-1.5Z"/></svg>',
  erase: '<svg viewBox="0 0 24 24"><path d="m16.2 3.3 4.5 4.5a2 2 0 0 1 0 2.8L12 19.3H7.5l-4.2-4.2a2 2 0 0 1 0-2.9l9.9-9.9a2 2 0 0 1 3 0ZM9 17.3h2.2l3.4-3.4-4.4-4.4-4 4L9 17.3Z"/></svg>',
  off:   '<svg viewBox="0 0 24 24"><path d="m4 3 2.1 1.6L20 18.5V21h-2.5l-3.4-3.4-1.6 1.6L9 16.7 6.5 19H4v-2.5l2.3-2.3-1.9-1.9L3 13.7V4l1-1Zm3.6 8.3 1.5 1.5 1.6-1.6-1.5-1.5-1.6 1.6Z"/></svg>',
  undo:  '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z"/></svg>',
  clear: '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 12.1a2 2 0 0 1-2 1.9H9a2 2 0 0 1-2-1.9L6 7Zm3.5-3h5l.8 1.5H19V7H5V5.5h3.7L9.5 4Z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3 1.4 1.4Z"/></svg>',
};

export default {
  type:'drawing',
  name:'Draw',
  blurb:'Draw over the whole board — pen, highlighter, eraser.',
  icon: I.pen,
  css,
  singleton:true,
  fullscreen:true,

  initialState: () => ({ mode:'pen', colour:'#dc2626', width:6, strokes:[] }),

  render(el, ctx){
    const st = ctx.state;
    if(!Array.isArray(st.strokes)) st.strokes = [];

    const canvas = document.createElement('canvas');
    canvas.className = 'dw-canvas';
    const bar = document.createElement('div');
    bar.className = 'dw-bar';
    el.append(canvas, bar);

    const g = canvas.getContext('2d');
    let drawing = false;
    let current = null;

    /* ------------------------------------------------------------ painting */
    function sizeCanvas(){
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = Math.round(window.innerWidth  * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width  = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }

    function strokePath(s){
      if(!s.pts.length) return;
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      if(s.mode === 'mark'){
        g.globalAlpha = 0.32;
        g.lineWidth = s.width * 3.2;
        g.globalCompositeOperation = 'source-over';
      }else if(s.mode === 'erase'){
        g.lineWidth = s.width * 4;
        g.globalCompositeOperation = 'destination-out';
      }else{
        g.lineWidth = s.width;
        g.globalCompositeOperation = 'source-over';
      }
      g.strokeStyle = s.colour;
      g.beginPath();
      /* Fractions of the viewport, so a stroke drawn on a laptop lands in the
         same place when the same screen opens on the projector. */
      const W = window.innerWidth, H = window.innerHeight;
      g.moveTo(s.pts[0][0] * W, s.pts[0][1] * H);
      if(s.pts.length === 1) g.lineTo(s.pts[0][0] * W + 0.1, s.pts[0][1] * H);
      for(let i = 1; i < s.pts.length; i++) g.lineTo(s.pts[i][0] * W, s.pts[i][1] * H);
      g.stroke();
      g.restore();
    }

    function redraw(){
      g.clearRect(0, 0, window.innerWidth, window.innerHeight);
      st.strokes.forEach(strokePath);
      if(current) strokePath(current);
    }

    /* ------------------------------------------------------------- input */
    function pt(e){
      return [ e.clientX / window.innerWidth, e.clientY / window.innerHeight ];
    }
    canvas.addEventListener('pointerdown', e => {
      if(st.mode === 'off') return;
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      current = { mode: st.mode, colour: st.colour, width: st.width, pts: [pt(e)] };
      redraw();
    });
    canvas.addEventListener('pointermove', e => {
      if(!drawing || !current) return;
      current.pts.push(pt(e));
      redraw();
    });
    function endStroke(e){
      if(!drawing) return;
      drawing = false;
      try{ canvas.releasePointerCapture(e.pointerId); }catch(_){}
      if(current && current.pts.length){
        st.strokes.push(current);
        if(st.strokes.length > MAX_STROKES) st.strokes.splice(0, st.strokes.length - MAX_STROKES);
        ctx.setState({ strokes: st.strokes });
      }
      current = null;
      redraw();
    }
    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);

    /* ------------------------------------------------------------ toolbar */
    function tool(icon, title, onClick, cls){
      const b = document.createElement('button');
      b.type = 'button'; b.title = title; b.setAttribute('aria-label', title);
      b.innerHTML = icon;
      if(cls) b.className = cls;
      b.addEventListener('click', onClick);
      bar.appendChild(b);
      return b;
    }
    function sep(){ const d = document.createElement('div'); d.className = 'sep'; bar.appendChild(d); }

    const modeBtns = {};
    modeBtns.pen   = tool(I.pen,   'Pen',         () => setMode('pen'));
    modeBtns.mark  = tool(I.mark,  'Highlighter', () => setMode('mark'));
    modeBtns.erase = tool(I.erase, 'Eraser',      () => setMode('erase'));
    modeBtns.off   = tool(I.off,   'Put the pen down — click widgets again', () => setMode('off'));
    sep();

    const swatches = COLOURS.map(c => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'dw-swatch'; b.title = c.id;
      b.setAttribute('aria-label', 'Colour ' + c.id);
      b.innerHTML = `<i style="background:${c.hex}"></i>`;
      b.addEventListener('click', () => { ctx.setState({ colour: c.hex }); paintBar(); });
      bar.appendChild(b);
      return { b, hex: c.hex };
    });
    sep();

    const widthBtns = WIDTHS.map(w => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'dw-w'; b.title = w + 'px';
      b.setAttribute('aria-label', 'Line width ' + w);
      b.innerHTML = `<i style="width:${w + 6}px;height:${Math.max(2, w - 1)}px"></i>`;
      b.addEventListener('click', () => { ctx.setState({ width: w }); paintBar(); });
      bar.appendChild(b);
      return { b, w };
    });
    sep();

    tool(I.undo, 'Undo the last stroke', () => {
      st.strokes.pop();
      ctx.setState({ strokes: st.strokes });
      redraw();
    });
    tool(I.clear, 'Rub it all out', () => {
      if(st.strokes.length && !confirm('Rub out everything drawn on this screen?')) return;
      ctx.setState({ strokes: [] });
      st.strokes = [];
      redraw();
    });
    tool(I.close, 'Close the drawing layer', () => ctx.remove());

    function setMode(mode){
      ctx.setState({ mode });
      paintBar();
    }
    function paintBar(){
      Object.entries(modeBtns).forEach(([m, b]) => b.classList.toggle('on', st.mode === m));
      swatches.forEach(s => s.b.classList.toggle('on', s.hex === st.colour));
      widthBtns.forEach(x => x.b.classList.toggle('on', x.w === st.width));
      canvas.classList.toggle('live', st.mode !== 'off');
    }

    const onResize = () => sizeCanvas();
    window.addEventListener('resize', onResize);

    /* ESCAPE PUTS THE PEN DOWN. Without this the layer is a trap: a live
       canvas covers the whole board, so the moment a teacher has drawn a
       ring around something they can no longer press Start on the timer,
       and nothing on screen explains why. Escape is the one key people
       already try when a tool will not let go. */
    const onKey = e => {
      if(e.key !== 'Escape' || st.mode === 'off') return;
      const t = e.target;
      if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      setMode('off');
      ctx.toast('Pen down — click the pen again to draw');
    };
    window.addEventListener('keydown', onKey);

    sizeCanvas();
    paintBar();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  },
};
