import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { MIL_AXIS, MorphShape, type MorphShapeProps } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { logitAt, NEXT_TOKEN, PROMPT, VOCAB_LABEL } from "./data";

/**
 * The whole shape story in one shot — how a prompt becomes a single token:
 *
 *   input_ids          [B=1, T=5]                five ids, one per token
 *   logits             [B=1, T=5, V=151,936]      the model scores every token at every position
 *   last_token_logits  [B=1, V=151,936]           only the last position predicts what comes next
 *   next_token         [B=1]                      argmax: the index of the biggest score
 *
 * One tensor, morphing in place. Every column is bottom-anchored on `BASE`, so a
 * dimension that grows makes the block taller *upward* and row 0 never moves:
 * the token cell becomes the first number of its own column, and then the whole
 * thing collapses back down to a single id.
 *
 * The block is drawn six rows deep because six is enough to read; the ⋮ row says
 * the axis carries 151,936 more of them. Everything else here is exact.
 */

const COL_W = 168;
const COL_GAP = 20;
const COLS = 5;
const BLOCK_X = 960 - (COLS * COL_W + (COLS - 1) * COL_GAP) / 2; // 500
const CENTRE_X = 960 - COL_W / 2; // 876
const BASE = 720;
const CELL_H = 64;
const PITCH = 70;
/** The score row that wins — the one just under the ⋮. */
const WIN_ROW = 4;
const WIN_Y = BASE - CELL_H - WIN_ROW * PITCH + CELL_H / 2; // 408
/** Where the label beside the surviving column is right-aligned to. */
const LABEL_X = CENTRE_X - 44;

const colFrom = (c: number) => BLOCK_X + c * (COL_W + COL_GAP);
const rowY = (r: number) => BASE - CELL_H - r * PITCH;

/** Beats. */
const IN = 12; // the ids arrive
const GROW = 96; // the model runs: the third axis appears
const SH1 = 100; // shape: input_ids -> logits
const SLICE = 190; // only the last position is kept
const SH2 = 200; // shape: logits -> last_token_logits
const LIT = 260; // the biggest score in the column lights up
const CLEAR = 296; // the other 151,935 of them clear away
const SH3 = 336; // shape: next_token — and the score becomes an index
const CHIP = 362; // and the index becomes a token

/** Last frame any animation in this scene uses; the rest is reading time. */
const LAST_ANIM = CHIP + TIMING.fast; // 376
export const MIL_SHAPE_GROW_DURATION = LAST_ANIM + 50; // 426 (14.2s)

/**
 * Exported so the layout audit checks the numbers the scene actually renders.
 * The name slot is sized by its longest entry, `last_token_logits`.
 */
export const SHAPE_GROW_PROPS: MorphShapeProps = {
  x: BLOCK_X,
  y: 790,
  size: 44,
  stages: [
    {
      at: IN,
      name: "input_ids",
      dims: [
        { axis: "B", value: "1", note: "batch" },
        { axis: "T", value: "5", note: "sequence" },
      ],
    },
    {
      at: SH1,
      name: "logits",
      dims: [
        { axis: "B", value: "1", note: "batch" },
        { axis: "T", value: "5", note: "sequence" },
        { axis: "V", value: VOCAB_LABEL, note: "vocab" },
      ],
      op: "model",
    },
    {
      at: SH2,
      name: "last_token_logits",
      dims: [
        { axis: "B", value: "1", note: "batch" },
        { axis: "V", value: VOCAB_LABEL, note: "vocab" },
      ],
      op: "keep the last token",
    },
    {
      at: SH3,
      name: "next_token",
      dims: [{ axis: "B", value: "1", note: "batch" }],
      op: "argmax",
    },
  ],
};

