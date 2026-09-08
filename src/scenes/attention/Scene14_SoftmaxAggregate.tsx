import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { LeadLine } from "../../components/shared/ui";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { AP_COLORS } from "../../components/shared/theme";

export const SCENE_14_DURATION = 720; // 24.0s

const KEYS = ["sat", "by", "the", "river"];
const WEIGHTS = [0.16, 0.14, 0.11, 0.59]; // softmax output, sums to 1
const Y = 470;

export const Scene14_SoftmaxAggregate: React.FC = () => {
  const frame = useCurrentFrame();
  const row = layoutTokenRow(KEYS, { fontSize: 32 });
  const cardH = cardHeightFor(32);

  const weightsOpacity = interpolate(frame, [120, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sumOpacity = interpolate(frame, [230, 254], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outOpacity = interpolate(frame, [320, 344], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barBottom = 700;
  const outX = 960;
  const outY = 882;

  return (
    <SceneShell kicker="Softmax → weights × V" duration={SCENE_14_DURATION} enterDelay={0}>
      <LeadLine text="Attending from “bank”" y={340} start={10} />

      {/* Key tokens */}
      {row.centers.map((cx, i) => (
        <TokenCard
          key={i}
          label={KEYS[i]}
          x={cx}
          y={Y}
          width={row.widths[i]}
          height={cardH}
          variant={i === 3 ? "key" : "neutral"}
          fontSize={32}
          appearDelay={24 + i * 4}
        />
      ))}

      {/* Softmax weight bars */}
      {row.centers.map((cx, i) => {
        const maxW = Math.max(...WEIGHTS);
        const grow = interpolate(frame - (120 + i * 8), [0, 24], [0, WEIGHTS[i]], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const h = (grow / maxW) * 170;
        return (
          <div
            key={`bar-${i}`}
            style={{
              position: "absolute",
              left: cx - 24,
              top: barBottom - h,
              width: 48,
              height: h,
              borderRadius: 9,
              background: AP_COLORS.accent,
              opacity: weightsOpacity * (0.5 + (grow / maxW) * 0.5),
              border: `1.5px solid ${AP_COLORS.accentBorder}`,
            }}
          />
        );
      })}

      {/* Weight percentages */}
      {row.centers.map((cx, i) => (
        <div
          key={`p-${i}`}
          style={{
            position: "absolute",
            left: cx,
            top: barBottom + 14,
            transform: "translateX(-50%)",
            color: AP_COLORS.accent,
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "inherit",
            opacity: interpolate(frame - (150 + i * 8), [0, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {Math.round(WEIGHTS[i] * 100)}%
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 760,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 28,
          opacity: sumOpacity,
        }}
      >
        weights sum to 1 → <span style={{ color: AP_COLORS.textPrimary }}>× V</span>
      </div>

      {/* Output vector */}
      <FlowArrow x1={outX} y1={806} x2={outX} y2={858} color={AP_COLORS.value} appearDelay={320} />
      <div
        style={{
          position: "absolute",
          left: outX - 240,
          top: outY,
          width: 480,
          padding: "24px 20px",
          borderRadius: 18,
          background: AP_COLORS.valueBg,
          border: `1.5px solid ${AP_COLORS.valueBorder}`,
          boxShadow: AP_COLORS.cardShadow,
          textAlign: "center",
          opacity: outOpacity,
          transform: `translateY(${14 - outOpacity * 14}px)`,
        }}
      >
        <div style={{ color: AP_COLORS.textSecondary, fontSize: 22, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 14 }}>
          BANK’S NEW REPRESENTATION
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {[0.71, 0.44, 0.6, 0.82, 0.38].map((v, i) => (
            <div key={i} style={{ width: 34, height: 52, borderRadius: 7, background: AP_COLORS.value, opacity: v * 0.85, border: `1.5px solid ${AP_COLORS.valueBorder}` }} />
          ))}
        </div>
      </div>
    </SceneShell>
  );
};
