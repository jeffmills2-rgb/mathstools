/*
  MMT Exam Builder — Algebra Engine
  ---------------------------------
  Save as:

  engines/algebra/algebra-engine.js

  Browser global:
    window.MMT_ALGEBRA_ENGINE.render(node, config)
*/

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) el.setAttribute(key, String(value));
    });
    return el;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function addText(svg, text, x, y, attrs = {}) {
    const el = svgEl("text", {
      x,
      y,
      "font-family": "Cambria Math, STIX Two Math, Times New Roman, serif",
      "font-size": attrs.size || 20,
      "font-weight": attrs.weight || 700,
      "text-anchor": attrs.anchor || "middle",
      "dominant-baseline": attrs.baseline || "middle",
      fill: attrs.fill || "#111827"
    });
    el.textContent = text;
    svg.appendChild(el);
    return el;
  }

  function addLine(svg, x1, y1, x2, y2, attrs = {}) {
    const el = svgEl("line", {
      x1,
      y1,
      x2,
      y2,
      stroke: attrs.stroke || "#111827",
      "stroke-width": attrs.width || 3,
      "stroke-linecap": attrs.cap || "round",
      "stroke-dasharray": attrs.dash || ""
    });
    svg.appendChild(el);
    return el;
  }

  function addRect(svg, x, y, width, height, attrs = {}) {
    const el = svgEl("rect", {
      x,
      y,
      width,
      height,
      fill: attrs.fill || "#eff6ff",
      stroke: attrs.stroke || "#111827",
      "stroke-width": attrs.width || 3,
      rx: attrs.rx || 0
    });
    svg.appendChild(el);
    return el;
  }

  function renderBinomialAreaModel(node, config = {}) {
    clear(node);

    const variable = String(config.variable || "x");
    const a = Number(config.a || 3);
    const b = Number(config.b || 4);
    const showProducts = Boolean(config.showProducts);

    const width = 720;
    const height = 420;
    const svg = svgEl("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": `Area model for (${variable} plus ${a})(${variable} plus ${b})`
    });

    addRect(svg, 10, 10, width - 20, height - 20, {
      fill: "#f8fafc",
      stroke: "none",
      rx: 18
    });

    const x0 = 150;
    const y0 = 86;
    const wX = 280;
    const wA = 150;
    const hX = 185;
    const hB = 105;

    addRect(svg, x0, y0, wX + wA, hX + hB, { fill: "#eaf2ff", width: 3 });
    addLine(svg, x0 + wX, y0, x0 + wX, y0 + hX + hB, { width: 3 });
    addLine(svg, x0, y0 + hX, x0 + wX + wA, y0 + hX, { width: 3 });

    // Subtle alternating fill to make the four parts visible without looking busy.
    addRect(svg, x0 + 2, y0 + 2, wX - 4, hX - 4, { fill: "#dbeafe", stroke: "none" });
    addRect(svg, x0 + wX + 2, y0 + 2, wA - 4, hX - 4, { fill: "#eff6ff", stroke: "none" });
    addRect(svg, x0 + 2, y0 + hX + 2, wX - 4, hB - 4, { fill: "#eff6ff", stroke: "none" });
    addRect(svg, x0 + wX + 2, y0 + hX + 2, wA - 4, hB - 4, { fill: "#dbeafe", stroke: "none" });

    // Redraw main lines after fills.
    addRect(svg, x0, y0, wX + wA, hX + hB, { fill: "none", width: 3 });
    addLine(svg, x0 + wX, y0, x0 + wX, y0 + hX + hB, { width: 3 });
    addLine(svg, x0, y0 + hX, x0 + wX + wA, y0 + hX, { width: 3 });

    addText(svg, variable, x0 + wX / 2, y0 - 28, { size: 24 });
    addText(svg, String(a), x0 + wX + wA / 2, y0 - 28, { size: 24 });
    addText(svg, variable, x0 - 35, y0 + hX / 2, { size: 24 });
    addText(svg, String(b), x0 - 35, y0 + hX + hB / 2, { size: 24 });

    if (showProducts) {
      addText(svg, `${variable}²`, x0 + wX / 2, y0 + hX / 2, { size: 26 });
      addText(svg, `${a}${variable}`, x0 + wX + wA / 2, y0 + hX / 2, { size: 22 });
      addText(svg, `${b}${variable}`, x0 + wX / 2, y0 + hX + hB / 2, { size: 22 });
      addText(svg, String(a * b), x0 + wX + wA / 2, y0 + hX + hB / 2, { size: 22 });
    } else {
      [
        [x0 + wX / 2, y0 + hX / 2, 116, 44],
        [x0 + wX + wA / 2, y0 + hX / 2, 92, 44],
        [x0 + wX / 2, y0 + hX + hB / 2, 116, 44],
        [x0 + wX + wA / 2, y0 + hX + hB / 2, 92, 44]
      ].forEach(([cx, cy, bw, bh]) => {
        addRect(svg, cx - bw / 2, cy - bh / 2, bw, bh, {
          fill: "#ffffff",
          stroke: "#64748b",
          width: 2,
          rx: 8
        });
      });
    }

    node.appendChild(svg);
  }

  function render(node, config = {}) {
    if (config.diagramType === "binomial-area-model") {
      renderBinomialAreaModel(node, config);
      return;
    }

    clear(node);
    node.innerHTML = `<div class="diagram-placeholder">Algebra diagram unavailable</div>`;
  }

  window.MMT_ALGEBRA_ENGINE = { render };
})();
