/*
  CHHS Exam Builder — Area Diagram Engine
  ---------------------------------------
  Save as:

  engines/area/area-engine.js

  Exposes:
  window.MMT_AREA_ENGINE.render(target, config)

  Supported diagramType values:
  - rectangle
  - triangle
  - parallelogram
  - composite-straight
  - circle
  - sector
  - partial-circle
  - curved-composite
  - trapezium
  - rhombus
  - kite
  - advanced-composite
*/

window.MMT_AREA_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);

    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        node.setAttribute(key, String(value));
      }
    });

    return node;
  }

  function makeSvg(width = 720, height = 430, label = "area diagram") {
    const svg = el("svg", {
      viewBox: `0 0 ${width} ${height}`,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": label,
      class: "area-svg"
    });

    const style = el("style");
    style.textContent = `
      .area-svg{overflow:visible}
      .area-fill{fill:#eff6ff}
      .area-highlight-fill{fill:rgba(29,78,216,.16)}
      .area-removed-fill{fill:#fff}
      .area-line{stroke:#111827;stroke-width:3.2;stroke-linejoin:round;stroke-linecap:round}
      .area-dash{stroke:#111827;stroke-width:2.4;stroke-dasharray:7 6;stroke-linecap:round}
      .area-feature{stroke:#1d4ed8;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round}
      .area-feature-green{stroke:#047857;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round}
      .area-diagonal{stroke:#9f174a;stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
      .area-label{font-family:"Cambria Math","Times New Roman",serif;font-size:22px;font-weight:800;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .area-small-label{font-family:"Cambria Math","Times New Roman",serif;font-size:18px;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .area-point{fill:#111827}
      .right-angle{fill:none;stroke:#111827;stroke-width:2.4}
      .equal-mark{stroke:#111827;stroke-width:3;stroke-linecap:round}
    `;
    svg.appendChild(style);

    return svg;
  }

  function number(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function label(svg, text, x, y, cls = "area-label", rotate = 0) {
    if (!text) return;
    const t = el("text", { x, y, class: cls });
    if (rotate) t.setAttribute("transform", `rotate(${rotate} ${x} ${y})`);
    t.textContent = text;
    svg.appendChild(t);
  }

  function pathFromPoints(points, close = true) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + (close ? " Z" : "");
  }

  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function sideLabel(svg, text, a, b, dx = 0, dy = 0, cls = "area-label") {
    const m = midpoint(a, b);
    label(svg, text, m.x + dx, m.y + dy, cls);
  }

  function rightAngle(svg, x, y, orientation = "bottom-right", size = 24) {
    let d;
    if (orientation === "bottom-right") d = `M ${x} ${y - size} L ${x + size} ${y - size} L ${x + size} ${y}`;
    else if (orientation === "bottom-left") d = `M ${x} ${y - size} L ${x - size} ${y - size} L ${x - size} ${y}`;
    else if (orientation === "top-right") d = `M ${x} ${y + size} L ${x + size} ${y + size} L ${x + size} ${y}`;
    else d = `M ${x} ${y + size} L ${x - size} ${y + size} L ${x - size} ${y}`;
    svg.appendChild(el("path", { d, class: "right-angle" }));
  }

  function drawTickMark(svg, a, b, count = 1) {
    const m = midpoint(a, b);
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const length = Math.hypot(vx, vy) || 1;
    const ux = vx / length;
    const uy = vy / length;
    const px = -uy;
    const py = ux;
    const tickLength = 22;
    const spacing = 12;
    const offsets = count === 2 ? [-spacing / 2, spacing / 2] : [0];

    offsets.forEach(offset => {
      const cx = m.x + ux * offset;
      const cy = m.y + uy * offset;
      svg.appendChild(el("line", {
        x1: cx - px * tickLength / 2,
        y1: cy - py * tickLength / 2,
        x2: cx + px * tickLength / 2,
        y2: cy + py * tickLength / 2,
        class: "equal-mark"
      }));
    });
  }

  function polar(cx, cy, r, angleDeg) {
    const angle = (angleDeg - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  }

  function arcPath(cx, cy, r, startAngle, endAngle) {
    const start = polar(cx, cy, r, startAngle);
    const end = polar(cx, cy, r, endAngle);
    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  function renderRectangle(target, config = {}) {
    const svg = makeSvg(720, 420, "rectangle area diagram");
    const x = 195;
    const y = 115;
    const w = 330;
    const h = 200;

    svg.appendChild(el("rect", {
      x,
      y,
      width: w,
      height: h,
      class: "area-fill area-line"
    }));

    label(svg, config.lengthLabel || "", x + w / 2, y + h + 36);
    label(svg, config.widthLabel || "", x - 52, y + h / 2);
    if (config.shape === "square") label(svg, "square", x + w / 2, y - 34, "area-small-label");

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderTriangle(target, config = {}) {
    const svg = makeSvg(720, 430, "triangle area diagram");

    const a = { x: 165, y: 320 };
    const b = { x: 565, y: 320 };
    const c = config.oblique
      ? { x: 430, y: 95 }
      : { x: 365, y: 95 };

    svg.appendChild(el("path", {
      d: pathFromPoints([a, b, c]),
      class: "area-fill area-line"
    }));

    const foot = { x: c.x, y: a.y };
    svg.appendChild(el("line", {
      x1: c.x,
      y1: c.y,
      x2: foot.x,
      y2: foot.y,
      class: "area-dash"
    }));
    rightAngle(svg, foot.x, foot.y, c.x >= 365 ? "bottom-left" : "bottom-right");

    sideLabel(svg, config.baseLabel || "", a, b, 0, 36);
    label(svg, config.heightLabel || "", c.x + 42, (c.y + foot.y) / 2, "area-label");

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderParallelogram(target, config = {}) {
    const svg = makeSvg(720, 430, "parallelogram area diagram");
    const a = { x: 170, y: 310 };
    const b = { x: 550, y: 310 };
    const c = { x: 465, y: 115 };
    const d = { x: 85, y: 115 };

    svg.appendChild(el("path", {
      d: pathFromPoints([a, b, c, d]),
      class: "area-fill area-line"
    }));

    const foot = { x: c.x, y: b.y };
    svg.appendChild(el("line", {
      x1: c.x,
      y1: c.y,
      x2: foot.x,
      y2: foot.y,
      class: "area-dash"
    }));
    rightAngle(svg, foot.x, foot.y, "bottom-left");

    sideLabel(svg, config.baseLabel || "", a, b, 0, 38);
    label(svg, config.heightLabel || "", c.x + 44, (c.y + foot.y) / 2);

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderCompositeStraight(target, config = {}) {
    const svg = makeSvg(720, 430, "straight-sided composite area diagram");

    if (config.shape === "rectangle-triangle") {
      const pts = [
        { x: 170, y: 315 },
        { x: 550, y: 315 },
        { x: 550, y: 160 },
        { x: 360, y: 80 },
        { x: 170, y: 160 }
      ];

      svg.appendChild(el("path", {
        d: pathFromPoints(pts),
        class: "area-fill area-line"
      }));

      svg.appendChild(el("line", { x1: 170, y1: 160, x2: 550, y2: 160, class: "area-dash" }));
      label(svg, config.baseLabel || "", 360, 347);
      label(svg, config.heightLabel || "", 120, 236);
      label(svg, config.triangleHeightLabel || "", 365, 118, "area-small-label");

      target.innerHTML = "";
      target.appendChild(svg);
      return;
    }

    const pts = [
      { x: 165, y: 105 },
      { x: 555, y: 105 },
      { x: 555, y: 245 },
      { x: 400, y: 245 },
      { x: 400, y: 325 },
      { x: 165, y: 325 }
    ];

    svg.appendChild(el("path", {
      d: pathFromPoints(pts),
      class: "area-fill area-line"
    }));

    svg.appendChild(el("line", { x1: 400, y1: 105, x2: 400, y2: 325, class: "area-dash" }));
    label(svg, config.topLabel || "", 360, 68);
    label(svg, config.leftHeightLabel || "", 110, 215);
    label(svg, config.rightHeightLabel || "", 596, 175);
    label(svg, config.notchWidthLabel || "", 480, 278);
    label(svg, config.bottomLabel || "", 285, 365);

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderCircle(target, config = {}) {
    const svg = makeSvg(720, 420, "circle area diagram");
    const cx = 360;
    const cy = 210;
    const r = 125;

    svg.appendChild(el("circle", {
      cx,
      cy,
      r,
      class: "area-fill area-line"
    }));
    svg.appendChild(el("circle", { cx, cy, r: 4.5, class: "area-point" }));

    if (config.given === "diameter") {
      svg.appendChild(el("line", { x1: cx - r, y1: cy, x2: cx + r, y2: cy, class: "area-feature" }));
      label(svg, config.diameterLabel || "", cx, cy - 30);
    } else {
      svg.appendChild(el("line", { x1: cx, y1: cy, x2: cx + r, y2: cy, class: "area-feature" }));
      label(svg, config.radiusLabel || "", cx + r / 2, cy - 28);
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderSector(target, config = {}) {
    const svg = makeSvg(720, 430, "sector area diagram");
    const cx = 360;
    const cy = 230;
    const r = 130;
    const angle = number(config.angle, 90);
    const startAngle = -angle / 2;
    const endAngle = angle / 2;
    const a = polar(cx, cy, r, startAngle);
    const b = polar(cx, cy, r, endAngle);
    const largeArc = angle > 180 ? 1 : 0;

    svg.appendChild(el("path", {
      d: `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${largeArc} 1 ${b.x} ${b.y} Z`,
      class: "area-fill area-line"
    }));

    svg.appendChild(el("path", { d: arcPath(cx, cy, 38, startAngle, endAngle), class: "area-feature-green" }));
    label(svg, `${angle}°`, cx, cy - 58, "area-small-label");
    label(svg, config.radiusLabel || "", cx + r / 2, cy + 32);

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderPartialCircle(target, config = {}) {
    const svg = makeSvg(720, 420, "partial circle area diagram");
    const shape = config.shape || "semicircle";
    const cx = 360;
    const cy = shape === "quadrant" ? 260 : 245;
    const r = 135;

    if (shape === "quadrant") {
      const start = { x: cx, y: cy - r };
      const end = { x: cx + r, y: cy };

      svg.appendChild(el("path", {
        d: `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y} Z`,
        class: "area-fill area-line"
      }));

      label(svg, config.radiusLabel || "", cx - 34, cy - r / 2);
      label(svg, config.radiusLabel || "", cx + r / 2, cy + 32);
      rightAngle(svg, cx, cy, "bottom-right", 30);
    } else {
      svg.appendChild(el("path", {
        d: `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} L ${cx - r} ${cy} Z`,
        class: "area-fill area-line"
      }));

      svg.appendChild(el("line", { x1: cx, y1: cy, x2: cx + r, y2: cy, class: "area-feature" }));
      label(svg, config.radiusLabel || "", cx + r / 2, cy + 32);
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderCurvedComposite(target, config = {}) {
    const svg = makeSvg(720, 430, "curved composite area diagram");

    if (config.shape === "square-minus-quadrant") {
      const x = 205;
      const y = 95;
      const size = 250;
      const cx = x;
      const cy = y + size;

      svg.appendChild(el("rect", { x, y, width: size, height: size, class: "area-fill area-line" }));

      // Removed quadrant: centre at the bottom-left corner of the square.
      // Drawing the two radii prevents the removed part appearing as a diagonal segment.
      svg.appendChild(el("path", {
        d: `M ${cx} ${cy} L ${cx} ${cy - size} A ${size} ${size} 0 0 1 ${cx + size} ${cy} Z`,
        class: "area-removed-fill"
      }));

      svg.appendChild(el("path", {
        d: `M ${cx} ${cy - size} A ${size} ${size} 0 0 1 ${cx + size} ${cy}`,
        class: "area-feature"
      }));

      label(svg, config.sideLabel || "", x + size / 2, y + size + 38);

      target.innerHTML = "";
      target.appendChild(svg);
      return;
    }

    const x = 175;
    const y = 125;
    const w = 300;
    const h = 170;
    svg.appendChild(el("rect", { x, y, width: w, height: h, class: "area-fill area-line" }));
    svg.appendChild(el("path", {
      d: `M ${x + w} ${y} A ${h / 2} ${h / 2} 0 0 1 ${x + w} ${y + h} Z`,
      class: "area-highlight-fill area-line"
    }));

    label(svg, config.widthLabel || "", x + w / 2, y - 32);
    label(svg, config.heightLabel || "", x - 48, y + h / 2);

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderTrapezium(target, config = {}) {
    const svg = makeSvg(720, 430, "trapezium area diagram");
    const pts = [
      { x: 150, y: 310 },
      { x: 570, y: 310 },
      { x: 480, y: 110 },
      { x: 250, y: 110 }
    ];

    svg.appendChild(el("path", { d: pathFromPoints(pts), class: "area-fill area-line" }));
    svg.appendChild(el("line", { x1: 480, y1: 110, x2: 480, y2: 310, class: "area-dash" }));
    rightAngle(svg, 480, 310, "bottom-left");

    sideLabel(svg, config.bottomLabel || "", pts[0], pts[1], 0, 38);
    sideLabel(svg, config.topLabel || "", pts[2], pts[3], 0, -34);
    label(svg, config.heightLabel || "", 525, 210);

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderRhombus(target, config = {}) {
    const svg = makeSvg(720, 430, "rhombus area diagram");
    const top = { x: 360, y: 75 };
    const right = { x: 555, y: 215 };
    const bottom = { x: 360, y: 355 };
    const left = { x: 165, y: 215 };

    svg.appendChild(el("path", { d: pathFromPoints([top, right, bottom, left]), class: "area-fill area-line" }));
    svg.appendChild(el("line", { x1: left.x, y1: left.y, x2: right.x, y2: right.y, class: "area-diagonal" }));
    svg.appendChild(el("line", { x1: top.x, y1: top.y, x2: bottom.x, y2: bottom.y, class: "area-diagonal" }));
    rightAngle(svg, 360, 215, "bottom-right", 24);

    label(svg, config.diagonalXLabel || "", 322, 150, "area-small-label");
    label(svg, config.diagonalYLabel || "", 430, 185, "area-small-label");

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderKite(target, config = {}) {
    const svg = makeSvg(720, 430, "kite area diagram");
    const top = { x: 360, y: 65 };
    const right = { x: 540, y: 190 };
    const bottom = { x: 360, y: 365 };
    const left = { x: 180, y: 190 };

    svg.appendChild(el("path", { d: pathFromPoints([top, right, bottom, left]), class: "area-fill area-line" }));
    svg.appendChild(el("line", { x1: left.x, y1: left.y, x2: right.x, y2: right.y, class: "area-diagonal" }));
    svg.appendChild(el("line", { x1: top.x, y1: top.y, x2: bottom.x, y2: bottom.y, class: "area-diagonal" }));
    rightAngle(svg, 360, 190, "bottom-right", 24);
    drawTickMark(svg, top, right, 1);
    drawTickMark(svg, left, top, 1);
    drawTickMark(svg, right, bottom, 2);
    drawTickMark(svg, bottom, left, 2);

    label(svg, config.diagonalXLabel || "", 322, 130, "area-small-label");
    label(svg, config.diagonalYLabel || "", 430, 160, "area-small-label");

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function renderAdvancedComposite(target, config = {}) {
    const svg = makeSvg(720, 430, "advanced composite area diagram");

    const pts = [
      { x: 135, y: 315 },
      { x: 560, y: 315 },
      { x: 500, y: 180 },
      { x: 360, y: 80 },
      { x: 220, y: 180 }
    ];

    svg.appendChild(el("path", { d: pathFromPoints(pts), class: "area-fill area-line" }));
    svg.appendChild(el("line", { x1: 220, y1: 180, x2: 500, y2: 180, class: "area-dash" }));
    svg.appendChild(el("line", { x1: 360, y1: 80, x2: 360, y2: 315, class: "area-dash" }));
    rightAngle(svg, 360, 180, "bottom-right", 22);

    label(svg, config.trapeziumTopLabel || "", 360, 148, "area-small-label");
    label(svg, config.trapeziumBottomLabel || "", 347, 350, "area-small-label");
    label(svg, config.totalHeightLabel || "", 596, 222);

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function render(target, config = {}) {
    const type = config.diagramType || "rectangle";

    if (type === "rectangle") return renderRectangle(target, config);
    if (type === "triangle") return renderTriangle(target, config);
    if (type === "parallelogram") return renderParallelogram(target, config);
    if (type === "composite-straight") return renderCompositeStraight(target, config);
    if (type === "circle") return renderCircle(target, config);
    if (type === "sector") return renderSector(target, config);
    if (type === "partial-circle") return renderPartialCircle(target, config);
    if (type === "curved-composite") return renderCurvedComposite(target, config);
    if (type === "trapezium") return renderTrapezium(target, config);
    if (type === "rhombus") return renderRhombus(target, config);
    if (type === "kite") return renderKite(target, config);
    if (type === "advanced-composite") return renderAdvancedComposite(target, config);

    target.innerHTML = `<div class="diagram-placeholder">Unknown area diagram: ${type}</div>`;
  }

  return { render };
})();
