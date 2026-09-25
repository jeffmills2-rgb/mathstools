/*
  Mills Maths Tools — Introduction to Networks: gap-fill types
  -------------------------------------------------------------
  question-banks/stage-5/introduction-to-networks/extra-types.js

  The original bank covers vocabulary, degree, planarity, Euler's formula
  and Eulerian trails. MA5-NET-P-01 also uses weighted networks (lengths,
  times, costs on edges) to solve practical problems, the sum of degrees
  (twice the number of edges), and drawing a network from a table.
  Appended to the bank's registry by index.js. Shortest paths are found by
  Dijkstra's algorithm on the same weights the diagram prints.
*/

import { SPACE_SIZES, randInt, choice, shuffle, makeQuestion } from "../../_shared/bank-helpers.js";

const TOPIC = "Introduction to Networks";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "networks", ...(spec.tags || [])] });
const net = graph => ({ engine: "network-engine", config: { diagramType: "graph", graph } });

export const EXTRA_NET_TYPES = [
  { id: "sum-of-degrees", label: "Sum of degrees and number of edges" },
  { id: "weighted-shortest-path", label: "Shortest path in a weighted network" },
  { id: "weighted-route-length", label: "Length of a route in a weighted network" },
  { id: "network-from-table", label: "Draw a network from a table" }
];

const LAYOUT = {
  A: [120, 110], B: [300, 70], C: [480, 110], D: [140, 290], E: [320, 250], F: [500, 300]
};
const EDGES = [["A", "B"], ["B", "C"], ["A", "D"], ["B", "E"], ["C", "F"], ["D", "E"], ["E", "F"], ["A", "E"], ["B", "F"]];

function weightedGraph() {
  const edges = shuffle(EDGES).slice(0, randInt(7, 9)).map(([a, b]) => ({ from: a, to: b, w: randInt(2, 12) }));
  // make sure A and F are connected
  const adj = {}; edges.forEach(e => { (adj[e.from] ||= []).push(e.to); (adj[e.to] ||= []).push(e.from); });
  const seen = new Set(["A"]); const st = ["A"]; while (st.length) { const v = st.pop(); (adj[v] || []).forEach(u => { if (!seen.has(u)) { seen.add(u); st.push(u); } }); }
  if (seen.size < 6) return weightedGraph();
  return edges;
}
function dijkstra(edges, s, t) {
  const dist = { [s]: 0 }; const prev = {}; const done = new Set();
  const nodes = Object.keys(LAYOUT);
  while (done.size < nodes.length) {
    let u = null; nodes.forEach(v => { if (!done.has(v) && dist[v] !== undefined && (u === null || dist[v] < dist[u])) u = v; });
    if (u === null) break; done.add(u);
    edges.forEach(e => { const v = e.from === u ? e.to : e.to === u ? e.from : null; if (v && !done.has(v) && (dist[v] === undefined || dist[u] + e.w < dist[v])) { dist[v] = dist[u] + e.w; prev[v] = u; } });
  }
  const path = [t]; while (path[0] !== s) path.unshift(prev[path[0]]);
  return { d: dist[t], path };
}
const graphOf = edges => ({ nodes: Object.entries(LAYOUT).map(([id, [x, y]]) => ({ id, x: Math.round(x * 1.15), y: Math.round(y * 1.2) })), edges: edges.map(e => ({ from: e.from, to: e.to, label: String(e.w) })) });

