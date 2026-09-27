import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { MIL_AXIS, Panel, PanelText } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { SPECIAL, VOCAB_LABEL } from "./data";

export const MIL_VOCAB_DURATION = 305; // 10.2s

// The vocabulary drawn as a ribbon. 150 cells cannot show 151,936 ids, so each
// cell stands for ~1,000 of them and the caption says so — the *scale* is the
// point, not the cell count.
const CELLS = 150;
const CELL_W = 9;
const CELL_GAP = 2;
const CELL_H = 92;
const RIBBON_W = CELLS * (CELL_W + CELL_GAP) - CELL_GAP;
const RIBBON_X = 960 - RIBBON_W / 2;
const RIBBON_Y = 424;

const CONTROLS: { text: string; id: number; note: string }[] = [
  { text: "<|endoftext|>", id: SPECIAL.endoftext, note: "the pad token" },
  { text: "<|im_start|>", id: SPECIAL.imStart, note: "opens a turn" },
  { text: "<|im_end|>", id: SPECIAL.imEnd, note: "closes a turn · the stop token" },
];

export const MILVocab: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = ramp(frame, 30, 30 + 6);

  return (
    <SceneShell title={`V = ${VOCAB_LABEL}`} duration={MIL_VOCAB_DURATION}>

      {/* The ribbon: ids 0 … 151,935. */}
      {Array.from({ length: CELLS }).map((_, i) => {
        const appear = ramp(frame, 34 + i * 0.7, 34 + i * 0.7 + 6);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: RIBBON_X + i * (CELL_W + CELL_GAP),
              top: RIBBON_Y,
              width: CELL_W,
              height: CELL_H,
              borderRadius: 2,
              background: MIL_AXIS.V,
              opacity: appear * (0.34 + 0.5 * (i / CELLS)),
            }}
          />
        );
      })}

      <EndLabel x={RIBBON_X} y={RIBBON_Y - 38} text="id 0" align="left" opacity={fill} />
      <EndLabel x={RIBBON_X + RIBBON_W} y={RIBBON_Y - 38} text="id 151,935" align="right" opacity={fill} />
      <EndLabel
        x={RIBBON_X}
        y={RIBBON_Y + CELL_H + 12}
        text="each cell ≈ 1,000 tokens"
        align="left"
        opacity={ramp(frame, 158, 158 + TIMING.fast)}
        muted
      />


      {CONTROLS.map((c, i) => (
        <Panel
          key={c.text}
          x={186 + i * 524}
          y={620}
          width={500}
          height={190}
          start={208 + i * 12}
          justify="center"
          center
          padding="22px 30px"
        >
          <div
            style={{
              fontFamily: AP_FONTS.mono,
              fontSize: 30,
              fontWeight: AP_WEIGHT.heading,
              color: AP_COLORS.accent,
              textShadow: AP_COLORS.textShadow,
            }}
          >
            {c.text}
          </div>
          <PanelText mono size={28} color={MIL_AXIS.V}>
            id {c.id}
          </PanelText>
          <PanelText size={26}>{c.note}</PanelText>
        </Panel>
      ))}

    </SceneShell>
  );
};

const EndLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  align: "left" | "right";
  opacity: number;
  muted?: boolean;
}> = ({ x, y, text, align, opacity, muted }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: align === "right" ? "translateX(-100%)" : undefined,
      fontFamily: AP_FONTS.mono,
      fontSize: muted ? AP_TYPE.label : 28,
      fontWeight: AP_WEIGHT.label,
      color: muted ? AP_COLORS.textSecondary : AP_COLORS.textPrimary,
      opacity,
      whiteSpace: "nowrap",
      textShadow: AP_COLORS.textShadow,
    }}
  >
    {text}
  </div>
);
