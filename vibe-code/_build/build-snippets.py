# -*- coding: utf-8 -*-
import html, os

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "starter-pack")

S = []
def snip(anchor, title, why, code, lang="js", after=""):
    S.append(dict(a=anchor, t=title, w=why, c=code.strip("\n"), l=lang, after=after))

snip("architecture", "State, then render",
 """Every interactive tool in this pack is these three things and nothing else. Controls
 edit one plain object; <code>render()</code> redraws the whole picture from it. Redrawing
 everything is wasteful in theory and much easier to live with in practice — you can never
 end up with a half-updated diagram, which is the bug that eats an evening.
 <b>Ask for this pattern by name.</b> An AI will use it if you say so and drift away from it if you don't.""",
"""const state = { num: 3, den: 4, showBar: true };

function render(){
  drawDiagram();          // reads state, draws from scratch
  drawLabels();
  document.getElementById("readout").textContent = describe(state);
}

function bind(id, event, fn){
  document.getElementById(id).addEventListener(event, e => { fn(e.target); render(); });
}
bind("den",     "input",  t => state.den     = Number(t.value) || 1);
bind("showBar", "change", t => state.showBar = t.checked);

render();""")

snip("tokens", "Design tokens at the top",
 """Six lines at the top of every file, and <code>var(--brand)</code> everywhere below —
 never a hex code further down. Now "make the whole site purple" is one line per file
 instead of a hunt through forty colours. Paste your block into <code>CLAUDE.md</code> so
 every new tool starts consistent.""",
""":root{
  --brand:#047857;      /* your main colour — change this one first */
  --brand-soft:#d1fae5;
  --ink:#10221c;
  --muted:#5b6b64;
  --line:#dde7e2;
  --bg:#fbfaf7;
}""", "css")

snip("bag", "Deal from a shuffled bag",
 """"Random questions" nearly always means <b>without replacement</b>. Draw each question
 independently and the case you built the tool for turns up one time in eight — a
 ten-question run can miss it completely, and you only find out in the lesson. Build every
 case once, shuffle, deal from the top, and refill only when the bag is empty.""",
"""/* four question types, eight questions: each appears exactly twice,
   in an order nobody can predict */
function shuffle(list){
  const a = [...list];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const bag = shuffle([...TYPES, ...TYPES]);

/* for a long run, refill only when it actually runs out */
let bag2 = shuffle(allFacts);
for(let i = 0; i < howMany; i++){
  if(bag2.length === 0) bag2 = shuffle(allFacts);
  const item = bag2.pop();
}""")

snip("seed", "A seed, so you can reprint",
 """Four characters that reproduce an identical sheet next term without keeping the file —
 and, for free, versions A/B/C: the same questions, same difficulty, same marking, in a
 different order for the person sitting next to you. That falls straight out of having a
 seed, and it is the best argument for bothering with one.""",
"""function makeRandom(seedText){
  let h = 2166136261;
  for(let i = 0; i < seedText.length; i++){
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function(){
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledWith(rand, list){
  const out = list.slice();
  for(let i = out.length - 1; i > 0; i--){
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const rand = makeRandom(sheetCode);          // same code → same sheet, always
const versionB = shuffledWith(makeRandom(sheetCode + "-B"), baseQuestions);""")

snip("check", "The teacher check panel",
 """Non-negotiable in anything that generates questions. It is "generate twenty and mark them
 by hand" turned into a button. Students never open it, it costs nothing to leave in, and it
 is the difference between a tool and an embarrassment. Screen only — never printed.""",
"""<details class="check no-print">
  <summary>Teacher check</summary>
  <p>Twenty questions from the current settings, with answers. Mark them by hand
     and look for: questions outside what you ticked, divisions that don't come out
     exactly, answers that don't match the question, and repeats.</p>
  <button type="button" id="previewBtn">Generate 20</button>
  <div id="previewGrid"></div>
</details>""", "html")

