import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_PER_LAYER_DURATION = 540; // 18.0s

const LAYERS = [
  { label: "Layer 1", y: 300 },
  { label: "Layer 2", y: 445 },
  { label: "Layer 3", y: 590 },
  { label: "…", y: 735 },
  { label: "Layer L", y: 880 },
];

export const KVPerLayer: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteOpacity = interpolate(frame, [120, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="Per layer" duration={KV_PER_LAYER_DURATION} enterDelay={0}>
      <LeadLine text="Every attention layer keeps its own cache" y={220} start={8} />

      {LAYERS.map((l, i) => (
        <div key={l.label} style={{ opacity: cardOpacity, position: "absolute", left: 560, top: l.y, width: 800, padding: "18px 22px", borderRadius: 16, background: AP_COLORS.surface, border: `1.5px solid ${AP_COLORS.surfaceBorderActive}`, boxShadow: AP_COLORS.cardShadowSoft }}>
          <div style={{ color: AP_COLORS.textPrimary, fontSize: 24, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
            {l.label}{" "}
            <span style={{ color: AP_COLORS.accent, fontFamily: "inherit" }}>· its own KV cache</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {Array.from({ length: 5 }, (_, s) => (
              <div key={s} style={{ width: 60, height: 42, borderRadius: 9, background: "rgba(255,255,255,0.02)", border: `1.5px solid ${i === 0 ? AP_COLORS.key : AP_COLORS.value}`, color: i === 0 ? AP_COLORS.key : AP_COLORS.value, fontSize: 15, fontWeight: 700, fontFamily: AP_FONTS.mono, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", lineHeight: 1 }}>
                <span>K</span>
                <span style={{ marginTop: 2 }}>V</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Flow arrows between layers */}
      {LAYERS.slice(0, -1).map((l, i) => (
        <FlowArrow key={i} x1={560} y1={l.y + 96} x2={560} y2={LAYERS[i + 1].y - 14} color={AP_COLORS.accent} appearDelay={70 + i * 20} thickness={3} />
      ))}

      <div style={{ position: "absolute", left: 0, top: 176, width: 1920, textAlign: "center", opacity: noteOpacity, color: AP_COLORS.textSecondary, fontSize: 26, fontWeight: 500, fontFamily: AP_FONTS.sans }}>
        a token's representation at layer 1 ≠ layer 20 → so its K, V differ too
      </div>
    </SceneShell>
  );
};
