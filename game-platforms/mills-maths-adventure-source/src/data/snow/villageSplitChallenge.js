/**
 * IGLOO VILLAGE — JOIN THE IGLOOS (VG) — pure logic for the SPLIT-STRATEGY
 * (partitioning) challenge, the sixth Snowball Sums build. No React, no
 * stores — fully checkable headlessly. All values are small integers.
 *
 * PEDAGOGY — the split strategy made of ICE: igloos are built from big
 * TEN-BLOCKS and small ONE-BLOCKS, so every two-digit number's structure is
 * visible before any adding starts. Joining two igloos (34 + 25) means
 * joining LIKE WITH LIKE: tens with tens (30 + 20), ones with ones (4 + 5),
 * then reading the new igloo. The star moment is REGROUPING: 38 + 25 piles
 * up 13 one-blocks — and ten of them visibly SNAP together into a fresh
 * ten-block that slides onto the tens wall. Estimation comes first: "will
 * the ones overflow into a new ten-block?" — answered before a single block
 * moves.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  little joins        no regrouping, tens ≤ 30 each
 *   S2  bigger joins        no regrouping, wider tens
 *   S3  the overflow        ones sum 11–17 — the snap appears
 *   S4  big overflows       regrouping with bigger numbers
 *   S5  overflow or not?    mixed — round 13's ones make EXACTLY ten
 *
 * Scoring (per round, max 25) — round 2, 2026-09-29:
 *   A) BUILD it: move every rod and cube to the middle igloo, and
 *      swap ten ones for a new ten when the ones pile reaches ten    = 10
 *      (first "Done!" only; a missed swap is a nudge, then retry)
 *   B) TYPE the finished igloo's total                             = 15
 */

export const VILLAGE_ROUNDS_PER_SET = 15;
const VILLAGE_STAGES = 5;
const VILLAGE_ROUNDS_PER_STAGE = VILLAGE_ROUNDS_PER_SET / VILLAGE_STAGES;

// Round 2 (Jeff, 2026-09-29): the predict + two-box steps "distract from the
// interactive". A round is now BUILD (move every rod and cube to the middle
// igloo yourself, swapping ten ones for a ten when you have to) = 10, then
// the TOTAL = 15. The older part-grades stay exported (pure) for reference.
export const VILLAGE_PREDICT_POINTS = 5;
export const VILLAGE_TENS_POINTS = 5;
export const VILLAGE_ONES_POINTS = 5;
export const VILLAGE_BUILD_POINTS = 10;
export const VILLAGE_TOTAL_POINTS = 15;
export const VILLAGE_ROUND_POINTS = VILLAGE_BUILD_POINTS + VILLAGE_TOTAL_POINTS; // 25
export const VILLAGE_MAX_SCORE = VILLAGE_ROUNDS_PER_SET * VILLAGE_ROUND_POINTS; // 375

// The exact-ten trap (ones sum EXACTLY 10 — overflow with nothing left over)
// always lands mid-S5.
export const VILLAGE_EXACT_ROUND_INDEX = 13;

