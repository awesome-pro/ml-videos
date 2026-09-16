import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { Curve, Diagram, PointMark, VectorArrow } from "../../components/math/Axes";
import { enterStyle, ramp, TIMING } from "../../components/math/motion";

/**
 * Demo 3 of the maths kit: plots that draw themselves and vectors that grow.
 *
 * Everything is plain SVG geometry derived from props + frame, so it stays
 * deterministic and resolution independent — no measuring, no filters.
 */

export const MATH_KIT_DIAGRAMS_DURATION = 340;

const LEFT = { left: 190, top: 384, width: 760, height: 356 };
const RIGHT = { left: 1230, top: 384, width: 460, height: 356 };

/** Two-class softmax (sigmoid) with a temperature parameter. */
const sigmoid = (x: number, temperature: number): number =>
  1 / (1 + Math.exp(-x / temperature));

const TEMPERATURES: { t: number; color: string; label: string; at: number }[] = [
  { t: 2, color: AP_COLORS.key, label: "T = 2", at: 62 },
  { t: 1, color: AP_COLORS.accent, label: "T = 1", at: 108 },
  { t: 0.5, color: AP_COLORS.value, label: "T = 0.5", at: 154 },
];

const PanelTitle: React.FC<{ x: number; text: string; start: number }> = ({ x, text, start }) => {
  const frame = useCurrentFrame();
  const progress = ramp(frame, start, start + TIMING.base);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 400,
        top: 308,
        width: 800,
        textAlign: "center",
        color: AP_COLORS.textPrimary,
        fontSize: 27,
        fontWeight: 700,
        ...enterStyle(progress, { rise: 10 }),
      }}
    >
      {text}
    </div>
  );
};

export const MathKitDiagrams: React.FC = () => {
  const frame = useCurrentFrame();

  const axesProgress = ramp(frame, 12, 52);
  const pointAppear = ramp(frame, 236, 254);
  const legendStart = 200;

  const vectorGrow = ramp(frame, 100, 142);
  const scaledGrow = ramp(frame, 182, 218);
  const chipStart = 232;

  return (
    <SceneShell
      kicker="Math kit · diagrams"
      title="Plots and vectors that explain themselves"
      duration={MATH_KIT_DIAGRAMS_DURATION}
      enterDelay={0}
    >
      <PanelTitle x={570} text="Two-class softmax, different temperatures" start={40} />
      <PanelTitle x={1440} text="Attention rescales each value vector" start={76} />

      {/* Left: the axes, three curves drawing themselves, one sampled point. */}
      <Diagram
        {...LEFT}
        xDomain={[-6, 6]}
        yDomain={[0, 1]}
        xTicks={[-6, -3, 0, 3, 6]}
        yTicks={[0, 0.5, 1]}
        xTickFormat={(v) => String(v)}
        yTickFormat={(v) => v.toFixed(1)}
        xLabel="score"
        yLabel="probability"
        progress={axesProgress}
      >
        {(scale) => (
          <g>
            {TEMPERATURES.map((temp) => (
              <Curve
                key={temp.label}
                scale={scale}
                fn={(x) => sigmoid(x, temp.t)}
                color={temp.color}
                strokeWidth={4}
                draw={ramp(frame, temp.at, temp.at + 30)}
                glow={ramp(frame, temp.at + 10, temp.at + 40) * 0.8}
              />
            ))}
            <PointMark
              scale={scale}
              x={2}
              y={sigmoid(2, 1)}
              color={AP_COLORS.accent}
              appear={pointAppear}
              dropLine
              label="0.88"
            />
          </g>
        )}
      </Diagram>

      <div
        style={{
          position: "absolute",
          left: 570 - 400,
          top: 880,
          width: 800,
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {TEMPERATURES.map((temp, i) => {
          const progress = ramp(frame, legendStart + i * 10, legendStart + i * 10 + TIMING.fast);
          return (
            <div
              key={temp.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 18px",
                borderRadius: 999,
                background: AP_COLORS.surface,
                border: "1px solid " + AP_COLORS.surfaceBorder,
                ...enterStyle(progress, { rise: 10 }),
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 4,
                  borderRadius: 999,
                  background: temp.color,
                  display: "inline-block",
                }}
              />
              <span style={{ color: AP_COLORS.textSecondary, fontSize: 26, fontWeight: 700 }}>
                {temp.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right: a value vector growing, then the same vector rescaled. */}
      <Diagram {...RIGHT} xDomain={[-0.1, 1]} yDomain={[-0.1, 1]} bare>
        {(scale) => (
          <g>
            <VectorArrow
              scale={scale}
              x={0}
              y={0}
              dx={0.78}
              dy={0.62}
              color={AP_COLORS.value}
              progress={vectorGrow}
              label="V"
            />
            <VectorArrow
              scale={scale}
              x={0}
              y={0}
              dx={0.78}
              dy={0.62}
              color={AP_COLORS.accent}
              progress={scaledGrow * 0.58}
              width={6}
            />
          </g>
        )}
      </Diagram>

      <div
        style={{
          position: "absolute",
          left: 1440 - 400,
          top: 880,
          width: 800,
          display: "flex",
          justifyContent: "center",
          ...enterStyle(ramp(frame, chipStart, chipStart + TIMING.base), { rise: 10 }),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 22px",
            borderRadius: 999,
            background: AP_COLORS.accentBg,
            border: "1px solid " + AP_COLORS.accentBorder,
          }}
        >
          <span style={{ color: AP_COLORS.accent, fontSize: 26, fontWeight: 800, fontFamily: AP_FONTS.mono }}>
            0.58 &times; V
          </span>
          <span style={{ color: AP_COLORS.textSecondary, fontSize: 26 }}>
            attention weight applied
          </span>
        </div>
      </div>
    </SceneShell>
  );
};
