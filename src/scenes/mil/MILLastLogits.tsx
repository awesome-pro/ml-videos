import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { ramp, TIMING } from "../../components/math";
import { SEQ_TOKENS, VOCAB_LABEL } from "./data";

/**
 * Why a decode step only needs the newest position's scores.
 *
 * A forward pass produces a row of scores at *every* position. Each row
 * describes the token that would come *after* that position — so the row at
 * position i is a distribution over the token at position i+1.
 *
 * For positions 1..5 that token is already fixed: it is the next token of the
 * prompt, and it was never this model's to choose. Only the newest position's
 * row describes a token that is still undecided. So every earlier row is
 * computed and then never read — exactly the waste `MILNaiveLoop` counted.
 *
 * What we keep from the past is therefore not these rows. It is K and V: the
 * only things attention at the new position actually reads.
 *
 * The rows are all the same size, because that is the point of the scene.
 */

const LABEL_RIGHT = 300;
const BAR_X = 330;
const BAR_W = 900;
const BAR_H = 46;
const PRED_X = 1290;
const TAG_RIGHT = 1848;
const ROW_Y = 336;
const ROW_PITCH = 74;

/** Frames. */
const ROWS = 56;
const TOKEN = 300;
const SPENT = 396;
const COPY = 496;
const COPY2 = 552;

const LAST_ANIM = COPY2 + TIMING.fast; // 566
export const MIL_LAST_LOGITS_DURATION = LAST_ANIM + 54; // 620 (20.7s)

/** The six positions a decode step's forward pass would score. */
const PROMPT_ROWS = SEQ_TOKENS.slice(0, 6);

/** The numbers the layout audit checks against the 1920x1080 frame. */
export const LAST_LOGITS_GEOM = {
  labelRight: LABEL_RIGHT,
  barX: BAR_X,
  barW: BAR_W,
  barH: BAR_H,
  predX: PRED_X,
  tagRight: TAG_RIGHT,
  rowY: ROW_Y,
  pitch: ROW_PITCH,
  rows: PROMPT_ROWS.length,
  bottom: ROW_Y + (PROMPT_ROWS.length - 1) * ROW_PITCH + BAR_H / 2,
  copyY: 768,
  headerY: ROW_Y - BAR_H / 2 - 34,
  copy2Y: 824,
} as const;

