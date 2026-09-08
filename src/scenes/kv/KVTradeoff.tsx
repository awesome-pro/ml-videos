import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_TRADEOFF_DURATION = 480; // 16.0s

export const KVTradeoff: React.FC = () => {
  const frame = useCurrentFrame();

  const o1 = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o2 = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o3 = interpolate(frame, [120, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="The trade-off" duration={KV_TRADEOFF_DURATION} enterDelay={0}>
      <LeadLine text="We trade one cost for another" y={300} start={8} />

      <div style={{ position: "absolute", left: 0, top: 420, width: 1920, display: "flex", justifyContent: "center", gap: 60 }}>
        <Panel color={AP_COLORS.value} direction="up" title="memory" opacity={o1} desc="store the past K, V" />
        <div style={{ alignSelf: "center", color: AP_COLORS.textMuted, fontSize: 48, fontWeight: 800, opacity: o2, fontFamily: AP_FONTS.sans }}>
          ⇅
        </div>
        <Panel color={AP_COLORS.key} direction="down" title="recomputation" opacity={o2} desc="stop recomputing the past" />
      </div>

      <div style={{ position: "absolute", left: 0, top: 760, width: 1920, textAlign: "center", opacity: o3, color: AP_COLORS.accent, fontSize: 30, fontWeight: 800, fontFamily: AP_FONTS.sans }}>
        more memory ⟹ far less repeated work
      </div>
    </SceneShell>
  );
};

const Panel: React.FC<{ color: string; direction: "up" | "down"; title: string; opacity: number; desc: string }> = ({ color, direction, title, opacity, desc }) => {
  return (
    <div style={{ position: "relative", width: 360, padding: "28px 24px", borderRadius: 18, background: AP_COLORS.surface, border: `1.5px solid ${color}`, boxShadow: AP_COLORS.cardShadow, opacity, textAlign: "center" }}>
      <div style={{ color: color, fontSize: 44, fontWeight: 800, marginBottom: 10, fontFamily: AP_FONTS.sans }}>
        {direction === "up" ? "↑" : "↓"}
      </div>
      <div style={{ color: AP_COLORS.textPrimary, fontSize: 30, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
        {title}
      </div>
      <div style={{ color: AP_COLORS.textSecondary, fontSize: 22, fontWeight: 500, marginTop: 8, fontFamily: AP_FONTS.sans }}>
        {desc}
      </div>
      {/* a small bar to visualize the direction */}
      <div style={{ height: 16, borderRadius: 999, marginTop: 20, background: "rgba(255,255,255,0.05)", overflow: "hidden", border: `1px solid ${color}` }}>
        <div style={{ height: 16, width: direction === "up" ? "92%" : "22%", borderRadius: 999, background: color, opacity: 0.75 }} />
      </div>
    </div>
  );
};
