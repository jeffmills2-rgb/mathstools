/*
  Mills Maths Tools — 3D Solids and Nets Engine
  ----------------------------------------------
  engines/solids/solids-engine.js

  Exposes: window.MMT_SOLIDS_ENGINE.render(target, config)

  Stage 3 "3D Space" (MA3-3DS-01) is about telling prisms from pyramids,
  counting faces, edges and vertices, and connecting a solid to its net and to
  its views. Every one of those needs a picture.

  diagramType
  -----------
    solid     kind: "prism" | "pyramid" (with `sides` 3–8 and optional
              `base: "rectangle"` for a non-square box), or "cylinder",
              "cone", "sphere". `height` is in units of the base's
              circumradius (default prism 1.5, pyramid 1.8, `cube: true` → √2). Drawn standing on its base, seen from a
              little above; hidden edges dashed. Visibility is COMPUTED from
              face orientation, not hand-listed, so every n draws correctly.
    net       `faces` [{ pts: [[x,y],…] }] in net units (y down) — squares,
              rectangles and triangles laid out flat, each with an optional
              `label`; or `nets: [{ label, faces }]` for several side by side.
    stack-views  a stack of unit cubes (`heights[row][col]`, row 0 at the
              front) beside lettered view options, with a FRONT arrow
    views     `options` [{ label, cells: [[col,row],…] }] — small grids
              lettered A, B, C … for "which is the top/front/side view?"

  Nets are laid out by the bank from unit squares or polygons, so the bank's
  folding check and the drawing use the same coordinates.
*/

