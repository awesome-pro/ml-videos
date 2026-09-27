import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { Panel, PanelText } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";

export const MIL_TTFT_DURATION = 345; // 11.5s

// The timeline. Prefill is one wide block; every generated token is one narrow
// one. TTFT spans the prefill, ITL spans one decode step.
const RAIL_Y = 520;
const RAIL_X0 = 200;
const RAIL_X1 = 1740;
const PREFILL_X1 = 600;
const TOKEN_W = 44;
const TOKEN_H = 64;
const TOKEN_STEP = 100;
const FIRST_TOKEN_X = 640;
const TOKEN_COUNT = 5;

const prefillCx = (RAIL_X0 + PREFILL_X1) / 2;
const itlCx = FIRST_TOKEN_X + TOKEN_STEP / 2;

export const MILTTFTITL: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell title="TTFT and ITL" duration={MIL_TTFT_DURATION}>

      <div
        style={{
          position: "absolute",
          left: RAIL_X0,
          top: RAIL_Y,
          width: (RAIL_X1 - RAIL_X0) * ramp(frame, 20, 20 + TIMING.base),
          height: 4,
          background: AP_COLORS.textMuted,
          opacity: 0.5,
        }}
      />

      <Block
        x={RAIL_X0}
        width={PREFILL_X1 - RAIL_X0}
        y={RAIL_Y}
        start={50}
        color={AP_COLORS.accent}
        label="prefill"
      />

      {Array.from({ length: TOKEN_COUNT }).map((_, i) => (
        <Block
          key={i}
          x={FIRST_TOKEN_X + i * TOKEN_STEP}
          width={TOKEN_W}
          y={RAIL_Y}
          start={130 + i * 14}
          color={AP_COLORS.key}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: FIRST_TOKEN_X + TOKEN_COUNT * TOKEN_STEP,
          top: RAIL_Y,
          transform: "translateY(-50%)",
          fontFamily: AP_FONTS.sans,
          fontSize: 40,
          fontWeight: AP_WEIGHT.heading,
          color: AP_COLORS.textMuted,
          opacity: ramp(frame, 212, 212 + TIMING.fast),
        }}
      >
        …
      </div>

      <Brace x1={RAIL_X0} x2={FIRST_TOKEN_X} y={428} start={90} color={AP_COLORS.accent} />
      <BraceLabel x={prefillCx} y={366} text="TTFT" color={AP_COLORS.accent} start={96} />

      <Brace x1={FIRST_TOKEN_X} x2={FIRST_TOKEN_X + TOKEN_STEP} y={596} start={230} color={AP_COLORS.key} />
      <BraceLabel x={itlCx} y={626} text="ITL" color={AP_COLORS.key} start={236} />

      <div
        style={{
          position: "absolute",
          left: RAIL_X0,
          top: 596,
          fontFamily: AP_FONTS.mono,
          fontSize: AP_TYPE.label,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.textSecondary,
          opacity: ramp(frame, 60, 60 + TIMING.fast),
          whiteSpace: "nowrap",
        }}
      >
        t = 0
      </div>

      <div
        style={{
          position: "absolute",
          left: FIRST_TOKEN_X + TOKEN_COUNT * TOKEN_STEP + 60,
          top: 596,
          fontFamily: AP_FONTS.sans,
          fontSize: AP_TYPE.label,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.textSecondary,
          opacity: ramp(frame, 240, 240 + TIMING.fast),
          whiteSpace: "nowrap",
        }}
      >
        one block = one token · the gap repeats every step
      </div>

      <Panel x={200} y={700} width={740} height={230} title="TTFT" titleColor={AP_COLORS.accent} start={260}>
        <PanelText size={28}>Time to the first token.</PanelText>
        <PanelText size={28}>One pass over the whole prompt.</PanelText>
      </Panel>

      <Panel
        x={980}
        y={700}
        width={740}
        height={230}
        title="ITL"
        titleColor={AP_COLORS.key}
        start={276}
        justify="flex-start"
      >
        <PanelText size={28}>Inter-token latency: the gap between tokens.</PanelText>
        <PanelText size={28}>It sets the typing speed the user sees.</PanelText>
      </Panel>

    </SceneShell>
  );
};

const Block: React.FC<{
  x: number;
  width: number;
  y: number;
  start: number;
  color: string;
  label?: string;
}> = ({ x, width, y, start, color, label }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, start, start + TIMING.base);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - TOKEN_H / 2,
        width,
        height: TOKEN_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        background: color,
        border: `1.5px solid ${color}`,
        opacity: 0.28 + 0.5 * appear,
        transform: `scaleY(${0.6 + 0.4 * appear})`,
        color: AP_COLORS.bg,
        fontFamily: AP_FONTS.sans,
        fontSize: 28,
        fontWeight: AP_WEIGHT.heading,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {label}
    </div>
  );
};

const Brace: React.FC<{ x1: number; x2: number; y: number; start: number; color: string }> = ({
  x1,
  x2,
  y,
  start,
  color,
}) => {
  const frame = useCurrentFrame();
  const draw = ramp(frame, start, start + TIMING.base);
  const w = (x2 - x1) * draw;
  return (
    <>
      <div style={{ position: "absolute", left: x1, top: y, width: w, height: 3, background: color }} />
      {[x1, x1 + w].map((tx, i) =>
        i === 0 || draw > 0.98 ? (
          <div key={tx} style={{ position: "absolute", left: tx - 1.5, top: y - 11, width: 3, height: 25, background: color }} />
        ) : null
      )}
    </>
  );
};

const BraceLabel: React.FC<{ x: number; y: number; text: string; color: string; start: number }> = ({
  x,
  y,
  text,
  color,
  start,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translateX(-50%)",
        fontFamily: AP_FONTS.mono,
        fontSize: 34,
        fontWeight: AP_WEIGHT.heading,
        color,
        opacity: ramp(frame, start, start + TIMING.fast),
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {text}
    </div>
  );
};