snip("selftest", "Fire every rule at the right answer",
 """The one that catches what you were not looking for. While the integers quiz in this pack
 was being written, its marker had a rule saying <i>"you have combined the sizes"</i> whenever
 the student's answer had size |a| + |b|. That reads as obviously correct. It also fires on
 −8 + (−5) = −13, which is the <b>right</b> answer, because −13 really does have size 8 + 5.
 Nothing in the code looked wrong, and rereading it would never have helped.
 <br><br>So: guard every rule so it can only fire when the value it describes differs from the
 correct one, then prove it by running hundreds of correct answers past the whole marker.""",
"""/* guard: this rule cannot fire on a correct answer */
const say = (v, msg) => (given === v && v !== right) ? msg : null;

/* ...and prove it. Put this behind a button in the teacher panel. */
const failures = [];
for(let i = 0; i < 400; i++){
  const d = makeData();
  TYPES.forEach(t => {
    const right = t.get(d.st);
    const fired = diagnose(t.key, right, d.st);   // pass the CORRECT answer in
    if(fired) failures.push(t.key + " → " + fired);
  });
}
/* failures.length must be 0 */""")

snip("truth", "Say what is true",
 """<code>(1/3).toFixed(4)</code> puts <code>1/3 = 0.3333</code> on a projector in front of
 thirty children. It is not true, and it ships without anyone noticing because it looks like
 a decimal. Do the long division and watch the remainders instead: a remainder that comes
 round again means the digits repeat from there. Only fall back to an approximation when the
 repeating block is too long to read — and then write ≈, not =.""",
"""function decimalParts(n, d){
  const intPart = Math.floor(n / d);
  let r = n % d;
  const digits = [], seen = new Map();
  while(r !== 0 && !seen.has(r)){
    seen.set(r, digits.length);          /* where this remainder first appeared */
    r *= 10;
    digits.push(Math.floor(r / d));
    r = r % d;
  }
  if(r === 0) return { intPart, prefix: digits.join(""), period: "" };
  const start = seen.get(r);             /* the digits repeat from here */
  return { intPart, prefix: digits.slice(0, start).join(""),
                    period: digits.slice(start).join("") };
}
/* 1/3 → 0.3̇   1/7 → 0.1̇42857̇   3/8 → 0.375 exactly */""")

snip("integers", "Work in whole numbers",
 """<code>0.1 + 0.2</code> is <code>0.30000000000000004</code>. Scale decimal input up to
 integers before any arithmetic happens and the problem cannot occur — the number line in
 <code>maths-tool-starter.html</code> does this, which is why its labels come out clean.""",
"""const MAX_DP = 3;
function decimals(v){
  const s = String(v), i = s.indexOf(".");
  return i === -1 ? 0 : Math.min(MAX_DP, s.length - i - 1);
}
const SCALE = Math.pow(10, Math.max(decimals(start), decimals(step)));

const s0 = Math.round(start * SCALE);      /* now they are integers */
const st = Math.round(step  * SCALE);
const points = [];
for(let i = 0; i <= jumps; i++) points.push(s0 + i * st);   /* exact */

/* and back again, only when you print it on the screen */
function fmt(scaled){
  const whole = scaled / SCALE;
  const text = Number.isInteger(whole) ? String(whole)
                                       : String(Number(whole.toFixed(MAX_DP)));
  return text.replace(/^-/, "\\u2212");    /* a real minus sign, not a hyphen */
}""")

snip("fractions", "Compare whole numbers, not divisions",
 """To test whether two fractions are equal, cross-multiply. <code>a/b === c/d</code> is a
 floating-point comparison and it will betray you on some pair you never tested. The same
 goes for deciding whether a fraction terminates or recurs: reduce it and look at what is
 left on the bottom — any threshold you pick to test <code>33.33333333333333</code> is
 wrong for some other fraction.""",
"""const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);

const equal = (a, b, c, d) => a * d === c * b;        /* not a/b === c/d */

function reduce(n, d){ const g = gcd(n, d) || 1; return [n / g, d / g]; }

/* terminates ⟺ after reducing, the denominator has no factor but 2 and 5 */
function terminates(n, d){
  let [, den] = reduce(n, d);
  while(den % 2 === 0) den /= 2;
  while(den % 5 === 0) den /= 5;
  return den === 1;
}""")

