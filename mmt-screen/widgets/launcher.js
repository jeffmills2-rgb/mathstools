/* ================================================== MMT tool launcher widget
   Search every tool, worksheet creator, quiz, game and flip-card set on the
   site, and open one from the board.

   THERE IS NO LIST OF TOOLS IN THIS FILE, AND THERE MUST NEVER BE ONE.
   The widget fetches the site's own homepage and reads the resource cards out
   of it. Those cards already carry, for all 111 resources, exactly what a
   launcher needs — href, title, type, stage, topic, outcome code, and a
   data-search string of keywords Jeff wrote himself. A hand-kept copy here
   would be a second catalogue that silently rots: every tool added to the
   homepage would be missing from the board until someone remembered to add it
   twice, and nobody ever remembers the second time. Parsing the real page
   means the launcher is correct by construction, forever, for free.

   PARSED WITH DOMParser, NOT A REGEX. Beyond the usual reasons, the homepage
   mixes escaped and literal entities in the same attribute — "Years 7&#8211;10"
   and "Years 7–10" both appear as data-stage — and the parser decodes them to
   one string, so the stage filter does not end up with two of everything.

   CACHE FIRST, THEN REFRESH. The catalogue is kept in localStorage and shown
   immediately, while a fresh copy is fetched in the background. A teacher
   opening the board at the start of a lesson gets results the instant it
   paints, and a tool added last night is picked up without anyone clearing
   anything.
   ========================================================================= */

import { escapeHtml } from './shared.js';

const CACHE_KEY = 'mmtScreen.catalogue.v1';
const SOURCE = '/index.html';

/* data-type on the homepage cards -> what a teacher calls it */
const TYPES = {
  interactive: { label:'Tool',      tint:'#dbeafe', ink:'#1d4ed8' },
  worksheet:   { label:'Worksheet', tint:'#ffedd5', ink:'#c2410c' },
  quiz:        { label:'Quiz',      tint:'#dcfce7', ink:'#15803d' },
  game:        { label:'Game',      tint:'#ede9fe', ink:'#6d28d9' },
  flip:        { label:'Flip cards',tint:'#ccfbf1', ink:'#0f766e' },
  assessment:  { label:'Revision',  tint:'#fef3c7', ink:'#92400e' },
  dashboard:   { label:'Dashboard', tint:'#e2e8f0', ink:'#334155' },
  research:    { label:'Research',  tint:'#f1f5f9', ink:'#64748b' },
  place:       { label:'Section',   tint:'#e0e7ff', ink:'#4338ca' },
};
const FILTERS = [
  { id:'all',         label:'All' },
  { id:'interactive', label:'Tools' },
  { id:'worksheet',   label:'Worksheets' },
  { id:'quiz',        label:'Quizzes' },
  { id:'game',        label:'Games' },
  { id:'flip',        label:'Flip cards' },
];

