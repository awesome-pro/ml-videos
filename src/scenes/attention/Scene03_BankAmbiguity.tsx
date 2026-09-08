import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { BANK_1, BANK_2 } from "./examples";
import { AP_COLORS } from "../../components/shared/theme";

export const SCENE_03_DURATION = 660; // 22.0s

const BANK_INDEX = 5; // "bank" is the last token in both bank sentences

export const Scene03_BankAmbiguity: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: isolated "bank" (ambiguous).
  const isoOpacity = interpolate(frame, [8, 26, 190, 212], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: two contexts resolve the meaning.
  const ctxOpacity = interpolate(frame, [214, 234], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const row1 = layoutTokenRow(BANK_1, { fontSize: 32 });
  const row2 = layoutTokenRow(BANK_2, { fontSize: 32 });
  const cardH = cardHeightFor(32);

  return (
    <SceneShell kicker="Same word, many meanings" duration={SCENE_03_DURATION} enterDelay={0}>
      {/* ---- Phase 1: isolated "bank" ---- */}
      <div style={{ position: "absolute", inset: 0, opacity: isoOpacity }}>
        <TokenCard
          label="bank"
          x={960}
          y={440}
          width={300}
          height={132}
          variant="accent"
          fontSize={64}
          appearDelay={10}
          radius={22}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 552,
            width: 1920,
            textAlign: "center",
            color: AP_COLORS.textSecondary,
            fontSize: 30,
            fontWeight: 500,
            opacity: interpolate(frame, [60, 80], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          … which one do you mean?
        </div>
        <div style={{ position: "absolute", left: 0, top: 620, width: 1920, display: "flex", justifyContent: "center", gap: 34 }}>
          <SenseChip label="river shoreline" color={AP_COLORS.key} start={90} />
          <div style={{ color: AP_COLORS.textMuted, fontSize: 30, alignSelf: "center", opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            or
          </div>
          <SenseChip label="financial bank" color={AP_COLORS.value} start={118} />
        </div>
      </div>

      {/* ---- Phase 2: context ---- */}
      <div style={{ position: "absolute", inset: 0, opacity: ctxOpacity }}>
        <LeadLine text="Now put “bank” in a sentence." y={342} start={216} />

        {row1.centers.map((cx, i) => (
          <TokenCard
            key={`b1-${i}`}
            label={BANK_1[i]}
            x={cx}
            y={540}
            width={row1.widths[i]}
            height={cardH}
            variant={i === BANK_INDEX ? "key" : "neutral"}
            fontSize={32}
            appearDelay={232 + i * 3}
          />
        ))}
        {row2.centers.map((cx, i) => (
          <TokenCard
            key={`b2-${i}`}
            label={BANK_2[i]}
            x={cx}
            y={740}
            width={row2.widths[i]}
            height={cardH}
            variant={i === BANK_INDEX ? "value" : "neutral"}
            fontSize={32}
            appearDelay={252 + i * 3}
          />
        ))}

        <ResolutionTag
          text="riverside"
          x={row1.centers[BANK_INDEX]}
          y={540 + cardH / 2 + 34}
          start={340}
          color={AP_COLORS.key}
        />
        <ResolutionTag
          text="financial"
          x={row2.centers[BANK_INDEX]}
          y={740 + cardH / 2 + 34}
          start={360}
          color={AP_COLORS.value}
        />
      </div>
    </SceneShell>
  );
};

const SenseChip: React.FC<{ label: string; color: string; start: number }> = ({ label, color, start }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - start, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        padding: "14px 26px",
        borderRadius: 12,
        background: AP_COLORS.surface,
        border: `1.5px solid ${color}`,
        color,
        fontSize: 26,
        fontWeight: 600,
        opacity: opacity * 0.9,
        boxShadow: AP_COLORS.cardShadowSoft,
      }}
    >
      {label}
    </div>
  );
};

const LeadLine: React.FC<{ text: string; y: number; start: number }> = ({ text, y, start }) => {
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
        fontSize: 32,
        fontWeight: 500,
        opacity,
      }}
    >
      {text}
    </div>
  );
};

const ResolutionTag: React.FC<{ text: string; x: number; y: number; start: number; color: string }> = ({
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
        padding: "8px 20px",
        borderRadius: 999,
        background: color === AP_COLORS.key ? AP_COLORS.keyBg : AP_COLORS.valueBg,
        border: `1.5px solid ${color}`,
        color,
        fontSize: 24,
        fontWeight: 700,
        opacity,
        boxShadow: AP_COLORS.cardShadowSoft,
      }}
    >
      {text}
    </div>
  );
};
