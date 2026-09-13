# -*- coding: utf-8 -*-
"""Build START-HERE.html — one readable, self-contained copy of the human docs."""
import os, re, html, markdown

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "starter-pack")

SECTIONS = [
    ("start",    "Start here",           "Ten minutes",              "TEN-MINUTES.md"),
    ("workshop", "The workshop guide",   "The full method",          "WORKSHOP.md"),
    ("prompts",  "Prompts",              "Copy, paste, edit",        "PROMPTS.md"),
    ("brief",    "A finished brief",     "What CLAUDE.md looks like","CLAUDE-example.md"),
    ("deploy",   "Putting it online",    "Later, not day one",       "DEPLOY.md"),
]

md = markdown.Markdown(extensions=["extra", "sane_lists", "toc"])

def convert(path):
    md.reset()
    with open(os.path.join(D, path), encoding="utf-8") as f:
        text = f.read()
    body = md.convert(text)
    # cross-document references become in-page anchors
    for name, anchor in [("TEN-MINUTES.md","#start"), ("WORKSHOP.md","#workshop"),
                         ("PROMPTS.md","#prompts"), ("DEPLOY.md","#deploy"),
                         ("CLAUDE-example.md","#brief")]:
        body = body.replace("<code>%s</code>" % name,
                            '<a href="%s"><code>%s</code></a>' % (anchor, name))
    return body

