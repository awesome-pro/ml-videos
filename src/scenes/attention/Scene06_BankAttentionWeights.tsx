import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { BANK_1 } from "./examples";
import { AP_COLORS } from "../../components/shared/theme";
import { LeadLine, Tag } from "../../components/shared/ui";

export const SCENE_06_DURATION = 720; // 24.0s

const BANK_INDEX = 5;
const ROW_Y = 520;
const LEAD_Y = 332;
const BAR_MAX_H = 190;
// Relative "relevance to bank" for each token (river is the strong one).
const WEIGHTS = [0.3, 0.36, 0.24, 0.2, 0.95, 0.7];

export const Scene06_BankAttentionWeights: React.FC = () => {
  const frame = useCurrentFrame();
  const row = layoutTokenRow(BANK_1, { fontSize: 32 });
  const cardH = cardHeightFor(32);

  const resultOpacity = interpolate(frame, [380, 406], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="Scoring the context" duration={SCENE_06_DURATION} enterDelay={0}>
      <LeadLine text="bank asks: how relevant is each token?" y={LEAD_Y} start={12} />

      {row.centers.map((cx, i) => (
        <TokenCard
          key={`t-${i}`}
          label={BANK_1[i]}
          x={cx}
          y={ROW_Y}
          width={row.widths[i]}
          height={cardH}
          variant={i === BANK_INDEX ? "query" : "neutral"}
          fontSize={32}
          appearDelay={24 + i * 3}
        />
      ))}

      {/* Weight bars */}
      {row.centers.map((cx, i) => {
        if (i === BANK_INDEX) return null;
        return (
          <WeightBar key={`b-${i}`} x={cx} weight={WEIGHTS[i]} start={150 + i * 12} maxH={BAR_MAX_H} color={AP_COLORS.accent} />
        );
      })}

      {/* Attention arcs bank -> others (thickness = weight) */}
      {row.centers.map((cx, i) => {
        if (i === BANK_INDEX) return null;
        return (
          <AttentionArc
            key={`a-${i}`}
            x1={row.centers[BANK_INDEX]}
            y1={ROW_Y - cardH / 2}
            x2={cx}
            y2={ROW_Y - cardH / 2}
            weight={WEIGHTS[i]}
            color={AP_COLORS.accent}
            appearDelay={210 + i * 12}
            apexLift={92}
          />
        );
      })}

      <Tag text="strong attention" x={row.centers[4]} y={828} start={330} color={AP_COLORS.accent} />

      {/* Updated representation */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 884,
          width: 1920,
          textAlign: "center",
          opacity: resultOpacity,
          transform: `translateY(${16 - resultOpacity * 16}px)`,
        }}
      >
        <div
          style={{
            color: AP_COLORS.textSecondary,
            fontSize: 25,
            fontWeight: 600,
            letterSpacing: "0.1em",
            marginBottom: 14,
          }}
        >
          UPDATED REPRESENTATION OF “bank”
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {[0.62, 0.35, 0.55, 0.9, 0.48, 0.72, 0.3, 0.66].map((v, i) => (
            <div
              key={i}
              style={{
                width: 34,
                height: 56,
                borderRadius: 7,
                background: AP_COLORS.accent,
                opacity: v * 0.85,
                border: `1.5px solid ${AP_COLORS.accentBorder}`,
              }}
            />
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const WeightBar: React.FC<{
  x: number;
  weight: number;
  start: number;
  maxH: number;
  color: string;
}> = ({ x, weight, start, maxH, color }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame - start, [0, 22], [0, weight], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const h = grow * maxH;
  const bottom = 800;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 23,
        top: bottom - h,
        width: 46,
        height: h,
        borderRadius: 8,
        background: color,
        opacity: 0.45 + grow * 0.5,
        border: `1.5px solid ${color}`,
      }}
    />
  );
};
