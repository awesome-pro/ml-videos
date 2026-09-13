import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { hl } from "../../components/math/Equation";
import { EquationSteps } from "../../components/math/EquationSteps";
import type { EquationStep } from "../../components/math/EquationSteps";
import { ramp, TIMING } from "../../components/math/motion";

/**
 * Demo 2 of the maths kit: one formula evolving across steps, with the reason
 * for each step shown alongside it.
 *
 * The old scenes cut from one equation to the next. Here each step crossfades
 * with opposite vertical drift, so the formula reads as being rearranged.
 */

export const MATH_KIT_STEPS_DURATION = 420;

const STEPS: EquationStep[] = [
  {
    at: 20,
    tex: "\\mathrm{scores}=" + hl("q", "Q") + hl("k", "K") + "^{\\top}",
    note: "Every query is compared with every key — one score per pair.",
    highlights: [
      { id: "q", color: AP_COLORS.query, start: 44 },
      { id: "k", color: AP_COLORS.key, start: 58 },
    ],
  },
  {
    at: 116,
    tex:
      "\\mathrm{scores}=\\frac{" +
      hl("q", "Q") +
      hl("k", "K") +
      "^{\\top}}{" +
      hl("scale", "\\sqrt{d_k}") +
      "}",
    note: "Divided by √d_k so the scores stay in a range softmax can handle.",
    highlights: [{ id: "scale", color: AP_COLORS.negative, start: 150 }],
  },
  {
    at: 212,
    tex:
      "A=" +
      hl("softmax", "\\mathrm{softmax}") +
      "\\!\\left(\\frac{" +
      hl("q", "Q") +
      hl("k", "K") +
      "^{\\top}}{\\sqrt{d_k}}\\right)",
    note: "Each row becomes a distribution that sums to 1 — that is the attention weight.",
    highlights: [{ id: "softmax", color: AP_COLORS.accent, start: 246 }],
  },
  {
    at: 308,
    tex:
      "\\mathrm{out}=" +
      hl("a", "A") +
      "\\," +
      hl("v", "V"),
    note: "A weighted average of the value vectors — the new representation.",
    highlights: [
      { id: "a", color: AP_COLORS.accent, start: 342 },
      { id: "v", color: AP_COLORS.value, start: 356 },
    ],
  },
];

const LABELS: { text: string; at: number }[] = [
  { text: "score", at: 20 },
  { text: "scale", at: 116 },
  { text: "softmax", at: 212 },
  { text: "weighted sum", at: 308 },
];

const StepChip: React.FC<{ index: number; text: string; at: number; frame: number }> = ({
  index,
  text,
  at,
  frame,
}) => {
  const active = frame >= at;
  const appeared = ramp(frame, at, at + TIMING.fast);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        borderRadius: 999,
        border: "1.5px solid " + (active ? AP_COLORS.accentBorder : AP_COLORS.surfaceBorder),
        background: active ? AP_COLORS.accentBg : "rgba(255,255,255,0.02)",
        opacity: active ? 0.35 + 0.65 * appeared : 0.4,
      }}
    >
      <span
        style={{
          color: active ? AP_COLORS.accent : AP_COLORS.textMuted,
          fontSize: 20,
          fontWeight: 800,
          fontFamily: AP_FONTS.mono,
        }}
      >
        {index + 1}
      </span>
      <span
        style={{
          color: active ? AP_COLORS.textPrimary : AP_COLORS.textMuted,
          fontSize: 22,
          fontWeight: active ? 700 : 500,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const MathKitSteps: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      kicker="Math kit · step by step"
      title="One formula, built one step at a time"
      duration={MATH_KIT_STEPS_DURATION}
      enterDelay={0}
    >
      <EquationSteps steps={STEPS} size={66} y={326} crossfade={18} showRail={false} />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 848,
          width: 1920,
          display: "flex",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {LABELS.map((label, i) => (
          <StepChip key={label.text} index={i} text={label.text} at={label.at} frame={frame} />
        ))}
      </div>
    </SceneShell>
  );
};
