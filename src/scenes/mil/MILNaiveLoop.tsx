import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { ramp, TIMING } from "../../components/math";
import { StepBars, stepBarsWidth, STEP_BAR } from "../../components/mil";
import { GEN_TOKENS, NAIVE_POSITIONS, RECOMPUTED_POSITIONS, SEQ_TOKENS } from "./data";
import { BAR_AT, stepBarRows } from "./kvRows";

/**
 * Why the cache exists, stated as arithmetic.
 *
 * The naive greedy loop appends one token and then runs the model over the
 * *whole* sequence again. So step k feeds it 5, 6, 7, 8, 9 positions — and
 * every bar starts at the same left edge, which makes the repeated region a
 * visible shape rather than a claim.
 *
 * Bar 1 enters in one go (the prompt is one pass). Every bar after it sweeps
 * left to right, which is literally the re-run, and its last cell is the only
 * position that step had not already computed.
 *
 * The numbers are derived in `data.ts`; nothing here is typed in.
 */

const BAR_X = 272;
const BAR_Y = 358;

/**
 * Beats (frames) and the rows they drive (pixels), kept strictly apart: `_AT`
 * is always a frame, `_Y` is always a position. Mixing the two is how a line
 * ends up drawn across the middle of the chart.
 */
const LEGEND_AT = 470;
const TOTAL_AT = 530;
const SUB_AT = 566;

const LEGEND_Y = 748;
const TOTAL_Y = 816;
const SUB_Y = 890;

/** Last frame any animation in this scene uses. */
const LAST_ANIM = SUB_AT + TIMING.fast; // 580
export const MIL_NAIVE_DURATION = LAST_ANIM + 50; // 630 (21.0s)

const ROWS = stepBarRows("naive");

/** The numbers the layout audit checks against the 1920x1080 frame. */
export const NAIVE_GEOM = {
  barX: BAR_X,
  barY: BAR_Y,
  cols: SEQ_TOKENS.length,
  gridRight: BAR_X + stepBarsWidth(SEQ_TOKENS.length),
  noteX: BAR_X + stepBarsWidth(SEQ_TOKENS.length) + 34,
  legendY: LEGEND_Y,
  totalY: TOTAL_Y,
  subY: SUB_Y,
  bottom: SUB_Y + 30,
} as const;

export const MILNaiveLoop: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell title="Every step redoes the whole prefix" duration={MIL_NAIVE_DURATION}>

      <div
        style={{
          position: "absolute",
          left: BAR_X + stepBarsWidth(9) + 34,
          top: BAR_Y - STEP_BAR.pitch / 2 - 50,
          opacity: ramp(frame, BAR_AT[0], BAR_AT[0] + TIMING.fast),
          fontFamily: AP_FONTS.sans,
          fontSize: 24,
          fontWeight: AP_WEIGHT.heading,
          color: AP_COLORS.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        positions
      </div>

      <StepBars x={BAR_X} y={BAR_Y} rows={ROWS} />

      <Legend start={LEGEND_AT} />

      <Total start={TOTAL_AT} />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: SUB_Y,
          width: 1920,
          textAlign: "center",
          opacity: ramp(frame, SUB_AT, SUB_AT + TIMING.fast),
          color: AP_COLORS.textSecondary,
          fontFamily: AP_FONTS.sans,
          fontSize: 30,
          fontWeight: AP_WEIGHT.body,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {RECOMPUTED_POSITIONS} of them are the same positions, computed again.
      </div>
    </SceneShell>
  );
};

/** What the two colours mean. */
const Legend: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const item = (i: number) => ramp(frame, start + i * 10, start + i * 10 + TIMING.fast);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: LEGEND_Y,
        width: 1920,
        display: "flex",
        justifyContent: "center",
        gap: 56,
      }}
    >
      <LegendItem at={item(0)} color={AP_COLORS.key} bg={AP_COLORS.keyBg} label="a position, computed once" />
      <LegendItem at={item(1)} color={AP_COLORS.negative} bg="rgba(255, 163, 171, 0.12)" label="a position, computed again" />
    </div>
  );
};

const LegendItem: React.FC<{ at: number; color: string; bg: string; label: string }> = ({
  at,
  color,
  bg,
  label,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      opacity: at,
      transform: `translateY(${(1 - at) * 8}px)`,
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: bg,
        border: `1.5px solid ${color}`,
      }}
    />
    <span
      style={{
        fontFamily: AP_FONTS.sans,
        fontSize: 26,
        fontWeight: AP_WEIGHT.label,
        color: AP_COLORS.textSecondary,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  </div>
);

/** The count, which is the entire argument. */
const Total: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const at = ramp(frame, start, start + TIMING.base);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: TOTAL_Y,
        width: 1920,
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        gap: 18,
        opacity: at,
        transform: `translateY(${(1 - at) * 10}px)`,
      }}
    >
      <span
        style={{
          fontFamily: AP_FONTS.mono,
          fontSize: 68,
          fontWeight: AP_WEIGHT.title,
          color: AP_COLORS.negative,
          textShadow: AP_COLORS.textShadowStrong,
          lineHeight: 1,
        }}
      >
        {NAIVE_POSITIONS}
      </span>
      <span
        style={{
          fontFamily: AP_FONTS.sans,
          fontSize: 38,
          fontWeight: AP_WEIGHT.heading,
          color: AP_COLORS.textPrimary,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        position-computations
      </span>
      <span
        style={{
          fontFamily: AP_FONTS.sans,
          fontSize: 30,
          fontWeight: AP_WEIGHT.body,
          color: AP_COLORS.textMuted,
          marginLeft: 14,
        }}
      >
        to produce {GEN_TOKENS.length} tokens
      </span>
    </div>
  );
};
