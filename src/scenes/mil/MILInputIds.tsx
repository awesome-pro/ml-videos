import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { TensorShape, TokenRow, tokenRowWidth } from "../../components/mil";
import { enterStyle, ramp, TIMING } from "../../components/math";
import { PROMPT, PROMPT_TEXT } from "./data";

export const MIL_INPUT_IDS_DURATION = 300; // 10.0s

// One row of tokens: T is the visual width of the row, B is how many rows exist.
const CELL_W = 190;
const CELL_H = 64;
const CELL_GAP = 14;
const ROW_Y = 470;
const ROW_W = tokenRowWidth(PROMPT.length, CELL_W, CELL_GAP);
const ROW_X = 960 - ROW_W / 2;

export const MILInputIds: React.FC = () => {
  const frame = useCurrentFrame();
  const cardIn = ramp(frame, 10, 10 + TIMING.base);
  const tokenizeIn = ramp(frame, 44, 44 + TIMING.fast);

  return (
    <SceneShell title="A prompt is a row of token ids" duration={MIL_INPUT_IDS_DURATION}>
      {/* The prompt as the user typed it. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 288,
          width: 1920,
          display: "flex",
          justifyContent: "center",
          ...enterStyle(cardIn, { rise: 16 }),
        }}
      >
        <div
          style={{
            padding: "18px 46px",
            borderRadius: 16,
            background: AP_COLORS.surface,
            border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
            fontFamily: AP_FONTS.sans,
            fontSize: 40,
            fontWeight: AP_WEIGHT.label,
            color: AP_COLORS.textPrimary,
            textShadow: AP_COLORS.textShadow,
          }}
        >
          {PROMPT_TEXT}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 392,
          width: 1920,
          textAlign: "center",
          fontFamily: AP_FONTS.sans,
          fontSize: AP_TYPE.label,
          fontWeight: AP_WEIGHT.heading,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: AP_COLORS.accent,
          opacity: tokenizeIn,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        tokenize ▾
      </div>

      <TokenRow tokens={PROMPT} x={ROW_X} y={ROW_Y} cellW={CELL_W} cellH={CELL_H} gap={CELL_GAP} start={70} stagger={6} />

      {/* The T axis, measured. */}
      <DimLine x={ROW_X} width={ROW_W} y={560} color={AP_COLORS.key} label="T = 5" start={130} />

      <TensorShape
        name="input_ids"
        dims={[
          { axis: "B", value: "1", note: "batch size" },
          { axis: "T", value: "5", note: "sequence length" },
        ]}
        y={648}
        start={170}
        pops={[
          { index: 1, at: 196 },
          { index: 0, at: 236 },
        ]}
      />

    </SceneShell>
  );
};

/** A measured span: a line with end ticks and a mono label beneath it. */
const DimLine: React.FC<{
  x: number;
  width: number;
  y: number;
  color: string;
  label: string;
  start: number;
}> = ({ x, width, y, color, label, start }) => {
  const frame = useCurrentFrame();
  const draw = ramp(frame, start, start + TIMING.base);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: width * draw,
          height: 3,
          background: color,
          opacity: 0.9,
        }}
      />
      {[x, x + width].map((tx) => (
        <div
          key={tx}
          style={{
            position: "absolute",
            left: tx - 1.5,
            top: y - 12,
            width: 3,
            height: 27,
            background: color,
            opacity: 0.9 * draw,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: x + width / 2,
          top: y + 18,
          transform: "translateX(-50%)",
          fontFamily: AP_FONTS.mono,
          fontSize: 30,
          fontWeight: AP_WEIGHT.label,
          color,
          opacity: draw,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {label}
      </div>
    </>
  );
};
