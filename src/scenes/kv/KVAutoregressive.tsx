import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS } from "../../components/shared/theme";
import { CAPITAL_TOKENS } from "./data";
import { FlowArrow } from "../../components/shared/FlowArrow";

export const KV_AUTOREG_DURATION = 720; // 24.0s

// The prompt + the two generated tokens ("Paris", "."). We reveal them in order.
const SEQUENCE: readonly string[] = [...CAPITAL_TOKENS, "."];

const ROW_Y = 560;
const HEIGHT = cardHeightFor(32);

export const KVAutoregressive: React.FC = () => {
  const frame = useCurrentFrame();

  const layout = layoutTokenRow(SEQUENCE, { fontSize: 32, gap: 18, maxWidth: 1560 });

  const delayFor = (i: number) => (i < 5 ? 18 + i * 10 : i === 5 ? 200 : 340);

  const predictsOpacity = interpolate(frame, [168, 188], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const predictsOpacity2 = interpolate(frame, [308, 328], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const captionOpacity = interpolate(frame, [400, 430], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const loopOpacity = interpolate(frame, [500, 530], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="Autoregressive generation" duration={KV_AUTOREG_DURATION} enterDelay={0}>
      <LeadLine text="A language model generates one token at a time" y={300} start={8} />

      {SEQUENCE.map((tok, i) => (
        <TokenCard
          key={tok}
          label={tok}
          x={layout.centers[i]}
          y={ROW_Y}
          width={layout.widths[i]}
          height={HEIGHT}
          variant={i >= 5 ? "accent" : "neutral"}
          fontSize={layout.fontSize}
          appearDelay={delayFor(i)}
        />
      ))}

      <PredictBeat x={layout.centers[5]} y={ROW_Y - 92} opacity={predictsOpacity} label="predicts" />
      <PredictBeat x={layout.centers[6]} y={ROW_Y - 92} opacity={predictsOpacity2} label="predicts" />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 776,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 30,
          fontWeight: 600,
          opacity: captionOpacity,
          fontFamily: "inherit",
        }}
      >
        each new token becomes part of the input for the next
      </div>

      <FlowArrow x1={layout.centers[6]} y1={ROW_Y + 90} x2={layout.centers[0]} y2={ROW_Y + 90} color={AP_COLORS.accent} appearDelay={430} thickness={3} />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 850,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.accent,
          fontSize: 24,
          fontWeight: 700,
          opacity: loopOpacity,
          fontFamily: "inherit",
        }}
      >
        return it to the input · repeat
      </div>
    </SceneShell>
  );
};

const PredictBeat: React.FC<{ x: number; y: number; opacity: number; label: string }> = ({ x, y, opacity, label }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translateX(-50%)",
      color: AP_COLORS.accent,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      opacity,
      fontFamily: "inherit",
    }}
  >
    ▾ {label}
  </div>
);
