import React, { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

import { YARD_AREA, YARD_STALL, YARD_BOARD } from "../data/snow/snowLayout.js";
import { useLodgeYard } from "./lodgeYardStore.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * THE LODGE YARD — 3D layer (LY). The lodge's hot-chocolate STALL (striped
 * awning, steaming mug) and, beside it, a lit COUNTING-UP BOARD: a number
 * line from the price's tens number up to 100c ($1). Round 2 (2026-09-29):
 * the hundred-bead board "looked like a ratio", so it is gone — every coin
 * the student gives is a JUMP along this line from the price (65c → 70c →
 * 100c), labelled with the coin. The till pin shows where they are; a jump
 * past $1 glows red. Correct change → confetti.
 */

const WOOD = "#6e5a44";
const WOOD_DARK = "#57462f";
const AWNING_A = "#d6493f";
const AWNING_B = "#f3ead6";
const COCOA = "#7a5638";
const BOARD_PANEL = "#fdf3dc";
const LINE = "#2b2f45";
const JUMP = "#e08a00";
const OVER = "#e5484d";
const TILL = "#ffd166";

const STALL = [YARD_STALL[0] - YARD_AREA.x, YARD_STALL[1] - YARD_AREA.z];
const BOARD = [YARD_BOARD[0] - YARD_AREA.x, YARD_BOARD[1] - YARD_AREA.z];

// Board-local number line.
const LINE_W = 5.2;
const LINE_Y = 1.35;
const LINE_Z = 0.06;

/** Board-local x for a value on the line (past 100c runs a little further). */
function xFor(round, v) {
  const span = 100 - round.lineMin;
  const clamped = Math.min(v, 100 + span * 0.08);
  return -LINE_W / 2 + ((clamped - round.lineMin) / span) * LINE_W;
}

/** One coin's jump: an arc from `from` to `to` with the coin on top. */
function CoinJump({ round, from, to, cents, over }) {
  const x0 = xFor(round, from);
  const x1 = xFor(round, to);
  const span = Math.abs(x1 - x0);
  const h = 0.25 + Math.min(1.1, span * 0.45);
  const geom = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, LINE_Y + 0.04, LINE_Z + 0.03),
      new THREE.Vector3((x0 + x1) / 2, LINE_Y + h * 2, LINE_Z + 0.03),
      new THREE.Vector3(x1, LINE_Y + 0.04, LINE_Z + 0.03)
    );
    return new THREE.TubeGeometry(curve, 20, 0.03, 6, false);
  }, [x0, x1, h]);
  const color = over ? OVER : JUMP;
  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Html position={[(x0 + x1) / 2, LINE_Y + h + 0.22, LINE_Z]} center distanceFactor={8} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="yard-jump-chip" style={{ borderColor: color }}>+{cents}c</div>
      </Html>
    </group>
  );
}

