import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { enterStyle, ramp, TIMING } from "../../components/math";
import { SANS_EM } from "../../components/mil";
import { MODEL, SEQ_TOKENS, VOCAB_LABEL } from "./data";

/**
 * Decode, as the mirror image of `MILNaiveLoop`: the sequence is six tokens
 * long, but the model is handed **one** of them and reads the other five out of
 * the cache. So a step costs one position, not six.
 *
 * The cache is drawn as a real matrix — two rows, one column per token — because
 * that is what it is, and because the column that grows is the whole point. The
 * new token's query then fans across the K row, which is the only reason the
 * cache has to exist at all: attention at position 6 needs K and V from every
 * position before it.
 *
 * Colours are the design system's own semantics: blue is the query, teal is
 * `K`, amber is `V`, and the newly appended column is the only one that lights.
 */

/** Grid geometry. Columns line up with the token labels above them. */
const GRID_X = 180;
const CELL_W = 168;
const GAP = 12;
const COLS = 6;
const LABEL_Y = 286;
const K_Y = 382;
const V_Y = 460;
const CELL_H = 56;

const Q_X = 1330;
const Q_W = 170;
/** Right of the query, so the frame has no dead third. */
const LAYERS_X = 1545;

const colX = (j: number) => GRID_X + j * (CELL_W + GAP);
const colRight = (j: number) => colX(j) + CELL_W;

/** Frames. */
const LABELS = 50;
const KV_ROWS = 110;
const NEW = 230;
const Q_AT = 300;
const ARCS = 340;
const COPY = 550;
const COPY2 = 586;

const LAST_ANIM = COPY2 + TIMING.fast; // 600
export const MIL_DECODE_DURATION = LAST_ANIM + 50; // 650 (21.7s)

/** Columns 0..4 came out of prefill; column 5 is the one this step appends. */
const CACHED_COLS = COLS - 1;

/**
 * The output pipeline. The chips size to their own copy (there is no DOM to
 * measure — AGENTS.md), so their geometry is computed from `SANS_EM` and the
 * whole run is centred on the canvas rather than placed by hand.
 */
const CHIP_FONT = 28;
const CHIP_PAD = 30;
const CHIP_GAP = 52;
const chipW = (text: string) => Math.round(text.length * CHIP_FONT * SANS_EM + CHIP_PAD * 2);

const PIPE_AT = [430, 462, 494];
const PIPE_COPY = [
  { text: "q × every cached k, v", color: AP_COLORS.query, bg: AP_COLORS.queryBg, border: AP_COLORS.queryBorder },
  {
    text: `1 row of logits [B, ${VOCAB_LABEL}]`,
    color: AP_COLORS.value,
    bg: AP_COLORS.valueBg,
    border: AP_COLORS.valueBorder,
  },
  { text: "the next token", color: AP_COLORS.key, bg: AP_COLORS.keyBg, border: AP_COLORS.keyBorder },
];

const PIPE = (() => {
  const widths = PIPE_COPY.map((c) => chipW(c.text));
  const total = widths.reduce((a, b) => a + b, 0) + CHIP_GAP * (PIPE_COPY.length - 1);
  let cursor = 960 - total / 2;
  return PIPE_COPY.map((copy, i) => {
    const x = Math.round(cursor);
    cursor += widths[i] + CHIP_GAP;
    return { ...copy, x, w: widths[i] };
  });
})();

/** The numbers the layout audit checks against the 1920x1080 frame. */
export const DECODE_GEOM = {
  gridX: GRID_X,
  cellW: CELL_W,
  gap: GAP,
  cols: COLS,
  gridRight: colRight(COLS - 1),
  labelY: LABEL_Y,
  kY: K_Y,
  vY: V_Y,
  cellH: CELL_H,
  qX: Q_X,
  qW: Q_W,
  qRight: Q_X + Q_W,
  layersX: LAYERS_X,
  pipeY: 620,
  pipe: PIPE.map((step) => ({ text: step.text, x: step.x, w: step.w })),
  pipeGap: CHIP_GAP,
  chipFont: CHIP_FONT,
  copyY: 740,
  copy2Y: 796,
} as const;

