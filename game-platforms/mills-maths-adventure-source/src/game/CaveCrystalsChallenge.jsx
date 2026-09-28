import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import { CAVE_AREA, CAVE_WALL, CAVE_DOME } from "../data/snow/snowLayout.js";
import { useCaveCrystals } from "./caveCrystalsStore.js";
import { cavePhases, CAVE_PHASE_GAP_MS } from "../data/snow/caveCrystalsChallenge.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * THE ICE CAVE — 3D layer (IC). A DARK half-dome cave mouth swallows the
 * back of the clearing; inside it, a wall of numbered crystals spans the
 * round's little window of the number line. Everything starts dim — then
 * the chosen act plays: crystals GLOW one beat at a time, cyan sweeping UP
 * from b, or amber stepping BACK from a, with the landing crystal ringed
 * gold. Count-up rounds read the ANSWER as how-many-glows; count-back
 * rounds read it as where-you-land — the wall makes the difference between
 * the two readings visible. Correct answer → the whole wall shimmers +
 * confetti.
 */

// Lighter cave + pale-ice resting crystals (audit 2026-09-28): the dim
// crystals were dark-navy on a near-black dome — invisible from the camera.
const DOME = "#27305a";
const CRYSTAL_DIM = "#a9c4e4";
const GLOW_UP = "#59d8e8";
const GLOW_BACK = "#e8a020";
const LAND = "#ffe14d";

const WALL = [CAVE_WALL.xMin - CAVE_AREA.x, CAVE_WALL.z - CAVE_AREA.z]; // west end, local
const WALL_LEN = CAVE_WALL.xMax - CAVE_WALL.xMin;
const DOME_LOCAL = [CAVE_DOME.center[0] - CAVE_AREA.x, CAVE_DOME.center[1] - CAVE_AREA.z];

/** Local x of value v within the round's crystal window. */
function xFor(round, v) {
  const span = round.windowMax - round.windowMin;
  return WALL[0] + ((v - round.windowMin) / span) * WALL_LEN;
}

/**
 * Per-phase progress: how many crystals of each run are lit right now. The
 * student's choice runs first; the quick way (if different) follows.
 */
function phaseProgress(phases, startedAt, done) {
  if (done) return phases.map((p) => p.steps);
  let t = Date.now() - startedAt;
  return phases.map((p) => {
    if (t <= 0) return 0;
    const lit = Math.min(p.steps, Math.floor(t / p.msPerStep));
    t -= p.steps * p.msPerStep + CAVE_PHASE_GAP_MS;
    return lit;
  });
}

/** One wall crystal (an octahedron on a stub). */
function Crystal({ position, lit, color, landing, tall, size = 1 }) {
  return (
    <group position={position} scale={[size, size, size]}>
      <mesh castShadow position={[0, tall ? 0.85 : 0.62, 0]} rotation={[0, 0.5, 0]}>
        <octahedronGeometry args={[tall ? 0.34 : 0.26]} />
        <meshStandardMaterial
          color={lit ? color : CRYSTAL_DIM}
          emissive={lit ? color : CRYSTAL_DIM}
          emissiveIntensity={lit ? 1.1 : 0.12}
          transparent
          opacity={0.95}
          flatShading
        />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.36, 6]} />
        <meshStandardMaterial color="#3a4166" />
      </mesh>
      {landing && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.4, 0.55, 20]} />
          <meshBasicMaterial color={LAND} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}