function Stall({ shown }) {
  return (
    <group position={[STALL[0], 0, STALL[1]]} rotation={[0, 0.35, 0]}>
      {/* Counter + posts + striped awning. */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[2.6, 1.1, 1.0]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {[-1.15, 1.15].map((dx) => (
        <mesh key={dx} castShadow position={[dx, 1.5, -0.4]}>
          <boxGeometry args={[0.1, 2.0, 0.1]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} castShadow position={[(i - 2.5) * 0.48, 2.55, -0.1]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.48, 0.06, 1.1]} />
          <meshStandardMaterial color={i % 2 ? AWNING_A : AWNING_B} />
        </mesh>
      ))}
      {/* The steaming mug on the counter. */}
      <mesh castShadow position={[0.6, 1.28, 0.1]}>
        <cylinderGeometry args={[0.18, 0.15, 0.32, 12]} />
        <meshStandardMaterial color="#e8eef8" />
      </mesh>
      <mesh position={[0.6, 1.42, 0.1]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
        <meshStandardMaterial color={COCOA} />
      </mesh>
      <Html position={[0, 3.0, 0]} center distanceFactor={11} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="fc-count-chip">☕ Hot chocolate {shown ? `${shown.price}c` : ""}</div>
      </Html>
    </group>
  );
}

export default function LodgeYardChallenge() {
  const status = useLodgeYard((s) => s.status);
  const shown = useLodgeYard((s) => s.currentRound());
  const coins = useLodgeYard((s) => s.coins);
  const active = status !== "idle" && status !== "intro";

  if (!active || !shown) return null;

  // Cumulative stops along the line.
  const stops = [shown.price];
  for (const c of coins) stops.push(stops[stops.length - 1] + c);
  const till = stops[stops.length - 1];
  const tens = [];
  for (let v = shown.lineMin; v <= 100; v += 10) tens.push(v);
  const units = [];
  for (let v = shown.lineMin; v <= 100; v++) if (v % 10 !== 0) units.push(v);

  return (
    <group position={[YARD_AREA.x, 0, YARD_AREA.z]}>
      <Stall shown={shown} />

      {/* The counting-up board on its stand. */}
      <group position={[BOARD[0], 0, BOARD[1]]} rotation={[0, -0.25, 0]}>
        {[-3.0, 3.0].map((dx) => (
          <mesh key={dx} castShadow position={[dx, 1.2, -0.06]}>
            <boxGeometry args={[0.12, 2.4, 0.12]} />
            <meshStandardMaterial color={WOOD_DARK} />
          </mesh>
        ))}
        <mesh castShadow position={[0, 1.75, -0.09]}>
          <boxGeometry args={[6.2, 2.5, 0.08]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
        <mesh position={[0, 1.75, -0.04]}>
          <boxGeometry args={[5.95, 2.3, 0.04]} />
          <meshStandardMaterial color={BOARD_PANEL} emissive={BOARD_PANEL} emissiveIntensity={0.4} />
        </mesh>

        {/* The line, its tens (labelled) and its ones. */}
        <mesh position={[0, LINE_Y, LINE_Z]}>
          <boxGeometry args={[LINE_W + 0.1, 0.045, 0.02]} />
          <meshStandardMaterial color={LINE} />
        </mesh>
        {tens.map((v) => (
          <group key={`t${v}`} position={[xFor(shown, v), LINE_Y, LINE_Z]}>
            <mesh>
              <boxGeometry args={[0.035, 0.26, 0.02]} />
              <meshStandardMaterial color={LINE} />
            </mesh>
            <Html position={[0, -0.34, 0]} center distanceFactor={8} className="ix-badge-anchor" zIndexRange={[24, 0]}>
              <div className="yard-tick-label">{v === 100 ? "100c ($1)" : `${v}c`}</div>
            </Html>
          </group>
        ))}
        {units.map((v) => (
          <mesh key={`u${v}`} position={[xFor(shown, v), LINE_Y, LINE_Z]}>
            <boxGeometry args={[0.018, v % 5 === 0 ? 0.16 : 0.1, 0.02]} />
            <meshStandardMaterial color="#7b8198" />
          </mesh>
        ))}

        {/* The price (where the counting starts) — a cocoa pin. */}
        <group position={[xFor(shown, shown.price), LINE_Y, LINE_Z + 0.04]}>
          <mesh>
            <sphereGeometry args={[0.1, 12, 10]} />
            <meshStandardMaterial color={COCOA} emissive={COCOA} emissiveIntensity={0.3} />
          </mesh>
          {shown.price % 10 !== 0 && (
            <Html position={[0, -0.72, 0]} center distanceFactor={8} className="ix-badge-anchor" zIndexRange={[24, 0]}>
              <div className="yard-tick-label yard-price">☕ {shown.price}c</div>
            </Html>
          )}
        </group>

        {/* Each coin given = one jump. */}
        {coins.map((c, i) => (
          <CoinJump key={`${i}-${stops[i]}`} round={shown} from={stops[i]} to={stops[i + 1]} cents={c} over={stops[i + 1] > 100} />
        ))}

        {/* The till: where the counting has got to. */}
        {coins.length > 0 && (
          <mesh position={[xFor(shown, till), LINE_Y, LINE_Z + 0.06]}>
            <sphereGeometry args={[0.12, 14, 10]} />
            <meshStandardMaterial
              color={till > 100 ? OVER : TILL}
              emissive={till > 100 ? OVER : TILL}
              emissiveIntensity={0.9}
            />
          </mesh>
        )}
      </group>

      {status === "celebrate" && <ConfettiBurst origin={[BOARD[0], 2.6, BOARD[1] + 0.6]} />}
    </group>
  );
}