snip("print", "Print rules, written first",
 """Write this block <b>before</b> you polish the screen version, and press Ctrl/Cmd+P after
 every change. Otherwise you find out at the photocopier that the options panel printed, the
 answers are on page one, and the sheet is sixty-one pages.""",
"""@media print{
  body{background:#fff; padding:0; margin:0}
  .no-print{display:none !important}       /* options, buttons, teacher panel */
  .sheet, .answers{border:0; box-shadow:none; padding:0; border-radius:0; margin:0}
  .sheet + .sheet{break-before:page}
  .answers{break-before:page}              /* answers on their own page */
  .q{font-size:11.5pt; break-inside:avoid} /* no question split across pages */
}""", "css")

snip("svg", "Inline SVG, drawn from state",
 """Not canvas, not an image. It stays sharp on any projector, it takes its colours from the
 same CSS variables as everything else, and you can read it. Two helpers cover almost
 everything.""",
"""const NS = "http://www.w3.org/2000/svg";
function el(name, attrs){
  const n = document.createElementNS(NS, name);
  for(const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

/* maths angles run anticlockwise from the x-axis; SVG y runs down */
const pt = (cx, cy, r, deg) =>
  [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];

/* crop the box to what you actually drew, so a small diagram is not
   marooned in a sea of white */
svg.setAttribute("viewBox", `0 ${top} 700 ${bottom - top}`);""",
 after="""<p class="gotcha"><b>Two that will catch you.</b> Author CSS beats the browser's
 <code>[hidden]{display:none}</code>, so a <code>.field{display:flex}</code> rule keeps
 hidden elements on screen — add <code>[hidden]{display:none !important}</code>. And put
 <code>user-select:none</code> on any SVG you can drag, or dragging selects the labels.</p>""")

# ---------------------------------------------------------------- render
def block(s):
    return f"""
  <section id="{s['a']}">
    <h2>{s['t']}</h2>
    <p class="why">{s['w']}</p>
    <div class="wrapcopy"><pre><code>{html.escape(s['c'])}</code></pre></div>
    {s['after']}
  </section>"""

