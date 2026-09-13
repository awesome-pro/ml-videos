import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { BANK_1 } from "./examples";
import { LeadLine } from "../../components/shared/ui";

export const SCENE_TOKENS_TO_IDS_DURATION = 320; // 10.7s — words → token IDs

// Deterministic pseudo-IDs (never random).
const TOKEN_IDS = [97, 41, 12, 76, 182, 40];

export const SceneTokensToIDs: React.FC = () => {
  const frame = useCurrentFrame();

  const idsOpacity = interpolate(frame, [160, 182], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="From words to math" duration={SCENE_TOKENS_TO_IDS_DURATION} enterDelay={0}>
      <LeadLine text="A model can’t read words — it reads numbers." y={314} start={8} />

      {/* Words (input) */}
      <div style={{ position: "absolute", left: 0, top: 414, width: 1920, display: "flex", justifyContent: "center", gap: 14 }}>
        {BANK_1.map((w, i) => (
          <div
            key={i}
            style={{
              padding: "16px 22px",
              borderRadius: 12,
              background: AP_COLORS.surfaceRaised,
              border: `1.5px solid ${AP_COLORS.surfaceBorderActive}`,
              color: AP_COLORS.textPrimary,
              fontSize: 34,
              fontWeight: 600,
              fontFamily: AP_FONTS.sans,
              opacity: interpolate(frame - (18 + i * 3), [0, 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {w}
          </div>
        ))}
      </div>

      <DownArrow y={506} start={104} />

      <StageLabel text="TOKENIZER" y={566} color={AP_COLORS.accent} opacity={interpolate(frame, [128, 144], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />

      {/* Token IDs */}
      <div style={{ position: "absolute", left: 0, top: 612, width: 1920, display: "flex", justifyContent: "center", gap: 14, opacity: idsOpacity }}>
        {TOKEN_IDS.map((id, i) => (
          <div
            key={i}
            style={{
              padding: "14px 22px",
              borderRadius: 12,
              background: AP_COLORS.surface,
              border: `1.5px solid ${AP_COLORS.accentBorder}`,
              color: AP_COLORS.accent,
              fontSize: 30,
              fontWeight: 700,
              fontFamily: AP_FONTS.mono,
              opacity: interpolate(frame - (164 + i * 3), [0, 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {id}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 726,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 28,
          opacity: interpolate(frame, [240, 264], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        each word → a <span style={{ color: AP_COLORS.accent }}>token ID</span> (its number in the vocabulary)
      </div>
    </SceneShell>
  );
};

const StageLabel: React.FC<{ text: string; y: number; opacity: number; color: string }> = ({ text, y, opacity, color }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1920,
        textAlign: "center",
        color,
        fontSize: 23,
        fontWeight: 700,
        letterSpacing: "0.2em",
        opacity,
      }}
    >
      {text}
    </div>
  );
};

const DownArrow: React.FC<{ y: number; start: number }> = ({ y, start }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - start, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <line x1={960} y1={y} x2={960} y2={y + 26} stroke={AP_COLORS.textMuted} strokeWidth={3} opacity={o} />
      <polygon points={`960,${y + 40} 948,${y + 22} 972,${y + 22}`} fill={AP_COLORS.textMuted} opacity={o} />
    </svg>
  );
};
