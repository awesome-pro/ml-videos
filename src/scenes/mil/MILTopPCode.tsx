import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import {
  CodeBlock,
  CodeNote,
  MIL_PAD,
  TokenVector,
  type CodeLine,
  type VectorCell,
  type VectorValue,
} from "../../components/mil";
import { crossFade, ramp, TIMING } from "../../components/math";
import {
  FILTER_CUM,
  FILTER_EXCL,
  FILTER_P,
  FILTER_P_COVER,
  FILTER_P_COVER_PREV,
  FILTER_P_CROSSING,
  FILTER_P_PCT,
  FILTER_PROBS,
  FILTER_SORTED,
  FILTER_TOP_P,
  FILTER_VECTOR,
} from "./data";

/**
 * The top-p block, executed one line at a time.
 *
 * The hard line is `(cum_probs - sorted_probs) <= top_p`, and a single row of
 * numbers cannot show why. So the scene uses TWO rows and performs the
 * subtraction on them:
 *
 *   row A   sorted_probs   each token's own share of the mass
 *   row B   cum_probs      the running total, so its bars form a staircase
 *
 * Every bar is drawn on the same 0-to-1 axis. That is what makes the operation
 * visible: token i's share is exactly the last piece of token i's running total.
 * So the minus is shown by marking that last piece in rose and taking it away —
 * after which row B's staircase has stepped back one place, and the first cell
 * reads 0.00. `cum − p` is the running total as it stood one token earlier, and
 * you can watch it step back.
 *
 * The two rows then merge into one: row A is consumed and fades, row B rises
 * into its place and carries on through the mask, the un-sort and the -inf.
 */

export const TOP_P_GEOM = {
  x: 182,
  /** The left column where each row is named. */
  labelW: 210,
  /** The explanation is the scene's headline, at the top. */
  explainY: 232,
  rowY: 320,
  /** Distance between the rows; row B rises by this when they merge. */
  rowPitch: 146,
  /** Narrower than a full-width cell, because each row is named on its left. */
  cellW: 156,
  cellH: 118,
  /** The code is reference material: smaller, and below everything. */
  codeY: 640,
  codeSize: 24,
  codePitch: 30,
};
const {
  x: X,
  labelW: LABEL_W,
  explainY: EXPLAIN_Y,
  rowY: ROW_Y,
  rowPitch: ROW_PITCH,
  cellW: CELL_W,
  cellH: CELL_H,
  codeY: CODE_Y,
  codeSize: CODE_SIZE,
  codePitch: CODE_PITCH,
} = TOP_P_GEOM;

const CELL_X = X + LABEL_W;
const ROW_B_Y = ROW_Y + ROW_PITCH;

/** Beats, one per source line, with the subtraction given its own moment. */
export const TOP_P_BEATS = {
  guard: 40, // if top_p is not None:
  l0: 52, // sort
  l1: 124, // softmax
  l2: 178, // cumsum
  minus: 236, // cum - p, where the two rows become one
  judge: 286, // ... and the comparison against top_p that follows it
  l4: 330, // pin the head
  l5: 382, // a fresh mask
  l6: 448, // scatter back
  l7: 520, // where(..., -inf)
  softmax: 586,
};
const {
  guard: GUARD,
  l0: L0,
  l1: L1,
  l2: L2,
  minus: MINUS,
  judge: JUDGE,
  l4: L4,
  l5: L5,
  l6: L6,
  l7: L7,
  softmax: SOFTMAX,
} = TOP_P_BEATS;

/** The subtraction, in three steps: mark the piece, take it away, merge rows. */
const CUT_AT = MINUS + 6;
const SHRINK_AT = MINUS + 16;
const SHRINK_BY = SHRINK_AT + 18;
const MERGED_BY = SHRINK_BY + 12;

/** The hero lines. This is the explanation; the code is the reference for it. */
export type HeroLine = { at: number; until: number | null; text: string; color: string };

