import React from "react";
import { Html } from "@react-three/drei";

import {
  VILLAGE_AREA,
  VILLAGE_LEFT_STAND,
  VILLAGE_RIGHT_STAND,
  VILLAGE_BUILD_SITE,
} from "../data/snow/snowLayout.js";
import { useVillageSplit } from "./villageSplitStore.js";
import { villageSite } from "../data/snow/villageSplitChallenge.js";
import { ConfettiBurst } from "./OrderPartsChallenge.jsx";

/**
 * IGLOO VILLAGE — 3D layer (VG). Two part-built igloos stand on block
 * stands, each made of TEN-RODS (a stacked wall) and ONE-CUBES (a little
 * pile). Round 2 (2026-09-29): the STUDENT builds the sum — tap a rod or a
 * cube on either igloo (or use the panel buttons) and it moves to the middle
 * igloo; tap the middle ones pile (or "Swap") once it holds ten or more and
 * ten cubes become one fresh gold rod. Correct total → dome + confetti.
 */

// Stronger ice colours (audit 2026-09-28): pale blue on pale snow was
// unreadable in the twilight.
const ICE_TEN = "#4da6e0";
const ICE_ONE = "#f4fbff";
const ICE_NEW = "#ffe14d"; // the freshly snapped ten-block
const STAND = "#57462f";

const LEFT = [VILLAGE_LEFT_STAND[0] - VILLAGE_AREA.x, VILLAGE_LEFT_STAND[1] - VILLAGE_AREA.z];
const RIGHT = [VILLAGE_RIGHT_STAND[0] - VILLAGE_AREA.x, VILLAGE_RIGHT_STAND[1] - VILLAGE_AREA.z];
const SITE = [VILLAGE_BUILD_SITE[0] - VILLAGE_AREA.x, VILLAGE_BUILD_SITE[1] - VILLAGE_AREA.z];

// ONE unit cube, used for BOTH the ones and the ten-blocks (audit
// 2026-09-28): a ten-block is now a ROD of ten of the same cubes, so a
// student can see — and count — that it is ten ones joined up. The old
// ten-block was a plain slab that could have been any size.
const UNIT = 0.22;
const UNIT_GAP = 0.018;
const ROD_LEN = 10 * UNIT + 9 * UNIT_GAP;

/** Pointer handlers that make a block tappable (no-op without onPick). */
function pickProps(onPick) {
  if (!onPick) return {};
  return {
    onPointerDown: (e) => {
      e.stopPropagation();
      onPick();
    },
    onPointerOver: () => (document.body.style.cursor = "pointer"),
    onPointerOut: () => (document.body.style.cursor = ""),
  };
}

