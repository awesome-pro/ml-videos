import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import {
  CodeBlock,
  CodeNote,
  TokenVector,
  tokenVectorWidth,
  type CodeLine,
  type VectorCell,
  type VectorValue,
} from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { FILTER_K, FILTER_K_PCT, FILTER_TOP_K, FILTER_VECTOR } from "./data";

/**
 * The top-k block from the sampler, executed one line at a time.
 *
 * The line that matters is the third: the losers are not deleted, they are
 * *overwritten with `-inf`*. That is why the whole filter stays a tensor of the
 * same shape — and why the last beat works, because `softmax(-inf)` is exactly
 * 0. Nothing is removed; the tail is made impossible.
 *
 * The example is in vocabulary order, so the four winners sit at indices 3, 0,
 * 5 and 1. `top_k_indices` therefore is not `[0, 1, 2, 3]`, and the `scatter_`
 * on the next line has real work to do. The rank badges are the drawn order.
 */



export const TOP_K_GEOM = {
  x: 182,
  /** The explanation is the scene's headline, at the top. */
  explainY: 250,
  /** The variable name, one small mono line under it. */
  labelY: 320,
  cellY: 366,
  cellH: 150,
  braceY: 528,
  /** The code is reference material: smaller, and below everything. */
  codeY: 610,
  codeSize: 24,
  codePitch: 32,
};
const {
  x: X,
  explainY: EXPLAIN_Y,
  labelY: LABEL_Y,
  cellY: CELL_Y,
  cellH: CELL_H,
  braceY: BRACE_Y,
  codeY: CODE_Y,
  codeSize: CODE_SIZE,
  codePitch: CODE_PITCH,
} = TOP_K_GEOM;

/** One beat per source line, in order, then the softmax payoff. */
export const TOP_K_BEATS = { l0: 56, l1: 108, l2: 172, l3: 250, l4: 318, l5: 406, softmax: 466 };
const { l0: L0, l1: L1, l2: L2, l3: L3, l4: L4, l5: L5, softmax: SOFTMAX } = TOP_K_BEATS;

/** The four winners are written back one at a time, in rank order. */
const WRITE_AT = FILTER_TOP_K.map((_, rank) => L4 + rank * 12);

/**
 * The explanation, one line at a time. This is the scene's headline — the code
 * underneath is the reference for it, not the other way round.
 */
export type HeroLine = { at: number; until: number | null; text: string; color: string };

export const TOP_K_HERO: HeroLine[] = [
  { at: 20, until: L0, text: "new_logits — one score per token", color: AP_COLORS.textSecondary },
  { at: L0, until: L1, text: "top-k only runs if you asked for it", color: AP_COLORS.textPrimary },
  { at: L1, until: L2, text: "you cannot keep more tokens than there are", color: AP_COLORS.textPrimary },
  { at: L2, until: L3, text: "the four biggest values — and the four positions they came from", color: AP_COLORS.textPrimary },
  { at: L3, until: L4, text: "a fresh tensor of the same shape, every entry -inf", color: AP_COLORS.textPrimary },
  { at: L4, until: L5, text: "now write the winners back, into their own positions", color: AP_COLORS.textPrimary },
  { at: L5, until: SOFTMAX, text: "the tail is gone — but nothing has moved", color: AP_COLORS.textPrimary },
  { at: SOFTMAX, until: null, text: "softmax(-inf) is exactly 0, so the rest renormalise themselves", color: AP_COLORS.key },
];

const LAST_ANIM = SOFTMAX + TIMING.fast;
export const MIL_TOP_K_DURATION = LAST_ANIM + 50; // 530 (17.7s)

/** The block, exactly as it appears in the sampler. */
export const TOP_K_CODE: CodeLine[] = [
  { text: "if top_k is not None and top_k > 0:", at: L0, hl: [{ text: "top_k > 0", color: AP_COLORS.value }] },
  { text: "    top_k = min(top_k, new_logits.shape[-1])", at: L1, hl: [{ text: "min(" }] },
  {
    text: "    top_k_values, top_k_indices = torch.topk(new_logits, top_k, dim=-1)",
    at: L2,
    hl: [{ text: "torch.topk" }],
  },
  {
    text: "    top_k_mask = torch.full_like(new_logits, float('-inf'))",
    at: L3,
    hl: [{ text: "torch.full_like" }, { text: "'-inf'", color: AP_COLORS.negative }],
  },
  {
    text: "    top_k_mask.scatter_(dim=-1, index=top_k_indices, src=top_k_values)",
    at: L4,
    hl: [{ text: "scatter_" }],
  },
  { text: "    new_logits = top_k_mask", at: L5 },
];

const rankOf = (i: number) => FILTER_TOP_K.indexOf(i) + 1; // 0 when not a winner
const logitText = (i: number) => String(FILTER_VECTOR[i].logit);

/**
 * What the row currently holds, named the way the code names it. This is the
 * spine of the walkthrough: the label always matches the variable you would be
 * looking at on that line.
 */
