import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { NumberVec } from "../../components/shared/NumberVec";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { BANK_1 } from "./examples";
import { AP_COLORS } from "../../components/shared/theme";
import { LeadLine, Tag } from "../../components/shared/ui";

export const SCENE_06_DURATION = 440; // 14.7s — trimmed tail, plus numbers

const BANK_INDEX = 5;
const ROW_Y = 480;
const LEAD_Y = 324;
const BAR_MAX_H = 170;
const BAR_BOTTOM = 740;
// Relative "relevance to bank" for each token (river is the strong one).
const WEIGHTS = [0.18, 0.24, 0.15, 0.1, 0.58, 0]; // index 5 (bank) unused
// bank's new context-aware representation, printed as real numbers.
const NEW_REP = [0.62, -0.2, 0.9, 0.1, 0.55, 0.72];

export const Scene06_BankAttentionWeights: React.FC = () => {
  const frame = useCurrentFrame();
  const row = layoutTokenRow(BANK_1, { fontSize: 32 });
  const cardH = cardHeightFor(32);

  const resultOpacity = interpolate(frame, [350, 376], [0, 1], {
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
            appearDelay={190 + i * 12}
            apexLift={92}
          />
        );
      })}

      {/* Weight bars, with the actual score under each */}
      {row.centers.map((cx, i) => {
        if (i === BANK_INDEX) return null;
        const isStrong = i === 4;
        return (
          <React.Fragment key={`b-${i}`}>
            <WeightBar x={cx} weight={WEIGHTS[i]} start={150 + i * 12} maxH={BAR_MAX_H} color={AP_COLORS.accent} bottom={BAR_BOTTOM} />
            <div
              style={{
                position: "absolute",
                left: cx,
                top: BAR_BOTTOM + 14,
                transform: "translateX(-50%)",
                color: isStrong ? AP_COLORS.accent : AP_COLORS.textMuted,
                fontSize: 26,
                fontWeight: 700,
                fontFamily: "inherit",
                opacity: interpolate(frame - (168 + i * 12), [0, 14], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {WEIGHTS[i].toFixed(2)}
            </div>
          </React.Fragment>
        );
      })}

      <Tag text="strong attention" x={row.centers[4]} y={596} start={300} color={AP_COLORS.accent} />

      {/* Updated representation — actual numbers */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 824,
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
            marginBottom: 18,
          }}
        >
          UPDATED REPRESENTATION OF “bank”
        </div>
      </div>
      <NumberVec
        values={NEW_REP}
        color={AP_COLORS.accent}
        x={960 - (NEW_REP.length * 54 + (NEW_REP.length - 1) * 6) / 2}
        y={876}
        cellW={54}
        cellH={44}
        gap={6}
        appearDelay={356}
        format={(v) => v.toFixed(1)}
      />
    </SceneShell>
  );
};

const WeightBar: React.FC<{
  x: number;
  weight: number;
  start: number;
  maxH: number;
  color: string;
  bottom: number;
}> = ({ x, weight, start, maxH, color, bottom }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame - start, [0, 22], [0, weight], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const h = grow * maxH;
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
