import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { MIL_AXIS, MorphShape, type MorphShapeProps } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { logitAt, NEXT_TOKEN, VOCAB_LABEL } from "./data";

/**
 * The other half of the shape story: `logits [B, T, V]` -> one position ->
 * one id.
 *
 * The block is drawn exactly as the previous scene leaves it, so the two read
 * as one continuous shot. Then the four positions we do not need fade away, the
 * last one slides to the middle, and the 151,936-long axis collapses twice:
 * first to a single score, then to the index of that score — which is the token.
 */
const COL_W = 168;
const COL_GAP = 20;
const COLS = 5;
const BLOCK_X = 960 - (COLS * COL_W + (COLS - 1) * COL_GAP) / 2; // 500
const CENTRE_X = 960 - COL_W / 2; // 876
const BASE = 720;
const CELL_H = 64;
const PITCH = 70;

const colFrom = (c: number) => BLOCK_X + c * (COL_W + COL_GAP);
const rowY = (r: number) => BASE - CELL_H - r * PITCH;

/** Beats. */
const IN = 10; // the block arrives
const BAND = 100; // … and the last position is marked
const SLICE = 140; // the four positions we drop leave; the last one centres
const S1 = 180; // T = 5 becomes T = 1
const S2 = 240; // the position axis disappears entirely
const LIT = 290; // the biggest score in the column lights up
const CLEAR = 318; // the other 151,935 of them clear away
const S3 = 344; // argmax: the score becomes an index
const CHIP = 362; // and the index becomes a token

/** Last frame any animation in this scene uses; the rest is reading time. */
const LAST_ANIM = CHIP + TIMING.fast; // 376
export const MIL_SHAPE_SLICE_DURATION = LAST_ANIM + 50; // 426 (14.2s)

const WIN_ROW = 4;
const LIT_Y = rowY(WIN_ROW) + CELL_H / 2; // 408

/** Where the label beside the surviving cell is right-aligned to. */
const LABEL_X = CENTRE_X - 44;

export const SHAPE_SLICE_PROPS: MorphShapeProps = {
  x: BLOCK_X,
  y: 790,
  size: 48,
  stages: [
    {
      at: 12,
      name: "logits",
      dims: [
        { axis: "B", value: "1", note: "batch" },
        { axis: "T", value: "5", note: "sequence" },
        { axis: "V", value: VOCAB_LABEL, note: "vocab" },
      ],
    },
    {
      at: S1,
      name: "logits",
      dims: [
        { axis: "B", value: "1", note: "batch" },
        { axis: "T", value: "1", note: "last" },
        { axis: "V", value: VOCAB_LABEL, note: "vocab" },
      ],
      op: "last position",
    },
    {
      at: S2,
      name: "logits",
      dims: [
        { axis: "B", value: "1", note: "batch" },
        { axis: "V", value: VOCAB_LABEL, note: "vocab" },
      ],
      op: "only scores remain",
    },
    {
      at: S3,
      name: "next_token",
      dims: [{ axis: "B", value: "1", note: "batch" }],
      op: "argmax → one id",
    },
  ],
};

