window.MMT_ANGLE_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const VIEW = { w: 420, h: 260 };

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
    return node;
  }

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function point(cx, cy, angle, length) {
    const r = degToRad(angle);
    return {
      x: cx + Math.cos(r) * length,
      y: cy - Math.sin(r) * length
    };
  }

  function svg() {
    const s = el("svg", {
      viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
      width: "100%",
      height: "100%",
      class: "angle-svg"
    });

    const style = el("style");
    style.textContent = `
      .angle-svg{overflow:hidden;display:block}
      .ray,.baseLine{stroke:#111827;stroke-width:4;stroke-linecap:round;fill:none}
      .arc{stroke:#2563eb;stroke-width:4;stroke-linecap:butt;fill:none}
      .arc.green{stroke:#16a34a}
      .arc.orange{stroke:#f97316}
      .angleLabel,.pointLabel{font-family:"Cambria Math","Times New Roman",serif;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .angleLabel{font-size:17px;paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}
      .pointLabel{font-size:17px;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}
      .vertexDot{fill:#111827}
      .rightMarker,.parallelMarker{stroke:#111827;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;fill:none}
      .protFill{fill:rgba(255,255,255,.74);stroke:#111827;stroke-width:2.2}
      .protLine{stroke:#111827;stroke-width:1.45;stroke-linecap:round;fill:none}
      .protArc{stroke:#111827;stroke-width:1.35;fill:none;opacity:.92}
      .protTickMinor{stroke:#111827;stroke-width:.7;stroke-linecap:round}
      .protTickMid{stroke:#111827;stroke-width:1;stroke-linecap:round}
      .protTickMajor{stroke:#111827;stroke-width:1.65;stroke-linecap:round}
      .protRadial{stroke:#111827;stroke-width:1;stroke-linecap:round;opacity:.68}
      .protNumber{font-family:"Cambria Math","Times New Roman",serif;font-weight:800;font-size:12.5px;fill:#111827;text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:rgba(255,255,255,.98);stroke-width:5px;stroke-linejoin:round}
      .protNumber.big{font-size:18px;font-weight:950}
      .protOrigin{fill:#fff;stroke:#111827;stroke-width:2}
      .protT{font-family:"Cambria Math","Times New Roman",serif;font-weight:900;font-size:12px;fill:#475569;text-anchor:middle;dominant-baseline:middle}
    `;
    s.appendChild(style);
    return s;
  }

  function sweep(start, end) {
    let value = end - start;
    while (value < 0) value += 360;
    return value;
  }

  function arcPath(cx, cy, r, start, end) {
    const a = point(cx, cy, start, r);
    const b = point(cx, cy, end, r);
    const large = sweep(start, end) > 180 ? 1 : 0;
    return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y}`;
  }

  function protractorBodyPath(cx, cy, outerR, innerR) {
    const leftOuter = point(cx, cy, 180, outerR);
    const rightOuter = point(cx, cy, 0, outerR);
    const rightInner = point(cx, cy, 0, innerR);
    const leftInner = point(cx, cy, 180, innerR);

    return [
      `M ${leftOuter.x} ${leftOuter.y}`,
      `A ${outerR} ${outerR} 0 0 1 ${rightOuter.x} ${rightOuter.y}`,
      `L ${rightInner.x} ${rightInner.y}`,
      `A ${innerR} ${innerR} 0 0 0 ${leftInner.x} ${leftInner.y}`,
      "Z"
    ].join(" ");
  }

  function rotatedLabel(svg, text, x, y, rotation, cls = "protNumber") {
    const node = el("text", {
      x: 0,
      y: 0,
      transform: `translate(${x} ${y}) rotate(${rotation})`,
      class: cls
    });
    node.textContent = text;
    svg.appendChild(node);
  }

  function line(svg, x1, y1, x2, y2, cls = "ray") {
    svg.appendChild(el("line", { x1, y1, x2, y2, class: cls }));
  }

  function ray(svg, cx, cy, angle, length = 140, cls = "ray") {
    const p = point(cx, cy, angle, length);
    line(svg, cx, cy, p.x, p.y, cls);
    return p;
  }

  function arcColour(cls) {
    if (String(cls).includes("green")) return "#16a34a";
    if (String(cls).includes("orange")) return "#f97316";
    return "#2563eb";
  }

  function arrowHead(svg, tip, base, colour) {
    const dx = tip.x - base.x;
    const dy = tip.y - base.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const wing = 3.2;
    const px = -uy;
    const py = ux;

    // Tip stays on the boundary ray. The base is inside the angle, so the
    // arrowhead touches the line without pushing beyond it.
    const p1 = tip;
    const p2 = { x: base.x + px * wing, y: base.y + py * wing };
    const p3 = { x: base.x - px * wing, y: base.y - py * wing };

    svg.appendChild(el("polygon", {
      points: `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`,
      fill: colour
    }));
  }

  function arc(svg, cx, cy, start, end, r = 48, cls = "arc") {
    const totalSweep = sweep(start, end);
    const colour = arcColour(cls);

    // Trim the path so it stops at the base of each arrowhead rather than
    // drawing underneath it. This keeps the arrow tips clean and positioned
    // at the boundary rays.
    const arrowLength = 9;
    const rawOffset = (arrowLength / r) * 180 / Math.PI;
    const offset = Math.min(rawOffset, Math.max(1.5, totalSweep / 4));

    if (totalSweep > offset * 2 + 1) {
      svg.appendChild(el("path", {
        d: arcPath(cx, cy, r, start + offset, end - offset),
        class: cls
      }));
    }

    arrowHead(svg, point(cx, cy, start, r), point(cx, cy, start + offset, r), colour);
    arrowHead(svg, point(cx, cy, end, r), point(cx, cy, end - offset, r), colour);
  }

  function label(svg, text, x, y, cls = "angleLabel") {
    const t = el("text", { x, y, class: cls });
    t.textContent = text;
    svg.appendChild(t);
  }

  function angleLabel(svg, text, cx, cy, start, end, dist = 75) {
    const mid = start + sweep(start, end) / 2;
    const p = point(cx, cy, mid, dist);
    label(svg, text, p.x, p.y, "angleLabel");
  }

  function endpointLabel(svg, text, cx, cy, angle, length, offset = 19) {
    const p = point(cx, cy, angle, length + offset);
    label(svg, text, p.x, p.y, "pointLabel");
  }

  function dot(svg, cx, cy) {
    svg.appendChild(el("circle", { cx, cy, r: 4, class: "vertexDot" }));
  }

  function rightMarker(svg, cx, cy, size = 22) {
    svg.appendChild(el("polyline", {
      points: `${cx + size},${cy} ${cx + size},${cy - size} ${cx},${cy - size}`,
      class: "rightMarker"
    }));
  }

  function parallelMarker(svg, x, y) {
    svg.appendChild(el("polyline", {
      points: `${x - 8},${y - 8} ${x},${y} ${x - 8},${y + 8}`,
      class: "parallelMarker"
    }));
  }

  function drawStraight(config) {
    const s = svg();
    const cx = 210, cy = 160;
    const known = config.knownAngle ?? 65;
    const missing = config.missingLabel ?? "x";

    ray(s, cx, cy, 180, 165);
    ray(s, cx, cy, 0, 165);
    ray(s, cx, cy, known, 120);

    arc(s, cx, cy, 0, known, 48, "arc");
    arc(s, cx, cy, known, 180, 54, "arc green");

    angleLabel(s, missing, cx, cy, 0, known, 72);
    angleLabel(s, `${180 - known}°`, cx, cy, known, 180, 82);

    dot(s, cx, cy);
    return s;
  }

  function drawRight(config) {
    const s = svg();
    const cx = 180, cy = 175;
    const known = config.knownAngle ?? 35;
    const missing = config.missingLabel ?? "x";

    ray(s, cx, cy, 0, 165);
    ray(s, cx, cy, 90, 125);
    ray(s, cx, cy, known, 120);

    rightMarker(s, cx, cy);
    arc(s, cx, cy, 0, known, 48, "arc");
    arc(s, cx, cy, known, 90, 54, "arc green");

    angleLabel(s, missing, cx, cy, 0, known, 72);
    angleLabel(s, `${90 - known}°`, cx, cy, known, 90, 82);

    dot(s, cx, cy);
    return s;
  }

  function drawPoint(config) {
    const s = svg();
    const cx = 210, cy = 135;
    const knownAngles = config.knownAngles ?? [90, 110, 80];
    const missingLabel = config.missingLabel ?? "x";
    const missing = 360 - knownAngles.reduce((a, b) => a + b, 0);
    const parts = [...knownAngles, missing];

    let current = 20;
    const starts = [];

    parts.forEach(part => {
      starts.push(current);
      current += part;
    });

    starts.forEach(a => ray(s, cx, cy, a, 125));

    parts.forEach((part, i) => {
      const start = starts[i];
      const end = start + part;
      arc(s, cx, cy, start, end, 48 + i * 4, i % 2 ? "arc green" : "arc");
      angleLabel(s, i === parts.length - 1 ? missingLabel : `${part}°`, cx, cy, start, end, 78 + i * 2);
    });

    dot(s, cx, cy);
    return s;
  }

  function drawVertical(config) {
    const s = svg();

    // Keep all labels and endpoints inside the fixed SVG viewBox. This avoids
    // the large endpoint labels colliding with the question text or answer box.
    const cx = 210;
    const cy = 132;
    const known = Number(config.knownAngle ?? 55);
    const missing = config.missingLabel ?? "x";
    const base = Number(config.base ?? 8);
    const other = base + known;

    const lineLength = 148;
    const diagonalLength = 116;

    const b = point(cx, cy, base, lineLength);
    const d = point(cx, cy, base + 180, lineLength);
    const a = point(cx, cy, other, diagonalLength);
    const c = point(cx, cy, other + 180, diagonalLength);

    line(s, d.x, d.y, b.x, b.y);
    line(s, a.x, a.y, c.x, c.y);

    arc(s, cx, cy, base, other, 44, "arc");
    arc(s, cx, cy, base + 180, other + 180, 44, "arc green");

    angleLabel(s, `${known}°`, cx, cy, base, other, 72);
    angleLabel(s, missing, cx, cy, base + 180, other + 180, 73);

    const labels = config.pointLabels || { a: "A", b: "B", c: "C", d: "D" };
    const showPointLabels = config.showPointLabels !== false;

    if (showPointLabels) {
      endpointLabel(s, labels.a ?? "A", cx, cy, other, diagonalLength, 12);
      endpointLabel(s, labels.b ?? "B", cx, cy, base, lineLength, 12);
      endpointLabel(s, labels.c ?? "C", cx, cy, other + 180, diagonalLength, 12);
      endpointLabel(s, labels.d ?? "D", cx, cy, base + 180, lineLength, 12);
    }

    return s;
  }

  function parallelSectorAngles(theta, sector) {
    const lower = theta + 180;

    const sectors = {
      upperRight: { start: 0, end: theta },
      upperLeft: { start: theta, end: 180 },
      lowerLeft: { start: 180, end: lower },
      lowerRight: { start: lower, end: 360 }
    };

    return sectors[sector] || sectors.upperRight;
  }

  function parallelSectorSize(theta, sector) {
    const item = parallelSectorAngles(theta, sector);
    return Math.round(sweep(item.start, item.end));
  }

  function defaultParallelPair(relationship) {
    if (relationship === "co-interior") {
      return { top: "lowerLeft", bottom: "upperLeft" };
    }

    if (relationship === "alternate") {
      return { top: "lowerLeft", bottom: "upperRight" };
    }

    return { top: "upperRight", bottom: "upperRight" };
  }

  function drawParallel(config) {
    const s = svg();
    const relationship = config.relationship ?? "corresponding";
    const missing = config.missingLabel ?? "x";

    // The actual acute angle made by the transversal with a parallel line.
    // The question bank now supplies this in the range 25° to 75°; this
    // fallback keeps older saved configs sensible.
    let acute = Number(config.transversalAngle ?? config.acuteAngle ?? config.knownAngle ?? 60);
    if (acute > 90) acute = 180 - acute;
    acute = Math.max(25, Math.min(75, acute));

    const direction = config.transversalDirection || config.direction || "rising";
    const theta = direction === "falling" ? 180 - acute : acute;

    const knownIntersection = config.knownIntersection || "top";
    const missingIntersection = config.missingIntersection || "bottom";
    const pair = defaultParallelPair(relationship);
    const knownSector = config.knownSector || pair[knownIntersection] || pair.top;
    const missingSector = config.missingSector || pair[missingIntersection] || pair.bottom;

    const known = Number(config.knownAngle ?? parallelSectorSize(theta, knownSector));

    const y1 = 82;
    const y2 = 178;
    const gap = y2 - y1;
    const topX = direction === "falling" ? 135 : 285;
    const offset = gap / Math.tan(degToRad(acute));
    const bottomX = direction === "falling" ? topX + offset : topX - offset;

    line(s, 55, y1, 365, y1);
    line(s, 55, y2, 365, y2);

    parallelMarker(s, 302, y1);
    parallelMarker(s, 302, y2);

    const top = { x: topX, y: y1 };
    const bottom = { x: bottomX, y: y2 };
    const t1 = point(top.x, top.y, theta, 80);
    const t2 = point(bottom.x, bottom.y, theta + 180, 80);

    line(s, t1.x, t1.y, t2.x, t2.y);

    dot(s, top.x, top.y);
    dot(s, bottom.x, bottom.y);

    const topSector = knownIntersection === "top" ? knownSector : missingSector;
    const bottomSector = knownIntersection === "bottom" ? knownSector : missingSector;
    const topText = knownIntersection === "top" ? `${known}°` : missing;
    const bottomText = knownIntersection === "bottom" ? `${known}°` : missing;

    const topAngles = parallelSectorAngles(theta, topSector);
    const bottomAngles = parallelSectorAngles(theta, bottomSector);
    const tight = relationship === "co-interior";
    const r = tight ? 25 : 34;
    const labelDist = tight ? 43 : 56;

    arc(s, top.x, top.y, topAngles.start, topAngles.end, r, "arc");
    angleLabel(s, topText, top.x, top.y, topAngles.start, topAngles.end, labelDist);

    arc(s, bottom.x, bottom.y, bottomAngles.start, bottomAngles.end, r, "arc green");
    angleLabel(s, bottomText, bottom.x, bottom.y, bottomAngles.start, bottomAngles.end, labelDist);

    return s;
  }

  function drawProtractor(config) {
    const s = svg();
    const cx = 210;
    const cy = 222;
    const outerR = 176;
    const innerR = 52;
    const angle = Number(config.angle ?? config.knownAngle ?? 60);
    const startSide = config.startSide ?? "right";
    const base = startSide === "right" ? 0 : 180;
    const rayAngle = startSide === "right" ? angle : 180 - angle;

    // Cleaner protractor layout:
    // - number bands are kept clear of radial construction lines
    // - only the outer tick ring is dense
    // - inner guide rays stop before the number labels
    s.appendChild(el("path", {
      d: protractorBodyPath(cx, cy, outerR, innerR),
      class: "protFill",
      "fill-rule": "evenodd"
    }));

    [innerR, 86, 121, 148, outerR].forEach(r => {
      s.appendChild(el("path", { d: arcPath(cx, cy, r, 0, 180), class: "protArc" }));
    });

    line(s, cx - outerR, cy, cx + outerR, cy, "protLine");

    // Outer measuring ticks: every degree, with longer 5° and 10° ticks.
    for (let d = 0; d <= 180; d += 1) {
      const isMajor = d % 10 === 0;
      const isMid = d % 5 === 0 && !isMajor;
      const len = isMajor ? 22 : isMid ? 15 : 8;
      const outer = point(cx, cy, d, outerR);
      const inner = point(cx, cy, d, outerR - len);
      line(s, outer.x, outer.y, inner.x, inner.y, isMajor ? "protTickMajor" : isMid ? "protTickMid" : "protTickMinor");
    }

    // Inner guide rays: only between the centre opening and first guide arc.
    // This avoids the current clutter where lines run through the numbers.
    for (let d = 10; d <= 170; d += 10) {
      const p1 = point(cx, cy, d, innerR);
      const p2 = point(cx, cy, d, 84);
      line(s, p1.x, p1.y, p2.x, p2.y, "protRadial");
    }

    // Number bands. These sit in clear white bands like the preferred image.
    for (let d = 0; d <= 180; d += 10) {
      const outerLabel = point(cx, cy, d, 138);
      const innerLabel = point(cx, cy, d, 111);
      const rotation = 90 - d;
      const outerText = 180 - d;
      const innerText = d;
      const outerCls = d === 90 ? "protNumber big" : "protNumber";
      const innerCls = d === 90 ? "protNumber big" : "protNumber";

      if (d !== 0 && d !== 180) {
        rotatedLabel(s, outerText, outerLabel.x, outerLabel.y, rotation, outerCls);
        rotatedLabel(s, innerText, innerLabel.x, innerLabel.y, rotation, innerCls);
      } else {
        const outerBase = point(cx, cy, d, 139);
        const innerBase = point(cx, cy, d, 112);
        label(s, outerText, outerBase.x, outerBase.y, "protNumber");
        label(s, innerText, innerBase.x, innerBase.y, "protNumber");
      }
    }

    line(s, cx, cy, cx, cy - 30, "protLine");
    label(s, "T", cx, cy + 17, "protT");
    s.appendChild(el("circle", { cx, cy, r: 4, class: "protOrigin" }));

    ray(s, cx, cy, base, 182, "ray");
    ray(s, cx, cy, rayAngle, 166, "ray");

    if (startSide === "right") {
      arc(s, cx, cy, 0, angle, 42, "arc");
    } else {
      arc(s, cx, cy, 180 - angle, 180, 42, "arc");
    }

    dot(s, cx, cy);
    return s;
  }

  function render(target, config = {}) {
    if (!target) return;

    target.innerHTML = "";

    const type = config.diagramType || config.kind || "straight";

    let output;

    if (type === "straight" || type === "straight-line") output = drawStraight(config);
    else if (type === "right" || type === "right-angle") output = drawRight(config);
    else if (type === "point" || type === "around-point") output = drawPoint(config);
    else if (type === "vertical" || type === "vertically-opposite") output = drawVertical(config);
    else if (type === "parallel" || type === "parallel-lines") output = drawParallel(config);
    else if (type === "protractor" || type === "protractor-read") output = drawProtractor(config);
    else output = drawStraight(config);

    target.appendChild(output);
  }

  return { render };
})();