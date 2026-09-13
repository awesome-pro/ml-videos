import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { ScoreGrid } from "../../components/shared/ScoreGrid";
import { AP_COLORS } from "../../components/shared/theme";
import { LeadLine } from "../../components/shared/ui";

export const SCENE_13_DURATION = 400; // 13.3s — explain the causal mask

const N = 6;
const TOKENS = ["1", "2", "3", "4", "5", "6"];
const CELL = 52;
const GAP = 5;
const GRID_X = 960 - (N * (CELL + GAP) - GAP) / 2;
const GRID_Y = 368;
const HIGHLIGHT_ROW = 4; // token 5

export const Scene13_CausalMask: React.FC = () => {
  const frame = useCurrentFrame();

  const values: number[][] = [];
  const masked: boolean[][] = [];
  for (let r = 0; r < N; r++) {
    const rowVals: number[] = [];
    const rowMask: boolean[] = [];
    for (let c = 0; c < N; c++) {
      rowMask.push(c > r); // future tokens are blocked
      rowVals.push(c === r ? 0.9 : c < r ? 0.45 : 0.5);
    }
    values.push(rowVals);
    masked.push(rowMask);
  }

  const highlightOpacity = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blockOpacity = interpolate(frame, [200, 224], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const minusOpacity = interpolate(frame, [254, 278], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const whyOpacity = interpolate(frame, [310, 334], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hlY = GRID_Y + HIGHLIGHT_ROW * (CELL + GAP);
  const hlWidth = (HIGHLIGHT_ROW + 1) * (CELL + GAP) - GAP + 16;

  return (
    <SceneShell kicker="The causal mask" duration={SCENE_13_DURATION} enterDelay={0}>
      <LeadLine text="A token can’t see the tokens that come after it." y={290} start={8} />

      {/* the score grid, upper triangle masked (rose ✕) */}
      <ScoreGrid
        rows={N}
        cols={N}
        values={values}
        masked={masked}
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

      {/* Highlight the current (query) token row */}
      <div
        style={{
          position: "absolute",
          left: GRID_X - 8,
          top: hlY - 8,
          width: hlWidth,
          height: CELL + 16,
          borderRadius: 14,
          border: `2px solid ${AP_COLORS.query}`,
          boxShadow: "0 0 24px rgba(109,139,255,0.25)",
          opacity: highlightOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Explanation */}
      <div style={{ position: "absolute", left: 0, top: 742, width: 1920, textAlign: "center", opacity: blockOpacity, transform: `translateY(${10 - blockOpacity * 10}px)` }}>
        <span style={{ color: AP_COLORS.negative }}>the rose cells are the future → masked (blocked)</span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 788, width: 1920, textAlign: "center", opacity: minusOpacity, transform: `translateY(${10 - minusOpacity * 10}px)` }}>
        <span style={{ color: AP_COLORS.textPrimary }}>a masked score = −∞</span>
        <span style={{ color: AP_COLORS.textSecondary }}>, so softmax gives it weight 0.</span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 834, width: 1920, textAlign: "center", opacity: whyOpacity }}>
        <span style={{ color: AP_COLORS.textPrimary, fontWeight: 700 }}>Token 5 is written before token 6 — it must never see 6.</span>
      </div>
    </SceneShell>
  );
};
