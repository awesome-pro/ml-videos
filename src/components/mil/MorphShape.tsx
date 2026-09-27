import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../shared/theme";
import { crossFade, ramp, TIMING } from "../math";
import { MIL_AXIS, MONO_EM, type AxisName } from "./theme";

/**
 * The tensor shape, written the way you would in code — but *morphing*.
 *
 * `TensorShape` prints one fixed shape. The shape scenes are about the shape
 * changing, so the line itself has to change: a new axis fades in while the
 * closing bracket slides right to make room for it, and an axis that is no
 * longer there fades out while the bracket slides back over the space it left.
 *
 * Dimensions are keyed by AXIS, never by slot position. That is what lets an
 * axis change its value (`T=5` -> `T=1`) or vanish outright and have the axes
 * after it close ranks smoothly instead of leaving a hole in the line.
 *
 * JetBrains Mono advances at exactly 0.6em, so every position here is exact
 * arithmetic — see `shapeLayout`, which is pure and therefore checkable outside
 * a browser. AGENTS.md forbids DOM measurement (it would break determinism),
 * and it is not needed: a mono line is a grid.
 */

export type ShapeDim = {
  axis: AxisName;
  value: string;
  /** One-word gloss printed under the axis. Keep it short: slots are narrow. */
  note?: string;
};

export type ShapeStage = {
  /** Frame at which this becomes the shape on screen. Must increase. */
  at: number;
  name: string;
  /** Each stage's dims must extend the previous one, or drop trailing dims. */
  dims: ShapeDim[];
  /** Short operation label, aligned to the right end of the gloss row. */
  op?: string;
};

export type MorphShapeProps = {
  stages: ShapeStage[];
  /** Left edge of the whole line (the name's left edge). */
  x: number;
  /** Top of the shape line. */
  y: number;
  size?: number;
  /** Right edge that `op` labels are aligned to. */
  opX?: number;
};

const textOf = (d: ShapeDim) => `${d.axis}=${d.value}`;

/** The static, frame-independent geometry of a shape line. */
export type ShapeLayout = {
  adv: number;
  sepW: number;
  lineH: number;
  /** Width of the name slot: the longest name any stage uses. */
  nameW: number;
  /** Just inside the opening bracket. */
  base: number;
  axes: AxisName[];
  /** The widest this axis ever prints, so a value change never reflows. */
  axisW: (a: AxisName) => number;
  /** Where the closing bracket sits in each stage, index-aligned to `stages`. */
  closeAt: number[];
  /** Where `a` sits in stage `i`, or null when that stage does not carry it. */
  axisXAt: (a: AxisName, i: number) => number | null;
  /** Index of the first stage carrying `a`. */
  firstStage: (a: AxisName) => number;
  /** Index of `a` within its first stage's dims (0 means it needs no comma). */
  commaAt: (a: AxisName) => number;
};

export function shapeLayout(stages: ShapeStage[], x: number, size: number): ShapeLayout {
  const adv = size * MONO_EM;
  const sepW = 2 * adv;
  const lineH = size * 1.12;
  const nameW = Math.max(...stages.map((s) => s.name.length)) * adv;
  const base = x + nameW + adv;

  const axes: AxisName[] = [];
  for (const s of stages) {
    for (const d of s.dims) if (axes.indexOf(d.axis) < 0) axes.push(d.axis);
  }

  const axisW = (a: AxisName) => {
    let n = 0;
    for (const s of stages) {
      const d = s.dims.find((k) => k.axis === a);
      if (d) n = Math.max(n, textOf(d).length);
    }
    return n * adv;
  };

  const axisXAt = (a: AxisName, i: number) => {
    let px = base;
    for (const d of stages[i].dims) {
      if (d.axis === a) return px;
      px += axisW(d.axis) + sepW;
    }
    return null;
  };

  const closeAt = stages.map((s) => {
    let px = base;
    s.dims.forEach((d, k) => {
      px += axisW(d.axis) + (k > 0 ? sepW : 0);
    });
    return px;
  });

  const firstStage = (a: AxisName) => stages.findIndex((s) => s.dims.some((d) => d.axis === a));
  const commaAt = (a: AxisName) => stages[firstStage(a)].dims.findIndex((d) => d.axis === a);

  return { adv, sepW, lineH, nameW, base, axes, axisW, closeAt, axisXAt, firstStage, commaAt };
}

/** A crossfade that never overprints: the outgoing copy lifts as it leaves. */
type Fade = { opacity: number; dy: number };

/** One printed value of one axis, plus the frame window it lives in. */
type Run = { text: string; note?: string; from: number; until: number | null };