nav, panels = [], []
for slug, title, sub, path in SECTIONS:
    nav.append(
        '<a href="#%s" data-target="%s"><span class="n-t">%s</span>'
        '<span class="n-s">%s</span></a>' % (slug, slug, html.escape(title), html.escape(sub)))
    panels.append('<section id="%s"><h1 class="doc-title">%s</h1>\n%s\n</section>'
                  % (slug, html.escape(title), convert(path)))

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Start here — Mathematics Vibe Coding Starter Pack</title>
<style>
  :root{
    --brand:#047857; --brand-soft:#d1fae5; --ink:#10221c; --muted:#5b6b64;
    --line:#dde7e2; --bg:#fbfaf7; --card:#ffffff;
    --sans:ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    --mono:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  *{box-sizing:border-box}
  body{margin:0; background:var(--bg); color:var(--ink); font-family:var(--sans);
       line-height:1.62; font-size:17px}
  a{color:var(--brand)}

  .shell{max-width:1180px; margin:0 auto; display:grid;
         grid-template-columns:250px minmax(0,1fr); gap:44px;
         padding:34px 22px 80px}

  /* ---- sidebar ---- */
  aside{position:sticky; top:24px; align-self:start; max-height:calc(100vh - 48px); overflow:auto}
  .brand{font-weight:700; font-size:1.05rem; line-height:1.25; margin-bottom:4px}
  .brand small{display:block; font-weight:400; color:var(--muted); font-size:.82rem; margin-top:3px}
  nav{margin-top:20px; display:flex; flex-direction:column; gap:2px}
  nav a{display:block; text-decoration:none; color:var(--ink); padding:8px 12px;
        border-left:2px solid var(--line); border-radius:0 5px 5px 0}
  nav a:hover{background:var(--brand-soft)}
  nav a.on{border-left-color:var(--brand); background:var(--brand-soft)}
  .n-t{display:block; font-weight:600; font-size:.95rem}
  .n-s{display:block; color:var(--muted); font-size:.78rem}
  .also{margin-top:22px; padding-top:16px; border-top:1px solid var(--line);
        display:flex; flex-direction:column; gap:6px}
  .also-t{margin:0 0 2px; font-size:.72rem; letter-spacing:.12em; text-transform:uppercase;
          color:var(--muted); font-weight:600}
  .also a{font-size:.9rem; font-weight:600; text-decoration:none; color:var(--brand)}
  .also a:hover{text-decoration:underline}
  .aside-note{margin-top:18px; padding-top:14px; border-top:1px solid var(--line);
              font-size:.82rem; color:var(--muted)}

  /* ---- content ---- */
  main{min-width:0}
  .lede{background:var(--card); border:1px solid var(--line); border-radius:10px;
        padding:22px 24px; margin-bottom:40px}
  .lede h2{margin:0 0 8px; font-size:1.25rem}
  .lede p{margin:0 0 10px; color:var(--muted)}
  .lede p:last-child{margin-bottom:0}
  .lede b{color:var(--ink)}

  section{scroll-margin-top:20px; padding-bottom:26px; margin-bottom:34px;
          border-bottom:1px solid var(--line)}
  section:last-child{border-bottom:none}
  .doc-title{font-size:.75rem; text-transform:uppercase; letter-spacing:.14em;
             color:var(--brand); font-weight:700; margin:0 0 6px}
  h1{font-size:2rem; line-height:1.15; margin:.2em 0 .4em; letter-spacing:-.015em}
  h2{font-size:1.42rem; margin:1.7em 0 .5em; letter-spacing:-.01em}
  h3{font-size:1.12rem; margin:1.5em 0 .4em}
  h2 + h3{margin-top:.9em}
  p, li{max-width:70ch}
  ul, ol{padding-left:1.25em}
  li{margin:.35em 0}
  li::marker{color:var(--brand)}
  hr{border:none; border-top:1px solid var(--line); margin:2.2em 0}
  strong{font-weight:600}

  code{font-family:var(--mono); font-size:.9em; background:var(--brand-soft);
       padding:.12em .38em; border-radius:4px}
  pre{background:var(--ink); color:#e8f2ee; padding:16px 18px; border-radius:8px;
      overflow-x:auto; font-size:.88rem; line-height:1.5; max-width:100%}
  pre code{background:none; padding:0; color:inherit; font-size:1em}

  blockquote{margin:1.2em 0; padding:14px 18px; background:var(--card);
             border-left:3px solid var(--brand); border-radius:0 8px 8px 0}
  blockquote p{margin:.4em 0}
  blockquote p:first-child{margin-top:0}
  blockquote p:last-child{margin-bottom:0}

  table{border-collapse:collapse; width:100%; margin:1.2em 0; font-size:.95rem}
  th, td{text-align:left; padding:9px 12px; border-bottom:1px solid var(--line);
         vertical-align:top}
  th{background:var(--brand-soft); font-weight:600}
  .tw{overflow-x:auto; max-width:100%}

  input[type=checkbox]{accent-color:var(--brand)}

  .copy{position:absolute; top:8px; right:8px; font:600 .74rem/1 var(--sans);
        letter-spacing:.05em; text-transform:uppercase; color:var(--brand);
        background:var(--card); border:1px solid var(--line); border-radius:5px;
        padding:6px 9px; cursor:pointer}
  .copy:hover{background:var(--brand-soft)}
  .copy.done{color:var(--card); background:var(--brand); border-color:var(--brand)}
  .wrapcopy{position:relative}
  .wrapcopy > blockquote, .wrapcopy > pre{margin-top:0}
  a:focus-visible, button:focus-visible{outline:2px solid var(--brand); outline-offset:2px}

  @media (max-width:900px){
    .shell{grid-template-columns:1fr; gap:26px; padding-top:24px}
    aside{position:static; max-height:none}
    nav{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:6px}
  }
  @media print{
    aside{display:none} .shell{display:block} .copy{display:none}
    pre{background:#f4f4f4; color:#000; border:1px solid #ccc}
  }
</style>
</head>
<body>
<div class="shell">

  <aside>
    <div class="brand">Mathematics Vibe Coding
      <small>Starter pack · read me first</small></div>
    <nav id="nav">__NAV__</nav>
    <div class="also">
      <p class="also-t">Also in the folder</p>
      <a href="A-REAL-BUILD.html">A real build &rarr;</a>
      <a href="SNIPPETS.html">Snippets &rarr;</a>
      <a href="maths-tool-starter.html">The starter tool &rarr;</a>
      <a href="index.html">The eight examples &rarr;</a>
    </div>
    <p class="aside-note">Everything here is also in the <code>.md</code> files in the
    folder. Those are the editable copies — this page is the readable one.</p>
  </aside>

  <main>
    <div class="lede">
      <h2>You are looking at the readable copy</h2>
      <p>The folder contains the same documents as <code>.md</code> files. Those are
      for editing, and for handing to an AI. If you double-click one it may open in
      an app rather than showing you the text — <b>this page is the one to read.</b></p>
      <p><b>In a hurry?</b> Open <code>maths-tool-starter.html</code> in your browser,
      then follow <a href="#start">Start here</a>. Ten minutes, one working change.</p>
      <p><b>Want to see it done first?</b> <a href="A-REAL-BUILD.html">A real build</a> is
      one tool in two rounds, with the actual prompts that built it — typos and all.</p>
    </div>
    __PANELS__
  </main>

</div>

<script>
/* wrap tables so a wide one scrolls instead of stretching the page */
document.querySelectorAll("table").forEach(function(t){
  var w = document.createElement("div"); w.className = "tw";
  t.parentNode.insertBefore(w, t); w.appendChild(t);
});

/* a copy button on every code block, and on the prompts */
function addCopy(node){
  var wrap = document.createElement("div"); wrap.className = "wrapcopy";
  node.parentNode.insertBefore(wrap, node); wrap.appendChild(node);
  var b = document.createElement("button");
  b.className = "copy"; b.type = "button"; b.textContent = "Copy";
  b.addEventListener("click", function(){
    var text = node.innerText.trim();
    navigator.clipboard.writeText(text).then(function(){
      b.textContent = "Copied"; b.classList.add("done");
      setTimeout(function(){ b.textContent = "Copy"; b.classList.remove("done"); }, 1600);
    });
  });
  wrap.appendChild(b);
}
document.querySelectorAll("pre").forEach(addCopy);
document.querySelectorAll("#prompts blockquote, #start blockquote").forEach(addCopy);

/* highlight the section you are reading */
var links = [].slice.call(document.querySelectorAll("#nav a"));
var obs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting) return;
    links.forEach(function(a){ a.classList.toggle("on", a.dataset.target === e.target.id); });
  });
}, {rootMargin:"-10% 0px -70% 0px"});
document.querySelectorAll("main section").forEach(function(s){ obs.observe(s); });
if(links.length) links[0].classList.add("on");
</script>
</body>
</html>
"""

out = PAGE.replace("__NAV__", "\n".join(nav)).replace("__PANELS__", "\n\n".join(panels))
dest = os.path.join(D, "START-HERE.html")
with open(dest, "w", encoding="utf-8") as f:
    f.write(out)
print("wrote", dest, round(os.path.getsize(dest)/1024, 1), "KB")
