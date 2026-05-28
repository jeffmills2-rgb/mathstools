/*
  CHHS Exam Builder — FDP Diagram Engine
  --------------------------------------
  Save as:

  engines/fdp/fdp-engine.js

  Exposes:
  window.MMT_FDP_ENGINE.render(target, config)

  Diagram types:
  - fraction-bar
  - percentage-grid
  - decimal-number-line
  - conversion-strip
  - best-buy-bars
*/

window.MMT_FDP_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function svg(viewBox = "0 0 520 180") {
    const s = el("svg", {
      viewBox,
      width: "100%",
      height: "100%",
      role: "img",
      class: "fdp-svg"
    });

    const style = el("style");
    style.textContent = `
      .fdp-svg{overflow:visible}
      .fdp-line{stroke:#111827;stroke-width:3;stroke-linecap:round;fill:none}
      .fdp-thin{stroke:#111827;stroke-width:1.5;stroke-linecap:round;fill:none}
      .fdp-soft{fill:#eef2ff;stroke:#111827;stroke-width:2}
      .fdp-fill{fill:#bfdbfe;stroke:#111827;stroke-width:1.2}
      .fdp-empty{fill:#ffffff;stroke:#111827;stroke-width:1.2}
      .fdp-accent{fill:#d1fae5;stroke:#111827;stroke-width:1.2}
      .fdp-muted{fill:#f3f4f6;stroke:#111827;stroke-width:1.2}
      .fdp-text{font-family:"Cambria Math","Times New Roman",serif;font-size:20px;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .fdp-small{font-size:15px;font-weight:700}
      .fdp-label{font-size:17px;font-weight:700}
      .fdp-title{font-size:18px;font-weight:900}
    `;
    s.appendChild(style);
    return s;
  }

  function text(s, value, x, y, cls = "fdp-text") {
    const t = el("text", { x, y, class: cls });
    t.textContent = value;
    s.appendChild(t);
    return t;
  }

  function rect(s, x, y, w, h, cls = "fdp-empty", extra = {}) {
    const r = el("rect", { x, y, width: w, height: h, class: cls, ...extra });
    s.appendChild(r);
    return r;
  }

  function line(s, x1, y1, x2, y2, cls = "fdp-line") {
    s.appendChild(el("line", { x1, y1, x2, y2, class: cls }));
  }

  function fmtNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value ?? "");
    return Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : String(Number(n.toFixed(3)));
  }

  function renderFractionBar(config = {}) {
    const denominator = Math.max(1, Math.min(24, Number(config.denominator) || 4));
    const rawNumerator = Number(config.numerator);
    const numerator = Number.isFinite(rawNumerator)
      ? Math.max(0, Math.min(denominator, rawNumerator))
      : 1;

    // For exam questions, fraction bars should not reveal the answer by default.
    // A label is shown only when a question explicitly sets showLabel: true.
    const showLabel = config.showLabel === true;
    const label = config.label ?? `${numerator}/${denominator}`;

    const s = svg("0 0 520 150");
    const x = 50;
    const y = 45;
    const w = 420;
    const h = 44;
    const cell = w / denominator;

    for (let i = 0; i < denominator; i++) {
      rect(s, x + i * cell, y, cell, h, i < numerator ? "fdp-fill" : "fdp-empty");
    }

    rect(s, x, y, w, h, "fdp-thin", { fill: "none" });
    if (showLabel) text(s, label, 260, 118, "fdp-text fdp-label");
    return s;
  }

  function renderPercentageGrid(config = {}) {
    const percent = Math.max(0, Math.min(100, Number(config.percent) || 0));
    const filled = Math.round(percent);
    const label = config.label ?? `${percent}%`;
    const s = svg("0 0 420 230");
    const size = 15;
    const gap = 2;
    const x0 = 82;
    const y0 = 28;

    for (let i = 0; i < 100; i++) {
      const row = Math.floor(i / 10);
      const col = i % 10;
      rect(
        s,
        x0 + col * (size + gap),
        y0 + row * (size + gap),
        size,
        size,
        i < filled ? "fdp-fill" : "fdp-empty"
      );
    }

    text(s, label, 210, 208, "fdp-text fdp-label");
    return s;
  }

  function renderDecimalNumberLine(config = {}) {
    const min = Number.isFinite(config.min) ? config.min : 0;
    const max = Number.isFinite(config.max) ? config.max : 1;
    const value = Number.isFinite(config.value) ? config.value : (min + max) / 2;
    const label = config.label ?? fmtNumber(value);
    const tickCount = Math.max(2, Math.min(20, Number(config.tickCount) || 10));
    const showPoint = config.showPoint !== false;

    const s = svg("0 0 560 160");
    const left = 65;
    const right = 495;
    const y = 75;
    const x = n => left + ((n - min) / (max - min)) * (right - left);

    line(s, left, y, right, y);

    for (let i = 0; i <= tickCount; i++) {
      const xi = left + (i / tickCount) * (right - left);
      const isEnd = i === 0 || i === tickCount;
      line(s, xi, y - (isEnd ? 16 : 9), xi, y + (isEnd ? 16 : 9), isEnd ? "fdp-line" : "fdp-thin");
      if (isEnd || i === Math.floor(tickCount / 2)) {
        const n = min + (i / tickCount) * (max - min);
        text(s, fmtNumber(n), xi, 122, "fdp-text fdp-small");
      }
    }

    if (showPoint) {
      const xi = x(value);
      s.appendChild(el("circle", { cx: xi, cy: y, r: 8, class: "fdp-fill" }));
      text(s, label, xi, 38, "fdp-text fdp-label");
    }

    return s;
  }

  function renderConversionStrip(config = {}) {
    const fraction = config.fraction ?? "?";
    const decimal = config.decimal ?? "?";
    const percent = config.percent ?? "?";
    const s = svg("0 0 560 160");

    const boxes = [
      { title: "Fraction", value: fraction, x: 35 },
      { title: "Decimal", value: decimal, x: 205 },
      { title: "Percentage", value: percent, x: 375 }
    ];

    boxes.forEach((b, i) => {
      rect(s, b.x, 34, 140, 78, i === 1 ? "fdp-accent" : "fdp-soft", { rx: 8, ry: 8 });
      text(s, b.title, b.x + 70, 55, "fdp-text fdp-small");
      text(s, b.value, b.x + 70, 88, "fdp-text fdp-title");
    });

    line(s, 178, 73, 202, 73, "fdp-thin");
    line(s, 348, 73, 372, 73, "fdp-thin");
    return s;
  }

  function renderBestBuyBars(config = {}) {
    const optionA = config.optionA ?? { label: "A", units: 6, price: 9 };
    const optionB = config.optionB ?? { label: "B", units: 10, price: 14 };
    const maxUnits = Math.max(1, Number(optionA.units) || 1, Number(optionB.units) || 1);
    const s = svg("0 0 560 170");

    function bar(opt, y) {
      const units = Math.max(1, Number(opt.units) || 1);
      const w = 330 * units / maxUnits;
      text(s, opt.label, 54, y + 20, "fdp-text fdp-label");
      rect(s, 95, y, w, 38, "fdp-fill", { rx: 5, ry: 5 });
      rect(s, 95, y, 330, 38, "fdp-thin", { fill: "none", rx: 5, ry: 5 });
      text(s, `${units} for $${fmtNumber(opt.price)}`, 470, y + 20, "fdp-text fdp-small");
    }

    bar(optionA, 38);
    bar(optionB, 98);
    return s;
  }

  function render(target, config = {}) {
    target.innerHTML = "";
    const type = config.diagramType || "fraction-bar";
    let node;

    if (type === "percentage-grid") node = renderPercentageGrid(config);
    else if (type === "decimal-number-line") node = renderDecimalNumberLine(config);
    else if (type === "conversion-strip") node = renderConversionStrip(config);
    else if (type === "best-buy-bars") node = renderBestBuyBars(config);
    else node = renderFractionBar(config);

    target.appendChild(node);
  }

  return { render };
})();