window.MMT_SOLIDS_ENGINE = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const TEXT = 18;
  const INK = "#111827";
  const FACE = "#dbeafe";
  const TOPF = "#eff6ff";
  const SIDE = "#bfdbfe";
  const FONT = "'Cambria Math','Times New Roman',serif";
  const r1 = v => Math.round(v * 10) / 10;

  function el(n, a = {}) {
    const e = document.createElementNS(NS, n);
    Object.entries(a).forEach(([k, v]) => { if (v !== undefined && v !== null) e.setAttribute(k, String(v)); });
    return e;
  }
  function text(g, v, x, y, o = {}) {
    const t = el("text", { x: r1(x), y: r1(y), "font-family": FONT, "font-size": o.size || TEXT, "text-anchor": "middle", "dominant-baseline": "middle", "font-weight": o.weight || 700, fill: o.fill || INK });
    t.textContent = String(v);
    g.appendChild(t);
  }
  const P = pts => pts.map(p => `${r1(p[0])},${r1(p[1])}`).join(" ");
  function seg(g, a, b, hidden) {
    g.appendChild(el("line", { x1: r1(a[0]), y1: r1(a[1]), x2: r1(b[0]), y2: r1(b[1]), stroke: INK, "stroke-width": hidden ? 1.6 : 2.6, "stroke-dasharray": hidden ? "7 6" : null, "stroke-linecap": "round" }));
  }

  /* Real 3D: build the solid, project it orthographically from a camera a
     little above and to the side, and decide visibility from each face's
     outward normal. An edge is hidden only when BOTH its faces face away. */
  const AZ = 0.42;     // camera turn about the vertical axis (radians)
  const EL = 0.36;     // camera elevation above the horizontal
  function project([x, y, z]) {
    const xr = x * Math.cos(AZ) - z * Math.sin(AZ);
    const zr = x * Math.sin(AZ) + z * Math.cos(AZ);
    // screen: sx right, sy down; depth toward the viewer = -zr·cos(EL) + y·sin(EL)
    return [xr, -(y * Math.cos(EL) + zr * Math.sin(EL))];
  }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  function baseRing(n, rect) {
    // regular n-gon of circumradius 1 in the x–z plane; a 4-gon sits square to
    // the axes so a box looks like a box. `rect` stretches it along x.
    const start = n === 4 ? Math.PI / 4 : -Math.PI / 2;
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = start + (i * 2 * Math.PI) / n;
      out.push([Math.cos(t) * (rect ? 1.5 : 1), 0, Math.sin(t)]);
    }
    return out;
  }

  function drawPoly3D(g, verts, faces) {
    // camera direction: the world vector that projects to a single screen
    // point (so it runs along the line of sight) and points toward the viewer.
    const cam = [-Math.sin(AZ) * Math.cos(EL), Math.sin(EL), -Math.cos(AZ) * Math.cos(EL)];
    const centre = verts.reduce((s, v) => [s[0] + v[0] / verts.length, s[1] + v[1] / verts.length, s[2] + v[2] / verts.length], [0, 0, 0]);
    const vis = faces.map(f => {
      let nrm = cross(sub(verts[f[1]], verts[f[0]]), sub(verts[f[2]], verts[f[0]]));
      const fc = f.reduce((s, i) => [s[0] + verts[i][0] / f.length, s[1] + verts[i][1] / f.length, s[2] + verts[i][2] / f.length], [0, 0, 0]);
      if (dot(nrm, sub(fc, centre)) < 0) nrm = nrm.map(v => -v);     // make it outward
      return dot(nrm, cam) > 1e-9;
    });
    // fit to the frame
    const pr = verts.map(project);
    const xs = pr.map(p => p[0]);
    const ys = pr.map(p => p[1]);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    const k = Math.min(280 / w, 260 / h);
    const ox = 170 - ((Math.max(...xs) + Math.min(...xs)) / 2) * k;
    const oy = 158 - ((Math.max(...ys) + Math.min(...ys)) / 2) * k;
    const S = pr.map(p => [ox + p[0] * k, oy + p[1] * k]);
    faces.forEach((f, i) => {
      if (!vis[i]) return;
      const top = f.every(j => verts[j][1] > 1e-9) && f.length > 2 && f.every(j => Math.abs(verts[j][1] - verts[f[0]][1]) < 1e-9);
      g.appendChild(el("polygon", { points: P(f.map(j => S[j])), fill: top ? TOPF : SIDE, stroke: "none" }));
    });
    const edges = new Map();
    faces.forEach((f, fi) => f.forEach((a, t) => {
      const b = f[(t + 1) % f.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edges.has(key)) edges.set(key, { a, b, faces: [] });
      edges.get(key).faces.push(fi);
    }));
    const list = [...edges.values()];
    list.filter(e => !e.faces.some(fi => vis[fi])).forEach(e => seg(g, S[e.a], S[e.b], true));
    list.filter(e => e.faces.some(fi => vis[fi])).forEach(e => seg(g, S[e.a], S[e.b], false));
  }

  function prism(g, n, rect, tall) {
    const ring = baseRing(n, rect);
    const H = tall;
    const verts = [...ring, ...ring.map(p => [p[0], H, p[2]])];
    const faces = [ring.map((_, i) => i), ring.map((_, i) => n + i)];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push([i, j, n + j, n + i]); }
    drawPoly3D(g, verts, faces);
  }

  function pyramid(g, n, rect, tall) {
    const ring = baseRing(n, rect);
    const verts = [...ring, [0, tall, 0]];
    const faces = [ring.map((_, i) => i)];
    for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n]);
    drawPoly3D(g, verts, faces);
  }

  function roundSolid(g, kind) {
    const cx = 170;
    const rx = 100;
    const ry = 34;
    if (kind === "sphere") {
      g.appendChild(el("circle", { cx, cy: 160, r: 110, fill: FACE, stroke: INK, "stroke-width": 2.6 }));
      g.appendChild(el("path", { d: `M ${cx - 110} 160 A 110 36 0 0 0 ${cx + 110} 160`, fill: "none", stroke: INK, "stroke-width": 1.8 }));
      g.appendChild(el("path", { d: `M ${cx - 110} 160 A 110 36 0 0 1 ${cx + 110} 160`, fill: "none", stroke: INK, "stroke-width": 1.4, "stroke-dasharray": "7 6" }));
      return;
    }
    const yb = 262;
    const yt = 60;
    if (kind === "cylinder") {
      g.appendChild(el("path", { d: `M ${cx - rx} ${yt} L ${cx - rx} ${yb} A ${rx} ${ry} 0 0 0 ${cx + rx} ${yb} L ${cx + rx} ${yt}`, fill: SIDE, stroke: INK, "stroke-width": 2.6 }));
      g.appendChild(el("ellipse", { cx, cy: yt, rx, ry, fill: TOPF, stroke: INK, "stroke-width": 2.6 }));
      g.appendChild(el("path", { d: `M ${cx - rx} ${yb} A ${rx} ${ry} 0 0 1 ${cx + rx} ${yb}`, fill: "none", stroke: INK, "stroke-width": 1.5, "stroke-dasharray": "7 6" }));
      return;
    }
    // cone
    g.appendChild(el("path", { d: `M ${cx - rx} ${yb} L ${cx} ${yt - 10} L ${cx + rx} ${yb} A ${rx} ${ry} 0 0 1 ${cx - rx} ${yb}`, fill: SIDE, stroke: INK, "stroke-width": 2.6 }));
    g.appendChild(el("path", { d: `M ${cx - rx} ${yb} A ${rx} ${ry} 0 0 1 ${cx + rx} ${yb}`, fill: "none", stroke: INK, "stroke-width": 1.5, "stroke-dasharray": "7 6" }));
  }

  function solid(target, c) {
    const g = el("g");
    const kind = c.kind || "prism";
    const n = Math.max(3, Math.min(8, Number(c.sides) || 4));
    const rect = c.base === "rectangle";
    if (kind === "prism") prism(g, n, rect, c.height || (c.cube ? Math.SQRT2 : 1.5));
    else if (kind === "pyramid") pyramid(g, n, rect, c.height || 1.8);
    else roundSolid(g, kind);
    return finish(target, g, 340, 310, "3D solid", c);
  }

  /* One net, or several side by side (`nets: [{ label, faces }]`) for
     "which of these nets folds into a cube?". */
  function drawNet(g, faces, u, dx, dy) {
    const all = faces.flatMap(f => f.pts);
    const minX = Math.min(...all.map(p => p[0]));
    const minY = Math.min(...all.map(p => p[1]));
    faces.forEach((f, i) => {
      const pts = f.pts.map(p => [(p[0] - minX) * u + dx, (p[1] - minY) * u + dy]);
      g.appendChild(el("polygon", { points: P(pts), fill: f.fill || (i % 2 ? FACE : TOPF), stroke: INK, "stroke-width": 2.4, "stroke-linejoin": "round" }));
      if (f.label) {
        const cx = pts.reduce((s2, p) => s2 + p[0], 0) / pts.length;
        const cy = pts.reduce((s2, p) => s2 + p[1], 0) / pts.length;
        text(g, f.label, cx, cy, { size: 20 });
      }
    });
    return {
      w: (Math.max(...all.map(p => p[0])) - minX) * u,
      h: (Math.max(...all.map(p => p[1])) - minY) * u
    };
  }

  function net(target, c) {
    const g = el("g");
    if (Array.isArray(c.nets)) {
      const u = c.unit || 30;
      let x = 12;
      let H = 0;
      c.nets.forEach(nt => {
        const all = nt.faces.flatMap(f => f.pts);
        const w = (Math.max(...all.map(p => p[0])) - Math.min(...all.map(p => p[0]))) * u;
        text(g, nt.label, x + w / 2, 14, { size: 22 });
        const box = drawNet(g, nt.faces, u, x, 34);
        H = Math.max(H, box.h);
        x += box.w + 36;
      });
      return finish(target, g, x - 24, H + 46, "nets", {});
    }
    const box = drawNet(g, c.faces || [], c.unit || 44, 14, 14);
    return finish(target, g, box.w + 28, box.h + 28, "net", {});
  }

  /* An isometric stack of unit cubes; heights[row][col], row 0 at the front. */
  function drawStack(g, heights, s, baseX, baseY) {
    const rows = heights.length;
    const cols = Math.max(...heights.map(r => r.length));
    const ox = s * 0.5;
    const oy = -s * 0.36;
    for (let r = rows - 1; r >= 0; r--) {
      for (let cc = 0; cc < cols; cc++) {
        const h = heights[r][cc] || 0;
        for (let z = 0; z < h; z++) {
          const x = baseX + cc * s + r * ox;
          const y = baseY - z * s + r * oy;
          g.appendChild(el("polygon", { points: P([[x, y], [x + s, y], [x + s, y - s], [x, y - s]]), fill: SIDE, stroke: INK, "stroke-width": 2 }));
          g.appendChild(el("polygon", { points: P([[x, y - s], [x + s, y - s], [x + s + ox, y - s + oy], [x + ox, y - s + oy]]), fill: TOPF, stroke: INK, "stroke-width": 2 }));
          g.appendChild(el("polygon", { points: P([[x + s, y], [x + s + ox, y + oy], [x + s + ox, y - s + oy], [x + s, y - s]]), fill: FACE, stroke: INK, "stroke-width": 2 }));
        }
      }
    }
    const maxH = Math.max(...heights.flat());
    return { w: cols * s + rows * ox, h: maxH * s + rows * -oy };
  }

  /* The stack on the left, the lettered view options on the right, plus a
     "FRONT" arrow so "front view" has one meaning. */
  function stackViews(target, c) {
    const g = el("g");
    const heights = c.heights || [[1]];
    const rows = heights.length;
    const cols = Math.max(...heights.map(r => r.length));
    const maxH = Math.max(...heights.flat());
    const s = Math.min(40, 170 / (maxH + rows * 0.36), 220 / (cols + rows * 0.5));
    const baseY = 20 + maxH * s + rows * s * 0.36;
    const box = drawStack(g, heights, s, 20, baseY);
    // front arrow under the front row
    const fx = 20 + (cols * s) / 2;
    g.appendChild(el("line", { x1: r1(fx), y1: r1(baseY + 38), x2: r1(fx), y2: r1(baseY + 12), stroke: "#b91c1c", "stroke-width": 2.6 }));
    g.appendChild(el("polygon", { points: P([[fx, baseY + 6], [fx - 6, baseY + 16], [fx + 6, baseY + 16]]), fill: "#b91c1c" }));
    text(g, "FRONT", fx, baseY + 52, { size: 15, fill: "#b91c1c" });
    let H = baseY + 60;
    // options
    const cell = 26;
    let x = 20 + box.w + 50;
    const maxRows = Math.max(1, ...(c.options || []).map(o => Math.max(...o.cells.map(p => p[1])) + 1));
    (c.options || []).forEach(o => {
      const oc = Math.max(...o.cells.map(p => p[0])) + 1;
      const w = Math.max(2, oc) * cell;
      text(g, o.label, x + w / 2, 16, { size: 22 });
      o.cells.forEach(([cc, rr]) => {
        g.appendChild(el("rect", { x: x + cc * cell, y: 34 + (maxRows - 1 - rr) * cell, width: cell, height: cell, fill: FACE, stroke: INK, "stroke-width": 2 }));
      });
      x += w + 30;
    });
    H = Math.max(H, 34 + maxRows * cell + 10);
    return finish(target, g, x - 10, H, "cube stack and views", {});
  }

  function views(target, c) {
    const opts = c.options || [];
    const cell = 34;
    const g = el("g");
    let x = 10;
    opts.forEach(o => {
      const cols = Math.max(...o.cells.map(p => p[0])) + 1;
      const rows = Math.max(...o.cells.map(p => p[1])) + 1;
      const w = Math.max(3, cols) * cell;
      text(g, o.label, x + w / 2, 16, { size: 22 });
      o.cells.forEach(([cc, rr]) => {
        g.appendChild(el("rect", { x: x + cc * cell, y: 34 + (rows - 1 - rr) * cell + (4 - rows) * cell, width: cell, height: cell, fill: FACE, stroke: INK, "stroke-width": 2 }));
      });
      x += w + 34;
    });
    return finish(target, g, x, 34 + 4 * cell + 10, "view options", {});
  }

  function finish(target, g, w, h, label, c) {
    if (c && c.caption) text(g, c.caption, w / 2, h - 6, { size: 17 });
    const svg = el("svg", { viewBox: `0 0 ${Math.round(w)} ${Math.round(h + (c && c.caption ? 14 : 0))}`, width: "100%", role: "img", "aria-label": label });
    svg.appendChild(g);
    if (target) { target.innerHTML = ""; target.appendChild(svg); }
    return svg;
  }

  function render(target, config = {}) {
    const t = config.diagramType || "solid";
    if (t === "solid") return solid(target, config);
    if (t === "net") return net(target, config);
    if (t === "views") return views(target, config);
    if (t === "stack-views") return stackViews(target, config);
    if (target) target.innerHTML = `<div class="diagram-placeholder">Unknown solid diagram</div>`;
    return null;
  }

  return { render };
})();
