import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { MathText, MVar } from "../../components/shared/MathText";
import { MemBar } from "../../components/kv/MemBar";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_PRACTICAL_DURATION = 720; // 24.0s

const Sep: React.FC = () => (
  <span style={{ margin: "0 16px", color: AP_COLORS.textMuted, fontWeight: 700 }}>·</span>
);
const BigSep: React.FC = () => (
  <span style={{ width: 40, display: "inline-block" }} />
);

export const KVPracticalExample: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const formulaOpacity = interpolate(frame, [100, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const resultOpacity = interpolate(frame, [200, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOpacity = interpolate(frame, [320, 380], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="A real model" duration={KV_PRACTICAL_DURATION} enterDelay={0}>
      <LeadLine text="Let's make it concrete" y={300} start={8} />

      {/* Model card */}
      <div style={{ position: "absolute", left: 0, top: 356, width: 1920, textAlign: "center", opacity: cardOpacity }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 20, padding: "22px 40px", borderRadius: 22, background: AP_COLORS.surface, border: `1.5px solid ${AP_COLORS.accentBorder}`, boxShadow: AP_COLORS.cardShadow }}>
          <span style={{ color: AP_COLORS.textPrimary, fontSize: 50, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: AP_FONTS.sans }}>
            Llama 3.1&nbsp;8B
          </span>
          <span style={{ padding: "8px 18px", borderRadius: 999, background: `${AP_COLORS.key}22`, border: `1.5px solid ${AP_COLORS.key}`, color: AP_COLORS.key, fontSize: 24, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
            GQA
          </span>
        </div>
        <div style={{ marginTop: 26, color: AP_COLORS.textSecondary, fontSize: 26, fontWeight: 600, fontFamily: AP_FONTS.sans }}>
          <span style={{ color: AP_COLORS.accent, fontWeight: 700 }}>32</span> layers ·{" "}
          <span style={{ color: AP_COLORS.query, fontWeight: 700 }}>32</span> Q heads /{" "}
          <span style={{ color: AP_COLORS.value, fontWeight: 700 }}>8</span> KV heads ·{" "}
          <span style={{ color: AP_COLORS.key, fontWeight: 700 }}>128k</span> context
        </div>
      </div>

      {/* KV-cache size for one sequence */}
      <div style={{ position: "absolute", left: 0, top: 590, width: 1920, textAlign: "center", opacity: formulaOpacity }}>
        <div style={{ color: AP_COLORS.accent, fontSize: 26, fontWeight: 700, marginBottom: 26, fontFamily: AP_FONTS.sans }}>
          one 8k-token sequence
        </div>
        <MathText size={44}>
          <MVar color={AP_COLORS.negative}>2</MVar>
          <Sep />
          <MVar color={AP_COLORS.accent}>32</MVar>
          <Sep />
          <MVar color={AP_COLORS.key}>8192</MVar>
          <Sep />
          <MVar color={AP_COLORS.value}>8</MVar>
          <Sep />
          <MVar color={AP_COLORS.query}>128</MVar>
          <Sep />
          <MVar color={AP_COLORS.textSecondary}>2 bytes</MVar>
          <BigSep />
          <MVar color={AP_COLORS.textPrimary}>≈ 1 GB</MVar>
        </MathText>
      </div>

      {/* Memory bar + concurrent-request note */}
      <div style={{ position: "absolute", left: 0, top: 700, width: 1920, opacity: resultOpacity }}>
        <MemBar x={480} y={0} width={960} height={26} fill={0.95} color={AP_COLORS.negative} label="KV cache for a single 8k-token request" appearDelay={200} />
      </div>

      <div style={{ position: "absolute", left: 0, top: 790, width: 1920, textAlign: "center", opacity: noteOpacity, color: AP_COLORS.textPrimary, fontSize: 30, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
        …and every concurrent request needs its <span style={{ color: AP_COLORS.negative }}>own</span>
      </div>
    </SceneShell>
  );
};
