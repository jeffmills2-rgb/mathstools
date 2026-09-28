/**
 * SNOWMAN MEADOW — LEVEL THE TWINS (ML) — pure logic for the LEVELLING
 * challenge, the fourth Snowball Sums build. No React, no stores — fully
 * checkable headlessly. All values are small integers.
 *
 * PEDAGOGY — levelling turns a hard sum into a DOUBLE YOU KNOW, and attacks
 * "the numbers in a sum are fixed": two snowmen stand as towers of stacked
 * snowballs (17 and 21). Snowballs HOP from the taller to the shorter, one
 * at a time, and the equation chain grows live — 17 + 21 = 18 + 20 =
 * 19 + 19 — every sum visibly THE SAME, with the total never printed until
 * the student computes the double. The key question comes FIRST: how many
 * balls must hop? The difference is 4, but every hop helps BOTH snowmen —
 * the answer is HALF the difference. (Predicting the whole difference is
 * the classic trap.) The last stage plants ODD differences: 17 + 22 can
 * NEVER make twins — "Can't make twins!" is the right call, and the reveal
 * levels to near-twins (19 + 20 = double 19 + 1), linking levelling to
 * near-doubles.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  little twins        doubles to 10   (7 + 9 → 8 + 8)
 *   S2  teen twins          doubles 11–15   (12 + 16 → 14 + 14)
 *   S3  level to a TEN      mean 20/30/40   (26 + 34 → 30 + 30)
 *   S4  big twins           mean 16–35      (23 + 29 → 26 + 26)
 *   S5  twin or not?        round 13 is ALWAYS an odd difference
 *
 * Scoring (per round, max 25):
 *   A) PREDICT the hop count (or call "Can't make twins!")  = 10
 *   B) TYPE the total via the double                        = 15
 */

export const MEADOW_ROUNDS_PER_SET = 15;
const MEADOW_STAGES = 5;
const MEADOW_ROUNDS_PER_STAGE = MEADOW_ROUNDS_PER_SET / MEADOW_STAGES;

export const MEADOW_PREDICT_POINTS = 10;
export const MEADOW_TOTAL_POINTS = 15;
export const MEADOW_ROUND_POINTS = MEADOW_PREDICT_POINTS + MEADOW_TOTAL_POINTS; // 25
export const MEADOW_MAX_SCORE = MEADOW_ROUNDS_PER_SET * MEADOW_ROUND_POINTS; // 375

// The prediction menu: hop counts 1–4 plus the parity call.
export const MEADOW_CANT = "cant";
export const MEADOW_MOVE_OPTIONS = [1, 2, 3, 4, MEADOW_CANT];

// Hop pacing (shared by the 3D layer + panel): one ball per beat.
export const MEADOW_HOP_MS = 700;
export const MEADOW_LEVEL_TAIL_MS = 600;

