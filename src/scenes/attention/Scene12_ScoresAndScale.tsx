import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { ScoreGrid } from "../../components/shared/ScoreGrid";
import { MathText, MVar, MSup, MSub } from "../../components/shared/MathText";
import { AP_COLORS } from "../../components/shared/theme";
import { Tag } from "../../components/shared/ui";

export const SCENE_12_DURATION = 780; // 26.0s

const TOKENS = ["I", "sat", "river", "bank"];
const RAW_SCORES = [
  [0.6, 0.3, 0.2, 0.3],
  [0.3, 0.9, 0.5, 0.2],
  [0.2, 0.4, 0.9, 0.7],
  [0.25, 0.2, 0.8, 0.9],
];

const CELL = 66;
const GAP = 6;
const GRID_X = 960 - (4 * (CELL + GAP) - GAP) / 2;
const GRID_Y = 520;

export const Scene12_ScoresAndScale: React.FC = () => {
  const frame = useCurrentFrame();

  // Shrink the scores as we apply the /sqrt(dk) scaling.
  const shrink = interpolate(frame, [300, 344], [1, 0.66], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const values = RAW_SCORES.map((r) => r.map((v) => v * shrink));

  const formulaOpacity = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scaleOpacity = interpolate(frame, [300, 320], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const whyOpacity = interpolate(frame, [320, 348], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="Matching queries to keys" duration={SCENE_12_DURATION} enterDelay={0}>
      {/* Formula */}
      <div style={{ position: "absolute", left: 0, top: 350, width: 1920, opacity: formulaOpacity }}>
        <MathText size={54} align="center">
          <MVar color={AP_COLORS.query}>Q</MVar>
          <MVar color={AP_COLORS.key}>K</MVar>
          <MSup>T</MSup>
          <span>&nbsp;&nbsp;→&nbsp;&nbsp; scores</span>
          <span style={{ color: AP_COLORS.textMuted }}>&nbsp;&nbsp;&nbsp;(</span>
          <MVar color={AP_COLORS.query}>Q</MVar>
          <MVar color={AP_COLORS.key}>K</MVar>
          <MSup>T</MSup>
          <span style={{ color: AP_COLORS.textMuted }}>&nbsp;/&nbsp;</span>
          <MVar color={AP_COLORS.value}>√d</MVar>
          <MSub color={AP_COLORS.value}>k</MSub>
          <span style={{ color: AP_COLORS.textMuted }}>)</span>
        </MathText>
      </div>

      {/* Score matrix */}
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
      />

      {/* Highlight the strong bank→river match */}
      <Tag
        text="strong match"
        x={1160}
        y={GRID_Y + 3 * (CELL + GAP) + CELL / 2}
        start={280}
        color={AP_COLORS.accent}
      />

      {/* Scaling note */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 806,
          width: 1920,
          textAlign: "center",
          opacity: scaleOpacity,
          transform: `translateY(${12 - scaleOpacity * 12}px)`,
        }}
      >
        <div style={{ color: AP_COLORS.textPrimary, fontSize: 32, fontWeight: 700 }}>÷ √d</div>
        <div
          style={{
            color: AP_COLORS.textSecondary,
            fontSize: 26,
            fontWeight: 500,
            maxWidth: 1100,
            margin: "12px auto 0",
            opacity: whyOpacity,
            lineHeight: 1.4,
          }}
        >
          Large dot products can make softmax too sharp. Dividing by{" "}
          <span style={{ color: AP_COLORS.value }}>√d_k</span> keeps the values in a stable range.
        </div>
      </div>
    </SceneShell>
  );
};
