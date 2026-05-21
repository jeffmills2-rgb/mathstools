/*
  CHHS Exam Builder — Linear Relationships Diagram Engine
  ------------------------------------------------------
  Save as:

  engines/linear/linear-engine.js

  Exposes:
  window.MMT_LINEAR_ENGINE.render(target, config)

  Supported diagramType values:
  - "coordinate-plane"
  - "linear-graph"
  - "intersecting-lines"
  - "tile-pattern"

  This engine is designed for printable exam diagrams:
  - crisp SVG output
  - Cartesian planes with whole-number or decimal coordinates
  - blank coordinate grids for plotting tasks
  - plotted labelled points for coordinate-reading tasks
  - one or more straight-line graphs
  - optional intersection markers
  - simple tile/dot patterns for pattern-table-rule questions
*/

window.MMT_LINEAR_ENGINE = (() => {
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

  function makeSvg(width = 720, height = 520, label = "linear relationships diagram") {
    const svg = el("svg", {
      viewBox: `0 0 ${width} ${height}`,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": label,
      class: "linear-svg"
    });

    const style = el("style");
    style.textContent = `
      .linear-svg{overflow:visible}
      .linear-grid-major{stroke:rgba(17,24,39,.30);stroke-width:1.25}
      .linear-grid-minor{stroke:rgba(17,24,39,.13);stroke-width:.9}
      .linear-axis{stroke:#111827;stroke-width:2.7;stroke-linecap:round}
      .linear-border{fill:#fff;stroke:#111827;stroke-width:2}
      .linear-tick{stroke:#111827;stroke-width:1.7}
      .linear-label{font-family:"Cambria Math","Times New Roman",serif;font-size:16px;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .linear-axis-title{font-family:"Cambria Math","Times New Roman",serif;font-size:18px;font-weight:800;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .linear-point{fill:#111827;stroke:#111827;stroke-width:1.5}
      .linear-point-open{fill:#fff;stroke:#111827;stroke-width:2}
      .linear-point-label{font-family:"Cambria Math","Times New Roman",serif;font-size:20px;font-weight:800;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .linear-line-a{stroke:#9f174a;stroke-width:3.7;fill:none;stroke-linecap:round;stroke-linejoin:round}
      .linear-line-b{stroke:#1d4ed8;stroke-width:3.7;fill:none;stroke-linecap:round;stroke-linejoin:round}
      .linear-line-c{stroke:#047857;stroke-width:3.7;fill:none;stroke-linecap:round;stroke-linejoin:round}
      .linear-line-d{stroke:#7c2d12;stroke-width:3.7;fill:none;stroke-linecap:round;stroke-linejoin:round}
      .linear-line-label{font-family:"Cambria Math","Times New Roman",serif;font-size:16px;font-weight:800;fill:#111827;dominant-baseline:middle}
      .linear-intersection{fill:#111827;stroke:#fff;stroke-width:2}
      .linear-pattern-tile{fill:#dbeafe;stroke:#111827;stroke-width:1.8}
      .linear-pattern-dot{fill:#111827}
      .linear-pattern-label{font-family:"Cambria Math","Times New Roman",serif;font-size:17px;font-weight:800;fill:#111827;text-anchor:middle;dominant-baseline:middle}
    `;
    svg.appendChild(style);

    return svg;
  }

  function fmt(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) return String(value ?? "");
    if (Math.abs(n) < 1e-10) return "0";
    if (Math.abs(n - Math.round(n)) < 1e-10) return String(Math.round(n));

    return Number(n.toFixed(2)).toString();
  }

  function number(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function normaliseBounds(config = {}) {
    let xMin = number(config.xMin, -5);
    let xMax = number(config.xMax, 5);
    let yMin = number(config.yMin, -5);
    let yMax = number(config.yMax, 5);

    if (xMin === xMax) {
      xMin -= 5;
      xMax += 5;
    }

    if (yMin === yMax) {
      yMin -= 5;
      yMax += 5;
    }

    if (xMin > xMax) [xMin, xMax] = [xMax, xMin];
    if (yMin > yMax) [yMin, yMax] = [yMax, yMin];

    const xStep = Math.abs(number(config.xStep, 1)) || 1;
    const yStep = Math.abs(number(config.yStep, 1)) || 1;
    const xMinorStep = Math.abs(number(config.xMinorStep, xStep / 2)) || xStep;
    const yMinorStep = Math.abs(number(config.yMinorStep, yStep / 2)) || yStep;

    return { xMin, xMax, yMin, yMax, xStep, yStep, xMinorStep, yMinorStep };
  }

  function makePlot(config = {}, width = 720, height = 520) {
    const margin = {
      left: number(config.marginLeft, 74),
      right: number(config.marginRight, config.squareGrid ? 74 : 34),
      top: number(config.marginTop, config.squareGrid ? 58 : 34),
      bottom: number(config.marginBottom, config.squareGrid ? 48 : 70)
    };

    const bounds = normaliseBounds(config);

    const availableW = width - margin.left - margin.right;
    const availableH = height - margin.top - margin.bottom;

    const plot = {
      x: margin.left,
      y: margin.top,
      w: availableW,
      h: availableH
    };

    // For Cartesian graphing questions, keep the plotted grid square so one
    // unit on the x-axis is the same visual length as one unit on the y-axis.
    // The question bank supplies matching x/y bounds for these diagrams.
    if (config.squareGrid === true) {
      const size = Math.min(availableW, availableH);
      plot.x = margin.left + (availableW - size) / 2;
      plot.y = margin.top + (availableH - size) / 2;
      plot.w = size;
      plot.h = size;
    }

    const xScale = value => plot.x + ((value - bounds.xMin) / (bounds.xMax - bounds.xMin)) * plot.w;
    const yScale = value => plot.y + plot.h - ((value - bounds.yMin) / (bounds.yMax - bounds.yMin)) * plot.h;

    return { width, height, margin, bounds, plot, xScale, yScale };
  }

  function drawGridAndAxes(svg, ctx, config = {}) {
    const { plot, bounds, xScale, yScale } = ctx;
    const {
      xMin, xMax, yMin, yMax,
      xStep, yStep, xMinorStep, yMinorStep
    } = bounds;

    svg.appendChild(el("rect", {
      x: plot.x,
      y: plot.y,
      width: plot.w,
      height: plot.h,
      class: "linear-border"
    }));

    drawGridLines(svg, {
      min: xMin,
      max: xMax,
      step: xMinorStep,
      majorStep: xStep,
      scale: xScale,
      vertical: true,
      plot
    });

    drawGridLines(svg, {
      min: yMin,
      max: yMax,
      step: yMinorStep,
      majorStep: yStep,
      scale: yScale,
      vertical: false,
      plot
    });

    const xAxisY = yMin <= 0 && yMax >= 0 ? yScale(0) : plot.y + plot.h;
    const yAxisX = xMin <= 0 && xMax >= 0 ? xScale(0) : plot.x;

    svg.appendChild(el("line", {
      x1: plot.x,
      y1: xAxisY,
      x2: plot.x + plot.w,
      y2: xAxisY,
      class: "linear-axis"
    }));

    svg.appendChild(el("line", {
      x1: yAxisX,
      y1: plot.y,
      x2: yAxisX,
      y2: plot.y + plot.h,
      class: "linear-axis"
    }));

    drawAxisLabels(svg, ctx, { xAxisY, yAxisX, config });
  }

  function drawGridLines(svg, { min, max, step, majorStep, scale, vertical, plot }) {
    if (!Number.isFinite(step) || step <= 0) return;

    const start = Math.ceil(min / step) * step;

    for (let value = start; value <= max + 1e-9; value += step) {
      const isMajor = Math.abs(value / majorStep - Math.round(value / majorStep)) < 1e-8;
      const position = scale(value);

      svg.appendChild(el("line", vertical
        ? {
            x1: position,
            y1: plot.y,
            x2: position,
            y2: plot.y + plot.h,
            class: isMajor ? "linear-grid-major" : "linear-grid-minor"
          }
        : {
            x1: plot.x,
            y1: position,
            x2: plot.x + plot.w,
            y2: position,
            class: isMajor ? "linear-grid-major" : "linear-grid-minor"
          }
      ));
    }
  }

  function drawAxisLabels(svg, ctx, { xAxisY, yAxisX, config }) {
    const { plot, bounds, xScale, yScale } = ctx;
    const { xMin, xMax, yMin, yMax, xStep, yStep } = bounds;

    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + 1e-9; x += xStep) {
      const showOriginLabel = config.showOriginLabel === true || Math.abs(x) > 1e-9;
      if (!showOriginLabel) continue;

      const t = el("text", {
        x: xScale(x),
        y: Math.min(plot.y + plot.h + 24, xAxisY + 24),
        class: "linear-label"
      });
      t.textContent = fmt(x);
      svg.appendChild(t);
    }

    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) {
      const showOriginLabel = config.showOriginLabel === true || Math.abs(y) > 1e-9;
      if (!showOriginLabel) continue;

      const t = el("text", {
        x: Math.max(22, yAxisX - 26),
        y: yScale(y),
        class: "linear-label"
      });
      t.textContent = fmt(y);
      svg.appendChild(t);
    }

    const xTitle = el("text", {
      x: Math.min(ctx.width - 22, plot.x + plot.w + 28),
      y: Math.max(plot.y + 12, Math.min(plot.y + plot.h - 12, xAxisY)),
      class: "linear-axis-title"
    });
    xTitle.textContent = config.xLabel || "x";
    svg.appendChild(xTitle);

    const yTitle = el("text", {
      x: Math.max(plot.x + 16, Math.min(plot.x + plot.w - 16, yAxisX)),
      y: Math.max(18, plot.y - 28),
      class: "linear-axis-title"
    });
    yTitle.textContent = config.yLabel || "y";
    svg.appendChild(yTitle);
  }

  function drawPoints(svg, ctx, points = [], config = {}) {
    const { xScale, yScale, bounds } = ctx;

    points.forEach((point, index) => {
      const x = Number(point.x);
      const y = Number(point.y);

      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (x < bounds.xMin || x > bounds.xMax || y < bounds.yMin || y > bounds.yMax) return;

      const cx = xScale(x);
      const cy = yScale(y);

      svg.appendChild(el("circle", {
        cx,
        cy,
        r: number(point.r, 5.2),
        class: point.open ? "linear-point-open" : "linear-point"
      }));

      const label = point.label ?? "";
      const showCoordinates = point.showCoordinates ?? config.showCoordinates;

      if (label || showCoordinates) {
        const text = el("text", {
          x: cx + number(point.labelDx, 18),
          y: cy + number(point.labelDy, -16),
          class: "linear-point-label"
        });

        text.textContent = showCoordinates
          ? `${label ? label : ""}${label ? " " : ""}(${fmt(x)}, ${fmt(y)})`
          : String(label);

        svg.appendChild(text);
      }
    });
  }

  function renderCoordinatePlane(target, config = {}) {
    const width = number(config.width, 720);
    const height = number(config.height, 520);
    const svg = makeSvg(width, height, "Cartesian plane");
    const ctx = makePlot(config, width, height);

    drawGridAndAxes(svg, ctx, config);

    if (Array.isArray(config.points) && config.mode !== "blank") {
      drawPoints(svg, ctx, config.points, config);
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function lineY(line, x) {
    const m = number(line.m, 1);
    const b = number(line.b, 0);
    return m * x + b;
  }

  function lineExpression(line) {
    if (line.label) return line.label;

    const m = number(line.m, 1);
    const b = number(line.b, 0);

    const mText =
      Math.abs(m - 1) < 1e-9 ? "x" :
      Math.abs(m + 1) < 1e-9 ? "−x" :
      `${fmt(m)}x`;

    if (Math.abs(b) < 1e-9) return `y = ${mText}`;
    return b > 0 ? `y = ${mText} + ${fmt(b)}` : `y = ${mText} − ${fmt(Math.abs(b))}`;
  }

  function clipLineToBounds(line, bounds) {
    const { xMin, xMax, yMin, yMax } = bounds;
    const m = number(line.m, 1);
    const b = number(line.b, 0);
    const candidates = [];

    // Intersections with x = xMin, x = xMax
    [xMin, xMax].forEach(x => {
      const y = m * x + b;
      if (y >= yMin - 1e-9 && y <= yMax + 1e-9) candidates.push({ x, y });
    });

    // Intersections with y = yMin, y = yMax
    if (Math.abs(m) > 1e-12) {
      [yMin, yMax].forEach(y => {
        const x = (y - b) / m;
        if (x >= xMin - 1e-9 && x <= xMax + 1e-9) candidates.push({ x, y });
      });
    }

    const unique = [];

    candidates.forEach(point => {
      if (!unique.some(existing => Math.abs(existing.x - point.x) < 1e-8 && Math.abs(existing.y - point.y) < 1e-8)) {
        unique.push(point);
      }
    });

    if (unique.length < 2) return null;
    return [unique[0], unique[1]];
  }

  function drawLine(svg, ctx, line, index = 0, config = {}) {
    const clipped = clipLineToBounds(line, ctx.bounds);
    if (!clipped) return;

    const classes = ["linear-line-a", "linear-line-b", "linear-line-c", "linear-line-d"];
    const className = line.className || classes[index % classes.length];

    const [a, b] = clipped;

    svg.appendChild(el("line", {
      x1: ctx.xScale(a.x),
      y1: ctx.yScale(a.y),
      x2: ctx.xScale(b.x),
      y2: ctx.yScale(b.y),
      class: className
    }));

    if (line.showLabel !== false && config.showLineLabels !== false) {
      const labelPoint = chooseLabelPoint(a, b, ctx.bounds);
      const t = el("text", {
        x: ctx.xScale(labelPoint.x) + 8,
        y: ctx.yScale(labelPoint.y) - 8,
        class: "linear-line-label"
      });
      t.textContent = lineExpression(line);
      svg.appendChild(t);
    }
  }

  function chooseLabelPoint(a, b, bounds) {
    const t = 0.72;
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t
    };
  }

  function getLines(config = {}) {
    if (Array.isArray(config.lines)) return config.lines;
    if (config.line) return [config.line];
    return [];
  }

  function renderLinearGraph(target, config = {}) {
    const width = number(config.width, 720);
    const height = number(config.height, 520);
    const svg = makeSvg(width, height, "linear graph");
    const ctx = makePlot(config, width, height);

    drawGridAndAxes(svg, ctx, config);

    const lines = getLines(config);

    if (config.mode !== "blank" && config.showLine !== false) {
      lines.forEach((line, index) => drawLine(svg, ctx, line, index, config));
    }

    if (Array.isArray(config.points)) {
      drawPoints(svg, ctx, config.points, config);
    }

    if (config.showIntersection === true && lines.length >= 2) {
      drawIntersection(svg, ctx, lines[0], lines[1], config);
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function drawIntersection(svg, ctx, lineA, lineB, config = {}) {
    const m1 = number(lineA.m, 1);
    const b1 = number(lineA.b, 0);
    const m2 = number(lineB.m, -1);
    const b2 = number(lineB.b, 0);

    if (Math.abs(m1 - m2) < 1e-12) return;

    const x = (b2 - b1) / (m1 - m2);
    const y = m1 * x + b1;

    if (x < ctx.bounds.xMin || x > ctx.bounds.xMax || y < ctx.bounds.yMin || y > ctx.bounds.yMax) return;

    const cx = ctx.xScale(x);
    const cy = ctx.yScale(y);

    svg.appendChild(el("circle", {
      cx,
      cy,
      r: 6,
      class: "linear-intersection"
    }));

    if (config.showIntersectionLabel !== false) {
      const t = el("text", {
        x: cx + 32,
        y: cy - 18,
        class: "linear-point-label"
      });
      t.textContent = `(${fmt(x)}, ${fmt(y)})`;
      svg.appendChild(t);
    }
  }

  function renderTilePattern(target, config = {}) {
    const figures = Array.isArray(config.figures) && config.figures.length
      ? config.figures
      : [
          { n: 1, count: 5 },
          { n: 2, count: 8 },
          { n: 3, count: 11 }
        ];

    const width = number(config.width, 720);
    const height = number(config.height, 260);
    const svg = makeSvg(width, height, "geometric pattern");
    const tileSize = number(config.tileSize, 20);
    const gap = number(config.gap, 4);
    const figureGap = number(config.figureGap, 56);
    const baseY = 122;

    let cursorX = 38;

    figures.forEach(figure => {
      const n = Number(figure.n);
      const count = Number(figure.count);
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const figureWidth = cols * (tileSize + gap);
      const startX = cursorX;

      const label = el("text", {
        x: startX + figureWidth / 2,
        y: 28,
        class: "linear-pattern-label"
      });
      label.textContent = `Figure ${fmt(n)}`;
      svg.appendChild(label);

      for (let i = 0; i < count; i += 1) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        svg.appendChild(el("rect", {
          x: startX + col * (tileSize + gap),
          y: baseY - rows * (tileSize + gap) / 2 + row * (tileSize + gap),
          width: tileSize,
          height: tileSize,
          rx: 2,
          class: "linear-pattern-tile"
        }));
      }

      const countLabel = el("text", {
        x: startX + figureWidth / 2,
        y: height - 28,
        class: "linear-pattern-label"
      });
      countLabel.textContent = config.showCounts === false ? "" : `${count} tiles`;
      svg.appendChild(countLabel);

      cursorX += figureWidth + figureGap;
    });

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function render(target, config = {}) {
    const type = config.diagramType || "coordinate-plane";

    if (type === "coordinate-plane") {
      renderCoordinatePlane(target, config);
      return;
    }

    if (type === "linear-graph") {
      renderLinearGraph(target, config);
      return;
    }

    if (type === "intersecting-lines") {
      renderLinearGraph(target, {
        ...config,
        showIntersection: config.showIntersection ?? true
      });
      return;
    }

    if (type === "tile-pattern") {
      renderTilePattern(target, config);
      return;
    }

    target.innerHTML = `<div class="diagram-placeholder">Unknown linear diagram: ${type}</div>`;
  }

  return { render };
})();
