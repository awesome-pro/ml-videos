import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { ScoreGrid } from "../../components/shared/ScoreGrid";
import { MathText, MVar, MSup, MSub } from "../../components/shared/MathText";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const SCENE_12_DURATION = 400; // 13.3s — Q·Kᵀ → scores, with ÷√d_k explained

const TOKENS = ["I", "sat", "river", "bank"];
const RAW_SCORES = [
  [0.62, 0.4, 0.3, 0.36],
  [0.4, 0.82, 0.52, 0.3],
  [0.3, 0.5, 0.88, 0.74],
  [0.34, 0.3, 0.9, 0.84],
];

const CELL = 66;
const GAP = 6;
const GRID_X = 960 - (4 * (CELL + GAP) - GAP) / 2;
const GRID_Y = 500;

export const Scene12_ScoresAndScale: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 2: apply ÷√d_k — scores visibly shrink.
  const shrink = interpolate(frame, [280, 328], [1, 0.66], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const values = RAW_SCORES.map((r) => r.map((v) => v * shrink));

  const formulaOpacity = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const leadOpacity = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const captionOpacity = interpolate(frame, [236, 258], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleOpacity = interpolate(frame, [300, 326], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Strong bank → river cell (row 3 = bank, col 2 = river).
  const strongCx = GRID_X + 2 * (CELL + GAP) + CELL / 2;
  const strongCy = GRID_Y + 3 * (CELL + GAP) + CELL / 2;

  return (
    <SceneShell kicker="Matching queries to keys" duration={SCENE_12_DURATION} enterDelay={0}>
      <Lead text="Q · K stands for — how much does this query match that key?" y={312} opacity={leadOpacity} />

      {/* Step 1 formula */}
      <div style={{ position: "absolute", left: 0, top: 360, width: 1920, opacity: formulaOpacity }}>
        <MathText size={52} align="center">
          <MVar color={AP_COLORS.query}>Q</MVar>
          <MVar color={AP_COLORS.key}>K</MVar>
          <MSup>T</MSup>
          <span>&nbsp;&nbsp;→&nbsp;&nbsp; scores</span>
        </MathText>
      </div>

      {/* Score matrix with real numbers */}
      <ScoreGrid
        rows={4}
        cols={4}
        values={values}
        rowLabels={TOKENS}
        colLabels={TOKENS}
        x={GRID_X}
        y={GRID_Y}
        cell={CELL}
        gap={GAP}
        color={AP_COLORS.accent}
        appearDelay={60}
        showValues
        valueFormat={(v) => v.toFixed(2)}
      />

      {/* Highlight bank → river */}
      <div
        style={{
          position: "absolute",
          left: strongCx,
          top: strongCy,
          transform: "translate(-50%, -50%)",
          width: CELL,
          height: CELL,
          borderRadius: 9,
          border: `3px solid ${AP_COLORS.accent}`,
          boxShadow: "0 0 24px rgba(154,123,255,0.4)",
          pointerEvents: "none",
          opacity: interpolate(frame, [210, 232], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      <div style={{ position: "absolute", left: 0, top: GRID_Y + 4 * (CELL + GAP) + 12, width: 1920, textAlign: "center", color: AP_COLORS.textSecondary, fontSize: 24, opacity: captionOpacity }}>
        <span style={{ color: AP_COLORS.accent, fontWeight: 700 }}>bank ↔ river</span> scores highest
      </div>

      {/* Step 2: ÷√d_k, with the why */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 838,
          width: 1920,
          textAlign: "center",
          opacity: scaleOpacity,
          transform: `translateY(${12 - scaleOpacity * 12}px)`,
        }}
      >
        <MathText size={40} align="center">
          <span>&nbsp;÷&nbsp;√d</span>
          <MSub color={AP_COLORS.value}>k</MSub>
        </MathText>
        <div
          style={{
            color: AP_COLORS.textSecondary,
            fontSize: 25,
            fontWeight: 500,
            maxWidth: 1120,
            margin: "10px auto 0",
            lineHeight: 1.4,
          }}
        >
          Big dot products make softmax too sharp (one token dominates). Dividing by{" "}
          <span style={{ color: AP_COLORS.value }}>√d_k</span> keeps the scores in a stable range.
        </div>
        <div style={{ color: AP_COLORS.textMuted, fontSize: 22, fontFamily: AP_FONTS.mono, marginTop: 10 }}>
          e.g. 12.1 ÷ √9 = 4.0
        </div>
      </div>
    </SceneShell>
  );
};

// Small fade-in line (avoids needing the full LeadLine offset behaviour).
const Lead: React.FC<{ text: string; y: number; opacity: number }> = ({ text, y, opacity }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1920,
        textAlign: "center",
        color: AP_COLORS.textSecondary,
        fontSize: 28,
        fontWeight: 500,
        opacity,
        padding: "0 140px",
      }}
    >
      {text}
    </div>
  );
};