export default function CaveCrystalsChallenge() {
  const status = useCaveCrystals((s) => s.status);
  const shown = useCaveCrystals((s) => s.currentRound());
  const startedAt = useCaveCrystals((s) => s.lightStartedAt);
  const active = status !== "idle" && status !== "intro";
  const tick = useRef(0);
  const [, force] = React.useReducer((n) => n + 1, 0);
  useFrame((state) => {
    if (status !== "lighting") return;
    if (state.clock.elapsedTime - tick.current > 0.1) {
      tick.current = state.clock.elapsedTime;
      force();
    }
  });

  if (!active || !shown) return null;

  const started = status !== "choosing" && startedAt > 0;
  const chosen = useCaveCrystals.getState().chosen || shown.kind;
  const phases = started ? cavePhases(shown, chosen) : [];
  const done = status === "typing" || status === "celebrate" || status === "feedback";
  const lit = started ? phaseProgress(phases, startedAt, done) : [];

  // value → colour of the LATEST run that lit it (the quick way paints over).
  const litColor = new Map();
  const landings = [];
  phases.forEach((p, i) => {
    const color = p.dir === "up" ? GLOW_UP : GLOW_BACK;
    for (let g = 0; g < lit[i]; g++) litColor.set(p.values[g], color);
    if (lit[i] === p.steps) landings.push(p.landing);
  });

  const count = shown.windowMax - shown.windowMin + 1;
  const spacing = WALL_LEN / Math.max(1, count - 1);
  const size = Math.min(1, spacing / 0.75);
  const crowded = count > 16;
  // a and b right next to each other on a long wall: stagger their labels.
  const closeEnds = Math.abs(shown.a - shown.b) * spacing < 1.1;
  // Label a and b always; the answer only once a run has LANDED on it (it
  // must not sit on the wall before it is worked out). Crowded walls label
  // only the tens that are clear of those.
  const keyValues = new Set([shown.a, shown.b, ...landings]);
  const nearKey = (v) => [...keyValues].some((k) => k !== v && Math.abs(k - v) <= Math.max(2, Math.round(count / 14)));

  const chip =
    status === "choosing"
      ? `${shown.a} − ${shown.b} ?`
      : status === "typing"
        ? shown.kind === "up"
          ? `${shown.b} → ${shown.a}: how many steps?`
          : `${shown.a} back ${shown.b} steps: where?`
        : status === "celebrate"
          ? `${shown.a} − ${shown.b} = ${shown.answer}`
          : `${shown.a} − ${shown.b}`;

  return (
    <group position={[CAVE_AREA.x, 0, CAVE_AREA.z]}>
      {/* The dark cave mouth — a half-dome swallowing the back wall. */}
      <mesh position={[DOME_LOCAL[0], 0, DOME_LOCAL[1]]}>
        {/* The BACK half only (phi π…2π = the −z side, away from the camera).
            A full dome put its front wall between the camera and the crystal
            wall inside it — every crystal was hidden (audit 2026-09-28). */}
        <sphereGeometry args={[CAVE_DOME.radius, 24, 16, Math.PI, Math.PI, 0, Math.PI / 2]} />
        <meshStandardMaterial color={DOME} side={2} transparent opacity={0.9} />
      </mesh>

      {/* The numbered crystal wall — wide enough to hold BOTH routes. */}
      {Array.from({ length: count }, (_, i) => {
        const v = shown.windowMin + i;
        const endpoint = v === shown.a || v === shown.b;
        const isStart = started && phases.some((p) => p.from === v);
        const landed = landings.includes(v);
        const c = litColor.get(v);
        const hideAnswer = v === shown.answer && !landings.includes(v) && v !== shown.a && v !== shown.b;
        const showLabel = !crowded ? !hideAnswer : keyValues.has(v) || (v % 10 === 0 && !nearKey(v) && !hideAnswer);
        return (
          <group key={v}>
            <Crystal
              position={[xFor(shown, v), 0, WALL[1]]}
              lit={Boolean(c) || isStart || landed}
              color={landed ? LAND : c || (isStart ? "#ffffff" : GLOW_UP)}
              landing={landed}
              tall={endpoint}
              size={endpoint ? Math.max(size, 0.7) : size}
            />
            {showLabel && (
              <Html position={[xFor(shown, v), endpoint ? (closeEnds && v === shown.b ? 2.45 : 1.75) : 1.45, WALL[1]]} center distanceFactor={crowded ? 17 : 14} className="ix-badge-anchor" zIndexRange={[24, 0]}>
                <div className="fc-count-chip" style={endpoint ? { borderColor: "#3a86ff" } : undefined}>{v}</div>
              </Html>
            )}
          </group>
        );
      })}

      {/* A step counter riding along each run. */}
      {phases.map((p, i) =>
        lit[i] > 0 ? (
          <Html
            key={`pc${i}`}
            position={[xFor(shown, p.values[lit[i] - 1]), (closeEnds ? 3.15 : 2.5) + i * 0.75, WALL[1]]}
            center
            distanceFactor={11}
            className="ix-badge-anchor"
            zIndexRange={[24, 0]}
          >
            <div className="fc-count-chip" style={{ borderColor: p.dir === "up" ? GLOW_UP : GLOW_BACK }}>
              {p.dir === "up" ? "⬆ up" : "⬇ back"}: {lit[i]} step{lit[i] === 1 ? "" : "s"}
            </div>
          </Html>
        ) : null
      )}

      {/* The running sentence over the cave mouth. */}
      <Html position={[WALL[0] + WALL_LEN / 2, 3.6, WALL[1] + 1.2]} center distanceFactor={10} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="milk-display snow-chip">{chip}</div>
      </Html>

      {status === "celebrate" && (
        <ConfettiBurst origin={[xFor(shown, shown.kind === "up" ? shown.a : shown.answer), 1.6, WALL[1] + 0.6]} />
      )}
    </group>
  );
}