// The odd-difference trap always lands mid-S5, so every set teaches parity.
export const MEADOW_ODD_ROUND_INDEX = 13;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function meadowStageFor(i) {
  return Math.max(0, Math.min(MEADOW_STAGES - 1, Math.floor(i / MEADOW_ROUNDS_PER_STAGE)));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// Stage configs — SOLUTIONS FIRST: choose the LEVEL (the mean — the double
// the sum becomes) and half the difference, then split into the two towers.
//   meanPool  explicit means (S3's friendly tens), else meanMin..meanMax
//   halfSet   half-differences on offer (the hop count)
const MEADOW_STAGE_CONFIGS = [
  { meanMin: 6, meanMax: 10, halfSet: [1, 2], name: "little twins" },
  { meanMin: 11, meanMax: 15, halfSet: [1, 2, 3], name: "teen twins" },
  { meanPool: [20, 30, 40], halfSet: [2, 3, 4], name: "level to a ten" },
  { meanMin: 16, meanMax: 35, halfSet: [1, 2, 3, 4], name: "big twins" },
  { meanMin: 16, meanMax: 34, halfSet: [1, 2, 3, 4], name: "twin or not?" },
];

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateMeadowRound(roundIndex, rand = Math.random) {
  const stage = meadowStageFor(roundIndex);
  const cfg = MEADOW_STAGE_CONFIGS[stage];
  const odd = roundIndex === MEADOW_ODD_ROUND_INDEX;

  const mean = cfg.meanPool ? pick(cfg.meanPool, rand) : randInt(cfg.meanMin, cfg.meanMax, rand);

  let shorter;
  let taller;
  let diff;
  let moves;
  let level;
  let total;
  if (odd) {
    // An ODD difference: twins are impossible. Level as close as possible —
    // moves = (d−1)/2 leaves near-twins [mean, mean+1].
    diff = pick([3, 5, 7], rand);
    shorter = mean - (diff - 1) / 2;
    taller = mean + (diff + 1) / 2;
    moves = (diff - 1) / 2;
    level = mean; // the near-twins are level and level + 1
    total = 2 * mean + 1;
  } else {
    const half = pick(cfg.halfSet, rand);
    diff = 2 * half;
    shorter = mean - half;
    taller = mean + half;
    moves = half;
    level = mean;
    total = 2 * mean;
  }

  // Which side stands taller (pure cosmetics — the maths is symmetric).
  const tallerSide = rand() < 0.5 ? "left" : "right";
  const left = tallerSide === "left" ? taller : shorter;
  const right = tallerSide === "left" ? shorter : taller;

  return {
    roundIndex,
    stage,
    stageName: cfg.name,
    left,
    right,
    tallerSide,
    shorter,
    taller,
    diff,
    canTwin: !odd,
    halfDiff: odd ? null : diff / 2,
    moves, // balls that actually hop in the reveal
    level, // twins stand at level (+ level+1 when odd)
    total,
    prompt: `Two snowmen: ${left} and ${right} snowballs. Hop snowballs across until they are the SAME height.`,
    // One step per line, for the feedback card.
    working: odd
      ? [
          `${left} + ${right}: they are ${diff} apart — an odd gap`,
          `Hop ${moves}: ${level} + ${level + 1} (they can't match exactly)`,
          `Double ${level} is ${2 * level}, plus 1 more = ${total}`,
        ]
      : [
          `${left} + ${right}: they are ${diff} apart`,
          `Hop ${diff / 2} across: ${level} + ${level}`,
          `Double ${level} = ${total}`,
        ],
    reason: odd
      ? `The difference is ${diff} — an ODD difference can never make twins! Hop ${moves} to get ${level} + ${level + 1}: double ${level} and 1 more = ${total}.`
      : `The difference is ${diff}, but every hop helps BOTH snowmen — move HALF: ${diff / 2}. ${left} + ${right} becomes ${level} + ${level}, and double ${level} = ${total}. The total never changed!`,
  };
}

/**
 * A full set. Consecutive rounds never repeat the same (left, right) pair,
 * so every pair of snowmen is fresh.
 */
export function generateMeadowSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < MEADOW_ROUNDS_PER_SET; i++) {
    let round = generateMeadowRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      round.left === rounds[i - 1].left && round.right === rounds[i - 1].right
    ) {
      round = generateMeadowRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/**
 * Grade Part A — the PREDICTION (a hop count 1–4, or MEADOW_CANT). The
 * whole-difference trap gets its own teaching label. Pure.
 */
export function gradeMeadowPredict(round, choice) {
  const correct = round.canTwin ? choice === round.halfDiff : choice === MEADOW_CANT;
  let label;
  if (correct) {
    label = round.canTwin
      ? `⛄ Level twins! +${MEADOW_PREDICT_POINTS} pts`
      : `🧐 Sharp eyes — an odd difference can't make twins! +${MEADOW_PREDICT_POINTS} pts`;
  } else if (round.canTwin && choice === round.diff) {
    label = `That's the WHOLE difference — but every hop helps both snowmen!`;
  } else if (round.canTwin && choice === MEADOW_CANT) {
    label = `These two CAN be twins — the difference is even!`;
  } else {
    label = "Not quite level!";
  }
  return { correct, choice, points: correct ? MEADOW_PREDICT_POINTS : 0, label };
}

/** Grade Part B — the TYPED total (plain number, spaces tolerated). Pure. */
export function checkMeadowTotal(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.total };
}

