/*
  Mills Maths Tools — Bar Model Engine
  -------------------------------------
  engines/bar-model/bar-model-engine.js

  Exposes: window.MMT_BAR_MODEL_ENGINE.render(target, config)

  The bar model is how Stage 3 students are taught to see the STRUCTURE of a
  word problem before choosing an operation: part-part-whole for "altogether"
  and "how many more to make", and two bars side by side for "how many more
  than". Widths are proportional to the values, so a part that is twice as big
  looks twice as big — the picture carries the reasoning.

  diagramType
  -----------
    part-whole   one bar split into `parts` [{ value, label }], with the total
                 bracketed above (`total`)
    compare      `rows` [{ name, value, label }] as bars from a common left
                 edge; the gap at the end of the shorter bar is bracketed and
                 labelled `difference`

  Any label given as null draws an empty box — the unknown the student finds.
*/

window.MMT_BAR_MODEL_ENGINE = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const TEXT = 18;
  const INK = "#111827";
  const FILLS = ["#dbeafe", "#fef3c7", "#dcfce7", "#fce7f3", "#ede9fe"];
  const ACCENT = "#1d4ed8";
  const FONT = "'Cambria Math','Times New Roman',serif";
  const r1 = v => Math.round(v * 10) / 10;

  function el(n, a = {}) {
    const e = document.createElementNS(NS, n);
    Object.entries(a).forEach(([k, v]) => { if (v !== undefined && v !== null) e.setAttribute(k, String(v)); });
    return e;
  }
  function text(g, v, x, y, o = {}) {
    const t = el("text", { x: r1(x), y: r1(y), "font-family": FONT, "font-size": o.size || TEXT, "text-anchor": o.anchor || "middle", "dominant-baseline": "middle", "font-weight": o.weight || 700, fill: o.fill || INK });
    t.textContent = String(v);
    g.appendChild(t);
  }
  function labelOrBox(g, v, x, y, fill) {
    if (v === null || v === undefined || v === "") {
      g.appendChild(el("rect", { x: r1(x - 30), y: r1(y - 15), width: 60, height: 30, rx: 3, fill: "#fff", stroke: INK, "stroke-width": 1.8 }));
      return;
    }
    text(g, v, x, y, { fill });
  }
  function brace(g, x1, x2, y, up = true) {
    const d = up ? -1 : 1;
    g.appendChild(el("path", {
      d: `M ${r1(x1)} ${r1(y)} q 0 ${10 * d} 10 ${10 * d} L ${r1((x1 + x2) / 2 - 8)} ${r1(y + 10 * d)} q 8 0 8 ${8 * d} q 0 ${-8 * d} 8 ${-8 * d} L ${r1(x2 - 10)} ${r1(y + 10 * d)} q 10 0 10 ${-10 * d}`,
      fill: "none", stroke: ACCENT, "stroke-width": 2.2
    }));
  }

  function partWhole(target, c) {
    const parts = c.parts || [];
    const sum = parts.reduce((s, p) => s + (Number(p.value) || 1), 0) || 1;
    const x0 = 20;
    const W = 520;
    const y = 70;
    const h = 52;
    const g = el("g");
    let x = x0;
    parts.forEach((p, i) => {
      const w = (Number(p.value) || 1) / sum * W;
      g.appendChild(el("rect", { x: r1(x), y, width: r1(w), height: h, fill: FILLS[c.sameColour ? 0 : i % FILLS.length], stroke: INK, "stroke-width": 2 }));
      labelOrBox(g, p.label, x + w / 2, y + h / 2);
      x += w;
    });
    brace(g, x0, x0 + W, y - 6, true);
    labelOrBox(g, c.total, x0 + W / 2, y - 40, ACCENT);
    return finish(target, g, W + 40, y + h + 16, "bar model");
  }

  function compare(target, c) {
    const rows = c.rows || [];
    const max = Math.max(...rows.map(r => Number(r.value) || 1));
    const nameW = Math.max(60, ...rows.map(r => String(r.name || "").length * 9)) + 12;
    const x0 = nameW;
    const W = 440;
    const h = 44;
    const gap = 22;
    const y0 = 20;
    const g = el("g");
    rows.forEach((r, i) => {
      const y = y0 + i * (h + gap);
      const w = (Number(r.value) || 1) / max * W;
      text(g, r.name, x0 - 10, y + h / 2, { anchor: "end", size: 16 });
      g.appendChild(el("rect", { x: x0, y, width: r1(w), height: h, fill: FILLS[i % FILLS.length], stroke: INK, "stroke-width": 2 }));
      labelOrBox(g, r.label, x0 + w / 2, y + h / 2);
    });
    let H = y0 + rows.length * (h + gap);
    if (rows.length === 2 && c.difference !== undefined) {
      const w0 = (Number(rows[0].value) || 1) / max * W;
      const w1 = (Number(rows[1].value) || 1) / max * W;
      const short = Math.min(w0, w1);
      const long = Math.max(w0, w1);
      const yS = w0 < w1 ? y0 : y0 + h + gap;
      g.appendChild(el("rect", { x: r1(x0 + short), y: yS, width: r1(long - short), height: h, fill: "none", stroke: ACCENT, "stroke-width": 2, "stroke-dasharray": "6 4" }));
      brace(g, x0 + short, x0 + long, yS + h + 4, false);
      labelOrBox(g, c.difference, x0 + (short + long) / 2, yS + h + 32, ACCENT);
      H = Math.max(H, yS + h + 52);
    }
    return finish(target, g, x0 + W + 20, H, "comparison bar model");
  }

  function finish(target, g, w, h, label) {
    const svg = el("svg", { viewBox: `0 0 ${Math.round(w)} ${Math.round(h)}`, width: "100%", role: "img", "aria-label": label });
    svg.appendChild(g);
    if (target) { target.innerHTML = ""; target.appendChild(svg); }
    return svg;
  }

  function render(target, config = {}) {
    if (config.diagramType === "compare") return compare(target, config);
    return partWhole(target, config);
  }

  return { render };
})();