export const TOP_P_HERO: HeroLine[] = [
  {
    at: 20,
    until: L0,
    text: "new_logits — in vocabulary order, and top-p is optional like top-k",
    color: AP_COLORS.textSecondary,
  },
  { at: L0, until: L1, text: "biggest first, so the set we keep is always a prefix", color: AP_COLORS.textPrimary },
  { at: L1, until: L2, text: "softmax turns the logits into shares of one whole", color: AP_COLORS.textPrimary },
  {
    at: L2,
    until: MINUS,
    text: "cumsum: each bar reaches back over everything before it",
    color: AP_COLORS.textPrimary,
  },
  {
    at: MINUS,
    until: JUDGE,
    text: "cum − p takes this token's own share back off its running total",
    color: AP_COLORS.key,
  },
  {
    at: JUDGE,
    until: L4,
    text: `the four before it reach only ${(FILTER_P_COVER_PREV * 100).toFixed(0)}%, so ${
      FILTER_VECTOR[FILTER_P_CROSSING].token
    } has to stay — that takes the set to ${(FILTER_P_COVER * 100).toFixed(0)}%`,
    color: AP_COLORS.value,
  },
  {
    at: L4,
    until: L5,
    text: "the first one is pinned True, so the mask can never come out empty",
    color: AP_COLORS.textPrimary,
  },
  { at: L5, until: L6, text: "a fresh boolean mask, same shape, nothing kept yet", color: AP_COLORS.textPrimary },
  { at: L6, until: L7, text: "scatter_ carries the flags back to their original positions", color: AP_COLORS.textPrimary },
  {
    at: L7,
    until: SOFTMAX,
    text: "everything the mask rejects becomes -inf, exactly like top-k",
    color: AP_COLORS.textPrimary,
  },
  {
    at: SOFTMAX,
    until: null,
    text: `${FILTER_TOP_P.length} kept, covering ${(FILTER_P_COVER * 100).toFixed(0)}% of the mass — which is what top_p = ${FILTER_P} asks for`,
    color: AP_COLORS.key,
  },
];

/** One name in the left column, with the frame window it is on screen for. */
export type RowName = { at: number; until: number | null; text: string };

/** What row A is holding, named the way the code names it. */
export const TOP_P_NAMES_A: RowName[] = [
  { at: 20, until: L0, text: "new_logits" },
  { at: L0, until: L1, text: "sorted_logits" },
  { at: L1, until: MINUS + 24, text: "sorted_probs" },
];

/** What the kept set actually covers, shown beside the row once it is decided. */
export const TOP_P_COVER_AT = JUDGE;
export const TOP_P_COVER_TEXT = `covers ${(FILTER_P_COVER * 100).toFixed(0)}%`;

/** What row B is holding. It carries the name after the rows merge. */
export const TOP_P_NAMES_B: RowName[] = [
  { at: L2, until: SHRINK_AT, text: "cum_probs" },
  { at: SHRINK_BY, until: L7, text: "cum − p" },
  { at: L7 + 8, until: SOFTMAX, text: "new_logits" },
  { at: SOFTMAX, until: null, text: "softmax" },
];

const LAST_ANIM = SOFTMAX + TIMING.fast;
export const MIL_TOP_P_DURATION = LAST_ANIM + 50; // 650 (21.7s)

