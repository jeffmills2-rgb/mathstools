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
      .angle-svg{overflow:visible}
      .ray,.baseLine{stroke:#111827;stroke-width:4;stroke-linecap:round;fill:none}
      .arc{stroke:#2563eb;stroke-width:3;stroke-linecap:round;fill:none}
      .arc.green{stroke:#16a34a}
      .arc.orange{stroke:#f97316}
      .angleLabel,.pointLabel{font-family:"Cambria Math","Times New Roman",serif;font-weight:700;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .angleLabel{font-size:16px;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}
      .pointLabel{font-size:17px}
      .vertexDot{fill:#111827}
      .rightMarker,.parallelMarker{stroke:#111827;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;fill:none}
      .protLine{stroke:#111827;stroke-width:1.2;stroke-linecap:round;fill:none}
      .protArc{stroke:#111827;stroke-width:2;fill:none}
      .protTickMinor{stroke:#111827;stroke-width:.8;stroke-linecap:round}
      .protTickMajor{stroke:#111827;stroke-width:1.4;stroke-linecap:round}
      .protNumber{font-family:"Cambria Math","Times New Roman",serif;font-weight:700;font-size:10px;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .protNumber.big{font-size:15px;font-weight:900}
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

  function line(svg, x1, y1, x2, y2, cls = "ray") {
    svg.appendChild(el("line", { x1, y1, x2, y2, class: cls }));
  }

  function ray(svg, cx, cy, angle, length = 140, cls = "ray") {
    const p = point(cx, cy, angle, length);
    line(svg, cx, cy, p.x, p.y, cls);
    return p;
  }

  function arc(svg, cx, cy, start, end, r = 48, cls = "arc") {
    svg.appendChild(el("path", { d: arcPath(cx, cy, r, start, end), class: cls }));
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
    const cx = 210, cy = 135;
    const known = config.knownAngle ?? 55;
    const missing = config.missingLabel ?? "x";
    const base = -10;
    const other = base + known;

    const a1 = point(cx, cy, base, 170);
    const a2 = point(cx, cy, base + 180, 170);
    const b1 = point(cx, cy, other, 155);
    const b2 = point(cx, cy, other + 180, 155);

    line(s, a1.x, a1.y, a2.x, a2.y);
    line(s, b1.x, b1.y, b2.x, b2.y);

    arc(s, cx, cy, base, other, 46, "arc");
    arc(s, cx, cy, base + 180, other + 180, 46, "arc green");

    angleLabel(s, `${known}°`, cx, cy, base, other, 72);
    angleLabel(s, missing, cx, cy, base + 180, other + 180, 72);

    dot(s, cx, cy);
    return s;
  }

  function drawParallel(config) {
    const s = svg();
    const known = config.knownAngle ?? 65;
    const missing = config.missingLabel ?? "x";
    const relationship = config.relationship ?? "corresponding";

    const y1 = 88;
    const y2 = 178;
    line(s, 55, y1, 365, y1);
    line(s, 55, y2, 365, y2);

    parallelMarker(s, 300, y1);
    parallelMarker(s, 300, y2);

    const top = { x: 235, y: y1 };
    const bottom = { x: 175, y: y2 };

    line(s, 275, 35, 135, 230);

    dot(s, top.x, top.y);
    dot(s, bottom.x, bottom.y);

    if (relationship === "co-interior") {
      arc(s, top.x, top.y, 180, 245, 38, "arc");
      angleLabel(s, `${known}°`, top.x, top.y, 180, 245, 62);

      arc(s, bottom.x, bottom.y, 65, 180, 38, "arc green");
      angleLabel(s, missing, bottom.x, bottom.y, 65, 180, 62);
    } else if (relationship === "alternate") {
      arc(s, top.x, top.y, 180, 245, 38, "arc");
      angleLabel(s, `${known}°`, top.x, top.y, 180, 245, 62);

      arc(s, bottom.x, bottom.y, 0, 65, 38, "arc green");
      angleLabel(s, missing, bottom.x, bottom.y, 0, 65, 62);
    } else {
      arc(s, top.x, top.y, 0, 65, 38, "arc");
      angleLabel(s, `${known}°`, top.x, top.y, 0, 65, 62);

      arc(s, bottom.x, bottom.y, 0, 65, 38, "arc green");
      angleLabel(s, missing, bottom.x, bottom.y, 0, 65, 62);
    }

    return s;
  }

  function drawProtractor(config) {
    const s = svg();
    const cx = 210, cy = 220;
    const r = 150;
    const angle = config.angle ?? config.knownAngle ?? 60;
    const startSide = config.startSide ?? "right";
    const base = startSide === "right" ? 0 : 180;
    const rayAngle = startSide === "right" ? angle : 180 - angle;

    s.appendChild(el("path", { d: arcPath(cx, cy, r, 0, 180), class: "protArc" }));
    line(s, cx - r, cy, cx + r, cy, "protLine");

    for (let d = 0; d <= 180; d += 5) {
      const major = d % 10 === 0;
      const outer = point(cx, cy, d, r);
      const inner = point(cx, cy, d, r - (major ? 18 : 10));
      line(s, outer.x, outer.y, inner.x, inner.y, major ? "protTickMajor" : "protTickMinor");
    }

    for (let d = 0; d <= 180; d += 10) {
      const p1 = point(cx, cy, d, r - 34);
      const p2 = point(cx, cy, d, r - 70);
      line(s, p1.x, p1.y, p2.x, p2.y, "protTickMinor");

      const p = point(cx, cy, d, r - 30);
      label(s, d, p.x, p.y, d === 90 ? "protNumber big" : "protNumber");

      const q = point(cx, cy, d, r - 55);
      label(s, 180 - d, q.x, q.y, "protNumber");
    }

    ray(s, cx, cy, base, 154, "ray");
    ray(s, cx, cy, rayAngle, 144, "ray");

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