import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { NumberVec } from "../../components/shared/NumberVec";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import {
  ANIMAL_INDEX,
  ANIMAL_TIRED,
  IT_INDEX,
  STREET_INDEX,
} from "./examples";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { LeadLine } from "../../components/shared/ui";

export const SCENE_EXAMPLE_IT_DURATION = 540; // 18.0s — "for example, the token it"

// Which relevant tokens matter, and how much — animal wins.
const SCORE_TOKENS = [
  { idx: ANIMAL_INDEX, label: "animal", value: 0.58 },
  { idx: 3, label: "cross", value: 0.1 },
  { idx: STREET_INDEX, label: "street", value: 0.12 },
  { idx: 10, label: "tired", value: 0.14 },
];
const NEW_MEANING = [0.58, -0.1, 0.9, 0.3];

export const SceneExampleIt: React.FC = () => {
  const frame = useCurrentFrame();
  const row = layoutTokenRow(ANIMAL_TIRED, { fontSize: 26 });
  const cardH = cardHeightFor(26);

  const animalTagOpacity = interpolate(frame, [150, 172], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scoresOpacity = interpolate(frame, [300, 332], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const repOpacity = interpolate(frame, [410, 442], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const repX = 960 - (NEW_MEANING.length * 62 + (NEW_MEANING.length - 1) * 6) / 2;

  return (
    <SceneShell kicker="The first example" duration={SCENE_EXAMPLE_IT_DURATION} enterDelay={0}>
      <LeadLine text="For example — take the token “it”." y={288} start={8} />

      {/* Sentence */}
      {row.centers.map((cx, i) => (
        <TokenCard
          key={i}
          label={ANIMAL_TIRED[i]}
          x={cx}
          y={452}
          width={row.widths[i]}
          height={cardH}
          variant={i === IT_INDEX ? "accent" : i === ANIMAL_INDEX ? "positive" : "neutral"}
          fontSize={26}
          appearDelay={18 + i * 3}
        />
      ))}

      <AttentionArc
        x1={row.centers[IT_INDEX]}
        y1={452 - cardH / 2}
        x2={row.centers[ANIMAL_INDEX]}
        y2={452 - cardH / 2}
        weight={0.9}
        color={AP_COLORS.positive}
        appearDelay={140}
        apexLift={96}
      />

      <div
        style={{
          position: "absolute",
          left: row.centers[ANIMAL_INDEX],
          top: 452 + cardH / 2 + 46,
          transform: "translate(-50%, -50%)",
          padding: "10px 24px",
          borderRadius: 999,
          background: AP_COLORS.keyBg,
          border: `1.5px solid ${AP_COLORS.positive}`,
          color: AP_COLORS.positive,
          fontSize: 26,
          fontWeight: 700,
          opacity: animalTagOpacity,
          whiteSpace: "nowrap",
        }}
      >
        it = animal
      </div>
      <div
        style={{
          position: "absolute",
          left: row.centers[10],
          top: 452 + cardH / 2 + 46,
          transform: "translate(-50%, -50%)",
          color: AP_COLORS.textMuted,
          fontSize: 22,
          fontWeight: 600,
          opacity: interpolate(frame, [200, 224], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          whiteSpace: "nowrap",
        }}
      >
        the other tokens matter less
      </div>

      {/* Scores — which token matters, how much */}
      <div style={{ position: "absolute", left: 0, top: 596, width: 1920, textAlign: "center", opacity: scoresOpacity }}>
        <div style={{ color: AP_COLORS.textSecondary, fontSize: 25, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>
          WHICH TOKEN MATTERS · HOW MUCH?
        </div>
      </div>
      {SCORE_TOKENS.map((t) => (
        <div key={t.label} style={{ position: "absolute", left: row.centers[t.idx], top: 632, transform: "translateX(-50%)", textAlign: "center" }}>
          <div
            style={{
              width: 62,
              height: 46,
              borderRadius: 9,
              background: AP_COLORS.accent,
              opacity: 0.16 + t.value * 0.56,
              border: `1.5px solid ${t.idx === ANIMAL_INDEX ? AP_COLORS.accent : AP_COLORS.accentBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: AP_COLORS.textPrimary,
              fontFamily: AP_FONTS.mono,
              fontSize: 19,
              fontWeight: 700,
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {t.value.toFixed(2)}
          </div>
          <div style={{ color: t.idx === ANIMAL_INDEX ? AP_COLORS.accent : AP_COLORS.textMuted, fontSize: 20, fontWeight: 600, marginTop: 6 }}>
            {t.label}
          </div>
        </div>
      ))}

      {/* New representation = new meaning */}
      <div style={{ position: "absolute", left: 0, top: 736, width: 1920, textAlign: "center", opacity: repOpacity, transform: `translateY(${12 - repOpacity * 12}px)` }}>
        <div style={{ color: AP_COLORS.textSecondary, fontSize: 23, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 14 }}>
          THE NEW MEANING OF “IT”
        </div>
      </div>
      <NumberVec
        values={NEW_MEANING}
        color={AP_COLORS.accent}
        x={repX}
        y={774}
        cellW={62}
        cellH={44}
        gap={6}
        appearDelay={414}
        format={(v) => v.toFixed(1)}
      />
    </SceneShell>
  );
};