export const TOP_P_CODE: CodeLine[] = [
  // The block's own guard, shown for the same reason top-k's is: these filters
  // are optional, and the indentation below only makes sense with it there.
  { text: "if top_p is not None:", at: GUARD, hl: [{ text: "if top_p is not None", color: AP_COLORS.value }] },
  {
    text: "    sorted_logits, sorted_indices = torch.sort(new_logits, descending=True, dim=-1)",
    at: L0,
    hl: [{ text: "torch.sort" }, { text: "descending=True", color: AP_COLORS.value }],
  },
  { text: "    sorted_probs = torch.softmax(sorted_logits, dim=-1)", at: L1, hl: [{ text: "torch.softmax" }] },
  { text: "    cum_probs = torch.cumsum(sorted_probs, dim=-1)", at: L2, hl: [{ text: "torch.cumsum" }] },
  { text: "    top_p_mask = (cum_probs - sorted_probs) <= top_p", at: MINUS, hl: [{ text: "cum_probs - sorted_probs" }] },
  { text: "    top_p_mask[..., 0] = True", at: L4, hl: [{ text: "True", color: AP_COLORS.negative }] },
  {
    text: "    unsorted_top_p_mask = torch.zeros_like(new_logits, dtype=torch.bool)",
    at: L5,
    hl: [{ text: "torch.zeros_like" }],
  },
  {
    text: "    unsorted_top_p_mask.scatter_(src=top_p_mask, index=sorted_indices, dim=-1)",
    at: L6,
    hl: [{ text: "scatter_" }],
  },
  {
    text: "    new_logits = torch.where(unsorted_top_p_mask, new_logits, float('-inf'))",
    at: L7,
    hl: [{ text: "torch.where" }, { text: "'-inf'", color: AP_COLORS.negative }],
  },
];

const keeps = (i: number) => FILTER_TOP_P.indexOf(i) >= 0;
const logitText = (i: number) => String(FILTER_VECTOR[i].logit);
const slotSorted = (i: number) => FILTER_SORTED.indexOf(i);

export const MILTopPCode: React.FC = () => {
  const frame = useCurrentFrame();

  const sortP = ramp(frame, L0, L0 + TIMING.base);
  const unsortP = ramp(frame, L6, L6 + TIMING.base);
  /** 0 = vocabulary order, 1 = sorted. `scatter_` reverses it. */
  const sorted = sortP * (1 - unsortP);
  const slotOf = (i: number) => i + (slotSorted(i) - i) * sorted;

  /** How far the subtraction has been carried out, and the merge that follows. */
  const shrink = ramp(frame, SHRINK_AT, SHRINK_BY);
  const rise = ramp(frame, SHRINK_BY, MERGED_BY);
  const barOf = (i: number) => FILTER_CUM[i] + (FILTER_EXCL[i] - FILTER_CUM[i]) * shrink;

  /** The mask, which is thrown away at `zeros_like` and built again by `scatter_`. */
  const masked = frame >= JUDGE;
  const toneOf = (i: number) => {
    if (!masked) return "plain" as const;
    if (frame >= L5 && frame < L6) return "plain" as const;
    if (frame >= L7 + 8) return keeps(i) ? ("keep" as const) : ("dead" as const);
    return keeps(i) ? ("keep" as const) : ("drop" as const);
  };

  /** Row A: each token's own share. This is what the subtraction consumes. */
  const shareValues = (i: number): VectorValue[] => [
    { text: logitText(i), from: 20, until: L1 + 8 },
    { text: `${(FILTER_PROBS[i] * 100).toFixed(0)}%`, from: L1 + 8, until: MINUS + 24 },
  ];
  const shareRow: VectorCell[] = FILTER_VECTOR.map((v, i) => ({
    header: `#${i} ${v.token}`,
    values: shareValues(i),
    tone: "plain",
    slot: slotOf(i),
    at: 20,
    opacity: 1 - ramp(frame, SHRINK_AT, SHRINK_AT + 18),
    bar: frame >= L1 + 8 ? FILTER_PROBS[i] : undefined,
    barColor: AP_COLORS.query,
  }));

  /** Row B: the running total, which the subtraction walks back by one place. */
  const totalValues = (i: number): VectorValue[] => [
    { text: FILTER_CUM[i].toFixed(2), from: L2 + 8, until: SHRINK_AT },
    { text: FILTER_EXCL[i].toFixed(2), from: SHRINK_AT, until: L7 + 8 },
    { text: keeps(i) ? logitText(i) : "-inf", from: L7 + 8, until: SOFTMAX },
    { text: keeps(i) ? `${FILTER_P_PCT[i]}%` : "0%", from: SOFTMAX, until: null },
  ];
  const totalRow: VectorCell[] = FILTER_VECTOR.map((v, i) => ({
    header: `#${i} ${v.token}`,
    values: totalValues(i),
    tone: toneOf(i),
    // The pinned cell is the head of the sorted row, which is Paris here.
    ring: frame >= L4 + 8 && frame < L6 && FILTER_SORTED[0] === i ? ramp(frame, L4 + 8, L4 + 22) : 0,
    slot: slotOf(i),
    at: L2,
    bar: frame >= L2 + 8 ? barOf(i) : undefined,
    barCut: frame >= CUT_AT && frame < SHRINK_AT ? FILTER_PROBS[i] : 0,
  }));

  /** Row B rises into row A's place as the two rows become one. */
  const rowBY = ROW_B_Y - ROW_PITCH * rise;

  return (
    <SceneShell title="top-p: top 90% prefix" duration={MIL_TOP_P_DURATION}>
      {TOP_P_HERO.map((h, i) => (
        <CodeNote key={i} at={h.at} until={h.until} y={EXPLAIN_Y} color={h.color} size={38}>
          {h.text}
        </CodeNote>
      ))}

      <RowLabel y={ROW_Y + CELL_H / 2} lines={TOP_P_NAMES_A} />
      <RowLabel y={rowBY + CELL_H / 2} lines={TOP_P_NAMES_B} />
      <Coverage y={rowBY + CELL_H / 2} />

      <TokenVector
        cells={shareRow}
        x={CELL_X}
        y={ROW_Y}
        cellW={CELL_W}
        cellH={CELL_H}
        headerSize={24}
        valueSize={40}
      />
      <CutLine x={CELL_X + FILTER_TOP_P.length * (CELL_W + 12) - 6} y={rowBY} h={CELL_H} />

      <TokenVector
        cells={totalRow}
        x={CELL_X}
        y={rowBY}
        cellW={CELL_W}
        cellH={CELL_H}
        headerSize={24}
        valueSize={40}
      />

      <CodeBlock lines={TOP_P_CODE} x={X} y={CODE_Y} size={CODE_SIZE} pitch={CODE_PITCH} start={12} />
    </SceneShell>
  );
};

