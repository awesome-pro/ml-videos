import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { ScoreGrid } from "../../components/shared/ScoreGrid";
import { AP_COLORS } from "../../components/shared/theme";
import { LeadLine } from "../../components/shared/ui";

export const SCENE_13_DURATION = 720; // 24.0s

const N = 6;
const TOKENS = ["1", "2", "3", "4", "5", "6"];
const CELL = 58;
const GAP = 6;
const GRID_X = 960 - (N * (CELL + GAP) - GAP) / 2;
const GRID_Y = 480;
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
      // Allowed cells: diagonal-ish scores; blocked cells given a nominal value.
      rowVals.push(c === r ? 0.9 : c < r ? 0.45 : 0.5);
    }
    values.push(rowVals);
    masked.push(rowMask);
  }

  const highlightOpacity = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const noteOpacity = interpolate(frame, [300, 324], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hlY = GRID_Y + HIGHLIGHT_ROW * (CELL + GAP);
  const hlWidth = (HIGHLIGHT_ROW + 1) * (CELL + GAP) - GAP + 16;

  return (
    <SceneShell kicker="Causal mask (decoder-only)" duration={SCENE_13_DURATION} enterDelay={0}>
      <LeadLine text="No peeking at the future." y={340} start={10} />

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
        appearDelay={40}
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

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 862,
          width: 1920,
          textAlign: "center",
          opacity: noteOpacity,
          transform: `translateY(${12 - noteOpacity * 12}px)`,
        }}
      >
        <span style={{ color: AP_COLORS.textPrimary, fontSize: 34, fontWeight: 700 }}>
          Token 5 attends to 1–5,
        </span>
        <span style={{ color: AP_COLORS.negative, fontSize: 34, fontWeight: 700 }}> not to 6.</span>
      </div>
    </SceneShell>
  );
};
