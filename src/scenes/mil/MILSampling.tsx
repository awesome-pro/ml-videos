import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { ProbRuler, rulerLabelRows, rulerLayout, type RulerSeg } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { DRAWS, SAMPLING_SEGS } from "./data";

/**
 * What sampling *is*.
 *
 * The point of this scene is that greedy and sampling differ by exactly one
 * visible thing. So instead of the old list of rules, the distribution is laid
 * out as a single ruler whose segment widths ARE the probabilities, and then:
 * greedy puts a bracket over the tallest segment, sampling drops a point on the
 * ruler and takes whatever it landed on.
 *
 * Six tokens would hide the widths, so the last segment is the rest of the
 * vocabulary — ~151,930 tokens holding 9% between them.
 */

/** Ruler geometry; everything else is placed from these. Exported so the
 * layout audit checks the same numbers the scene renders. */
export const SAMPLING_GEOM = { x: 180, y: 430, width: 1540, height: 88 };
const { x: X, y: Y, width: W, height: H } = SAMPLING_GEOM;

const SEGS: RulerSeg[] = SAMPLING_SEGS;
/**
 * Label rows are computed once, here, and passed in as constants. Deriving them
 * per frame would let a name hop rows while the scene is on screen. The reserve
 * of 2 characters covers the " ×4" the hit counter appends, so a name can never
 * grow into its neighbour once the draws start landing.
 */
export const SAMPLING_LABEL_ROWS = rulerLabelRows(SEGS, X, W, 28, 2, 2);

/** Frames. */
const GREEDY_AT = 60;
const DRAW_AT = 160;
const DRAW_STEP = 20;
const TALLY_AT = 300;

const drawFrames = DRAWS.map((_, k) => DRAW_AT + k * DRAW_STEP);
const LAST_ANIM = TALLY_AT + TIMING.fast;

export const SAMPLING_TIMES = { greedyAt: GREEDY_AT, drawAt: DRAW_AT, drawStep: DRAW_STEP, tallyAt: TALLY_AT, reportAt: 660 };
export const MIL_SAMPLING_DURATION = LAST_ANIM + 50; // 364 (12.1s)

export const MILSampling: React.FC = () => {
  const frame = useCurrentFrame();
  const { starts, widths } = rulerLayout(SEGS, X, W);
  const greedyOut = 1 - ramp(frame, 130, 144);

  return (
    <SceneShell title="Greedy takes the top; sampling draws" duration={MIL_SAMPLING_DURATION}>
      <ProbRuler
        segs={SEGS}
        x={X}
        y={Y}
        width={W}
        height={H}
        start={12}
        draws={DRAWS.map((u, k) => ({ u, at: drawFrames[k] }))}
        hitAt={drawFrames[0]}
        labelRows={SAMPLING_LABEL_ROWS}
        showCounts
        ticks
      />

      {/* Greedy is a rule, not a draw: a bracket over the tallest segment. */}
      <div
        style={{
          position: "absolute",
          left: starts[0] - 6,
          top: Y - 30,
          width: widths[0] + 12,
          height: 18,
          boxSizing: "border-box",
          borderTop: `3px solid ${AP_COLORS.textPrimary}`,
          borderLeft: `3px solid ${AP_COLORS.textPrimary}`,
          borderRight: `3px solid ${AP_COLORS.textPrimary}`,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          opacity: ramp(frame, GREEDY_AT, GREEDY_AT + TIMING.fast) * greedyOut,
        }}
      />

      {/* The readout: one line at a time, in order. */}
      <Line
        at={GREEDY_AT}
        until={130}
        cx={starts[0] + widths[0] / 2}
        y={Y - 76}
        color={AP_COLORS.textPrimary}
        text="the tallest — greedy would take this, every time"
      />
      <Line at={16} until={GREEDY_AT} y={SAMPLING_TIMES.reportAt} color={AP_COLORS.textSecondary} text="the odds the model gives every token" />
      <Line
        at={GREEDY_AT + 6}
        until={140}
        y={SAMPLING_TIMES.reportAt}
        color={AP_COLORS.textPrimary}
        text="greedy always takes the single tallest"
      />
      <Line
        at={146}
        until={TALLY_AT}
        y={SAMPLING_TIMES.reportAt}
        color={AP_COLORS.query}
        text="sampling drops a point and takes whatever it lands on"
      />
      <Line
        at={TALLY_AT + 8}
        until={null}
        y={SAMPLING_TIMES.reportAt}
        color={AP_COLORS.key}
        text="4 of 6 draws landed on Paris — the widths are the odds"
      />
    </SceneShell>
  );
};

/** A caption centred on `cx` (default: the frame) that fades in and out. */
const Line: React.FC<{
  at: number;
  until: number | null;
  y: number;
  color: string;
  text: string;
  cx?: number;
}> = ({ at, until, y, color, text, cx = 960 }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, at, at + TIMING.fast);
  const outP = until === null ? 1 : 1 - ramp(frame, until, until + 10);
  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: y,
        transform: `translate(-50%, ${(1 - inP) * 8}px)`,
        fontFamily: AP_FONTS.sans,
        fontSize: 32,
        fontWeight: AP_WEIGHT.heading,
        color,
        opacity: Math.min(inP, outP),
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {text}
    </div>
  );
};