const css = `
.ln{ height:100%; display:flex; flex-direction:column; }
.ln-top{ flex:none; padding:.6rem .65rem .5rem; border-bottom:1px solid var(--line); }
.ln-search{ width:100%; padding:.5rem .75rem; border-radius:999px; border:1px solid var(--line-strong);
            background:var(--surface-soft); font-size:.9rem; }
.ln-search:focus{ outline:2px solid var(--brand-soft); border-color:var(--brand-2); background:#fff; }
.ln-filters{ display:flex; gap:4px; margin-top:.45rem; overflow-x:auto; scrollbar-width:none; padding-bottom:2px; }
.ln-filters::-webkit-scrollbar{ display:none; }
.ln-filters .chip{ cursor:pointer; white-space:nowrap; font-size:.74rem; padding:.26rem .6rem; }
.ln-list{ flex:1; min-height:0; overflow-y:auto; padding:.35rem; }
.ln-head{ padding:.45rem .55rem .25rem; font-size:.68rem; font-weight:700; letter-spacing:.08em;
          text-transform:uppercase; color:var(--muted-light); }
.ln-row{ display:flex; align-items:center; gap:.5rem; flex:1; min-width:0; padding:.45rem .5rem;
         border:0; background:none; border-radius:10px; text-align:left; cursor:pointer; }
.ln-row:hover{ background:var(--surface-soft); }
.ln-star{ flex:none; width:26px; height:26px; display:grid; place-items:center; border:0; background:none;
          border-radius:8px; color:var(--line-strong); cursor:pointer; }
.ln-star:hover{ background:var(--line); color:var(--muted); }
.ln-star.on{ color:#f59e0b; }
.ln-star svg{ width:15px; height:15px; fill:currentColor; }
/* The title and the sub-line are spans, and a span is inline: left alone they
   run together on one line ("Division with a Ratio TableStage 3 · Number"),
   and because an inline box will not shrink, the row then shoves the type tag
   off the right-hand edge. Stack them explicitly and let the column shrink. */
.ln-main{ flex:1; min-width:0; display:flex; flex-direction:column; }
.ln-title{ display:block; font-size:.86rem; font-weight:650; line-height:1.25; color:var(--ink);
           white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ln-sub{ display:block; font-size:.71rem; color:var(--muted); line-height:1.3;
         white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ln-tag{ flex:none; font-size:.66rem; font-weight:700; padding:.15rem .45rem; border-radius:999px;
         white-space:nowrap; align-self:center; }
.ln-item{ display:flex; align-items:center; min-width:0; }
.ln-note{ padding:1.2rem .9rem; text-align:center; font-size:.83rem; color:var(--muted); line-height:1.55; }
.ln-note button{ margin-top:.6rem; }
.ln-foot{ flex:none; padding:.35rem .6rem; border-top:1px solid var(--line);
          font-size:.68rem; color:var(--muted-light); display:flex; gap:.5rem; align-items:center; }
.ln-foot .spacer{ flex:1; }
`;

const STAR_ON  = '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2l-5-4.9 6.9-1L12 2Z"/></svg>';
const STAR_OFF = '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2l-5-4.9 6.9-1L12 2Zm0 4.6L10 10.7l-4.5.7 3.3 3.2-.8 4.5L12 16.9l4 2.2-.8-4.5 3.3-3.2-4.5-.7L12 6.6Z"/></svg>';

/* ------------------------------------------------------------- catalogue */
function parseCatalogue(html){
  const doc = new DOMParser().parseFromString(html, 'text/html');

  /* THE CARD GRID IS NOT THE WHOLE SITE. Mills Maths Adventure, the Revision
     Generator, Resources by Stage and the two dashboards are top-level
     destinations that live only in the nav — the flagship game has no card at
     all. A launcher that could not find "adventure" would look broken in the
     most obvious test anyone would give it, so the nav's real links are
     collected too and tagged as sections. Links to an on-page anchor, and to
     this board itself, are skipped. */
  const places = [...doc.querySelectorAll('.nav-links a[href]')]
    /* data-label: nav menu items carry a one-line blurb inside the link, so
       textContent would glue it onto the title. */
    .map(a => ({ raw: a.getAttribute('href') || '', label: (a.dataset.label || a.textContent).trim() }))
    .filter(x => x.raw && !x.raw.startsWith('#') && !x.raw.includes('mmt-screen') && x.label)
    .map(x => ({
      href: /^https?:/i.test(x.raw) ? x.raw : new URL(x.raw.replace(/^\/+/, ''), location.origin + '/').href,
      external: /^https?:/i.test(x.raw),
      title: x.label, type:'place', stage:'', topic:'', code:'',
      search: x.label.toLowerCase(),
    }));

  const cards = [...doc.querySelectorAll('a.resource-card')].map(a => {
    const raw = a.getAttribute('href') || '';
    const external = /^https?:/i.test(raw);
    /* Homepage hrefs are relative to the SITE ROOT, and this widget is served
       from /mmt-screen/ — resolving them against the current page would send
       every link to /mmt-screen/worksheet-creators/… and 404. */
    const href = external ? raw : new URL(raw.replace(/^\/+/, ''), location.origin + '/').href;
    return {
      href, external,
      title: (a.querySelector('h4')?.textContent || '').trim(),
      type:  a.dataset.type || '',
      stage: (a.dataset.stage || '').trim(),
      topic: (a.dataset.topic || '').trim(),
      code:  (a.querySelector('.outcome-code')?.textContent || '').trim(),
      search:(a.dataset.search || '').toLowerCase(),
    };
  }).filter(x => x.title && x.href);

  /* Where a nav link and a card point at the same URL — the Revision Generator
     and the two dashboards do — KEEP THE CARD. It carries the stage, topic,
     outcome code and Jeff's keyword string; the nav link carries a label and
     nothing else, so preferring it would quietly make three resources
     unsearchable by anything but their exact name. The surviving sections
     still lead the list, since with an empty search box they are the handful
     of places rather than the long tail. */
  const cardHrefs = new Set(cards.map(c => c.href));
  return [...places.filter(p => !cardHrefs.has(p.href)), ...cards];
}

