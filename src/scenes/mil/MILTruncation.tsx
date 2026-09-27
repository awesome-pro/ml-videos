import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { ProbRuler, rulerLabelRows, type RulerSeg } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { SAMPLING_SEGS } from "./data";

/**
 * top-k and top-p — the two ways of cutting the tail.
 *
 * Both are the same move: throw away the unlikely end of the distribution
 * *before* drawing, so a 0.03% token can never win. They differ only in where
 * they cut. So the scene shows two rulers:
 *
 *   top     the model's odds, all 151,936 options, with the cut marked in rose
 *   bottom  what you actually draw from — the survivors, renormalised
 *
 * The bottom ruler carries the same two draws the whole time. As the tail is
 * cut away they land on different tokens *without moving*, because a draw is a
 * point on the ruler and the ruler is what changed. The draw at 0.97 is the
 * demonstration: with no rule it takes `others` — the entire remaining
 * vocabulary — under top-k it takes `a`, and under top-p it takes `home`.
 */

/** Both rulers share this geometry, and the sampling scenes' ruler above them. */
export const TRUNCATION_GEOM = {
  x: 180,
  width: 1540,
  height: 78,
  oddsY: 316,
  drawY: 574,
  oddsCaptionY: 258,
  drawCaptionY: 516,
  noteY: 790,
};

const { x: X, width: W, height: H } = TRUNCATION_GEOM;

const BASE = SAMPLING_SEGS.map((s) => s.prob);

/** Frames. */
const ODDS_AT = 12;
const DRAW_AT = 60;
const PICK_1 = 100;
const PICK_2 = 120;
const TOPK_AT = 190;
const TOPP_AT = 320;
const NOTE_AT = 430;

const LAST_ANIM = NOTE_AT + TIMING.fast; // 444
export const MIL_TRUNCATION_DURATION = LAST_ANIM + 50; // 494 (16.5s)

/**
 * Two draws, both taken from the sampling scene's fixed set. One sits in the
 * head of the distribution and never changes hands; the other sits in the tail
 * the rules are about to cut.
 */
export const TRUNCATION_DRAWS = [
  { u: 0.28, at: PICK_1 },
  { u: 0.97, at: PICK_2 },
];

/**
 * Label rows for the lower ruler, computed once for its widest state. Its names
 * are always a *prefix* of the full list — a rule can only ever remove from the
 * end — so one row assignment holds for every rule.
 */
export const TRUNCATION_LABEL_ROWS = rulerLabelRows(SAMPLING_SEGS, X, W, 28);

/** Mass kept by each rule: the four highest, and the shortest 90% prefix. */
const KEPT_BY_K = BASE.slice(0, 4).reduce((a, b) => a + b, 0);
const KEPT_BY_P = BASE.slice(0, 5).reduce((a, b) => a + b, 0);