export const MorphShape: React.FC<MorphShapeProps> = ({
  stages,
  x,
  y,
  size = 48,
  opX = 1760,
}) => {
  const frame = useCurrentFrame();

  const L = shapeLayout(stages, x, size);
  const { sepW, lineH, nameW, base } = L;

  const fade = (from: number, until: number | null) => crossFade(frame, from, until);

  const dimIn = (i: number, a: AxisName) => stages[i].dims.find((d) => d.axis === a);

  /** The last stage at or before `i` still carrying this axis. */
  const seenAt = (i: number, a: AxisName) => {
    for (let k = i; k >= 0; k--) if (dimIn(k, a)) return k;
    return -1;
  };

  /**
   * Blend a per-stage quantity into "now": v0 + Σ (v_i − v_{i−1}) · progress_i.
   *
   * Every quantity is blended with the same progress set and every quantity is
   * linear in the axis widths, so mid-transition the closing bracket lands
   * exactly where the sum of the drawn axes puts it. The line stretches as one
   * object instead of the text and the bracket disagreeing about the width.
   */
  const blend = (valueAt: (i: number) => number) => {
    let v = valueAt(0);
    for (let i = 1; i < stages.length; i++) {
      v += (valueAt(i) - valueAt(i - 1)) * ramp(frame, stages[i].at, stages[i].at + TIMING.base);
    }
    return v;
  };

  const closeX = blend((i) => L.closeAt[i]);
  const xOf = (a: AxisName) =>
    blend((i) => {
      const k = seenAt(i, a);
      return L.axisXAt(a, k >= 0 ? k : L.firstStage(a)) ?? base;
    });

  /** Split an axis's stages into runs of identical (value, note). */
  const axisRuns = (a: AxisName): Run[] => {
    const present: { i: number; d: ShapeDim }[] = [];
    stages.forEach((s, i) => {
      const d = dimIn(i, a);
      if (d) present.push({ i, d });
    });
    const out: Run[] = [];
    let start = present[0].i;
    for (let k = 1; k <= present.length; k++) {
      const prev = present[k - 1];
      const next = k < present.length ? present[k] : null;
      const changed = next !== null && (next.d.value !== prev.d.value || next.d.note !== prev.d.note);
      if (next === null || changed) {
        const last = present[k - 1].i;
        out.push({
          text: textOf(prev.d),
          note: prev.d.note,
          from: stages[start].at,
          until: last + 1 < stages.length ? stages[last + 1].at : null,
        });
        if (k < present.length) start = present[k].i;
      }
    }
    return out;
  };

  /** The frame window an axis is on screen at all: first run in, last run out. */
  const axisWindow = (a: AxisName): { from: number; until: number | null } => {
    const r = axisRuns(a);
    return { from: r[0].from, until: r[r.length - 1].until };
  };

  const nameRuns: Run[] = (() => {
    const out: Run[] = [];
    let start = 0;
    for (let k = 1; k <= stages.length; k++) {
      const prev = stages[k - 1];
      const next = k < stages.length ? stages[k] : null;
      if (next === null || next.name !== prev.name) {
        out.push({
          text: prev.name,
          from: stages[start].at,
          until: next !== null ? next.at : null,
        });
        if (next !== null) start = k;
      }
    }
    return out;
  })();

  const nodes: React.ReactNode[] = [];

  const push = (
    key: string,
    left: number,
    top: number,
    f: Fade,
    color: string,
    content: React.ReactNode,
    opts: { mono?: boolean; size?: number; align?: "left" | "right" } = {}
  ) => {
    const { mono = true, size: fs = size, align = "left" } = opts;
    nodes.push(
      <div
        key={key}
        style={{
          position: "absolute",
          left,
          top,
          transform: `translateY(${f.dy}px)${align === "right" ? " translateX(-100%)" : ""}`,
          opacity: f.opacity,
          fontFamily: mono ? AP_FONTS.mono : AP_FONTS.sans,
          fontSize: fs,
          fontWeight: AP_WEIGHT.label,
          lineHeight: 1.12,
          color,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
          userSelect: "none",
        }}
      >
        {content}
      </div>
    );
  };

  const opensAt = Math.min(...stages.map((s) => s.at));

  for (const r of nameRuns) {
    push(`n${r.from}`, x, y, fade(r.from, r.until), AP_COLORS.textSecondary, r.text);
  }

  push("open", x + nameW, y, fade(opensAt, null), AP_COLORS.textMuted, "[");

  for (const a of L.axes) {
    const ax = xOf(a);

    // A comma belongs to the axis that follows it. The first axis never has one.
    if (L.commaAt(a) > 0) {
      const w = axisWindow(a);
      push(`sep${a}`, ax - sepW, y, fade(w.from, w.until), AP_COLORS.textMuted, ",");
    }

    for (const r of axisRuns(a)) {
      const f = fade(r.from, r.until);
      push(
        `v${a}-${r.from}`,
        ax,
        y,
        f,
        AP_COLORS.textSecondary,
        <span>
          {a}
          <span style={{ color: AP_COLORS.textMuted }}>=</span>
          <span style={{ color: MIL_AXIS[a] }}>{r.text.slice(a.length + 1)}</span>
        </span>
      );
      if (r.note) {
        push(`g${a}-${r.from}`, ax, y + lineH + 14, f, AP_COLORS.textSecondary, r.note, {
          mono: false,
          size: AP_TYPE.label,
        });
      }
    }
  }

  push("close", closeX, y, fade(opensAt, null), AP_COLORS.textMuted, "]");

  // The operation that produced this shape, right-aligned on the gloss row.
  stages.forEach((s, i) => {
    if (!s.op) return;
    const until = i + 1 < stages.length ? stages[i + 1].at : null;
    push(`op${i}`, opX, y + lineH + 14, fade(s.at, until), AP_COLORS.textSecondary, s.op, {
      size: 28,
      align: "right",
    });
  });

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
      {nodes}
    </div>
  );
};
