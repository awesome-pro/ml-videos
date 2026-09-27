import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../shared/theme";
import { enterStyle, ramp, withAlpha, TIMING } from "../math";
import { MIL_PAD, MONO_EM, SANS_EM } from "./theme";

/**
 * The next-token distribution drawn as ONE ruler, not as a list of bars.
 *
 * That difference is the whole point of the sampling scenes. A bar chart shows
 * how likely each token is; a ruler shows *where a draw lands*. Probability is
 * width, so "we take it based on probability" stops being a claim and becomes
 * something you can watch: a wide segment is simply harder to miss.
 *
 * The segment boundaries are cumulative sums, so everything here is exact
 * arithmetic on the probabilities the scene passes in. `rulerLayout` and
 * `pickIndex` are pure, so a script can check the geometry and the outcomes
 * without a browser (AGENTS.md: never measure the DOM).
 */

export type RulerSeg = {
  label: string;
  /** Share of the ruler, already normalised by the caller. */
  prob: number;
  /** false → discarded by the current rule: drawn rose and struck through. */
  kept?: boolean;
};

/** A share at or below this counts as removed rather than as a very thin slice. */
const GONE = 1e-4;

export type RulerDraw = {
  /** Landing point in [0,1] of the ruler. A marker never moves. */
  u: number;
  /** Frame the marker drops in. */
  at: number;
};

export type ProbRulerProps = {
  segs: RulerSeg[];
  /** Left edge and top of the track. */
  x: number;
  y: number;
  width?: number;
  height?: number;
  /** Frame the ruler arrives. */
  start?: number;
  draws?: RulerDraw[];
  /** Frame at which segments that received a draw brighten. */
  hitAt?: number;
  /**
   * Which label row each segment's name goes on, index-aligned to `segs`; -1
   * hides it. Compute once at module scope with `rulerLabelRows` — the rows must
   * not depend on the frame, or a name would jump rows mid-morph.
   */
  labelRows?: number[];
  labelSize?: number;
  /** Print each segment's share inside it, where there is room. */
  showPct?: boolean;
  /** 0 and 1 end ticks. */
  ticks?: boolean;
  /** Fill for a segment that is still in play. */
  color?: string;
  /** Print the token each marker landed on, above the track. */
  pickLabels?: boolean;
  /**
   * Append `×n` to each name showing how many draws landed on it. This is the
   * payoff of the whole ruler: after six draws the tall segments are visibly
   * carrying more hits, which is what "we take it based on probability" means.
   */
  showCounts?: boolean;
};

export type RulerLayout = {
  starts: number[];
  widths: number[];
  centres: number[];
};

/** Exact segment geometry: cumulative sums, so the ruler always adds to `width`. */
export function rulerLayout(segs: RulerSeg[], x: number, width: number): RulerLayout {
  let acc = 0;
  const starts: number[] = [];
  const widths: number[] = [];
  const centres: number[] = [];
  for (const s of segs) {
    starts.push(x + acc * width);
    widths.push(s.prob * width);
    centres.push(x + (acc + s.prob / 2) * width);
    acc += s.prob;
  }
  return { starts, widths, centres };
}

/**
 * Greedy label placement over up to `rowCount` stacked rows. Returns the row
 * each name lands on, or -1 when there is genuinely no room — a dropped name
 * beats two overprinted ones.
 */
export function rulerLabelRows(
  segs: RulerSeg[],
  x: number,
  width: number,
  labelSize = 28,
  rowCount = 2,
  /** Extra characters to reserve, e.g. the " x4" a hit counter will append. */
  reserveChars = 0
): number[] {
  const { centres } = rulerLayout(segs, x, width);
  const lastRight = new Array<number>(rowCount).fill(-Infinity);
  return segs.map((s, i) => {
    const half = ((s.label.length + reserveChars) * labelSize * SANS_EM) / 2;
    const left = centres[i] - half;
    const right = centres[i] + half;
    for (let r = 0; r < rowCount; r++) {
      if (left >= lastRight[r] + 14) {
        lastRight[r] = right;
        return r;
      }
    }
    return -1;
  });
}

/**
 * The token a draw at `u` lands on: walk the *kept* segments renormalised, and
 * take the one whose slice of the ruler contains `u`.
 */
export function pickIndex(segs: RulerSeg[], u: number): number {
  const total = segs.reduce((a, s) => (s.kept === false ? a : a + s.prob), 0);
  if (total <= 0) return -1;
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].kept === false) continue;
    acc += segs[i].prob / total;
    if (u < acc) return i;
  }
  for (let i = segs.length - 1; i >= 0; i--) if (segs[i].kept !== false) return i;
  return -1;
}