/** A ten-block: a rod of ten unit cubes. */
function TenBlock({ position, fresh, onPick }) {
  const color = fresh ? ICE_NEW : ICE_TEN;
  return (
    <group position={position} {...pickProps(onPick)}>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} castShadow position={[-ROD_LEN / 2 + UNIT / 2 + i * (UNIT + UNIT_GAP), 0, 0]}>
          <boxGeometry args={[UNIT, UNIT, UNIT]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={fresh ? 0.8 : 0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** A one-block: a single unit cube. */
function OneBlock({ position, hot, onPick }) {
  return (
    <mesh castShadow position={position} {...pickProps(onPick)}>
      <boxGeometry args={[UNIT, UNIT, UNIT]} />
      <meshStandardMaterial
        color={hot ? ICE_NEW : ICE_ONE}
        emissive={hot ? ICE_NEW : ICE_ONE}
        emissiveIntensity={hot ? 0.9 : 0.25}
      />
    </mesh>
  );
}

/** Ten-rod k's local slot: stacked one per course, like a wall. */
function tenSlot(k) {
  return [0, UNIT / 2 + k * (UNIT + 0.05), -0.2];
}

/** One-block k's local slot in a pile (rows of 5 in front). */
function oneSlot(k) {
  return [((k % 5) - 2) * (UNIT + 0.1), UNIT / 2 + Math.floor(k / 5) * (UNIT + 0.05), 0.75];
}

/** A source igloo: whatever is still to move + its count chip. */
function SourceIgloo({ local, tens, ones, count, fullTens, fullOnes, onTen, onOne }) {
  return (
    <group position={[local[0], 0.12, local[1]]}>
      <mesh receiveShadow position={[0, -0.06, 0.3]}>
        <boxGeometry args={[2.6, 0.12, 2.4]} />
        <meshStandardMaterial color={STAND} />
      </mesh>
      {Array.from({ length: tens }, (_, k) => (
        <TenBlock key={`t${k}`} position={tenSlot(k)} onPick={onTen} />
      ))}
      {Array.from({ length: ones }, (_, k) => (
        <OneBlock key={`o${k}`} position={oneSlot(k)} onPick={onOne} />
      ))}
      <Html position={[0, 2.3, 0.3]} center distanceFactor={11} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="fc-count-chip">
          {`${count} = ${fullTens} ten${fullTens === 1 ? "" : "s"} + ${fullOnes} one${fullOnes === 1 ? "" : "s"}`}
        </div>
      </Html>
    </group>
  );
}

export default function VillageSplitChallenge() {
  const status = useVillageSplit((s) => s.status);
  const shown = useVillageSplit((s) => s.currentRound());
  const moved = useVillageSplit((s) => s.moved);
  const regrouped = useVillageSplit((s) => s.regrouped);
  const buildMissed = useVillageSplit((s) => s.buildMissed);
  const active = status !== "idle" && status !== "intro";

  if (!active || !shown) return null;

  const building = status === "building";
  const st = () => useVillageSplit.getState();
  const site = villageSite(shown, moved, regrouped);
  // After a missed swap, the ten cubes to swap pulse gold (and are tappable).
  const needSwap = building && !regrouped && site.ones >= 10;

  const chip =
    status === "celebrate"
      ? `${shown.a} + ${shown.b} = ${shown.total}`
      : `${shown.a} + ${shown.b}`;

  return (
    <group position={[VILLAGE_AREA.x, 0, VILLAGE_AREA.z]}>
      {/* The two source igloos — what is still to move. */}
      <SourceIgloo
        local={LEFT}
        tens={shown.ta - moved.ta}
        ones={shown.oa - moved.oa}
        count={shown.a}
        fullTens={shown.ta}
        fullOnes={shown.oa}
        onTen={building ? () => st().moveBlock("a", "ten") : null}
        onOne={building ? () => st().moveBlock("a", "one") : null}
      />
      <SourceIgloo
        local={RIGHT}
        tens={shown.tb - moved.tb}
        ones={shown.ob - moved.ob}
        count={shown.b}
        fullTens={shown.tb}
        fullOnes={shown.ob}
        onTen={building ? () => st().moveBlock("b", "ten") : null}
        onOne={building ? () => st().moveBlock("b", "one") : null}
      />

      {/* The middle igloo: the student's own build. */}
      <group position={[SITE[0], 0.12, SITE[1]]}>
        <mesh receiveShadow position={[0, -0.06, 0.3]}>
          <boxGeometry args={[3.2, 0.12, 2.6]} />
          <meshStandardMaterial color={STAND} />
        </mesh>
        {Array.from({ length: site.tens }, (_, k) => (
          <TenBlock key={`t${k}`} position={tenSlot(k)} fresh={regrouped && k === site.tens - 1} />
        ))}
        {Array.from({ length: Math.max(0, site.ones) }, (_, k) => (
          <OneBlock
            key={`o${k}`}
            position={oneSlot(k)}
            hot={needSwap && buildMissed && k < 10}
            onPick={needSwap ? () => st().regroup() : null}
          />
        ))}
        {status === "celebrate" && (
          <mesh castShadow position={[0, 1.9, 0.2]}>
            <sphereGeometry args={[1.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={ICE_TEN} emissive={ICE_TEN} emissiveIntensity={0.4} transparent opacity={0.85} />
          </mesh>
        )}
      </group>

      {/* The sum above the middle igloo. */}
      <Html position={[SITE[0], 3.6, SITE[1]]} center distanceFactor={10} className="ix-badge-anchor" zIndexRange={[24, 0]}>
        <div className="milk-display snow-chip">{chip}</div>
      </Html>

      {status === "celebrate" && <ConfettiBurst origin={[SITE[0], 2.4, SITE[1] + 0.5]} />}
    </group>
  );
}
