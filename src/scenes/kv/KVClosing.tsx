import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_CLOSING_DURATION = 480; // 16.0s

const LINES = [
  { text: "Store the past Keys and Values.", color: AP_COLORS.key },
  { text: "Reuse them for future tokens.", color: AP_COLORS.value },
  { text: "Only calculate the new ones.", color: AP_COLORS.accent },
];

export const KVClosing: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [10, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastOpacity = interpolate(frame, [220, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell duration={KV_CLOSING_DURATION} enterDelay={0}>
      <div style={{ position: "absolute", left: 0, top: 180, width: 1920, opacity: titleOpacity }}>
        <div style={{ color: AP_COLORS.accent, fontSize: 30, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", textAlign: "center", fontFamily: AP_FONTS.sans }}>
          KV cache
        </div>
      </div>

      {LINES.map((l, i) => {
        const o = interpolate(frame - (60 + i * 26), [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const y = 400 + i * 92;
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: y, width: 1920, textAlign: "center", opacity: o, color: l.color, fontSize: 54, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: AP_FONTS.sans }}>
            {l.text}
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 0, top: 780, width: 1920, textAlign: "center", opacity: lastOpacity }}>
        <span style={{ display: "inline-block", padding: "18px 44px", borderRadius: 999, background: AP_COLORS.accentBg, border: `1.5px solid ${AP_COLORS.accentBorder}`, color: AP_COLORS.accent, fontSize: 34, fontWeight: 800, fontFamily: AP_FONTS.sans }}>
          That is KV cache.
        </span>
      </div>
    </SceneShell>
  );
};
