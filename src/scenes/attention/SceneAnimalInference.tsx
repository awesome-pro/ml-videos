import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import {
  ANIMAL_INDEX,
  ANIMAL_TIRED,
  ANIMAL_WIDE,
  IT_INDEX,
  STREET_INDEX,
} from "./examples";
import { AP_COLORS } from "../../components/shared/theme";
import { LeadLine, Tag } from "../../components/shared/ui";

export const SCENE_ANIMAL_INFERENCE_DURATION = 410; // 13.7s — new animal/street intuition example

const ROW_1_Y = 474;
const ROW_2_Y = 748;
const LEAD_Y = 320;
const CLUE_COLOR = AP_COLORS.key;

export const SceneAnimalInference: React.FC = () => {
  const frame = useCurrentFrame();

  const row1 = layoutTokenRow(ANIMAL_TIRED, { fontSize: 25 });
  const row2 = layoutTokenRow(ANIMAL_WIDE, { fontSize: 25 });
  const cardH = cardHeightFor(25);

  // Row 2 beat: "wide" is the clue → it = street.
  const row2Phase = frame - 210;
  const row2Opacity = interpolate(row2Phase, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const punchOpacity = interpolate(frame, [330, 356], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="The intuition" duration={SCENE_ANIMAL_INFERENCE_DURATION} enterDelay={0}>
      <LeadLine text="Which word does “it” mean? Look at the other words." y={LEAD_Y} start={8} />

      {/* Row 1 — too tired → it = animal */}
      {row1.centers.map((cx, i) => (
        <TokenCard
          key={`r1-${i}`}
          label={ANIMAL_TIRED[i]}
          x={cx}
          y={ROW_1_Y}
          width={row1.widths[i]}
          height={cardH}
          variant={
            i === IT_INDEX
              ? "accent"
              : i === ANIMAL_INDEX
              ? "positive"
              : i === 10
              ? "key"
              : "neutral"
          }
          fontSize={25}
          appearDelay={18 + i * 3}
        />
      ))}
      <AttentionArc
        x1={row1.centers[IT_INDEX]}
        y1={ROW_1_Y - cardH / 2}
        x2={row1.centers[ANIMAL_INDEX]}
        y2={ROW_1_Y - cardH / 2}
        weight={0.85}
        color={AP_COLORS.positive}
        appearDelay={150}
        apexLift={92}
      />
      <Tag text="it = animal" x={row1.centers[ANIMAL_INDEX]} y={ROW_1_Y + cardH / 2 + 46} start={180} color={AP_COLORS.positive} />
      <Tag text="the clue" x={row1.centers[10]} y={ROW_1_Y + cardH / 2 + 46} start={120} color={CLUE_COLOR} />

      {/* Row 2 — too wide → it = street */}
      <div style={{ position: "absolute", inset: 0, opacity: row2Opacity }}>
        {row2.centers.map((cx, i) => (
          <TokenCard
            key={`r2-${i}`}
            label={ANIMAL_WIDE[i]}
            x={cx}
            y={ROW_2_Y}
            width={row2.widths[i]}
            height={cardH}
            variant={
              i === IT_INDEX
                ? "accent"
                : i === STREET_INDEX
                ? "positive"
                : i === 10
                ? "key"
                : "neutral"
            }
            fontSize={25}
            appearDelay={214 + i * 3}
          />
        ))}
        <AttentionArc
          x1={row2.centers[IT_INDEX]}
          y1={ROW_2_Y - cardH / 2}
          x2={row2.centers[STREET_INDEX]}
          y2={ROW_2_Y - cardH / 2}
          weight={0.85}
          color={AP_COLORS.positive}
          appearDelay={250}
          apexLift={92}
        />
        <Tag text="it = street" x={row2.centers[STREET_INDEX]} y={ROW_2_Y + cardH / 2 + 46} start={280} color={AP_COLORS.positive} />
        <Tag text="the clue" x={row2.centers[10]} y={ROW_2_Y + cardH / 2 + 46} start={214} color={CLUE_COLOR} />
      </div>

      {/* Punch line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 926,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textPrimary,
          fontSize: 38,
          fontWeight: 700,
          opacity: punchOpacity,
          transform: `translateY(${16 - punchOpacity * 16}px)`,
          padding: "0 120px",
        }}
      >
        The neighbors tell you which meaning fits.
      </div>
    </SceneShell>
  );
};