export const MILShapeGrow: React.FC = () => {
  const frame = useCurrentFrame();

  const born = ramp(frame, IN, IN + TIMING.fast);
  const grown = ramp(frame, GROW, GROW + TIMING.fast);
  const slide = ramp(frame, SLICE, SLICE + 36);
  const away = ramp(frame, SLICE, SLICE + 24);
  const pick = ramp(frame, LIT, LIT + TIMING.fast);
  const clear = ramp(frame, CLEAR, CLEAR + 18);
  const flip = ramp(frame, SH3, SH3 + TIMING.fast);
  const chipIn = ramp(frame, CHIP, CHIP + TIMING.fast);
  const bandIn = ramp(frame, SLICE, SLICE + TIMING.fast);

  /** The last column slides to the middle; the others stay put and fade. */
  const xOf = (c: number) => (c === COLS - 1 ? colFrom(c) + (CENTRE_X - colFrom(c)) * slide : colFrom(c));
  const colOp = (c: number) => (c === COLS - 1 ? 1 : 1 - away);

  /**
   * Once the column has been picked clean, the one cell left drops to the
   * baseline. That is the literal version of what happened — 151,936 scores
   * became a single number — and it puts the cell next to the token label that
   * describes it instead of stranding it in the middle of an empty block.
   */
  const drop = (rowY(0) - rowY(WIN_ROW)) * clear; // 0 -> 280
  const winCentre = WIN_Y + drop;

  // The band marks the surviving position, then slides down and shrinks to wrap
  // whatever is left — both driven by the same `clear` ramp.
  const bandX = xOf(COLS - 1) - 7;
  const bandTop = rowY(5) - 7 + (rowY(0) - rowY(5)) * clear; // 299 -> 649
  const bandH = 428 - 350 * clear; // 428 -> 78

  /** When the score row `r` grows in above row 0. */
  const rowAt = (r: number) => GROW + 8 + (r - 1) * 10;

  return (
    <SceneShell title="How the shape changes" duration={MIL_SHAPE_GROW_DURATION}>
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

      {Array.from({ length: COLS }).map((_, c) =>
        Array.from({ length: 6 }).map((__, r) => {
          const x = xOf(c);
          const y = rowY(r);
          const winner = c === COLS - 1 && r === WIN_ROW;
          // A dropped column takes its whole stack with it, and every entry of
          // the survivor except the winner clears away once it has been picked.
          const held = colOp(c) * (winner ? 1 : 1 - clear);

          if (r === 5) {
            return (
              <Cell
                key={`${c}-m`}
                x={x}
                y={y}
                appear={ramp(frame, GROW + 48, GROW + 48 + TIMING.fast) * held}
                ghost
              >
                <Txt show={1} color={AP_COLORS.textMuted} size={28}>
                  ⋮
                </Txt>
              </Cell>
            );
          }

          // Row 0 is the one cell on screen throughout: the token's own cell,
          // then the first score of that token's column.
          if (r === 0) {
            return (
              <Cell key={`${c}-0`} x={x} y={y} appear={born * held}>
                <Txt show={1 - grown} color={AP_COLORS.textPrimary} size={30} sans>
                  {PROMPT[c].text}
                </Txt>
                <Txt show={grown} color={MIL_AXIS.V} size={28} dy={(1 - grown) * 8}>
                  {logitAt(c, 0)}
                </Txt>
              </Cell>
            );
          }

          if (winner) {
            return (
              <Cell
                key={`${c}-${r}`}
                x={x}
                y={y + drop}
                appear={ramp(frame, rowAt(r), rowAt(r) + TIMING.fast)}
                pick={pick}
              >
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
            <Cell key={`${c}-${r}`} x={x} y={y} appear={ramp(frame, rowAt(r), rowAt(r) + TIMING.fast) * held}>
              <Txt show={1} color={MIL_AXIS.V} size={28}>
                {logitAt(c, r)}
              </Txt>
            </Cell>
          );
        })
      )}

      {/* Under each column: the id it came from, then the token it stands for. */}
      {Array.from({ length: COLS }).map((_, c) => (
        <React.Fragment key={`f${c}`}>
          <Foot x={xOf(c)} show={born * (1 - grown) * colOp(c)} mono>
            {PROMPT[c].id}
          </Foot>
          <Foot x={xOf(c)} show={grown * colOp(c)} mono={false}>
            {PROMPT[c].text}
          </Foot>
        </React.Fragment>
      ))}

      {/* What the lit cell currently means. The outgoing copy lifts clear. */}
      <SideLabel show={pick * (1 - flip)} color={MIL_AXIS.V} dy={-10 * flip} y={winCentre}>
        biggest score
      </SideLabel>
      <SideLabel show={pick * flip} color={AP_COLORS.key} dy={(1 - flip) * 10} y={winCentre}>
        its index
      </SideLabel>

      <FlowArrow
        x1={CENTRE_X + COL_W + 22}
        y1={winCentre}
        x2={1180}
        y2={winCentre}
        color={AP_COLORS.key}
        appearDelay={CHIP}
        thickness={4}
      />

      <TokenChip show={chipIn} y={winCentre} />

      <MorphShape {...SHAPE_GROW_PROPS} />
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
  sans?: boolean;
  children: React.ReactNode;
}> = ({ show, color, size, dy = 0, sans = false, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: show,
      transform: dy ? `translateY(${dy}px)` : undefined,
      fontFamily: sans ? AP_FONTS.sans : AP_FONTS.mono,
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

/** The one-line label under a column. */
const Foot: React.FC<{ x: number; show: number; mono: boolean; children: React.ReactNode }> = ({
  x,
  show,
  mono,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: BASE + 8,
      width: COL_W,
      textAlign: "center",
      fontFamily: mono ? AP_FONTS.mono : AP_FONTS.sans,
      fontSize: AP_TYPE.label,
      fontWeight: AP_WEIGHT.label,
      color: AP_COLORS.textSecondary,
      opacity: show,
      whiteSpace: "nowrap",
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
  y: number;
  children: React.ReactNode;
}> = ({ show, color, dy, y, children }) => (
  <div
    style={{
      position: "absolute",
      left: LABEL_X,
      top: y,
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

const TokenChip: React.FC<{ show: number; y: number }> = ({ show, y }) => {
  const frame = useCurrentFrame();
  const rise = 1 - ramp(frame, CHIP, CHIP + TIMING.fast);
  return (
    <div
      style={{
        position: "absolute",
        left: 1205,
        top: y,
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
