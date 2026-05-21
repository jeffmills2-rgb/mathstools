/*
  CHHS Exam Builder — Indices Diagram Engine
  ------------------------------------------
  Save as:

  engines/indices/indices-engine.js

  Exposes:
  window.MMT_INDICES_ENGINE.render(target, config)

  Supported:
  - factor-tree diagrams
*/

window.MMT_INDICES_ENGINE = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);

    Object.entries(attrs).forEach(([key, value]) => {
      node.setAttribute(key, String(value));
    });

    return node;
  }

  function primeFactors(n) {
    const factors = [];
    let x = n;
    let p = 2;

    while (p * p <= x) {
      while (x % p === 0) {
        factors.push(p);
        x /= p;
      }
      p += p === 2 ? 1 : 2;
    }

    if (x > 1) factors.push(x);
    return factors;
  }

  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i += 1) {
      if (n % i === 0) return false;
    }
    return true;
  }

  function splitFactor(n) {
    for (let p = 2; p * p <= n; p += 1) {
      if (n % p === 0) return [p, n / p];
    }

    return [n, 1];
  }

  function buildTree(n) {
    if (isPrime(n)) {
      return { value: n, prime: true, children: [] };
    }

    const [a, b] = splitFactor(n);
    return {
      value: n,
      prime: false,
      children: [buildTree(a), buildTree(b)]
    };
  }

  function collectLeaves(node, out = []) {
    if (!node.children?.length) {
      out.push(node);
      return out;
    }

    node.children.forEach(child => collectLeaves(child, out));
    return out;
  }

  function layoutTree(node, depth = 0, counter = { x: 0 }) {
    node.depth = depth;

    if (!node.children.length) {
      node.x = counter.x;
      counter.x += 1;
      return node.x;
    }

    const childXs = node.children.map(child => layoutTree(child, depth + 1, counter));
    node.x = childXs.reduce((sum, value) => sum + value, 0) / childXs.length;
    return node.x;
  }

  function renderFactorTree(target, config = {}) {
    const number = Number(config.number || 60);
    const mode = config.mode || "completed";
    const tree = buildTree(number);

    layoutTree(tree);

    const leaves = collectLeaves(tree);
    const maxDepth = Math.max(...collectNodes(tree).map(node => node.depth));
    const width = Math.max(520, leaves.length * 86 + 100);
    const height = Math.max(250, (maxDepth + 1) * 82 + 40);
    const xPadding = 54;
    const yPadding = 36;
    const leafSpacing = leaves.length > 1
      ? (width - 2 * xPadding) / (leaves.length - 1)
      : 0;

    const svg = el("svg", {
      viewBox: `0 0 ${width} ${height}`,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": `factor tree for ${number}`,
      class: "indices-svg"
    });

    const style = el("style");
    style.textContent = `
      .indices-svg{overflow:visible}
      .factor-link{stroke:#111827;stroke-width:2.4;stroke-linecap:round}
      .factor-node{fill:#fff;stroke:#111827;stroke-width:2.2}
      .factor-node-prime{fill:#ecfdf5;stroke:#065f46;stroke-width:2.2}
      .factor-node-blank{fill:#fff;stroke:#111827;stroke-width:2.2;stroke-dasharray:5 4}
      .factor-text{font-family:"Cambria Math","Times New Roman",serif;font-size:22px;font-weight:800;fill:#111827;text-anchor:middle;dominant-baseline:middle}
      .factor-hint{font-family:"Cambria Math","Times New Roman",serif;font-size:13px;fill:#4b5563;text-anchor:middle;dominant-baseline:middle}
    `;
    svg.appendChild(style);

    const nodes = collectNodes(tree);

    const toScreen = node => {
      const x = xPadding + node.x * leafSpacing;
      const y = yPadding + node.depth * 78;
      return { x, y };
    };

    nodes.forEach(node => {
      node.children.forEach(child => {
        const a = toScreen(node);
        const b = toScreen(child);
        svg.appendChild(el("line", {
          x1: a.x,
          y1: a.y + 17,
          x2: b.x,
          y2: b.y - 17,
          class: "factor-link"
        }));
      });
    });

    nodes.forEach(node => {
      const p = toScreen(node);
      const shouldHideLeaves = config.hideLeafValues === true || mode === "student";
      const isTerminalPrimeLeaf = node.prime && !node.children?.length;
      const blank = shouldHideLeaves && isTerminalPrimeLeaf;

      svg.appendChild(el("circle", {
        cx: p.x,
        cy: p.y,
        r: 22,
        class: blank
          ? "factor-node-blank"
          : node.prime
            ? "factor-node-prime"
            : "factor-node"
      }));

      const text = el("text", {
        x: p.x,
        y: p.y + 1,
        class: "factor-text"
      });
      text.textContent = blank ? "" : node.value;
      svg.appendChild(text);
    });

    if (mode === "partial" || mode === "student") {
      const hint = el("text", {
        x: width / 2,
        y: height - 14,
        class: "factor-hint"
      });
      hint.textContent = "Fill in the missing prime factors, then write the prime factorisation.";
      svg.appendChild(hint);
    }

    target.innerHTML = "";
    target.appendChild(svg);
  }

  function collectNodes(node, out = []) {
    out.push(node);
    node.children.forEach(child => collectNodes(child, out));
    return out;
  }

  function render(target, config = {}) {
    const type = config.diagramType || "factor-tree";

    if (type === "factor-tree") {
      renderFactorTree(target, config);
      return;
    }

    target.innerHTML = `<div class="diagram-placeholder">Unknown indices diagram: ${type}</div>`;
  }

  return { render };
})();
