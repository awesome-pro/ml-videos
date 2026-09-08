import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { BANK_1 } from "./examples";

export const SCENE_10_DURATION = 600; // 20.0s

// Deterministic pseudo-IDs and vector values (never random).
const TOKEN_IDS = [97, 41, 12, 76, 182, 40];
const VECTORS: number[][] = [
  [0.2, -0.4, 0.9, -0.1],
  [0.6, 0.3, -0.7, 0.2],
  [-0.3, 0.8, 0.1, 0.5],
  [0.4, -0.2, 0.7, -0.6],
  [0.9, 0.1, -0.4, 0.3],
  [-0.5, 0.6, 0.2, 0.8],
];

export const Scene10_TokensToVectors: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stage1 = spring({ frame: frame - 8, fps, config: { mass: 0.8, damping: 17, stiffness: 100 } });
  const stage2 = spring({ frame: frame - 150, fps, config: { mass: 0.8, damping: 17, stiffness: 100 } });
  const stage3 = spring({ frame: frame - 250, fps, config: { mass: 0.8, damping: 17, stiffness: 100 } });

  return (
    <SceneShell kicker="From words to math" duration={SCENE_10_DURATION} enterDelay={0}>
      <StageLabel text="INPUT" y={330} opacity={interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={AP_COLORS.textMuted} />

      {/* Stage 1: tokens */}
      <div style={{ position: "absolute", left: 0, top: 372, width: 1920, display: "flex", justifyContent: "center", gap: 14, opacity: stage1, transform: `translateY(${18 * (1 - stage1)}px)` }}>
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
            }}
          >
            {w}
          </div>
        ))}
      </div>

      <DownArrow y={482} start={120} />

      {/* Stage 2: token IDs */}
      <StageLabel text="TOKENIZER" y={510} opacity={interpolate(frame, [150, 164], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={AP_COLORS.accent} />
      <div style={{ position: "absolute", left: 0, top: 552, width: 1920, display: "flex", justifyContent: "center", gap: 14, opacity: stage2, transform: `translateY(${18 * (1 - stage2)}px)` }}>
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
            }}
          >
            {id}
          </div>
        ))}
      </div>

      <DownArrow y={662} start={220} />

      {/* Stage 3: vectors */}
      <StageLabel text="EMBEDDING" y={690} opacity={interpolate(frame, [250, 264], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} color={AP_COLORS.value} />
      <div style={{ position: "absolute", left: 0, top: 732, width: 1920, display: "flex", justifyContent: "center", gap: 18, opacity: stage3, transform: `translateY(${18 * (1 - stage3)}px)` }}>
        {VECTORS.map((v, i) => (
          <VectorBox key={i} values={v} />
        ))}
      </div>

      <div style={{ position: "absolute", left: 0, top: 900, width: 1920, textAlign: "center", color: AP_COLORS.textSecondary, fontSize: 28, opacity: interpolate(frame, [330, 354], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), fontFamily: AP_FONTS.sans }}>
        each token → a vector, a list of numbers
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

const VectorBox: React.FC<{ values: number[] }> = ({ values }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: 10,
        borderRadius: 12,
        background: AP_COLORS.surface,
        border: `1.5px solid ${AP_COLORS.valueBorder}`,
      }}
    >
      {values.map((v, i) => (
        <div key={i} style={{ width: 34, height: 20, borderRadius: 5, background: AP_COLORS.value, opacity: 0.25 + Math.abs(v) * 0.75 }} />
      ))}
    </div>
  );
};