export const ProbRuler: React.FC<ProbRulerProps> = ({
  segs,
  x,
  y,
  width = 1580,
  height = 88,
  start = 0,
  draws = [],
  hitAt = 0,
  labelRows,
  labelSize = 28,
  showPct = true,
  ticks = false,
  color = AP_COLORS.accent,
  pickLabels = false,
  showCounts = false,
}) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, start, start + TIMING.base);
  const hit = ramp(frame, hitAt, hitAt + TIMING.fast);
  const { starts, widths, centres } = rulerLayout(segs, x, width);

  // Which segments any landed draw fell on, and how many — sampling made visible.
  const counts = segs.map(() => 0);
  draws.forEach((d) => {
    if (frame < d.at) return;
    const i = pickIndex(segs, d.u);
    if (i >= 0) counts[i] += 1;
  });
  const hits = new Set<number>();
  counts.forEach((n, i) => {
    if (n > 0) hits.add(i);
  });

  const nodes: React.ReactNode[] = [];
  const rowPitch = labelSize + 8;

  nodes.push(
    <div
      key="track"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        borderRadius: 14,
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        ...enterStyle(appear, { rise: 12 }),
      }}
    />
  );

  segs.forEach((s, i) => {
    // A rule that drops a segment sets its share to zero; a zero-width box with
    // a border would still paint a 3px sliver, so skip it outright.
    if (s.prob <= GONE) return;
    const kept = s.kept !== false;
    const isHit = hits.has(i) && hit > 0;
    // The gap between segments shrinks with them, so a segment that temperature
    // has squeezed down to a few pixels still draws instead of vanishing. At
    // T = 0.5 the smallest is ~6px of ruler; against a fixed 5px gap that would
    // paint a 1px line, which reads as a rendering bug rather than as "unlikely".
    const gap = Math.min(5, widths[i] * 0.35);
    const w = Math.max(0, widths[i] - gap);
    const fill = !kept ? MIL_PAD : isHit ? AP_COLORS.key : color;
    const alpha = !kept ? 0.22 : isHit ? 0.34 : 0.26;

    nodes.push(
      <div
        key={`s${i}`}
        style={{
          position: "absolute",
          left: starts[i] + gap / 2,
          top: y + 4,
          width: w * appear,
          height: height - 8,
          borderRadius: 10,
          background: withAlpha(fill, alpha),
          border: `1.5px solid ${withAlpha(fill, kept ? (isHit ? 0.95 : 0.6) : 0.45)}`,
          opacity: appear,
        }}
      >
        {showPct && w > 74 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: AP_FONTS.mono,
              fontSize: 28,
              fontWeight: AP_WEIGHT.label,
              color: isHit ? AP_COLORS.key : kept ? AP_COLORS.textPrimary : MIL_PAD,
              whiteSpace: "nowrap",
              textShadow: AP_COLORS.textShadow,
            }}
          >
            {(s.prob * 100).toFixed(0)}%
          </div>
        ) : null}
      </div>
    );

    if (!labelRows) return;
    const row = labelRows[i];
    if (row === undefined || row < 0) return;
    // A name wider than the segment it labels would run into its neighbour.
    if (w + 8 < labelWidth(s.label, labelSize)) return;
    nodes.push(
      <div
        key={`l${i}`}
        style={{
          position: "absolute",
          left: centres[i],
          top: y + height + 22 + row * rowPitch,
          transform: "translateX(-50%)",
          fontFamily: AP_FONTS.sans,
          fontSize: labelSize,
          fontWeight: AP_WEIGHT.label,
          color: isHit ? AP_COLORS.key : kept ? AP_COLORS.textSecondary : AP_COLORS.textMuted,
          textDecoration: kept ? "none" : "line-through",
          opacity: appear,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {s.label}
        {showCounts && counts[i] > 0 ? (
          <span style={{ color: AP_COLORS.key }}> ×{counts[i]}</span>
        ) : null}
      </div>
    );
  });

  if (ticks) {
    [0, 1].forEach((t, k) => {
      nodes.push(
        <div
          key={`t${k}`}
          style={{
            position: "absolute",
            left: k === 0 ? x - 16 : x + width + 16,
            top: y + height / 2,
            transform: `translate(${k === 0 ? "-100%" : "0"}, -50%)`,
            fontFamily: AP_FONTS.mono,
            fontSize: AP_TYPE.label,
            fontWeight: AP_WEIGHT.label,
            color: AP_COLORS.textMuted,
            opacity: appear,
          }}
        >
          {t}
        </div>
      );
    });
  }

  // The draws: a line through the track with a dot where it landed. These do
  // not move when the segments do — that is what makes temperature legible.
  draws.forEach((d, k) => {
    const p = ramp(frame, d.at, d.at + TIMING.fast);
    const cx = x + d.u * width;
    const landed = pickIndex(segs, d.u);
    nodes.push(
      <div
        key={`d${k}`}
        style={{
          position: "absolute",
          left: cx,
          top: y - 10,
          opacity: p,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -1.5,
            top: 0,
            width: 3,
            height: height + 20,
            borderRadius: 2,
            background: AP_COLORS.query,
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -8,
            top: height / 2 - 2,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: AP_COLORS.query,
            border: `2px solid ${AP_COLORS.bg}`,
          }}
        />
      </div>
    );

    if (pickLabels) {
      const label = landed >= 0 ? segs[landed].label : "";
      nodes.push(
        <div
          key={`p${k}`}
          style={{
            position: "absolute",
            left: cx,
            top: y - 46,
            transform: "translateX(-50%)",
            fontFamily: AP_FONTS.sans,
            fontSize: 28,
            fontWeight: AP_WEIGHT.heading,
            color: AP_COLORS.query,
            opacity: ramp(frame, d.at + 4, d.at + 4 + TIMING.fast),
            whiteSpace: "nowrap",
            textShadow: AP_COLORS.textShadow,
          }}
        >
          {label}
        </div>
      );
    }
  });

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
      {nodes}
    </div>
  );
};

/**
 * The advance width this label needs, in px. Exported so scenes and the layout
 * audit agree on the same estimate.
 */
export function labelWidth(text: string, size = 28): number {
  return text.length * size * SANS_EM;
}

/** Monospace advance width, for the same reason. */
export function monoWidth(text: string, size = 28): number {
  return text.length * size * MONO_EM;
}