function rowLabel(frame: number): string {
  if (frame >= SOFTMAX) return "softmax(new_logits)";
  if (frame >= L5) return "new_logits";
  if (frame >= L3) return "top_k_mask";
  return "new_logits";
}

export const MILTopKCode: React.FC = () => {
  const frame = useCurrentFrame();

  const cells: VectorCell[] = FILTER_VECTOR.map((v, i) => {
    const rank = rankOf(i);
    const keep = rank > 0;
    const writeAt = keep ? WRITE_AT[rank - 1] : null;
    const values: VectorValue[] = [
      { text: logitText(i), from: 20, until: L3 + 14 },
      // `full_like` overwrites every entry, winners included.
      { text: "-inf", from: L3 + 14, until: writeAt ?? SOFTMAX },
    ];
    if (keep) {
      values.push({ text: logitText(i), from: writeAt as number, until: SOFTMAX });
      values.push({ text: `${FILTER_K_PCT[i]}%`, from: SOFTMAX, until: null });
    } else {
      values.push({ text: "0%", from: SOFTMAX, until: null });
    }

    const tone = (() => {
      if (frame < L3 + 14) return "plain" as const;
      if (keep) return frame >= (writeAt as number) ? ("keep" as const) : ("dead" as const);
      return "dead" as const;
    })();

    return {
      header: `#${i} ${v.token}`,
      values,
      tone,
      rank: frame >= L2 + 14 && keep ? rank : undefined,
      slot: i,
      at: 20,
    };
  });

  return (
    <SceneShell title="top-k: keep the four, -inf the rest" duration={MIL_TOP_K_DURATION}>
      <CodeBlock lines={TOP_K_CODE} x={X} y={CODE_Y} size={CODE_SIZE} pitch={CODE_PITCH} start={12} />

      <div
        style={{
          position: "absolute",
          left: X,
          top: LABEL_Y,
          fontFamily: AP_FONTS.mono,
          fontSize: 30,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.textSecondary,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {rowLabel(frame)}
      </div>

      <div
        style={{
          position: "absolute",
          left: X + tokenVectorWidth(cells.length),
          top: LABEL_Y + 2,
          transform: "translateX(-100%)",
          fontFamily: AP_FONTS.mono,
          fontSize: 28,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.value,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {`top_k = ${FILTER_K}`}
      </div>

      <TokenVector cells={cells} x={X} y={CELL_Y} cellH={CELL_H} headerSize={30} valueSize={48} />

      {/* dim=-1 in the code is this axis. */}
      <DimBrace at={L1 + 14} />
      {TOP_K_HERO.map((h, i) => (
        <CodeNote key={i} at={h.at} until={h.until} y={EXPLAIN_Y} color={h.color} size={38}>
          {h.text}
        </CodeNote>
      ))}
      <CodeNote at={L0} until={L1} y={EXPLAIN_Y} color={AP_COLORS.textPrimary}>
        top-k only runs if you asked for it
      </CodeNote>
      <CodeNote at={L1} until={L2} y={EXPLAIN_Y} color={AP_COLORS.textPrimary}>
        you cannot keep more tokens than there are
      </CodeNote>
      <CodeNote at={L2} until={L3} y={EXPLAIN_Y} color={AP_COLORS.textPrimary}>
        the four biggest values — and the four positions they came from
      </CodeNote>
      <CodeNote at={L3} until={L4} y={EXPLAIN_Y} color={AP_COLORS.textPrimary}>
        a fresh tensor of the same shape, every entry -inf
      </CodeNote>
      <CodeNote at={L4} until={L5} y={EXPLAIN_Y} color={AP_COLORS.textPrimary}>
        now write the winners back, into their own positions
      </CodeNote>
      <CodeNote at={L5} until={SOFTMAX} y={EXPLAIN_Y} color={AP_COLORS.textPrimary}>
        the tail is gone — but nothing has moved
      </CodeNote>
      <CodeNote at={SOFTMAX} until={null} y={EXPLAIN_Y} color={AP_COLORS.key}>
        softmax(-inf) is exactly 0, so the rest renormalise themselves
      </CodeNote>
    </SceneShell>
  );
};

/** A brace under the row, labelling the axis the code keeps calling `dim=-1`. */
const DimBrace: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, at, at + TIMING.fast);
  const w = tokenVectorWidth(FILTER_VECTOR.length);
  return (
    <div style={{ opacity: p }}>
      <div
        style={{
          position: "absolute",
          left: X + 6,
          top: BRACE_Y,
          width: w - 12,
          height: 12,
          boxSizing: "border-box",
          borderBottom: `2px solid ${AP_COLORS.accent}`,
          borderLeft: `2px solid ${AP_COLORS.accent}`,
          borderRight: `2px solid ${AP_COLORS.accent}`,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: X + w / 2,
          top: BRACE_Y + 18,
          transform: "translateX(-50%)",
          fontFamily: AP_FONTS.mono,
          fontSize: 26,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.accent,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        dim=-1
      </div>
    </div>
  );
};
