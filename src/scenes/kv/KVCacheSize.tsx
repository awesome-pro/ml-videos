import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { MathText, MVar, MSub } from "../../components/shared/MathText";
import { MemBar } from "../../components/kv/MemBar";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_SIZE_DURATION = 660; // 22.0s

export const KVCacheSize: React.FC = () => {
  const frame = useCurrentFrame();

  const f1 = interpolate(frame, [40, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f2 = interpolate(frame, [120, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f3 = interpolate(frame, [240, 290], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f4 = interpolate(frame, [340, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="How big does it get?" duration={KV_SIZE_DURATION} enterDelay={0}>
      <LeadLine text="The cache grows with the sequence, the layers, and the heads" y={300} start={8} />

      {/* Proportional formula */}
      <div style={{ position: "absolute", left: 0, top: 380, width: 1920, opacity: f1 }}>
        <MathText size={56}>
          <MVar color={AP_COLORS.textPrimary}>KV memory</MVar>
          <MVar color={AP_COLORS.textMuted}> ∝ </MVar>
          <MVar color={AP_COLORS.negative}>2</MVar>
          <MVar color={AP_COLORS.textMuted}> · </MVar>
          <MVar color={AP_COLORS.accent}>L</MVar>
          <MVar color={AP_COLORS.textMuted}> · </MVar>
          <MVar color={AP_COLORS.key}>T</MVar>
          <MVar color={AP_COLORS.textMuted}> · </MVar>
          <MVar color={AP_COLORS.value}>H</MVar>
          <MSub color={AP_COLORS.value}>kv</MSub>
          <MVar color={AP_COLORS.textMuted}> · </MVar>
          <MVar color={AP_COLORS.query}>d</MVar>
          <MVar color={AP_COLORS.textMuted}> · </MVar>
          <MVar color={AP_COLORS.textSecondary}>bytes</MVar>
        </MathText>
      </div>

      {/* Meaning row */}
      <div style={{ position: "absolute", left: 0, top: 500, width: 1920, opacity: f2 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 34 }}>
          <Term color={AP_COLORS.accent} label="layers" />
          <Term color={AP_COLORS.key} label="tokens" />
          <Term color={AP_COLORS.value} label="KV heads" />
          <Term color={AP_COLORS.query} label="head dim" />
          <Term color={AP_COLORS.negative} label="×2  (K and V)" />
        </div>
      </div>

      {/* Intuition: context ×2 → cache ×2 */}
      <div style={{ position: "absolute", left: 0, top: 620, width: 1920, opacity: f3 }}>
        <div style={{ textAlign: "center", color: AP_COLORS.textSecondary, fontSize: 24, fontWeight: 600, fontFamily: AP_FONTS.sans, marginBottom: 22 }}>
          twice the context → roughly twice the cache
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, top: 690, width: 1920, opacity: f4 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 120 }}>
          <MemBar x={520} y={20} width={360} height={20} fill={0.3} color={AP_COLORS.key} label="1× context" appearDelay={360} />
          <MemBar x={1040} y={20} width={360} height={20} fill={0.6} color={AP_COLORS.value} label="2× context" appearDelay={390} />
        </div>
      </div>
    </SceneShell>
  );
};

const Term: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div style={{ padding: "14px 24px", borderRadius: 999, background: AP_COLORS.surface, border: `1.5px solid ${color}`, color, fontSize: 24, fontWeight: 700, fontFamily: AP_FONTS.sans, boxShadow: AP_COLORS.cardShadowSoft }}>
    {label}
  </div>
);
