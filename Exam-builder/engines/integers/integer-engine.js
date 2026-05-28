/*
  CHHS Exam Builder — Integer Diagram Engine
  ------------------------------------------
  Save as:

  engines/integers/integer-engine.js

  Exposes:
  window.MMT_INTEGER_ENGINE.render(target, config)
*/

window.MMT_INTEGER_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function fmt(n) {
    return n < 0 ? `−${Math.abs(n)}` : String(n);
  }

  function makeSvg() {
    const svg = el("svg", {
      viewBox: "0 0 1000 200",
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": "number line",
      class: "integer-svg"
    });

    const style = el("style");
    style.textContent = `
      .integer-svg{overflow:visible}
      .int-baseline{stroke:#111827;stroke-width:5;stroke-linecap:round}
      .int-tick{stroke:#111827;stroke-width:3;stroke-linecap:round}
      .int-tick-minor{stroke:rgba(17,24,39,.45);stroke-width:2;stroke-linecap:round}
      .int-dot{fill:#111827}
      .int-answer-dot{fill:#16a34a}
      .int-label{font-family:"Cambria Math","Times New Roman",serif;font-size:24px;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .int-answer-label{fill:#16a34a}
    `;

    svg.appendChild(style);
    return svg;
  }

  function renderNumberLine(target, config = {}) {
    const svg = makeSvg();

    const min = Number.isFinite(config.min) ? config.min : -10;
    const max = Number.isFinite(config.max) ? config.max : 10;
    const step = Number.isFinite(config.step) ? config.step : 1;
    const labels = Array.isArray(config.labels) ? config.labels : [min, 0, max];
    const answer = config.answer;
    const showAnswer = !!config.showAnswer;

    const left = 85;
    const right = 915;
    const y = 86;
    const labelY = 168;

    const x = value => left + ((value - min) / (max - min)) * (right - left);

    svg.appendChild(el("line", {
      x1: left,
      y1: y,
      x2: right,
      y2: y,
      class: "int-baseline"
    }));

    const labelSet = new Set(labels.map(Number));

    for (let v = min; v <= max; v += step) {
      const xi = x(v);
      const isLabelled = labelSet.has(v);

      svg.appendChild(el("line", {
        x1: xi,
        y1: y - (isLabelled ? 22 : 12),
        x2: xi,
        y2: y + (isLabelled ? 22 : 12),
        class: isLabelled ? "int-tick" : "int-tick-minor"
      }));

      if (isLabelled) {
        svg.appendChild(el("circle", {
          cx: xi,
          cy: y,
          r: 8,
          class: "int-dot"
        }));

        const t = el("text", {
          x: xi,
          y: labelY,
          class: "int-label"
        });
        t.textContent = fmt(v);
        svg.appendChild(t);
      }
    }

    if (showAnswer && Number.isFinite(answer)) {
      const xi = x(answer);

      svg.appendChild(el("circle", {
        cx: xi,
        cy: y,
        r: 9,
        class: "int-answer-dot"
      }));

      if (!labelSet.has(answer)) {
        const t = el("text", {
          x: xi,
          y: labelY,
          class: "int-label int-answer-label"
        });
        t.textContent = fmt(answer);
        svg.appendChild(t);
      }
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function render(target, config = {}) {
    if (!target) return;

    const type = config.diagramType || "number-line";

    if (type === "number-line") {
      renderNumberLine(target, config);
      return;
    }

    target.innerHTML = "<div class='diagram-placeholder'>Unknown integer diagram</div>";
  }

  return { render };
})();