export const MILDecode: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell title="Decode: one token, one column" duration={MIL_DECODE_DURATION}>

      {Array.from({ length: COLS }).map((_, j) => {
        const isNew = j === CACHED_COLS;
        const at = LABELS + j * 6;
        const inNew = isNew ? ramp(frame, NEW, NEW + TIMING.fast) : 0;
        return (
          <React.Fragment key={`col${j}`}>
            {/* The token that column stands for. */}
            <div
              style={{
                position: "absolute",
                left: colX(j),
                top: LABEL_Y - 24,
                width: CELL_W,
                height: 48,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                background: isNew ? AP_COLORS.keyBg : AP_COLORS.surfaceRaised,
                border: `1.5px solid ${isNew ? AP_COLORS.keyBorder : AP_COLORS.surfaceBorder}`,
                color: isNew ? AP_COLORS.key : AP_COLORS.textPrimary,
                fontFamily: AP_FONTS.sans,
                fontSize: 26,
                fontWeight: AP_WEIGHT.label,
                whiteSpace: "nowrap",
                textShadow: AP_COLORS.textShadow,
                userSelect: "none",
                ...enterStyle(ramp(frame, at, at + TIMING.fast), { rise: 8 }),
              }}
            >
              {SEQ_TOKENS[j].text}
            </div>

            {/* Its K and its V, already in the cache — or appended just now. */}
            <CacheCell
              x={colX(j)}
              y={K_Y}
              label={`k${j + 1}`}
              kind="k"
              at={isNew ? NEW : KV_ROWS + j * 8}
              fresh={isNew ? inNew : 0}
            />
            <CacheCell
              x={colX(j)}
              y={V_Y}
              label={`v${j + 1}`}
              kind="v"
              at={isNew ? NEW + 6 : KV_ROWS + j * 8 + 4}
              fresh={isNew ? inNew : 0}
            />
          </React.Fragment>
        );
      })}

      {/* Row labels. `K` and `V` keep their colours for the whole video. */}
      <RowLabel y={K_Y} text="K" color={AP_COLORS.key} at={KV_ROWS} />
      <RowLabel y={V_Y} text="V" color={AP_COLORS.value} at={KV_ROWS + 4} />

      {/* One readout, in the right-hand column beside the labels row. */}
      <div
        style={{
          position: "absolute",
          left: LAYERS_X,
          top: LABEL_Y,
          transform: "translateY(-50%)",
          opacity: ramp(frame, NEW, NEW + TIMING.base),
          fontFamily: AP_FONTS.mono,
          fontSize: 26,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.key,
          whiteSpace: "nowrap",
        }}
      >
        + 1 column
      </div>

      {/* The new token's query, beside the K row it reads. */}
      <div
        style={{
          position: "absolute",
          left: Q_X,
          top: K_Y - CELL_H / 2,
          width: Q_W,
          height: CELL_H,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 11,
          background: AP_COLORS.queryBg,
          border: `1.5px solid ${AP_COLORS.queryBorder}`,
          color: AP_COLORS.query,
          fontFamily: AP_FONTS.mono,
          fontSize: 26,
          fontWeight: AP_WEIGHT.label,
          textShadow: AP_COLORS.textShadow,
          ...enterStyle(ramp(frame, Q_AT, Q_AT + TIMING.fast), { rise: 8 }),
        }}
      >
        q
      </div>

      {/* The cache is per layer — this matrix is drawn once, 24 times over. */}
      <div
        style={{
          position: "absolute",
          left: LAYERS_X,
          top: K_Y - 30,
          opacity: ramp(frame, KV_ROWS, KV_ROWS + TIMING.base),
          fontFamily: AP_FONTS.mono,
          fontSize: 26,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.textSecondary,
          whiteSpace: "nowrap",
        }}
      >
        × {MODEL.layers} layers
      </div>
      <div
        style={{
          position: "absolute",
          left: LAYERS_X,
          top: K_Y + 6,
          opacity: ramp(frame, KV_ROWS + 20, KV_ROWS + 20 + TIMING.fast),
          fontFamily: AP_FONTS.sans,
          fontSize: 24,
          fontWeight: AP_WEIGHT.body,
          color: AP_COLORS.textMuted,
          whiteSpace: "nowrap",
        }}
      >
        one cache per layer
      </div>

      {/* One query against every cached key — the reason the cache exists. */}
      {Array.from({ length: COLS }).map((_, j) => (
        <AttentionArc
          key={`arc${j}`}
          x1={Q_X}
          y1={K_Y}
          x2={colRight(j)}
          y2={K_Y}
          weight={0.3}
          color={AP_COLORS.query}
          appearDelay={ARCS + j * 6}
          drawDuration={18}
          apexLift={46}
        />
      ))}

      {/* ...and what comes out the other end. */}
      {PIPE.map((step, i) => (
        <React.Fragment key={step.text}>
          {i > 0 ? (
            <FlowArrow
              x1={PIPE[i - 1].x + PIPE[i - 1].w + 14}
              y1={690}
              x2={step.x - 14}
              y2={690}
              color={AP_COLORS.textMuted}
              appearDelay={PIPE_AT[i] - 20}
              thickness={4}
            />
          ) : null}
          <Chip
            x={step.x}
            y={690}
            at={PIPE_AT[i]}
            color={step.color}
            bg={step.bg}
            border={step.border}
          >
            {step.text}
          </Chip>
        </React.Fragment>
      ))}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 740,
          width: 1920,
          textAlign: "center",
          opacity: ramp(frame, COPY, COPY + TIMING.base),
          color: AP_COLORS.textPrimary,
          fontFamily: AP_FONTS.sans,
          fontSize: 34,
          fontWeight: AP_WEIGHT.heading,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        One position computed per step — not the whole sequence.
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 796,
          width: 1920,
          textAlign: "center",
          opacity: ramp(frame, COPY2, COPY2 + TIMING.fast),
          color: AP_COLORS.textMuted,
          fontFamily: AP_FONTS.sans,
          fontSize: 28,
          fontWeight: AP_WEIGHT.body,
        }}
      >
        It touches the whole cache but computes nothing twice — the gap between tokens is what ITL measures.
      </div>
    </SceneShell>
  );
};