export const MILTruncation: React.FC = () => {
  const frame = useCurrentFrame();

  const k = ramp(frame, TOPK_AT, TOPK_AT + TIMING.fast);
  const p = ramp(frame, TOPP_AT, TOPP_AT + TIMING.fast);

  /**
   * How much of each option survives, as a continuous ramp so the lower ruler
   * *morphs* between rules instead of redrawing:
   *   nothing cut -> all six;  top-k -> the four highest;  top-p -> five.
   * `home` leaves as top-k arrives and returns when top-p reaches further.
   */
  const incl = (i: number) => {
    if (i <= 3) return 1;
    if (i === 4) return 1 - k * (1 - p);
    return 1 - k;
  };

  /**
   * Where the odds ruler draws its cut. Discrete rather than ramped: a rule
   * being applied is an event, and the rose should land on a frame, not fade.
   */
  const cutFrom = frame < TOPK_AT ? 6 : frame < TOPP_AT ? 4 : 5;
  const oddsSegs: RulerSeg[] = SAMPLING_SEGS.map((s, i) => ({ ...s, kept: i < cutFrom }));

  const raw = BASE.map((prob, i) => prob * incl(i));
  const keptMass = raw.reduce((a, b) => a + b, 0);
  /** What you draw from: the survivors, stretched back out to fill the ruler. */
  const drawSegs: RulerSeg[] = SAMPLING_SEGS.map((s, i) => ({
    label: s.label,
    prob: keptMass > 0 ? raw[i] / keptMass : 0,
  }));

  return (
    <SceneShell title="Cutting the tail before you draw" duration={MIL_TRUNCATION_DURATION}>
      <Caption at={ODDS_AT} until={TOPK_AT} y={TRUNCATION_GEOM.oddsCaptionY} color={AP_COLORS.textSecondary}>
        the model's odds — every one of 151,936 options
      </Caption>
      <Caption at={TOPK_AT + 6} until={TOPP_AT} y={TRUNCATION_GEOM.oddsCaptionY} color={AP_COLORS.value}>
        top-k = 4 — keep the four highest scoring
      </Caption>
      <Caption at={TOPP_AT + 6} until={null} y={TRUNCATION_GEOM.oddsCaptionY} color={AP_COLORS.query}>
        top-p = 0.9 — keep the least that still holds 90%
      </Caption>

      <Mass at={TOPK_AT + 6} until={TOPP_AT} text={`kept ${(KEPT_BY_K * 100).toFixed(0)}%`} />
      <Mass at={TOPP_AT + 6} until={null} text={`kept ${(KEPT_BY_P * 100).toFixed(0)}%`} />

      <ProbRuler
        segs={oddsSegs}
        x={X}
        y={TRUNCATION_GEOM.oddsY}
        width={W}
        height={H}
        start={ODDS_AT}
        labelRows={TRUNCATION_LABEL_ROWS}
        showPct
      />

      <Caption at={DRAW_AT} until={TOPK_AT} y={TRUNCATION_GEOM.drawCaptionY} color={AP_COLORS.textSecondary}>
        no rule — you draw from all of it
      </Caption>
      <Caption at={TOPK_AT + 6} until={TOPP_AT} y={TRUNCATION_GEOM.drawCaptionY} color={AP_COLORS.value}>
        renormalised — you draw from these four
      </Caption>
      <Caption at={TOPP_AT + 6} until={null} y={TRUNCATION_GEOM.drawCaptionY} color={AP_COLORS.query}>
        five, not four — top-p stops at 90%, not at a count
      </Caption>

      <ProbRuler
        segs={drawSegs}
        x={X}
        y={TRUNCATION_GEOM.drawY}
        width={W}
        height={H}
        start={DRAW_AT}
        draws={TRUNCATION_DRAWS}
        hitAt={PICK_1}
        labelRows={TRUNCATION_LABEL_ROWS}
        showPct
      />

      <Note />
    </SceneShell>
  );
};

/** The closing line, held to the end of the scene. */
const Note: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, NOTE_AT, NOTE_AT + TIMING.fast);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: TRUNCATION_GEOM.noteY,
        width: 1920,
        textAlign: "center",
        fontFamily: AP_FONTS.sans,
        fontSize: 32,
        fontWeight: AP_WEIGHT.heading,
        color: AP_COLORS.textPrimary,
        opacity: inP,
        transform: `translateY(${(1 - inP) * 8}px)`,
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      top-k counts tokens · top-p follows the mass
    </div>
  );
};

/**
 * A line above a ruler. The outgoing copy lifts as it leaves so two captions
 * sharing this row can never overprint during the handover.
 */
const Caption: React.FC<{
  at: number;
  until: number | null;
  y: number;
  color: string;
  children: React.ReactNode;
}> = ({ at, until, y, color, children }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, at, at + TIMING.fast);
  const outP = until === null ? 1 : 1 - ramp(frame, until, until + 10);
  return (
    <div
      style={{
        position: "absolute",
        left: 180,
        top: y,
        transform: `translateY(${(1 - inP) * 8 - (1 - outP) * 8}px)`,
        fontFamily: AP_FONTS.sans,
        fontSize: 30,
        fontWeight: AP_WEIGHT.heading,
        color,
        opacity: Math.min(inP, outP),
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {children}
    </div>
  );
};

/** How much of the distribution the rule kept, on the odds caption row. */
const Mass: React.FC<{ at: number; until: number | null; text: string }> = ({ at, until, text }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, at, at + TIMING.fast);
  const outP = until === null ? 1 : 1 - ramp(frame, until, until + 10);
  return (
    <div
      style={{
        position: "absolute",
        left: 1720,
        top: TRUNCATION_GEOM.oddsCaptionY,
        transform: "translateX(-100%)",
        fontFamily: AP_FONTS.mono,
        fontSize: 28,
        fontWeight: AP_WEIGHT.label,
        color: AP_COLORS.textSecondary,
        opacity: Math.min(inP, outP),
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