/**
 * The two tower counts after k hops (for the animation + the equation
 * chain): the taller sheds a ball to the shorter each hop. Pure.
 */
export function meadowCountsAfter(round, k) {
  const hops = Math.max(0, Math.min(round.moves, k));
  const left = round.left + (round.tallerSide === "left" ? -hops : hops);
  const right = round.right + (round.tallerSide === "left" ? hops : -hops);
  return { left, right };
}

/** The accumulating equation chain after k hops: "17 + 21 = 18 + 20 …". Pure. */
export function meadowChain(round, k) {
  const parts = [];
  for (let i = 0; i <= Math.max(0, Math.min(round.moves, k)); i++) {
    const { left, right } = meadowCountsAfter(round, i);
    parts.push(`${left} + ${right}`);
  }
  return parts.join(" = ");
}

// ---- Hop-it-yourself (2026-09-28 audit) ------------------------------------
// Year 7 feedback: asking for "how many hops?" BEFORE a single ball has moved
// asks students to predict an idea (half the difference) they have never
// seen happen. Now the student DOES the hopping — one ball per tap, from the
// taller snowman to the shorter — watches the equation chain grow, and calls
// it: "They match!" or "They can never match!". The insight arrives after the
// act, on the typing card: "4 apart, but only 2 hops".

/** Largest hop count the panel allows (a student may overshoot and hop back). */
export function meadowMaxHops(round) {
  return round.diff;
}

/**
 * The two tower counts after k hops from the ORIGINALLY taller snowman —
 * NOT capped at the levelling point, so an overshoot shows (and can be
 * undone). k is clamped to 0…diff. Pure.
 */
export function meadowCountsAfterHops(round, k) {
  const hops = Math.max(0, Math.min(meadowMaxHops(round), k));
  const left = round.left + (round.tallerSide === "left" ? -hops : hops);
  const right = round.right + (round.tallerSide === "left" ? hops : -hops);
  return { left, right };
}

/** The chain for k free hops: "8 + 12 = 9 + 11 = 10 + 10". Pure. */
export function meadowChainHops(round, k) {
  const parts = [];
  for (let i = 0; i <= Math.max(0, Math.min(meadowMaxHops(round), k)); i++) {
    const { left, right } = meadowCountsAfterHops(round, i);
    parts.push(`${left} + ${right}`);
  }
  return parts.join(" = ");
}

/**
 * Grade the student's CALL after hopping. `call` is "match" or "cant";
 * `hops` is how many balls they've moved. "match" is right only when the
 * towers really are level; "cant" is right only on an odd gap. Returns
 * whether the call ends the hopping (`done`) and a kid-sized label. Pure.
 */
export function gradeMeadowCall(round, hops, call) {
  const { left, right } = meadowCountsAfterHops(round, hops);
  if (call === "match") {
    if (left === right) {
      return { correct: true, done: true, label: `⛄ Level! +${MEADOW_PREDICT_POINTS} pts` };
    }
    return {
      correct: false,
      done: false,
      label: `Not the same yet — ${left} and ${right}. Keep hopping!`,
    };
  }
  // call === "cant"
  if (!round.canTwin) {
    return {
      correct: true,
      done: true,
      label: `🧐 Right — an odd gap can never split evenly! +${MEADOW_PREDICT_POINTS} pts`,
    };
  }
  return {
    correct: false,
    done: false,
    label: "These two CAN match — keep hopping!",
  };
}

