import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { Equation, hl } from "../../components/math/Equation";
import { MemBar } from "../../components/kv/MemBar";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

// Animation ends ~350; +45 frames (1.5s) of buffer for the facecam take.
export const KV_PRACTICAL_DURATION = 395;

/**
 * The concrete arithmetic, typeset with KaTeX. Each factor lights up in turn,
 * and its colour matches the model-spec line above so the mapping is obvious.
 */
const SIZE_TEX =
  hl("two", "2") +
  " \\cdot " +
  hl("layers", "32") +
  " \\cdot " +
  hl("tokens", "8192") +
  " \\cdot " +
  hl("heads", "8") +
  " \\cdot " +
  hl("dim", "128") +
  " \\cdot " +
  hl("bytes", "2\\ \\text{bytes}") +
  " \\;\\approx\\; " +
  hl("gb", "1\\ \\text{GB}");

export const KVPracticalExample: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [16, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const resultOpacity = interpolate(frame, [230, 270], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOpacity = interpolate(frame, [310, 350], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="A real model" duration={KV_PRACTICAL_DURATION} enterDelay={0}>
      <LeadLine text="Let's make it concrete" y={282} start={8} />

      {/* Model card */}
      <div style={{ position: "absolute", left: 0, top: 344, width: 1920, textAlign: "center", opacity: cardOpacity }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 20, padding: "22px 40px", borderRadius: 22, background: AP_COLORS.surface, border: `1.5px solid ${AP_COLORS.accentBorder}`, boxShadow: AP_COLORS.cardShadow }}>
          <span style={{ color: AP_COLORS.textPrimary, fontSize: 58, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: AP_FONTS.sans }}>
            Llama 3.1&nbsp;8B
          </span>
          <span style={{ padding: "8px 18px", borderRadius: 999, background: AP_COLORS.keyBg, border: `1.5px solid ${AP_COLORS.key}`, color: AP_COLORS.key, fontSize: 26, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
            GQA
          </span>
        </div>
        <div style={{ marginTop: 24, color: AP_COLORS.textSecondary, fontSize: 30, fontWeight: 600, fontFamily: AP_FONTS.sans, textShadow: AP_COLORS.textShadow }}>
          <span style={{ color: AP_COLORS.accent, fontWeight: 700 }}>32</span> layers ·{" "}
          <span style={{ color: AP_COLORS.query, fontWeight: 700 }}>32</span> Q heads /{" "}
          <span style={{ color: AP_COLORS.value, fontWeight: 700 }}>8</span> KV heads ·{" "}
          <span style={{ color: AP_COLORS.key, fontWeight: 700 }}>128k</span> context
        </div>
      </div>

      {/* KV-cache size for one sequence */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 566,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.accent,
          fontSize: 28,
          fontWeight: 700,
          fontFamily: AP_FONTS.sans,
          opacity: labelOpacity,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        one 8k-token sequence
      </div>

      <Equation
        tex={SIZE_TEX}
        size={46}
        y={616}
        start={96}
        highlights={[
          { id: "two", color: AP_COLORS.negative, start: 120 },
          { id: "layers", color: AP_COLORS.accent, start: 132 },
          { id: "tokens", color: AP_COLORS.key, start: 144 },
          { id: "heads", color: AP_COLORS.value, start: 156 },
          { id: "dim", color: AP_COLORS.query, start: 168 },
          { id: "bytes", color: AP_COLORS.textSecondary, start: 180 },
          { id: "gb", color: AP_COLORS.textPrimary, start: 210 },
        ]}
      />

      {/* Memory bar + concurrent-request note */}
      <div style={{ position: "absolute", left: 0, top: 748, width: 1920, opacity: resultOpacity }}>
        <MemBar
          x={480}
          y={0}
          width={960}
          height={26}
          fill={0.95}
          color={AP_COLORS.negative}
          label="KV cache for a single 8k-token request"
          appearDelay={230}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 848,
          width: 1920,
          textAlign: "center",
          opacity: noteOpacity,
          color: AP_COLORS.textPrimary,
          fontSize: 34,
          fontWeight: 700,
          fontFamily: AP_FONTS.sans,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        …and every concurrent request needs its <span style={{ color: AP_COLORS.negative }}>own</span>
      </div>
    </SceneShell>
  );
};
