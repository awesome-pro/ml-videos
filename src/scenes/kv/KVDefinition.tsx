import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot, KvWordLabel } from "../../components/kv/KvSlot";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_DEFINITION_DURATION = 240; // 16.0s

const SLOT_W = 132;
const SLOT_H = 58;
const GAP = 16;
const SLOT_Y = 600;

const WORDS = ["The", "capital", "of", "France", "is", "Paris"];

const CENTERS = Array.from({ length: 6 }, (_, i) => {
  const total = 6 * SLOT_W + 5 * GAP;
  const start = 960 - total / 2;
  return start + SLOT_W / 2 + i * (SLOT_W + GAP);
});

export const KVDefinition: React.FC = () => {
  const frame = useCurrentFrame();

  const o1 = interpolate(frame, [20, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o2 = interpolate(frame, [46, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o3 = interpolate(frame, [96, 122], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const railOpacity = interpolate(frame, [60, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="The core idea" duration={KV_DEFINITION_DURATION} enterDelay={0}>
      <div style={{ position: "absolute", left: 0, top: 300, width: 1920, textAlign: "center", opacity: o1 }}>
        <span style={{ color: AP_COLORS.textPrimary, fontSize: 52, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: AP_FONTS.sans }}>
          Store the past Keys and Values.
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 380, width: 1920, textAlign: "center", opacity: o2 }}>
        <span style={{ color: AP_COLORS.textSecondary, fontSize: 40, fontWeight: 700, letterSpacing: "-0.01em", fontFamily: AP_FONTS.sans }}>
          Reuse them for every future token.
        </span>
      </div>

      {/* A small illustration: computed once → kept and reused */}
      <div style={{ position: "absolute", left: 0, top: 470, width: 1920, textAlign: "center", opacity: railOpacity }}>
        <span style={{ color: AP_COLORS.textMuted, fontSize: 26, fontWeight: 700, letterSpacing: "0.22em", fontFamily: AP_FONTS.sans }}>
          THE KV CACHE
        </span>
      </div>

      {WORDS.map((w, i) => (
        <div key={i} style={{ opacity: railOpacity }}>
          <KvSlot index={i + 1} x={CENTERS[i]} y={SLOT_Y} width={SLOT_W} height={SLOT_H} appearDelay={70 + i * 8} />
          <KvWordLabel word={w} x={CENTERS[i]} y={664} appearDelay={80 + i * 8} />
        </div>
      ))}

      <FlowArrow x1={960} y1={SLOT_Y - 86} x2={960} y2={SLOT_Y - 10} color={AP_COLORS.accent} appearDelay={170} thickness={3} />

      <div style={{ position: "absolute", left: 0, top: 740, width: 1920, textAlign: "center", opacity: o3 }}>
        <span style={{ color: AP_COLORS.accent, fontSize: 30, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
          that's it — that is the KV cache
        </span>
      </div>
    </SceneShell>
  );
};
