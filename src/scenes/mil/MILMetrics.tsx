import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { EquationSteps, ramp, TIMING } from "../../components/math";

export const MIL_METRICS_DURATION = 385; // 12.8s

/** The worked example the last step plugs numbers into. */
const TTFT_MS = 180;
const ITL_MS = 40;
const N = 100;
const TOTAL_MS = TTFT_MS + (N - 1) * ITL_MS;

const GIVENS = [`TTFT = ${TTFT_MS} ms`, `ITL = ${ITL_MS} ms`, `N = ${N} tokens`];

export const MILMetrics: React.FC = () => {
  return (
    <SceneShell title="How they are computed" duration={MIL_METRICS_DURATION}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 292,
          width: 1920,
          display: "flex",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {GIVENS.map((g, i) => (
          <Chip key={g} text={g} start={10 + i * 8} />
        ))}
      </div>

      <EquationSteps
        size={60}
        y={400}
        railY={772}
        steps={[
          {
            at: 20,
            tex: "\\text{TTFT} = t_{\\text{first}} - t_{\\text{request}}",
            note: "The time from sending the request to receiving the first token — this is the prefill cost.",
          },
          {
            at: 120,
            tex: "\\text{ITL} = \\dfrac{t_{\\text{last}} - t_{\\text{first}}}{N - 1}",
            note: "The average gap between consecutive tokens. Its reciprocal is throughput: 1/ITL tokens per second.",
          },
          {
            at: 220,
            tex: "\\text{total} = \\text{TTFT} + (N - 1) \\times \\text{ITL}",
            note: "What the user waits for end to end, for a response of N tokens.",
          },
          {
            at: 320,
            tex: `${TTFT_MS} + ${N - 1} \\times ${ITL_MS} = ${TOTAL_MS}\\ \\text{ms}`,
            note: `≈ ${(TOTAL_MS / 1000).toFixed(1)} s for ${N} tokens — and ${Math.round(1000 / ITL_MS)} tokens per second.`,
          },
        ]}
      />

    </SceneShell>
  );
};

const Chip: React.FC<{ text: string; start: number }> = ({ text, start }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, start, start + TIMING.base);
  return (
    <div
      style={{
        padding: "12px 28px",
        borderRadius: 999,
        background: AP_COLORS.surface,
        border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
        fontFamily: AP_FONTS.mono,
        fontSize: 28,
        fontWeight: AP_WEIGHT.label,
        color: AP_COLORS.textPrimary,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 12}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
