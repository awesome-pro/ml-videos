import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { NumberVec } from "../../components/shared/NumberVec";
import { LeadLine } from "../../components/shared/ui";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { AP_COLORS } from "../../components/shared/theme";

export const SCENE_14_DURATION = 420; // 14.0s — softmax → weights × V, with real numbers

const KEYS = ["sat", "by", "the", "river"];
const WEIGHTS = [0.16, 0.14, 0.11, 0.59]; // softmax output, sums to 1
const NEW_REP = [0.71, 0.44, 0.6, 0.82, 0.38];
const Y = 470;

export const Scene14_SoftmaxAggregate: React.FC = () => {
  const frame = useCurrentFrame();
  const row = layoutTokenRow(KEYS, { fontSize: 32 });
  const cardH = cardHeightFor(32);

  const weightsOpacity = interpolate(frame, [120, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sumOpacity = interpolate(frame, [250, 274], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outOpacity = interpolate(frame, [330, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barBottom = 700;
  const repX = 960 - (NEW_REP.length * 54 + (NEW_REP.length - 1) * 6) / 2;

  return (
    <SceneShell kicker="Softmax → weights × V" duration={SCENE_14_DURATION} enterDelay={0}>
      <LeadLine text="Softmax turns the scores into weights." y={320} start={8} />

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

      {/* Weight decimals under the bars */}
      {row.centers.map((cx, i) => (
        <div
          key={`p-${i}`}
          style={{
            position: "absolute",
            left: cx,
            top: barBottom + 12,
            transform: "translateX(-50%)",
            color: AP_COLORS.accent,
            fontSize: 25,
            fontWeight: 700,
            fontFamily: "inherit",
            opacity: interpolate(frame - (150 + i * 8), [0, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {WEIGHTS[i].toFixed(2)}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 762,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 28,
          opacity: sumOpacity,
        }}
      >
        weights are positive and sum to 1 → <span style={{ color: AP_COLORS.textPrimary }}>× V</span>
      </div>

      {/* Output vector */}
      <FlowArrow x1={960} y1={806} x2={960} y2={852} color={AP_COLORS.value} appearDelay={330} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 864,
          width: 1920,
          textAlign: "center",
          opacity: outOpacity,
          transform: `translateY(${14 - outOpacity * 14}px)`,
        }}
      >
        <div style={{ color: AP_COLORS.textSecondary, fontSize: 22, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 14 }}>
          BANK’S NEW REPRESENTATION
        </div>
      </div>
      <NumberVec
        values={NEW_REP}
        color={AP_COLORS.value}
        x={repX}
        y={904}
        cellW={54}
        cellH={42}
        gap={6}
        appearDelay={340}
        format={(v) => v.toFixed(1)}
      />
    </SceneShell>
  );
};
