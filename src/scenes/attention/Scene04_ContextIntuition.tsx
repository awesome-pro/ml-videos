import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { BANK_1, BANK_2 } from "./examples";
import { AP_COLORS } from "../../components/shared/theme";
import { LeadLine, Tag } from "../../components/shared/ui";

export const SCENE_04_DURATION = 720; // 24.0s

const BANK_INDEX = 5;
const RIVER_INDEX = 4;
const DEPOSITED_INDEX = 1;
const MONEY_INDEX = 2;
const ROW_1_Y = 520;
const ROW_2_Y = 735;

export const Scene04_ContextIntuition: React.FC = () => {
  const frame = useCurrentFrame();

  const row1 = layoutTokenRow(BANK_1, { fontSize: 32 });
  const row2 = layoutTokenRow(BANK_2, { fontSize: 32 });
  const cardH = cardHeightFor(32);

  const punchOpacity = interpolate(frame, [430, 456], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="The intuition" duration={SCENE_04_DURATION} enterDelay={0}>
      <LeadLine text="How did you know which “bank” it was?" y={344} start={10} />

      {/* Sentence 1 — river */}
      {row1.centers.map((cx, i) => (
        <TokenCard
          key={`r1-${i}`}
          label={BANK_1[i]}
          x={cx}
          y={ROW_1_Y}
          width={row1.widths[i]}
          height={cardH}
          variant={i === BANK_INDEX ? "query" : i === RIVER_INDEX ? "key" : "neutral"}
          fontSize={32}
          appearDelay={24 + i * 3}
        />
      ))}
      <AttentionArc
        x1={row1.centers[BANK_INDEX]}
        y1={ROW_1_Y - cardH / 2}
        x2={row1.centers[RIVER_INDEX]}
        y2={ROW_1_Y - cardH / 2}
        weight={0.85}
        color={AP_COLORS.accent}
        appearDelay={160}
        apexLift={140}
      />
      <Tag text="river gives context" x={row1.centers[RIVER_INDEX]} y={ROW_1_Y + cardH / 2 + 44} start={196} color={AP_COLORS.key} />

      {/* Sentence 2 — deposited / money */}
      {row2.centers.map((cx, i) => (
        <TokenCard
          key={`r2-${i}`}
          label={BANK_2[i]}
          x={cx}
          y={ROW_2_Y}
          width={row2.widths[i]}
          height={cardH}
          variant={i === BANK_INDEX ? "query" : i === DEPOSITED_INDEX || i === MONEY_INDEX ? "value" : "neutral"}
          fontSize={32}
          appearDelay={48 + i * 3}
        />
      ))}
      <AttentionArc
        x1={row2.centers[BANK_INDEX]}
        y1={ROW_2_Y - cardH / 2}
        x2={row2.centers[DEPOSITED_INDEX]}
        y2={ROW_2_Y - cardH / 2}
        weight={0.75}
        color={AP_COLORS.accent}
        appearDelay={200}
        apexLift={130}
      />
      <AttentionArc
        x1={row2.centers[BANK_INDEX]}
        y1={ROW_2_Y - cardH / 2}
        x2={row2.centers[MONEY_INDEX]}
        y2={ROW_2_Y - cardH / 2}
        weight={0.75}
        color={AP_COLORS.accent}
        appearDelay={216}
        apexLift={130}
      />
      <Tag text="deposited & money give context" x={row2.centers[DEPOSITED_INDEX]} y={ROW_2_Y + cardH / 2 + 44} start={242} color={AP_COLORS.value} />

      {/* Punch line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 940,
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
        To understand a token, look at the other tokens around it.
      </div>
    </SceneShell>
  );
};