export const MILShapeSlice: React.FC = () => {
  const frame = useCurrentFrame();

  const slide = ramp(frame, SLICE, SLICE + 36);
  const away = ramp(frame, SLICE, SLICE + 24);
  const clear = ramp(frame, CLEAR, CLEAR + 18);
  const pick = ramp(frame, LIT, LIT + TIMING.fast);
  const flip = ramp(frame, S3, S3 + TIMING.fast);
  const bandIn = ramp(frame, BAND, BAND + TIMING.fast);
  const chipIn = ramp(frame, CHIP, CHIP + TIMING.fast);

  /** The last column slides to the middle; the others stay put and fade. */
  const xOf = (c: number) =>
    c === COLS - 1 ? colFrom(c) + (CENTRE_X - colFrom(c)) * slide : colFrom(c);

  const colOp = (c: number) => (c === COLS - 1 ? 1 : 1 - away);
  const cellIn = (c: number, r: number) =>
    ramp(frame, IN + c * 6 + r * 3, IN + c * 6 + r * 3 + TIMING.fast) * colOp(c);

  // The band marks the surviving position, then shrinks to wrap what is left.
  const bandX = xOf(COLS - 1) - 7;
  const bandTop = rowY(5) - 7 + (rowY(WIN_ROW) - rowY(5)) * clear;
  const bandH = 428 - 350 * clear;

  return (
    <SceneShell title="Only the last position decides" duration={MIL_SHAPE_SLICE_DURATION}>
      {/* Drawn first so the column reads as marked rather than boxed. */}
      <div
        style={{
          position: "absolute",
          left: bandX,
          top: bandTop,
          width: COL_W + 14,
          height: bandH,
          borderRadius: 16,
          background: MIL_AXIS.T,
          opacity: 0.16 * bandIn,
          border: `2px solid ${MIL_AXIS.T}`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: xOf(COLS - 1) + COL_W / 2,
          top: 244,
          transform: "translateX(-50%)",
          fontFamily: AP_FONTS.sans,
          fontSize: 28,
          fontWeight: AP_WEIGHT.heading,
          color: MIL_AXIS.T,
          opacity: bandIn * (1 - ramp(frame, S2, S2 + 14)),
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        last position
      </div>

      {Array.from({ length: COLS }).map((_, c) =>
        Array.from({ length: 6 }).map((__, r) => {
          const x = xOf(c);
          const y = rowY(r);
          const born = cellIn(c, r);
          const winner = c === COLS - 1 && r === WIN_ROW;
          // Every entry except the winner clears away once it has been picked.
          const appear = winner ? born : born * (1 - clear);

          if (r === 5) {
            return (
              <Cell key={`${c}-m`} x={x} y={y} appear={appear} ghost>
                <Txt show={1} color={AP_COLORS.textMuted} size={28}>
                  ⋮
                </Txt>
              </Cell>
            );
          }

          if (winner) {
            return (
              <Cell key={`${c}-${r}`} x={x} y={y} appear={appear} pick={pick}>
                <Txt show={1 - pick} color={MIL_AXIS.V} size={28} dy={-6 * pick}>
                  {logitAt(c, r)}
                </Txt>
                <Txt show={pick * (1 - flip)} color={AP_COLORS.key} size={28} dy={(1 - pick) * 6 - flip * 6}>
                  {logitAt(c, r)}
                </Txt>
                <Txt show={pick * flip} color={AP_COLORS.key} size={28} dy={(1 - flip) * 6}>
                  {NEXT_TOKEN.id}
                </Txt>
              </Cell>
            );
          }

          return (
            <Cell key={`${c}-${r}`} x={x} y={y} appear={appear}>
              <Txt show={1} color={MIL_AXIS.V} size={28}>
                {logitAt(c, r)}
              </Txt>
            </Cell>
          );
        })
      )}

      {/* What the lit cell currently means. The outgoing copy lifts clear. */}
      <SideLabel show={pick * (1 - flip)} color={MIL_AXIS.V} dy={-10 * flip}>
        biggest score
      </SideLabel>
      <SideLabel show={pick * flip} color={AP_COLORS.key} dy={(1 - flip) * 10}>
        its index
      </SideLabel>

      <FlowArrow
        x1={CENTRE_X + COL_W + 22}
        y1={LIT_Y}
        x2={1180}
        y2={LIT_Y}
        color={AP_COLORS.key}
        appearDelay={CHIP}
        thickness={4}
      />

      <TokenChip show={chipIn} />

      <MorphShape {...SHAPE_SLICE_PROPS} />
    </SceneShell>
  );
};

const Cell: React.FC<{
  x: number;
  y: number;
  appear: number;
  ghost?: boolean;
  /** 0 -> an ordinary score, 1 -> the chosen one. */
  pick?: number;
  children?: React.ReactNode;
}> = ({ x, y, appear, ghost = false, pick = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: COL_W,
      height: CELL_H,
      boxSizing: "border-box",
      borderRadius: 12,
      background: ghost ? "transparent" : AP_COLORS.surfaceRaised,
      border: `1.5px ${ghost ? "dashed" : "solid"} ${
        ghost ? "rgba(255, 255, 255, 0.10)" : AP_COLORS.surfaceBorder
      }`,
      opacity: appear,
      transform: `translateY(${(1 - appear) * 12}px)`,
      userSelect: "none",
    }}
  >
    {pick > 0 ? (
      <div
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: 14,
          background: AP_COLORS.keyBg,
          border: `2px solid ${AP_COLORS.keyBorder}`,
          opacity: pick,
        }}
      />
    ) : null}
    {children}
  </div>
);

const Txt: React.FC<{
  show: number;
  color: string;
  size: number;
  dy?: number;
  children: React.ReactNode;
}> = ({ show, color, size, dy = 0, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: show,
      transform: dy ? `translateY(${dy}px)` : undefined,
      fontFamily: AP_FONTS.mono,
      fontSize: size,
      fontWeight: AP_WEIGHT.label,
      color,
      whiteSpace: "nowrap",
      textShadow: AP_COLORS.textShadow,
    }}
  >
    {children}
  </div>
);

/** Right-aligned to a fixed anchor, so two of them share one edge. */
const SideLabel: React.FC<{
  show: number;
  color: string;
  dy: number;
  children: React.ReactNode;
}> = ({ show, color, dy, children }) => (
  <div
    style={{
      position: "absolute",
      left: LABEL_X,
      top: LIT_Y,
      transform: `translate(-100%, -50%) translateY(${dy}px)`,
      opacity: show,
      color,
      fontFamily: AP_FONTS.sans,
      fontSize: 28,
      fontWeight: AP_WEIGHT.heading,
      whiteSpace: "nowrap",
      textShadow: AP_COLORS.textShadow,
    }}
  >
    {children}
  </div>
);

const TokenChip: React.FC<{ show: number }> = ({ show }) => {
  const frame = useCurrentFrame();
  const rise = 1 - ramp(frame, CHIP, CHIP + TIMING.fast);
  return (
    <div
      style={{
        position: "absolute",
        left: 1205,
        top: LIT_Y,
        transform: `translateY(calc(-50% + ${rise * 10}px))`,
        opacity: show,
        padding: "14px 30px",
        borderRadius: 14,
        background: AP_COLORS.keyBg,
        border: `1.5px solid ${AP_COLORS.keyBorder}`,
        color: AP_COLORS.key,
        fontFamily: AP_FONTS.sans,
        fontSize: 34,
        fontWeight: AP_WEIGHT.heading,
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {NEXT_TOKEN.text}
    </div>
  );
};