// Build pacing for the join/regroup animation (3D layer + panel).
export const VILLAGE_BLOCK_MS = 260;
export const VILLAGE_SNAP_MS = 900;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function villageStageFor(i) {
  return Math.max(0, Math.min(VILLAGE_STAGES - 1, Math.floor(i / VILLAGE_ROUNDS_PER_STAGE)));
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// Stage configs — SOLUTIONS FIRST: choose the tens digits and the ONES SUM
// shape (under / exactly / over ten), then split the ones sum into the two
// addends' ones digits (each 1–9).
//   onesKind  "under" (sum 3–9) | "over" (sum 11–17) | "mixed" (S5)
const VILLAGE_STAGE_CONFIGS = [
  { tMin: 1, tMax: 3, tCap: 5, onesKind: "under", name: "little joins" },
  { tMin: 1, tMax: 5, tCap: 8, onesKind: "under", name: "bigger joins" },
  { tMin: 1, tMax: 4, tCap: 6, onesKind: "over", name: "the overflow" },
  { tMin: 2, tMax: 6, tCap: 8, onesKind: "over", name: "big overflows" },
  { tMin: 1, tMax: 6, tCap: 8, onesKind: "mixed", name: "overflow or not?" },
];

/** Split an ones-sum into two digits, each 1–9. Pure. */
function splitOnes(sum, rand) {
  const lo = Math.max(1, sum - 9);
  const hi = Math.min(9, sum - 1);
  const oa = randInt(lo, hi, rand);
  return [oa, sum - oa];
}

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateVillageRound(roundIndex, rand = Math.random) {
  const stage = villageStageFor(roundIndex);
  const cfg = VILLAGE_STAGE_CONFIGS[stage];
  const exact = roundIndex === VILLAGE_EXACT_ROUND_INDEX;

  let onesSum;
  if (exact) onesSum = 10;
  else if (cfg.onesKind === "under") onesSum = randInt(3, 9, rand);
  else if (cfg.onesKind === "over") onesSum = randInt(11, 17, rand);
  else onesSum = rand() < 0.5 ? randInt(3, 9, rand) : randInt(11, 17, rand);

  const ta = randInt(cfg.tMin, cfg.tMax, rand);
  // Keep the finished igloo two-digit: tens sum + carried ten ≤ 90.
  const carry = onesSum >= 10 ? 1 : 0;
  const tbMax = Math.min(cfg.tMax, cfg.tCap - ta, 8 - ta - carry);
  const tb = randInt(cfg.tMin, Math.max(cfg.tMin, tbMax), rand);
  const [oa, ob] = splitOnes(onesSum, rand);

  const a = ta * 10 + oa;
  const b = tb * 10 + ob;
  const tensSum = (ta + tb) * 10;
  const total = a + b;

  return {
    roundIndex,
    stage,
    stageName: cfg.name,
    a,
    b,
    ta,
    tb,
    oa,
    ob,
    tensSum, // the tens wall VALUE (30 + 20 → 50)
    onesSum, // the raw ones pile (may be ≥ 10 — that's the point)
    regroup: onesSum >= 10,
    exactTen: onesSum === 10,
    total,
    prompt: `Build ${a} + ${b} in the middle igloo.`,
    // One step per line, for the feedback card.
    working:
      onesSum >= 10
        ? [
            `Tens: ${ta * 10} + ${tb * 10} = ${tensSum}`,
            `Ones: ${oa} + ${ob} = ${onesSum} — that's a new ten and ${onesSum - 10} more`,
            `${tensSum} + ${onesSum} = ${total}`,
          ]
        : [
            `Tens: ${ta * 10} + ${tb * 10} = ${tensSum}`,
            `Ones: ${oa} + ${ob} = ${onesSum}`,
            `${tensSum} + ${onesSum} = ${total}`,
          ],
    reason:
      onesSum >= 10
        ? `Tens with tens: ${ta * 10} + ${tb * 10} = ${tensSum}. Ones with ones: ${oa} + ${ob} = ${onesSum} — ten of them SNAP into a new ten-block! ${tensSum} + 10 + ${onesSum - 10} = ${total}.`
        : `Tens with tens: ${ta * 10} + ${tb * 10} = ${tensSum}. Ones with ones: ${oa} + ${ob} = ${onesSum}. ${tensSum} + ${onesSum} = ${total} — no overflow.`,
  };
}

/**
 * A full set. Consecutive rounds never repeat the same (a, b) pair, so
 * every build is fresh.
 */
export function generateVillageSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < VILLAGE_ROUNDS_PER_SET; i++) {
    let round = generateVillageRound(i, rand);
    let guard = 0;
    while (
      i > 0 && guard < 30 &&
      round.a === rounds[i - 1].a && round.b === rounds[i - 1].b
    ) {
      round = generateVillageRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade Part A — the overflow prediction (true = "yes, a new ten"). Pure. */
export function gradeVillagePredict(round, saidYes) {
  const correct = saidYes === round.regroup;
  return {
    correct,
    saidYes,
    points: correct ? VILLAGE_PREDICT_POINTS : 0,
    label: correct
      ? `🧊 Good eye! ${round.oa} + ${round.ob} ${round.regroup ? "makes a new ten" : "is less than ten"}. +${VILLAGE_PREDICT_POINTS} pts`
      : round.regroup
        ? `${round.oa} + ${round.ob} = ${round.onesSum} — that's 10 or more, so it DOES make a new ten!`
        : `${round.oa} + ${round.ob} = ${round.onesSum} — less than 10, so no new ten.`,
  };
}

/** Grade Part B — the typed tens wall + ones pile. Pure. */
export function checkVillageJoin(round, tensText, onesText) {
  const parse = (t) => {
    const cleaned = String(t || "").replace(/\s/g, "");
    return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
  };
  const tens = parse(tensText);
  const ones = parse(onesText);
  if (tens === null || ones === null) return { valid: false, tensCorrect: false, onesCorrect: false };
  return {
    valid: true,
    tensCorrect: tens === round.tensSum,
    onesCorrect: ones === round.onesSum, // the RAW pile — 13, not 3!
  };
}

/** Grade Part C — the finished igloo's total. Pure. */
export function checkVillageTotal(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.total };
}

/**
 * What the middle igloo holds for a build state: `moved` = { ta, tb, oa, ob }
 * blocks moved from each igloo, `regrouped` = ten ones swapped for a ten. Pure.
 */
export function villageSite(round, moved, regrouped) {
  const tens = moved.ta + moved.tb + (regrouped ? 1 : 0);
  const ones = moved.oa + moved.ob - (regrouped ? 10 : 0);
  return { tens, ones, value: tens * 10 + ones };
}

/**
 * Grade the "Done!" press on a build. Not everything moved → a gentle "keep
 * going" (never a miss). Ten or more ones left un-swapped → a miss with the
 * swap named. Otherwise the build is right. Pure.
 */
export function gradeVillageBuild(round, moved, regrouped) {
  const allMoved = moved.ta === round.ta && moved.tb === round.tb && moved.oa === round.oa && moved.ob === round.ob;
  if (!allMoved) return { done: false, miss: false, note: "Move ALL the rods and cubes to the middle igloo first." };
  const site = villageSite(round, moved, regrouped);
  if (site.ones >= 10) {
    return { done: false, miss: true, note: `There are ${site.ones} ones — swap 10 of them for a new ten!` };
  }
  return {
    done: true,
    miss: false,
    note: round.regroup ? `🧊 Built — nice swap! +${VILLAGE_BUILD_POINTS} pts` : `🧊 Built! +${VILLAGE_BUILD_POINTS} pts`,
  };
}