/** One `k` or `v` entry. The appended column gets a ring and scales in. */
const CacheCell: React.FC<{
  x: number;
  y: number;
  label: string;
  kind: "k" | "v";
  at: number;
  /** 0 -> an old entry, 1 -> the one just appended. */
  fresh: number;
}> = ({ x, y, label, kind, at, fresh }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, at, at + TIMING.fast);
  const color = kind === "k" ? AP_COLORS.key : AP_COLORS.value;
  const bg = kind === "k" ? AP_COLORS.keyBg : AP_COLORS.valueBg;
  const border = kind === "k" ? AP_COLORS.keyBorder : AP_COLORS.valueBorder;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - CELL_H / 2,
        width: CELL_W,
        height: CELL_H,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 11,
        background: bg,
        opacity: 0.34 + 0.66 * appear,
        border: `1.5px solid ${border}`,
        boxShadow: fresh > 0 ? `0 0 0 ${3 * fresh}px ${color}` : undefined,
        color,
        fontFamily: AP_FONTS.mono,
        fontSize: 26,
        fontWeight: AP_WEIGHT.label,
        textShadow: AP_COLORS.textShadow,
        userSelect: "none",
        transform: `scale(${1 + 0.06 * fresh})`,
      }}
    >
      {label}
    </div>
  );
};

const RowLabel: React.FC<{ y: number; text: string; color: string; at: number }> = ({
  y,
  text,
  color,
  at,
}) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, at, at + TIMING.fast);
  return (
    <div
      style={{
        position: "absolute",
        left: GRID_X - 26,
        top: y,
        transform: `translate(-100%, -50%) translateY(${(1 - appear) * 8}px)`,
        opacity: appear,
        fontFamily: AP_FONTS.mono,
        fontSize: 32,
        fontWeight: AP_WEIGHT.heading,
        color,
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {text}
    </div>
  );
};

/** A step in the output pipeline. */
const Chip: React.FC<{
  x: number;
  y: number;
  at: number;
  color: string;
  bg: string;
  border: string;
  children: React.ReactNode;
}> = ({ x, y, at, color, bg, border, children }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, at, at + TIMING.fast);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateY(-50%) translateY(${(1 - appear) * 8}px)`,
        opacity: appear,
        padding: "14px 30px",
        borderRadius: 12,
        background: bg,
        border: `1.5px solid ${border}`,
        color,
        fontFamily: AP_FONTS.sans,
        fontSize: 28,
        fontWeight: AP_WEIGHT.label,
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {children}
    </div>
  );
};
