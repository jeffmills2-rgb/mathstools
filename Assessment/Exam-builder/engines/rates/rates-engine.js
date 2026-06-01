/*
  CHHS Exam Builder — Ratios and Rates Diagram Engine
  Save as: engines/rates/rates-engine.js
*/

window.MMT_RATES_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function fmt(n) {
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    return Number(n.toFixed(1)).toString();
  }

  function makeSvg(width = 720, height = 430) {
    const svg = el("svg", {
      viewBox: `0 0 ${width} ${height}`,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": "distance-time graph",
      class: "rates-svg"
    });

    const style = el("style");
    style.textContent = `
      .rates-svg{overflow:visible}
      .rates-axis{stroke:#111827;stroke-width:2.6;stroke-linecap:round}
      .rates-grid-major{stroke:rgba(17,24,39,.28);stroke-width:1.4}
      .rates-grid-minor{stroke:rgba(17,24,39,.10);stroke-width:1}
      .rates-line{stroke:#9f174a;stroke-width:4;fill:none;stroke-linejoin:round;stroke-linecap:round}
      .rates-point{fill:#9f174a}
      .rates-label{font-family:"Cambria Math","Times New Roman",serif;font-size:17px;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .rates-axis-title{font-family:"Cambria Math","Times New Roman",serif;font-size:18px;font-weight:800;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .rates-border{stroke:#111827;stroke-width:2;fill:#fff}
    `;
    svg.appendChild(style);
    return svg;
  }

  function renderDistanceTime(target, config = {}) {
    const width = 720;
    const height = 430;
    const svg = makeSvg(width, height);

    const margin = { left: 76, right: 34, top: 34, bottom: 72 };
    const plot = {
      x: margin.left,
      y: margin.top,
      w: width - margin.left - margin.right,
      h: height - margin.top - margin.bottom
    };

    const xMax = Number.isFinite(Number(config.xMax)) ? Number(config.xMax) : 60;
    const yMax = Number.isFinite(Number(config.yMax)) ? Number(config.yMax) : 400;
    const xStep = Number.isFinite(Number(config.xStep)) ? Number(config.xStep) : 10;
    const yStep = Number.isFinite(Number(config.yStep)) ? Number(config.yStep) : 100;
    const xMinorStep = Number(config.xMinorStep || xStep / 2);
    const yMinorStep = Number(config.yMinorStep || yStep / 2);

    const xScale = value => plot.x + (value / xMax) * plot.w;
    const yScale = value => plot.y + plot.h - (value / yMax) * plot.h;

    svg.appendChild(el("rect", { x: plot.x, y: plot.y, width: plot.w, height: plot.h, class: "rates-border" }));

    drawGrid(svg, { plot, xMax, yMax, xStep, yStep, xMinorStep, yMinorStep, xScale, yScale });
    drawAxes(svg, { plot, xMax, yMax, xStep, yStep, xScale, yScale, config });

    const mode = config.mode || "completed";
    const points = Array.isArray(config.points) ? config.points : [];

    if (mode !== "blank" && points.length >= 2) {
      const path = points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(Number(point.x))} ${yScale(Number(point.y))}`)
        .join(" ");

      svg.appendChild(el("path", { d: path, class: "rates-line" }));

      points.forEach(point => {
        svg.appendChild(el("circle", {
          cx: xScale(Number(point.x)),
          cy: yScale(Number(point.y)),
          r: 4,
          class: "rates-point"
        }));
      });
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function drawGrid(svg, { plot, xMax, yMax, xStep, yStep, xMinorStep, yMinorStep, xScale, yScale }) {
    if (xMinorStep > 0) {
      for (let x = 0; x <= xMax + 1e-9; x += xMinorStep) {
        const isMajor = Math.abs(x / xStep - Math.round(x / xStep)) < 1e-9;
        svg.appendChild(el("line", {
          x1: xScale(x),
          y1: plot.y,
          x2: xScale(x),
          y2: plot.y + plot.h,
          class: isMajor ? "rates-grid-major" : "rates-grid-minor"
        }));
      }
    }

    if (yMinorStep > 0) {
      for (let y = 0; y <= yMax + 1e-9; y += yMinorStep) {
        const isMajor = Math.abs(y / yStep - Math.round(y / yStep)) < 1e-9;
        svg.appendChild(el("line", {
          x1: plot.x,
          y1: yScale(y),
          x2: plot.x + plot.w,
          y2: yScale(y),
          class: isMajor ? "rates-grid-major" : "rates-grid-minor"
        }));
      }
    }
  }

  function drawAxes(svg, { plot, xMax, yMax, xStep, yStep, xScale, yScale, config }) {
    svg.appendChild(el("line", { x1: plot.x, y1: plot.y + plot.h, x2: plot.x + plot.w, y2: plot.y + plot.h, class: "rates-axis" }));
    svg.appendChild(el("line", { x1: plot.x, y1: plot.y, x2: plot.x, y2: plot.y + plot.h, class: "rates-axis" }));

    for (let x = 0; x <= xMax + 1e-9; x += xStep) {
      const t = el("text", { x: xScale(x), y: plot.y + plot.h + 24, class: "rates-label" });
      t.textContent = fmt(x);
      svg.appendChild(t);
    }

    for (let y = 0; y <= yMax + 1e-9; y += yStep) {
      const t = el("text", { x: plot.x - 28, y: yScale(y), class: "rates-label" });
      t.textContent = fmt(y);
      svg.appendChild(t);
    }

    const xTitle = el("text", { x: plot.x + plot.w / 2, y: plot.y + plot.h + 54, class: "rates-axis-title" });
    xTitle.textContent = config.xLabel || "Time";
    svg.appendChild(xTitle);

    const yTitle = el("text", {
      x: 20,
      y: plot.y + plot.h / 2,
      class: "rates-axis-title",
      transform: `rotate(-90 20 ${plot.y + plot.h / 2})`
    });
    yTitle.textContent = config.yLabel || "Distance";
    svg.appendChild(yTitle);
  }

  function render(target, config = {}) {
    const type = config.diagramType || "distance-time";

    if (type === "distance-time") {
      renderDistanceTime(target, config);
      return;
    }

    target.innerHTML = `<div class="diagram-placeholder">Unknown rates diagram: ${type}</div>`;
  }

  return { render };
})();