function readCache(){
  try{
    const raw = localStorage.getItem(CACHE_KEY);
    if(!raw) return null;
    const c = JSON.parse(raw);
    return Array.isArray(c.items) && c.items.length ? c : null;
  }catch(_){ return null; }
}
function writeCache(items){
  try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items })); }
  catch(_){ /* quota — the launcher still works, it just refetches next time */ }
}

async function fetchCatalogue(){
  const res = await fetch(SOURCE, { cache:'no-cache' });
  if(!res.ok) throw new Error('HTTP ' + res.status);
  const items = parseCatalogue(await res.text());
  if(!items.length) throw new Error('no resource cards found');
  writeCache(items);
  return items;
}

export default {
  type:'launcher',
  name:'MMT tools',
  blurb:'Search every tool, worksheet, quiz and game on the site and open it from the board.',
  icon:'<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm7.7 11.3 3.5 3.5-1.4 1.4-3.5-3.5 1.4-1.4Z"/></svg>',
  css,
  defaultSize:{ w:440, h:420 },
  minSize:{ w:300, h:260 },

  initialState: () => ({ favourites: [], filter:'all' }),

  render(el, ctx){
    const st = ctx.state;
    if(!Array.isArray(st.favourites)) st.favourites = [];

    let items = [];
    let query = '';          /* deliberately not saved — a stale search box at
                                the start of a lesson hides everything and
                                looks like a broken widget */
    let status = 'loading';

    el.innerHTML = `
      <div class="ln">
        <div class="ln-top">
          <input class="ln-search" type="search" placeholder="Search tools, worksheets, quizzes…"
                 aria-label="Search Mills Maths Tools" autocomplete="off" />
          <div class="ln-filters">
            ${FILTERS.map(f => `<button class="chip" data-f="${f.id}" type="button">${f.label}</button>`).join('')}
          </div>
        </div>
        <div class="ln-list"></div>
        <div class="ln-foot"><span class="count"></span><span class="spacer"></span>
          <span class="src">from the homepage</span></div>
      </div>`;

    const search  = el.querySelector('.ln-search');
    const list    = el.querySelector('.ln-list');
    const countEl = el.querySelector('.count');

    const isFav = href => st.favourites.includes(href);

    function matches(item){
      if(st.filter !== 'all' && item.type !== st.filter) return false;
      if(!query) return true;
      const hay = `${item.title} ${item.search} ${item.code} ${item.topic} ${item.stage}`.toLowerCase();
      /* Every word must appear somewhere — "ratio worksheet" should find the
         ratio-table worksheet and not everything containing either word. */
      return query.split(/\s+/).filter(Boolean).every(t => hay.includes(t));
    }

    /* RESULTS ARE RANKED, NOT LEFT IN HOMEPAGE ORDER. Jeff's data-search
       strings are deliberately generous — the flip-card set for Length lists
       "circumference" among its keywords — so unranked results answered
       "circumference" with Length, because Length appears earlier in the
       page. A teacher typing the name of a tool is asking for THAT tool, and
       getting something else first reads as the search being broken. Title
       hits therefore outrank keyword hits by an order of magnitude, and an
       exact or opening match outranks a title hit buried mid-sentence. */
    function score(item){
      if(!query) return 0;
      const title = item.title.toLowerCase();
      const tokens = query.split(/\s+/).filter(Boolean);
      let s = 0;
      if(title === query) s += 400;
      else if(title.startsWith(query)) s += 200;
      else if(title.includes(query)) s += 120;
      tokens.forEach(t => {
        if(title.startsWith(t)) s += 40;
        else if(new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(title)) s += 30;
        else if(title.includes(t)) s += 15;
        if(item.code.toLowerCase().includes(t)) s += 10;
        if(item.topic.toLowerCase().includes(t)) s += 6;
      });
      return s;
    }
    function rank(list){
      if(!query) return list;
      return list
        .map((item, i) => ({ item, i, s: score(item) }))
        .sort((a, b) => b.s - a.s || a.i - b.i)     /* page order breaks ties */
        .map(x => x.item);
    }

    function row(item){
      const t = TYPES[item.type] || { label:item.type || 'Resource', tint:'#f1f5f9', ink:'#64748b' };
      const wrap = document.createElement('div');
      wrap.className = 'ln-item';

      const star = document.createElement('button');
      star.className = 'ln-star' + (isFav(item.href) ? ' on' : '');
      star.type = 'button';
      star.title = isFav(item.href) ? 'Remove from favourites' : 'Add to favourites';
      star.setAttribute('aria-label', star.title);
      star.innerHTML = isFav(item.href) ? STAR_ON : STAR_OFF;
      star.addEventListener('click', e => {
        e.stopPropagation();
        const favs = isFav(item.href)
          ? st.favourites.filter(h => h !== item.href)
          : [...st.favourites, item.href];
        ctx.setState({ favourites: favs });
        paint();
      });

      const btn = document.createElement('button');
      btn.className = 'ln-row';
      btn.type = 'button';
      btn.innerHTML =
        `<span class="ln-main">` +
          `<span class="ln-title">${escapeHtml(item.title)}</span>` +
          `<span class="ln-sub">${escapeHtml([item.stage, item.topic, item.code].filter(Boolean).join(' · '))}</span>` +
        `</span>` +
        `<span class="ln-tag" style="background:${t.tint};color:${t.ink}">${t.label}</span>`;
      btn.addEventListener('click', () => {
        window.open(item.href, '_blank', 'noopener');
        ctx.toast('Opening ' + item.title);
      });

      wrap.append(star, btn);
      return wrap;
    }

    function paint(){
      el.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', b.dataset.f === st.filter));
      list.innerHTML = '';

      if(status === 'loading' && !items.length){
        list.innerHTML = `<div class="ln-note">Reading the list of tools from the site…</div>`;
        countEl.textContent = '';
        return;
      }
      if(status === 'error' && !items.length){
        const note = document.createElement('div');
        note.className = 'ln-note';
        note.innerHTML = `Could not read the list of tools.<br>This needs the site to be served over http — opening the file directly will not work.`;
        const retry = document.createElement('button');
        retry.className = 'btn'; retry.type = 'button'; retry.textContent = 'Try again';
        retry.addEventListener('click', () => { status = 'loading'; paint(); refresh(); });
        note.appendChild(retry);
        list.appendChild(note);
        countEl.textContent = '';
        return;
      }

      const favItems = st.favourites.map(h => items.find(i => i.href === h)).filter(Boolean);
      const shown = rank(items.filter(matches));

      /* Favourites lead only on a clean search box. Once a teacher is typing
         they are looking for something specific, and a pinned list above the
         answer is just something to scroll past. */
      if(!query && st.filter === 'all' && favItems.length){
        const h = document.createElement('div');
        h.className = 'ln-head'; h.textContent = 'Favourites';
        list.appendChild(h);
        favItems.forEach(i => list.appendChild(row(i)));
        const h2 = document.createElement('div');
        h2.className = 'ln-head'; h2.textContent = 'Everything else';
        list.appendChild(h2);
        shown.filter(i => !isFav(i.href)).forEach(i => list.appendChild(row(i)));
      }else{
        shown.forEach(i => list.appendChild(row(i)));
      }

      if(!shown.length){
        list.innerHTML = `<div class="ln-note">Nothing matches “${escapeHtml(query)}”.<br>Try a broader word — algebra, fractions, angles, ratio.</div>`;
      }
      countEl.textContent = `${shown.length} of ${items.length}`;
    }

    async function refresh(){
      try{
        items = await fetchCatalogue();
        status = 'ready';
      }catch(err){
        console.warn('[MMT Screen] could not refresh the tool catalogue', err);
        if(!items.length) status = 'error';
      }
      paint();
    }

    /* Cached copy first so the widget paints instantly, then the live one. */
    const cached = readCache();
    if(cached){ items = cached.items; status = 'ready'; }
    paint();
    refresh();

    let debounce = null;
    search.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { query = search.value.trim().toLowerCase(); paint(); }, 120);
    });
    el.querySelectorAll('[data-f]').forEach(b =>
      b.addEventListener('click', () => { ctx.setState({ filter: b.dataset.f }); paint(); }));

    return () => clearTimeout(debounce);
  },
};
