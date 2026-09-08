import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot } from "../../components/kv/KvSlot";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_AS_MEMORY_DURATION = 480; // 16.0s

const SLOT_W = 132;
const SLOT_H = 58;
const GAP = 16;
const SLOT_Y = 560;

const WORDS = ["The", "capital", "of", "France", "is", "Paris"];

const CENTERS = Array.from({ length: 6 }, (_, i) => {
  const start = 960 - (6 * SLOT_W + 5 * GAP) / 2;
  return start + SLOT_W / 2 + i * (SLOT_W + GAP);
});

export const KVCacheAsMemory: React.FC = () => {
  const frame = useCurrentFrame();

  const notFacts = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const yesRemember = interpolate(frame, [160, 196], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const railOpacity = interpolate(frame, [40, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="What it is" duration={KV_AS_MEMORY_DURATION} enterDelay={0}>
      <LeadLine text="the KV cache is the attention mechanism's memory" y={300} start={8} />

      <div style={{ position: "absolute", left: 0, top: 372, width: 1920, textAlign: "center", opacity: railOpacity, color: AP_COLORS.textMuted, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", fontFamily: AP_FONTS.sans }}>
        THIS SEQUENCE'S RECENT TOKENS
      </div>

      {WORDS.map((w, i) => (
        <div key={i} style={{ opacity: railOpacity }}>
          <KvSlot index={i + 1} x={CENTERS[i]} y={SLOT_Y} width={SLOT_W} height={SLOT_H} appearDelay={50 + i * 8} />
          <div style={{ position: "absolute", left: CENTERS[i], top: SLOT_Y + 68, transform: "translateX(-50%)", color: AP_COLORS.textMuted, fontSize: 20, fontWeight: 500, opacity: railOpacity, fontFamily: AP_FONTS.sans }}>
            {w}
          </div>
        </div>
      ))}

      {/* Two annotations */}
      <div style={{ position: "absolute", left: 0, top: 720, width: 1920, display: "flex", justifyContent: "center", gap: 40 }}>
        <Pill color={AP_COLORS.negative} opacity={notFacts} text="not learned facts" line />
        <Pill color={AP_COLORS.key} opacity={yesRemember} text="tokens you just processed" />
      </div>
    </SceneShell>
  );
};

const Pill: React.FC<{ color: string; opacity: number; text: string; line?: boolean }> = ({ color, opacity, text, line }) => (
  <div
    style={{
      padding: "16px 34px",
      borderRadius: 999,
      background: `${color}18`,
      border: `1.5px solid ${color}`,
      color,
      fontSize: 26,
      fontWeight: 700,
      opacity,
      textDecoration: line ? "line-through" : "none",
      fontFamily: AP_FONTS.sans,
      boxShadow: AP_COLORS.cardShadowSoft,
    }}
  >
    {text}
  </div>
);
