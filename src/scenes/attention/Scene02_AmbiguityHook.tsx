import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AttentionArc } from "../../components/shared/AttentionArc";
import {
  cardHeightFor,
  layoutTokenRow,
} from "../../components/shared/layout";
import {
  ANIMAL_INDEX,
  ANIMAL_TIRED,
  ANIMAL_WIDE,
  IT_INDEX,
  STREET_INDEX,
} from "./examples";
import { AP_COLORS } from "../../components/shared/theme";

export const SCENE_02_DURATION = 660; // 22.0s

const ROW_1_Y = 500;
const ROW_2_Y = 770;

export const Scene02_AmbiguityHook: React.FC = () => {
  const row1 = layoutTokenRow(ANIMAL_TIRED, { fontSize: 30 });
  const row2 = layoutTokenRow(ANIMAL_WIDE, { fontSize: 30 });
  const cardH = cardHeightFor(30);

  const arc1Start = 120;
  const arc2Start = 140;
  const label1Start = arc1Start + 18;
  const label2Start = arc2Start + 18;

  return (
    <SceneShell kicker="The core problem" duration={SCENE_02_DURATION} enterDelay={0}>
      {/* Lead-in line */}
      <LeadLine
        text={<>Which word does “it” refer to?</>}
        y={316}
        start={0}
      />

      {/* Row 1 — too tired */}
      {row1.centers.map((cx, i) => (
        <TokenCard
          key={`r1-${i}`}
          label={ANIMAL_TIRED[i]}
          x={cx}
          y={ROW_1_Y}
          width={row1.widths[i]}
          height={cardH}
          variant={i === IT_INDEX ? "accent" : "neutral"}
          fontSize={30}
          appearDelay={16 + i * 3}
        />
      ))}
      <AttentionArc
        x1={row1.centers[IT_INDEX]}
        y1={ROW_1_Y - cardH / 2}
        x2={row1.centers[ANIMAL_INDEX]}
        y2={ROW_1_Y - cardH / 2}
        weight={0.85}
        color={AP_COLORS.accent}
        appearDelay={arc1Start}
        apexLift={100}
      />
      <ResolveLabel text="it = animal" x={row1.centers[ANIMAL_INDEX]} y={ROW_1_Y + cardH / 2 + 44} start={label1Start} color={AP_COLORS.accent} />

      {/* Row 2 — too wide */}
      {row2.centers.map((cx, i) => (
        <TokenCard
          key={`r2-${i}`}
          label={ANIMAL_WIDE[i]}
          x={cx}
          y={ROW_2_Y}
          width={row2.widths[i]}
          height={cardH}
          variant={i === IT_INDEX ? "accent" : "neutral"}
          fontSize={30}
          appearDelay={16 + i * 3}
        />
      ))}
      <AttentionArc
        x1={row2.centers[IT_INDEX]}
        y1={ROW_2_Y - cardH / 2}
        x2={row2.centers[STREET_INDEX]}
        y2={ROW_2_Y - cardH / 2}
        weight={0.85}
        color={AP_COLORS.accent}
        appearDelay={arc2Start}
        apexLift={90}
      />
      <ResolveLabel text="it = street" x={row2.centers[STREET_INDEX]} y={ROW_2_Y + cardH / 2 + 44} start={label2Start} color={AP_COLORS.accent} />
    </SceneShell>
  );
};

const LeadLine: React.FC<{ text: React.ReactNode; y: number; start: number }> = ({
  text,
  y,
  start,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - start, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1920,
        textAlign: "center",
        color: AP_COLORS.textSecondary,
        fontSize: 34,
        fontWeight: 500,
        opacity,
        transform: `translateY(${8 - opacity * 8}px)`,
      }}
    >
      {text}
    </div>
  );
};

const ResolveLabel: React.FC<{ text: string; x: number; y: number; start: number; color: string }> = ({
  text,
  x,
  y,
  start,
  color,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - start, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(opacity, [0, 1], [0.8, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        padding: "10px 22px",
        borderRadius: 999,
        background: "rgba(154, 123, 255, 0.12)",
        border: `1.5px solid ${color}`,
        color,
        fontSize: 26,
        fontWeight: 700,
        opacity,
        fontFamily: "inherit",
        boxShadow: AP_COLORS.cardShadowSoft,
      }}
    >
      {text}
    </div>
  );
};
