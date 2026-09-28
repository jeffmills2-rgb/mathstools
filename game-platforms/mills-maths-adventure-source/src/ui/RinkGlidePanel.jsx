import React, { useEffect } from "react";

import { useRinkGlide } from "../game/rinkGlideStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  RINK_ROUNDS_PER_SET,
  RINK_MAX_QUEUE,
  RINK_PUSH_MS,
  RINK_GLIDE_TAIL_MS,
  glideStops,
} from "../data/snow/rinkGlideChallenge.js";
import { SnowIntro, SnowRoundHead, SnowWorking } from "./SnowCardParts.jsx";

/**
 * ICE RINK — 2D panel (RG). PLAN a queue of pushes with the big buttons
 * (or the arrow keys: ↑ +10, → +1, ↓ −10, ← −1), Backspace undoes, then GO —
 * the penguin skates the jumps and the landing is graded (exact land 15 +
 * fewest-pushes bonus 10/6/3). Wrong landing → camera shake + the fewest-
 * pushes route on the reason card. Esc quits; leaving the snow world exits.
 */

const CELEBRATE_MS = 2200;

const PUSH_LABEL = { 10: "+10", 1: "+1", "-10": "−10", "-1": "−1" };
const PUSH_KEYS = { ArrowUp: 10, ArrowRight: 1, ArrowDown: -10, ArrowLeft: -1 };

/** "+10 ×4 · +1 ×5" — the queue as runs, the way you'd say it. */
function planText(queue) {
  const runs = [];
  for (const v of queue) {
    const last = runs[runs.length - 1];
    if (last && last.v === v) last.n += 1;
    else runs.push({ v, n: 1 });
  }
  return runs.map((r) => `${PUSH_LABEL[r.v]}${r.n > 1 ? ` ×${r.n}` : ""}`).join("  ·  ");
}

export default function RinkGlidePanel() {
  const status = useRinkGlide((s) => s.status);
  const roundIndex = useRinkGlide((s) => s.roundIndex);
  const score = useRinkGlide((s) => s.score);
  const bestScore = useRinkGlide((s) => s.bestScore);
  const round = useRinkGlide((s) => s.currentRound());
  const queue = useRinkGlide((s) => s.queue);
  const landResult = useRinkGlide((s) => s.landResult);
  const regionId = useSession((s) => s.currentRegionId);

  // Leaving the snow world ends the challenge.
  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useRinkGlide.getState().exit();
    }
  }, [status, regionId]);

  // Keys: Esc quits; Enter starts/goes/advances; arrows queue; Backspace undoes.
  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useRinkGlide.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      if (st.status === "planning") {
        const push = PUSH_KEYS[e.key];
        const r = st.currentRound();
        if (push !== undefined && r && r.buttons.includes(push)) {
          e.preventDefault();
          st.addPush(push);
          return;
        }
        if (e.key === "Backspace") {
          e.preventDefault();
          st.undoPush();
          return;
        }
      }
      if (e.key !== "Enter") return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "planning") st.go();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  // The glide plays for one beat per push — then grade it.
  useEffect(() => {
    if (status !== "gliding") return undefined;
    const ms = useRinkGlide.getState().queue.length * RINK_PUSH_MS + RINK_GLIDE_TAIL_MS;
    const t = setTimeout(() => useRinkGlide.getState().finishGlide(), ms);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  // Missed landing → shake.
  useEffect(() => {
    if (status === "feedback") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex]);

  // Celebrate → auto-next.
  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useRinkGlide.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  return (
    <div className="farm-challenge-panel snow-dock">
      {status === "intro" && (
        <SnowIntro
          icon="⛸️"
          title="The Ice Rink"
          steps={[
            <>The ice is a giant <b>number line</b> from 0 to 100.</>,
            <>Press <b>+10</b> for a big glide and <b>+1</b> for a little step. Each push draws a hop on the ice.</>,
            <>Land exactly on the <b>fish bucket</b>, then press GO!</>,
            <>Use as <b>few pushes</b> as you can — big glides first.</>,
          ]}
          example="37 → 82:  +10 ×4 → 77,  +1 ×5 → 82  (9 pushes)"
          onStart={() => useRinkGlide.getState().beginRounds()}
          onQuit={() => useRinkGlide.getState().exit()}
        />
      )}

      {status === "planning" && round && (() => {
        const stops = glideStops(round, queue);
        const lands = stops[stops.length - 1];
        const hit = lands === round.target;
        return (
          <div className="farm-challenge-card">
            <SnowRoundHead
              icon="⛸️"
              roundIndex={roundIndex}
              total={RINK_ROUNDS_PER_SET}
              score={score}
              onQuit={() => useRinkGlide.getState().exit()}
            />
            <div className="snow-q">
              Glide from <span className="fc-value">{round.start}</span> to{" "}
              <span className="fc-value">{round.target}</span>
            </div>
            <div className="plank-pieces">
              {round.buttons.map((b) => (
                <button
                  key={b}
                  className="plank-piece-btn"
                  disabled={queue.length >= RINK_MAX_QUEUE}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    useRinkGlide.getState().addPush(b);
                  }}
                >
                  {PUSH_LABEL[b]}
                </button>
              ))}
              <button
                className="plank-piece-btn"
                disabled={queue.length === 0}
                onClick={(e) => {
                  e.currentTarget.blur();
                  useRinkGlide.getState().undoPush();
                }}
              >
                ⌫ Undo
              </button>
            </div>
            <div className="snow-plan">
              {queue.length === 0 ? (
                <span className="snow-sub">
                  Keys: ↑ +10 · → +1{round.four ? " · ↓ −10 · ← −1" : ""}
                </span>
              ) : (
                <>
                  {planText(queue)}{"  "}→{" "}
                  <span className={hit ? "hit" : "miss"}>
                    {hit ? `lands on ${lands} ✓` : `lands on ${lands}`}
                  </span>
                  <span className="snow-round"> · {queue.length} push{queue.length === 1 ? "" : "es"}</span>
                </>
              )}
            </div>
            <div className="farm-challenge-buttons" style={{ marginTop: 8 }}>
              <button
                className="primary-button"
                disabled={queue.length === 0}
                onClick={(e) => {
                  e.currentTarget.blur();
                  useRinkGlide.getState().go();
                }}
              >
                GO! (Enter)
              </button>
            </div>
          </div>
        );
      })()}

      {status === "gliding" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>⛸️ Gliding… {queue.length} push{queue.length === 1 ? "" : "es"} queued</span>
          </div>
        </div>
      )}

      {status === "celebrate" && round && landResult && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ Landed on {round.target} in {landResult.pushes} push{landResult.pushes === 1 ? "" : "es"} — {landResult.effLabel} · ⭐ {score}
            </span>
          </div>
        </div>
      )}

      {status === "feedback" && round && landResult && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict bad">
            Slid to {landResult.finalValue} — the bucket is on {round.target}. The quickest way:
          </div>
          <SnowWorking lines={round.working} />
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useRinkGlide.getState().next();
              }}
            >
              {roundIndex + 1 < RINK_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>⛸️ The Ice Rink — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useRinkGlide.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useRinkGlide.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