/**
 * The coverage of the kept set, under the row's name. This is the number top-p
 * is actually about: the predicate compares an exclusive total to the line, but
 * the point of the rule is that what survives adds up to at least the line.
 */
const Coverage: React.FC<{ y: number }> = ({ y }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, TOP_P_COVER_AT, TOP_P_COVER_AT + TIMING.fast);
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        top: y + 22,
        opacity: appear,
        fontFamily: AP_FONTS.mono,
        fontSize: 24,
        fontWeight: AP_WEIGHT.label,
        color: AP_COLORS.key,
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {TOP_P_COVER_TEXT}
    </div>
  );
};

/** Where the line falls: the boundary between the last keeper and the first cut. */
const CutLine: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => {
  const frame = useCurrentFrame();
  // Gone by `scatter_`, because after the un-sort the keepers are no longer a
  // contiguous run and "the boundary" stops meaning anything.
  const shown = ramp(frame, TOP_P_COVER_AT, TOP_P_COVER_AT + TIMING.fast) * (1 - ramp(frame, L6, L6 + 10));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - 8,
        width: 3,
        height: h + 16,
        borderRadius: 2,
        background: MIL_PAD,
        opacity: shown,
      }}
    />
  );
};

/** A row's name in the left column, crossfading as the row's contents change. */
const RowLabel: React.FC<{ y: number; lines: RowName[] }> = ({ y, lines }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {lines.map((l, i) => {
        const f = crossFade(frame, l.at, l.until);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: X,
              top: y,
              transform: `translateY(calc(-50% + ${f.dy}px))`,
              opacity: f.opacity,
              fontFamily: AP_FONTS.mono,
              fontSize: 24,
              fontWeight: AP_WEIGHT.label,
              color: AP_COLORS.textSecondary,
              whiteSpace: "nowrap",
              textShadow: AP_COLORS.textShadow,
            }}
          >
            {l.text}
          </div>
        );
      })}
    </>
  );
};
