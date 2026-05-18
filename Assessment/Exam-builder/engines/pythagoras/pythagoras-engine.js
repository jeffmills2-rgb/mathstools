/*
  CHHS Exam Builder — Pythagoras Diagram Engine
  ---------------------------------------------
  Save as:

  engines/pythagoras/pythagoras-engine.js

  Exposes:
  window.MMT_PYTHAGORAS_ENGINE.render(target, config)
*/

window.MMT_PYTHAGORAS_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const VIEW = { w: 300, h: 220 };

  const ROTATIONS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function choice(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function fmt(n) {
    if (typeof n === "string") return n;
    return Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : Number(n).toFixed(1);
  }

  function rotatePoint(p, angleRad) {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
      x: p.x * cos - p.y * sin,
      y: p.x * sin + p.y * cos
    };
  }

  function transformTriangle(a, b) {
    let points = [
      { name: "A", x: 0, y: 0 },
      { name: "B", x: b, y: 0 },
      { name: "C", x: 0, y: -a }
    ];

    if (Math.random() < 0.5) {
      points = points.map(p => ({ ...p, x: -p.x }));
    }

    const angle = choice(ROTATIONS) * Math.PI / 180;
    points = points.map(p => ({ ...p, ...rotatePoint(p, angle) }));

    const padding = 46;
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const rawW = maxX - minX || 1;
    const rawH = maxY - minY || 1;

    const scale = Math.min(
      (VIEW.w - 2 * padding) / rawW,
      (VIEW.h - 2 * padding) / rawH
    );

    points = points.map(p => ({
      ...p,
      x: (p.x - minX) * scale + (VIEW.w - rawW * scale) / 2,
      y: (p.y - minY) * scale + (VIEW.h - rawH * scale) / 2
    }));

    return Object.fromEntries(points.map(p => [p.name, p]));
  }

  function unitVector(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  function rightAngleMarker(A, B, C) {
    const size = 18;
    const v1 = unitVector(A, B);
    const v2 = unitVector(A, C);

    const p1 = { x: A.x + v1.x * size, y: A.y + v1.y * size };
    const p2 = { x: p1.x + v2.x * size, y: p1.y + v2.y * size };
    const p3 = { x: A.x + v2.x * size, y: A.y + v2.y * size };

    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`;
  }

  function rectIntersectsSegment(rect, p1, p2) {
    function pointInside(p) {
      return p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h;
    }

    function ccw(A, B, C) {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }

    function segmentsIntersect(A, B, C, D) {
      return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
    }

    const corners = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.w, y: rect.y },
      { x: rect.x + rect.w, y: rect.y + rect.h },
      { x: rect.x, y: rect.y + rect.h }
    ];

    if (pointInside(p1) || pointInside(p2)) return true;

    for (let i = 0; i < 4; i++) {
      if (segmentsIntersect(p1, p2, corners[i], corners[(i + 1) % 4])) return true;
    }

    return false;
  }

  function rectsOverlap(r1, r2) {
    return !(
      r1.x + r1.w < r2.x ||
      r2.x + r2.w < r1.x ||
      r1.y + r1.h < r2.y ||
      r2.y + r2.h < r1.y
    );
  }

  function pointInTriangle(p, A, B, C) {
    const area = (P, Q, R) =>
      Math.abs((P.x * (Q.y - R.y) + Q.x * (R.y - P.y) + R.x * (P.y - Q.y)) / 2);

    const main = area(A, B, C);
    const a1 = area(p, B, C);
    const a2 = area(A, p, C);
    const a3 = area(A, B, p);

    return Math.abs(main - (a1 + a2 + a3)) < 0.6;
  }

  function makeLabelCandidate(p1, p2, text, centroid, t, off) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;

    let nx = -dy / len;
    let ny = dx / len;

    const mid = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };

    const toMid = {
      x: mid.x - centroid.x,
      y: mid.y - centroid.y
    };

    if (nx * toMid.x + ny * toMid.y < 0) {
      nx *= -1;
      ny *= -1;
    }

    const x = p1.x + dx * t + nx * off;
    const y = p1.y + dy * t + ny * off;
    const w = Math.max(42, String(text).length * 11 + 14);
    const h = 28;

    return {
      x,
      y,
      rect: {
        x: x - w / 2,
        y: y - h / 2,
        w,
        h
      },
      t,
      off
    };
  }

  function scoreLabelCandidate(candidate, allEdges, trianglePoints, placedRects) {
    const margin = 3;
    const safeRect = {
      x: candidate.rect.x - margin,
      y: candidate.rect.y - margin,
      w: candidate.rect.w + margin * 2,
      h: candidate.rect.h + margin * 2
    };

    const rectPoints = [
      { x: safeRect.x, y: safeRect.y },
      { x: safeRect.x + safeRect.w, y: safeRect.y },
      { x: safeRect.x + safeRect.w, y: safeRect.y + safeRect.h },
      { x: safeRect.x, y: safeRect.y + safeRect.h },
      { x: candidate.x, y: candidate.y }
    ];

    const insideHits = rectPoints.filter(pt => pointInTriangle(pt, trianglePoints[0], trianglePoints[1], trianglePoints[2])).length;
    const edgeHits = allEdges.filter(edge => rectIntersectsSegment(safeRect, edge[0], edge[1])).length;
    const labelHits = placedRects.filter(r => rectsOverlap(safeRect, r)).length;

    const outOfBounds =
      Math.max(0, 8 - candidate.rect.x) +
      Math.max(0, candidate.rect.x + candidate.rect.w - (VIEW.w - 8)) +
      Math.max(0, 8 - candidate.rect.y) +
      Math.max(0, candidate.rect.y + candidate.rect.h - (VIEW.h - 8));

    return (
      insideHits * 2500 +
      edgeHits * 1400 +
      labelHits * 2200 +
      outOfBounds * 10 +
      candidate.off * 2 +
      Math.abs(candidate.t - 0.5) * 45
    );
  }

  function labelForSide(p1, p2, text, centroid, allEdges, trianglePoints, placedRects) {
    const candidates = [];
    const alongPositions = [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74];
    const offsets = [22, 28, 34, 40, 46, 52];

    for (const off of offsets) {
      for (const t of alongPositions) {
        candidates.push(makeLabelCandidate(p1, p2, text, centroid, t, off));
      }
    }

    let best = candidates[0];
    let bestScore = Infinity;

    for (const candidate of candidates) {
      const score = scoreLabelCandidate(candidate, allEdges, trianglePoints, placedRects);

      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }

      if (score === candidate.off * 2 + Math.abs(candidate.t - 0.5) * 45 && candidate.off <= 34) break;
    }

    placedRects.push({
      x: best.rect.x - 4,
      y: best.rect.y - 4,
      w: best.rect.w + 8,
      h: best.rect.h + 8
    });

    return {
      text,
      x: best.x,
      y: best.y + 1
    };
  }

  function makeSvg() {
    const svg = el("svg", {
      viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
      width: "100%",
      height: "100%",
      class: "pythagoras-svg",
      role: "img",
      "aria-label": "right triangle diagram"
    });

    const style = el("style");
    style.textContent = `
      .pythagoras-svg{overflow:visible;background:#fff}
      .py-triangle{stroke:#111827;stroke-width:4;fill:rgba(255,255,255,.2);stroke-linejoin:round}
      .py-right{stroke:#111827;stroke-width:3;fill:none;stroke-linejoin:round}
      .py-label{font-family:"Cambria Math","Times New Roman",serif;font-size:19px;font-weight:900;dominant-baseline:middle;text-anchor:middle;fill:#111827;paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}
    `;
    svg.appendChild(style);
    return svg;
  }

  function renderTriangle(target, config = {}) {
    const a = Number(config.a || 3);
    const b = Number(config.b || 4);
    const c = Number(config.c || Math.sqrt(a * a + b * b));

    const labels = config.labels || {
      a: `${fmt(a)}${config.units ? " " + config.units : ""}`,
      b: `${fmt(b)}${config.units ? " " + config.units : ""}`,
      c: `${fmt(c)}${config.units ? " " + config.units : ""}`
    };

    const P = transformTriangle(a, b);
    const A = P.A;
    const B = P.B;
    const C = P.C;

    const centroid = {
      x: (A.x + B.x + C.x) / 3,
      y: (A.y + B.y + C.y) / 3
    };

    const edges = [[A, B], [A, C], [B, C]];
    const trianglePoints = [A, B, C];
    const placedRects = [];

    const labelA = labelForSide(A, C, labels.a, centroid, edges, trianglePoints, placedRects);
    const labelB = labelForSide(A, B, labels.b, centroid, edges, trianglePoints, placedRects);
    const labelC = labelForSide(B, C, labels.c, centroid, edges, trianglePoints, placedRects);

    const svg = makeSvg();

    svg.appendChild(el("polygon", {
      points: `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`,
      class: "py-triangle"
    }));

    svg.appendChild(el("path", {
      d: rightAngleMarker(A, B, C),
      class: "py-right"
    }));

    [labelA, labelB, labelC].forEach(item => {
      const text = el("text", {
        x: item.x,
        y: item.y,
        class: "py-label"
      });
      text.textContent = item.text;
      svg.appendChild(text);
    });

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function render(target, config = {}) {
    if (!target) return;

    const type = config.diagramType || "right-triangle";

    if (type === "right-triangle") {
      renderTriangle(target, config);
      return;
    }

    target.innerHTML = "<div class='diagram-placeholder'>Unknown Pythagoras diagram</div>";
  }

  return { render };
})();