function sumOfDegreesQuestion() {
  const v = choice(["edges-from-degrees", "possible"]);
  if (v === "edges-from-degrees") {
    const degs = Array.from({ length: randInt(5, 7) }, () => randInt(1, 5));
    if (degs.reduce((a, b) => a + b, 0) % 2) degs[0] += 1;
    const S = degs.reduce((a, b) => a + b, 0);
    return q({ type: "sum-of-degrees", marks: 2, prompt: `A network has vertices with degrees ${degs.join(", ")}. How many edges does it have?`, answer: String(S / 2), working: [`Sum of degrees = ${S}`, "Each edge adds 2 to the total, so edges = sum ÷ 2", `${S} ÷ 2 = ${S / 2}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(S), String(degs.length), String(S / 2 + 1)], tags: ["degree"] });
  }
  const degs = Array.from({ length: 5 }, () => randInt(1, 4)); const S = degs.reduce((a, b) => a + b, 0);
  return q({ type: "sum-of-degrees", marks: 1, prompt: `Is it possible to draw a network whose vertices have degrees ${degs.join(", ")}? Explain.`, answer: S % 2 ? `No: the degrees add to ${S}, which is odd, but the sum of degrees must be even (twice the number of edges).` : `The sum ${S} is even, so the sum-of-degrees rule allows it (${S / 2} edges).`, working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["degree"] });
}

function weightedShortestPathQuestion() {
  const edges = weightedGraph();
  const [s, t] = choice([["A", "F"], ["D", "C"], ["A", "C"], ["D", "F"]]);
  const res = dijkstra(edges, s, t);
  return q({
    type: "weighted-shortest-path", marks: 2,
    prompt: `The network shows travel times (minutes) between towns. Find the shortest route from ${s} to ${t} and its total time.`,
    diagram: net(graphOf(edges)),
    answer: `${res.path.join("–")}, ${res.d} minutes`,
    working: ["Compare the totals of the possible routes (or use Dijkstra's method).", `${res.path.join(" → ")}: ${res.path.slice(1).map((v, i) => edges.find(e => (e.from === v && e.to === res.path[i]) || (e.to === v && e.from === res.path[i])).w).join(" + ")} = ${res.d}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${res.path.join("–")}, ${res.d + 2} minutes`, `${[s, t].join("–")}, ${res.d - 1} minutes`],
    tags: ["weighted", "shortest path"]
  });
}

function weightedRouteLengthQuestion() {
  const edges = weightedGraph();
  // a random walk of 3 edges starting at A
  const route = ["A"]; let guard = 0;
  while (route.length < 4 && guard++ < 50) { const cur = route[route.length - 1]; const opts = edges.filter(e => (e.from === cur || e.to === cur)).map(e => (e.from === cur ? e.to : e.from)).filter(v => !route.includes(v)); if (!opts.length) break; route.push(choice(opts)); }
  if (route.length < 3) return weightedRouteLengthQuestion();
  const ws = route.slice(1).map((v, i) => edges.find(e => (e.from === v && e.to === route[i]) || (e.to === v && e.from === route[i])).w);
  const total = ws.reduce((a, b) => a + b, 0);
  return q({
    type: "weighted-route-length", marks: 1,
    prompt: `The network shows distances in kilometres. Find the length of the route ${route.join("–")}.`,
    diagram: net(graphOf(edges)),
    answer: `${total} km`,
    working: [`${ws.join(" + ")} = ${total}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${total + ws[0]} km`, `${total - ws[ws.length - 1]} km`],
    tags: ["weighted"]
  });
}

function networkFromTableQuestion() {
  const edges = weightedGraph().slice(0, 6);
  const nodes = [...new Set(edges.flatMap(e => [e.from, e.to]))].sort();
  const rows = [["", ...nodes], ...nodes.map(a => [a, ...nodes.map(b => { const e = edges.find(x => (x.from === a && x.to === b) || (x.from === b && x.to === a)); return e ? String(e.w) : "–"; })])];
  const degs = nodes.map(v => edges.filter(e => e.from === v || e.to === v).length);
  return q({
    type: "network-from-table", marks: 3,
    prompt: "The table gives the distances (km) along direct roads between towns (– means no direct road). Draw the network, and state the degree of each vertex.",
    table: { headerRow: true, rows },
    answer: nodes.map((v, i) => `${v}: ${degs[i]}`).join(", "),
    working: ["Each number in the table is one edge (the table is symmetric, so count each pair once)."],
    space: SPACE_SIZES.LARGE,
    mcEligible: false,
    tags: ["weighted", "draw"]
  });
}

export const EXTRA_NET_GENERATORS = {
  "sum-of-degrees": sumOfDegreesQuestion,
  "weighted-shortest-path": weightedShortestPathQuestion,
  "weighted-route-length": weightedRouteLengthQuestion,
  "network-from-table": networkFromTableQuestion
};
