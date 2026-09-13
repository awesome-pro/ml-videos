import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { Equation, hl } from "../../components/math/Equation";
import { enterStyle, ramp, TIMING } from "../../components/math/motion";

/**
 * Demo 1 of the maths kit: real LaTeX typesetting with frame-driven emphasis.
 *
 * Compare with the old `MathText` approach, which composed formulas from
 * monospace spans — no fraction bars, no roots, no italic variables and no
 * operator spacing. This is the same attention formula, properly typeset.
 */

export const MATH_KIT_EQUATIONS_DURATION = 300;

const ATTENTION_TEX =
  "\\mathrm{Attention}(" +
  hl("q", "Q") +
  "," +
  hl("k", "K") +
  "," +
  hl("v", "V") +
  ")=" +
  hl("softmax", "\\mathrm{softmax}") +
  "\\!\\left(\\frac{" +
  hl("q", "Q") +
  hl("k", "K") +
  "^{\\top}}{\\sqrt{d_k}}\\right)" +
  hl("v", "V");

const SOFTMAX_TEX =
  "\\mathrm{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_{j} e^{z_j}}";

const Legend: React.FC<{
  label: string;
  color: string;
  text: string;
  start: number;
}> = ({ label, color, text, start }) => {
  const frame = useCurrentFrame();
  const progress = ramp(frame, start, start + TIMING.base);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 22px",
        borderRadius: 12,
        background: AP_COLORS.surface,
        border: "1px solid " + AP_COLORS.surfaceBorder,
        ...enterStyle(progress, { rise: 12 }),
      }}
    >
      <span style={{ color, fontWeight: 800, fontSize: 26, fontFamily: AP_FONTS.mono, minWidth: 22 }}>
        {label}
      </span>
      <span style={{ color: AP_COLORS.textSecondary, fontSize: 23, fontWeight: 500 }}>{text}</span>
    </div>
  );
};

export const MathKitEquations: React.FC = () => {
  const frame = useCurrentFrame();
  const captionOpacity = ramp(frame, 216, 216 + TIMING.base);

  return (
    <SceneShell
      kicker="Math kit · typesetting"
      title="Real LaTeX, animated term by term"
      duration={MATH_KIT_EQUATIONS_DURATION}
      enterDelay={0}
    >
      <Equation
        tex={ATTENTION_TEX}
        size={62}
        y={352}
        start={16}
        highlights={[
          { id: "q", color: AP_COLORS.query, start: 78 },
          { id: "k", color: AP_COLORS.key, start: 116 },
          { id: "v", color: AP_COLORS.value, start: 154 },
          { id: "softmax", color: AP_COLORS.accent, start: 192 },
        ]}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 508,
          width: 1920,
          display: "flex",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <Legend label="Q" color={AP_COLORS.query} text="what am I looking for" start={86} />
        <Legend label="K" color={AP_COLORS.key} text="when am I relevant" start={124} />
        <Legend label="V" color={AP_COLORS.value} text="what I hand over" start={162} />
      </div>

      <Equation
        tex={SOFTMAX_TEX}
        size={46}
        y={642}
        start={206}
        color={AP_COLORS.textSecondary}
        dimBase={false}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 776,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textMuted,
          fontSize: 25,
          fontWeight: 500,
          fontFamily: AP_FONTS.sans,
          padding: "0 260px",
          lineHeight: 1.5,
          opacity: captionOpacity,
          transform: `translateY(${(1 - captionOpacity) * 10}px)`,
        }}
      >
        Fraction bars, radicals, sum limits and operator spacing are now real maths
        typesetting — not monospace characters positioned by hand.
      </div>
    </SceneShell>
  );
};
