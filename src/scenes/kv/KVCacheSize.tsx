import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { Equation, hl } from "../../components/math/Equation";
import { MemBar } from "../../components/kv/MemBar";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

// Animation ends ~350; +45 frames (1.5s) of buffer for the facecam take.
export const KV_SIZE_DURATION = 395;

/**
 * The cache-size relationship, typeset with KaTeX rather than monospace spans,
 * with each factor lighting up in turn so the eye follows the term being named.
 */
const MEMORY_TEX =
  "\\text{KV memory} \\;\\propto\\; " +
  hl("two", "2") +
  " \\cdot " +
  hl("l", "L") +
  " \\cdot " +
  hl("t", "T") +
  " \\cdot " +
  hl("h", "H_{kv}") +
  " \\cdot " +
  hl("d", "d") +
  " \\cdot " +
  hl("bytes", "\\text{bytes}");

export const KVCacheSize: React.FC = () => {
  const frame = useCurrentFrame();

  const f2 = interpolate(frame, [150, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f3 = interpolate(frame, [220, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f4 = interpolate(frame, [290, 340], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="How big does it get?" duration={KV_SIZE_DURATION} enterDelay={0}>
      <LeadLine text="The cache grows with the sequence, the layers, and the heads" y={288} start={8} />

      <Equation
        tex={MEMORY_TEX}
        size={58}
        y={370}
        start={30}
        highlights={[
          { id: "two", color: AP_COLORS.negative, start: 60 },
          { id: "l", color: AP_COLORS.accent, start: 72 },
          { id: "t", color: AP_COLORS.key, start: 84 },
          { id: "h", color: AP_COLORS.value, start: 96 },
          { id: "d", color: AP_COLORS.query, start: 108 },
          { id: "bytes", color: AP_COLORS.textSecondary, start: 120 },
        ]}
      />

      {/* What each factor means */}
      <div style={{ position: "absolute", left: 0, top: 510, width: 1920, opacity: f2 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 30 }}>
          <Term color={AP_COLORS.accent} label="layers" />
          <Term color={AP_COLORS.key} label="tokens" />
          <Term color={AP_COLORS.value} label="KV heads" />
          <Term color={AP_COLORS.query} label="head dim" />
          <Term color={AP_COLORS.negative} label="×2  (K and V)" />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 620,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 32,
          fontWeight: 600,
          fontFamily: AP_FONTS.sans,
          textShadow: AP_COLORS.textShadow,
          opacity: f3,
        }}
      >
        twice the context → roughly twice the cache
      </div>

      <div style={{ position: "absolute", left: 0, top: 710, width: 1920, opacity: f4 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 120 }}>
          <MemBar x={520} y={20} width={360} height={24} fill={0.3} color={AP_COLORS.key} label="1× context" appearDelay={300} />
          <MemBar x={1040} y={20} width={360} height={24} fill={0.6} color={AP_COLORS.value} label="2× context" appearDelay={330} />
        </div>
      </div>
    </SceneShell>
  );
};

const Term: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div
    style={{
      padding: "14px 24px",
      borderRadius: 999,
      background: AP_COLORS.surface,
      border: `1.5px solid ${color}`,
      color,
      fontSize: 26,
      fontWeight: 700,
      fontFamily: AP_FONTS.sans,
      textShadow: AP_COLORS.textShadow,
      boxShadow: AP_COLORS.cardShadowSoft,
    }}
  >
    {label}
  </div>
);