export const MILLastLogits: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell title="Only the newest row is used" duration={MIL_LAST_LOGITS_DURATION}>

      <div
        style={{
          position: "absolute",
          left: BAR_X,
          top: ROW_Y - BAR_H / 2 - 34,
          opacity: ramp(frame, ROWS, ROWS + TIMING.base),
          fontFamily: AP_FONTS.sans,
          fontSize: 24,
          fontWeight: AP_WEIGHT.heading,
          color: AP_COLORS.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        scores it produces
      </div>
      <div
        style={{
          position: "absolute",
          left: PRED_X,
          top: ROW_Y - BAR_H / 2 - 34,
          opacity: ramp(frame, ROWS, ROWS + TIMING.base),
          fontFamily: AP_FONTS.sans,
          fontSize: 24,
          fontWeight: AP_WEIGHT.heading,
          color: AP_COLORS.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        the token it describes
      </div>

      {PROMPT_ROWS.map((_, i) => (
        <LogitsRow
          key={`row${i}`}
          i={i}
          last={i === PROMPT_ROWS.length - 1}
          at={ROWS + i * 12}
          tokenAt={TOKEN}
          spentAt={SPENT}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 768,
          width: 1920,
          textAlign: "center",
          opacity: ramp(frame, COPY, COPY + TIMING.base),
          color: AP_COLORS.textPrimary,
          fontFamily: AP_FONTS.sans,
          fontSize: 32,
          fontWeight: AP_WEIGHT.heading,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        Five of the six rows describe tokens the prompt already fixed.
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 824,
          width: 1920,
          textAlign: "center",
          opacity: ramp(frame, COPY2, COPY2 + TIMING.fast),
          color: AP_COLORS.textMuted,
          fontFamily: AP_FONTS.sans,
          fontSize: 28,
          fontWeight: AP_WEIGHT.body,
        }}
      >
        So a decode step produces one row — and what it needs from the past is K and V, not scores.
      </div>
    </SceneShell>
  );
};

/**
 * One position's row of scores, and the token it describes. Rows before the
 * last stay dim from the moment they appear: they were never read.
 */
const LogitsRow: React.FC<{
  i: number;
  last: boolean;
  at: number;
  tokenAt: number;
  spentAt: number;
}> = ({ i, last, at, tokenAt, spentAt }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, at, at + TIMING.fast);
  // The last row is the only one that ever comes up to full strength.
  const lit = last ? ramp(frame, spentAt, spentAt + TIMING.base) : 0;
  const y = ROW_Y + i * ROW_PITCH;

  const color = last ? AP_COLORS.value : AP_COLORS.textMuted;
  const opacity = last ? 1 : 0.55;

  /** What the row's scores are about: the token that follows this position. */
  const described = i < PROMPT_ROWS.length - 1 ? SEQ_TOKENS[i + 1].text : "the next token";

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: LABEL_RIGHT,
          top: y,
          transform: `translate(-100%, -50%) translateY(${(1 - appear) * 8}px)`,
          opacity: appear * opacity,
          fontFamily: AP_FONTS.mono,
          fontSize: 26,
          fontWeight: AP_WEIGHT.label,
          color: last ? AP_COLORS.textPrimary : AP_COLORS.textSecondary,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {SEQ_TOKENS[i].text}
      </div>

      <div
        style={{
          position: "absolute",
          left: BAR_X,
          top: y - BAR_H / 2,
          width: BAR_W,
          height: BAR_H,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 22px",
          borderRadius: 10,
          background: last ? AP_COLORS.valueBg : "transparent",
          // Entrance and lit-state compose into one opacity — spreading
          // `enterStyle` here would overwrite this with the raw ramp.
          opacity: (0.4 + 0.6 * lit) * appear,
          transform: `translateY(${(1 - appear) * 8}px)`,
          border: `1.5px solid ${last && lit > 0 ? AP_COLORS.valueBorder : "rgba(255, 255, 255, 0.14)"}`,
        }}
      >
        <span
          style={{
            fontFamily: AP_FONTS.mono,
            fontSize: 24,
            fontWeight: AP_WEIGHT.label,
            color,
            whiteSpace: "nowrap",
          }}
        >
          V = {VOCAB_LABEL}
        </span>
        {/* A vector, not a box: the ticks stand in for the other 151,930 numbers. */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1 }}>
          {Array.from({ length: 16 }).map((_, t) => (
            <div
              key={t}
              style={{
                width: 2,
                height: 20,
                borderRadius: 1,
                background: color,
                opacity: 0.34 + 0.5 * lit,
              }}
            />
          ))}
          <span
            style={{
              fontFamily: AP_FONTS.mono,
              fontSize: 24,
              fontWeight: AP_WEIGHT.label,
              color,
              marginLeft: 6,
            }}
          >
            …
          </span>
        </div>
      </div>

      {last ? (
        <FlowArrow
          x1={BAR_X + BAR_W + 14}
          y1={y}
          x2={PRED_X - 16}
          y2={y}
          color={AP_COLORS.value}
          appearDelay={tokenAt}
          thickness={4}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: PRED_X,
          top: y,
          transform: `translateY(-50%) translateY(${(1 - appear) * 8}px)`,
          opacity: appear * (last ? 1 : 0.7),
          fontFamily: AP_FONTS.sans,
          fontSize: 28,
          fontWeight: AP_WEIGHT.label,
          color: last ? AP_COLORS.key : AP_COLORS.textSecondary,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {described}
      </div>

      {/* A tag only appears once the point has been made, so the rows read as a
          set first and as a division second. */}
      <div
        style={{
          position: "absolute",
          left: TAG_RIGHT,
          top: y,
          transform: `translate(-100%, -50%)`,
          opacity: ramp(frame, spentAt + (last ? 20 : i * 6), spentAt + (last ? 20 : i * 6) + TIMING.fast),
          fontFamily: AP_FONTS.sans,
          fontSize: 24,
          fontWeight: AP_WEIGHT.heading,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: last ? AP_COLORS.key : AP_COLORS.negative,
          whiteSpace: "nowrap",
        }}
      >
        {last ? "needed now" : "already decided"}
      </div>
    </>
  );
};