nav = "\n".join(f'<a href="#{s["a"]}" data-target="{s["a"]}">{html.escape(s["t"])}</a>' for s in S)
body = "\n".join(block(s) for s in S)

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Snippets — patterns worth pasting</title>
<style>
  :root{
    --brand:#047857; --brand-soft:#d1fae5; --ink:#10221c; --muted:#5b6b64;
    --line:#dde7e2; --bg:#fbfaf7; --card:#fff; --warn:#b45309; --warn-soft:#fef3c7;
    --sans:ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    --mono:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  *{box-sizing:border-box}
  [hidden]{display:none !important}
  body{margin:0; background:var(--bg); color:var(--ink); font-family:var(--sans);
       line-height:1.6; font-size:17px}
  a{color:var(--brand)}
  .shell{max-width:1160px; margin:0 auto; display:grid;
         grid-template-columns:230px minmax(0,1fr); gap:44px; padding:34px 22px 80px}

  aside{position:sticky; top:24px; align-self:start; max-height:calc(100vh - 48px); overflow:auto}
  .brand{font-weight:700; font-size:1.05rem; line-height:1.25}
  .brand small{display:block; font-weight:400; color:var(--muted); font-size:.82rem; margin-top:3px}
  nav{margin-top:18px; display:flex; flex-direction:column; gap:1px}
  nav a{text-decoration:none; color:var(--ink); padding:7px 12px; font-size:.93rem;
        border-left:2px solid var(--line); border-radius:0 5px 5px 0}
  nav a:hover{background:var(--brand-soft)}
  nav a.on{border-left-color:var(--brand); background:var(--brand-soft); font-weight:600}

  main{min-width:0}
  h1{font-size:2.1rem; margin:0 0 8px; letter-spacing:-.02em}
  .lede{color:var(--muted); max-width:66ch; margin:0 0 12px}
  .lede + .lede{margin-bottom:34px}
  section{scroll-margin-top:20px; padding-bottom:26px; margin-bottom:30px; border-bottom:1px solid var(--line)}
  section:last-child{border-bottom:none}
  h2{font-size:1.35rem; margin:0 0 8px; letter-spacing:-.01em}
  .why{color:var(--muted); max-width:70ch; margin:0 0 14px}
  .why b, .why code{color:var(--ink)}
  code{font-family:var(--mono); font-size:.88em; background:var(--brand-soft);
       padding:.1em .35em; border-radius:4px}
  pre{background:var(--ink); color:#e8f2ee; padding:17px 19px; border-radius:9px;
      overflow-x:auto; font-size:.86rem; line-height:1.55; margin:0; max-width:100%}
  pre code{background:none; padding:0; color:inherit; font-size:1em}
  .wrapcopy{position:relative}
  .copy{position:absolute; top:9px; right:9px; font:600 .72rem/1 var(--sans);
        letter-spacing:.05em; text-transform:uppercase; color:var(--brand);
        background:var(--card); border:1px solid var(--line); border-radius:5px;
        padding:6px 9px; cursor:pointer}
  .copy:hover{background:var(--brand-soft)}
  .copy.done{color:#fff; background:var(--brand); border-color:var(--brand)}
  .gotcha{margin:14px 0 0; padding:12px 16px; background:var(--warn-soft);
          border-left:3px solid var(--warn); border-radius:0 8px 8px 0; font-size:.95rem; max-width:70ch}
  a:focus-visible, button:focus-visible{outline:2px solid var(--brand); outline-offset:2px}

  @media (max-width:900px){
    .shell{grid-template-columns:1fr; gap:24px}
    aside{position:static; max-height:none}
    nav{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:5px}
  }
  @media print{ aside,.copy{display:none} .shell{display:block}
                pre{background:#f4f4f4; color:#000; border:1px solid #ccc} }
</style>
</head>
<body>
<div class="shell">
  <aside>
    <div class="brand">Snippets<small>patterns worth pasting</small></div>
    <nav id="nav">__NAV__</nav>
  </aside>
  <main>
    <h1>Patterns worth pasting</h1>
    <p class="lede">Every one of these is in the example files already, buried a few hundred
      lines down where you would have to know it was there. This is the same code, on its own,
      with the mistake it prevents written next to it.</p>
    <p class="lede">Paste the block <em>and</em> the reason into your AI chat. The reason is
      what stops it being helpfully rewritten back into the bug.</p>
    __BODY__
  </main>
</div>
<script>
document.querySelectorAll("pre").forEach(function(pre){
  var b = document.createElement("button");
  b.className = "copy"; b.type = "button"; b.textContent = "Copy";
  b.addEventListener("click", function(){
    navigator.clipboard.writeText(pre.innerText.trim()).then(function(){
      b.textContent = "Copied"; b.classList.add("done");
      setTimeout(function(){ b.textContent = "Copy"; b.classList.remove("done"); }, 1600);
    });
  });
  pre.parentNode.appendChild(b);
});
var links = [].slice.call(document.querySelectorAll("#nav a"));
var obs = new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(!e.isIntersecting) return;
    links.forEach(function(a){ a.classList.toggle("on", a.dataset.target === e.target.id); });
  });
}, {rootMargin:"-8% 0px -75% 0px"});
document.querySelectorAll("main section").forEach(function(s){ obs.observe(s); });
if(links.length) links[0].classList.add("on");
</script>
</body>
</html>
"""

out = PAGE.replace("__NAV__", nav).replace("__BODY__", body)
dest = os.path.join(D, "SNIPPETS.html")
open(dest, "w", encoding="utf-8").write(out)
print("wrote", dest, round(os.path.getsize(dest)/1024, 1), "KB,", len(S), "snippets")
