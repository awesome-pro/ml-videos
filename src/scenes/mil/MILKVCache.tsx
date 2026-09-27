import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { ramp, TIMING } from "../../components/math";
import { StepBars, stepBarsWidth } from "../../components/mil";
import { CACHED_POSITIONS, KV_SHAPE, MODEL, NAIVE_POSITIONS, SEQ_TOKENS } from "./data";
import { stepBarRows } from "./kvRows";

/**
 * The same five bars as `MILNaiveLoop`, with the repeated region turned into a
 * ghost: those positions are in the cache now, so the step reads them instead
 * of computing them. The layout is deliberately identical — a still of this
 * scene diffs against a still of the previous one, and the only thing that
 * changes is the part that stopped being work.
 *
 * The one idea in the scene is why keeping them is *valid*: K and V at position
 * i are a function of tokens up to i and nothing else. Causality means no later
 * token can revise them, so computing them again can only reproduce what is
 * already stored.
 */

const BAR_X = 272;
const BAR_Y = 340;

const KV_AT = 466;
const LEGEND_AT = 540;
const TOTAL_AT = 600;

/** Pixels. The bars end at 771, so everything below stacks under them. */
const KV_Y = 722;
const LEGEND_Y = 782;
const TOTAL_Y = 840;

const LAST_ANIM = TOTAL_AT + TIMING.base; // 620
export const MIL_KV_CACHE_DURATION = LAST_ANIM + 50; // 670 (22.3s)

const ROWS = stepBarRows("cached");

/** The numbers the layout audit checks against the 1920x1080 frame. */
export const KV_CACHE_GEOM = {
  barX: BAR_X,
  barY: BAR_Y,
  cols: SEQ_TOKENS.length,
  gridRight: BAR_X + stepBarsWidth(SEQ_TOKENS.length),
  noteX: BAR_X + stepBarsWidth(SEQ_TOKENS.length) + 34,
  kvY: KV_Y,
  legendY: LEGEND_Y,
  totalY: TOTAL_Y,
  bottom: TOTAL_Y + 68,
} as const;

export const MILKVCache: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell title="Keep the K and V" duration={MIL_KV_CACHE_DURATION}>

      <StepBars x={BAR_X} y={BAR_Y} rows={ROWS} />

      {/* What the cache actually is, in the shape notation the rest of the
          video already uses. Two tensors per layer, one pair per token. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: KV_Y,
          width: 1920,
          textAlign: "center",
          opacity: ramp(frame, KV_AT, KV_AT + TIMING.base),
          fontFamily: AP_FONTS.mono,
          fontSize: 30,
          fontWeight: AP_WEIGHT.label,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        <span style={{ color: AP_COLORS.textMuted }}>the cache </span>
        <span style={{ color: AP_COLORS.key }}>K</span>
        <span style={{ color: AP_COLORS.textMuted }}>, </span>
        <span style={{ color: AP_COLORS.value }}>V</span>
        <span style={{ color: AP_COLORS.textPrimary }}>
          {" "}
          [B={KV_SHAPE.batch}, {KV_SHAPE.heads} heads, T, {KV_SHAPE.dim}]
        </span>
        <span style={{ color: AP_COLORS.textMuted }}>
          {"  × "}
          {MODEL.layers} layers
        </span>
      </div>

      <Legend start={LEGEND_AT} />

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
          opacity: ramp(frame, TOTAL_AT, TOTAL_AT + TIMING.base),
          transform: `translateY(${(1 - ramp(frame, TOTAL_AT, TOTAL_AT + TIMING.base)) * 10}px)`,
        }}
      >
        <span
          style={{
            fontFamily: AP_FONTS.mono,
            fontSize: 68,
            fontWeight: AP_WEIGHT.title,
            color: AP_COLORS.key,
            textShadow: AP_COLORS.textShadowStrong,
            lineHeight: 1,
          }}
        >
          {CACHED_POSITIONS}
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
            fontFamily: AP_FONTS.mono,
            fontSize: 30,
            fontWeight: AP_WEIGHT.label,
            color: AP_COLORS.textMuted,
            marginLeft: 14,
          }}
        >
          instead of {NAIVE_POSITIONS}
        </span>
      </div>
    </SceneShell>
  );
};

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
      <LegendItem at={item(0)} color={AP_COLORS.key} bg={AP_COLORS.keyBg} label="computed now" />
      <LegendItem
        at={item(1)}
        color={AP_COLORS.textSecondary}
        bg="transparent"
        dashed
        label="already in the cache — read, not recomputed"
      />
    </div>
  );
};

const LegendItem: React.FC<{
  at: number;
  color: string;
  bg: string;
  label: string;
  dashed?: boolean;
}> = ({ at, color, bg, label, dashed = false }) => (
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
        border: `1.5px ${dashed ? "dashed" : "solid"} ${color}`,
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
