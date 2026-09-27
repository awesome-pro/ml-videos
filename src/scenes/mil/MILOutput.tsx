import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { MiniGrid, TokenRow, type GridCell, type GridTone } from "../../components/mil";
import { enterStyle, ramp, TIMING } from "../../components/math";
import { ANSWER_TEXT, DECODE_ROWS, RAW_STREAM } from "./data";

export const MIL_OUTPUT_DURATION = 355; // 11.8s

// Top half: the batch stepping together, including the rows that have finished.
const DEC_COLS = 6;
const DEC_CELL_W = 150;
const DEC_CELL_H = 56;
const DEC_GAP = 10;
const DEC_W = DEC_COLS * DEC_CELL_W + (DEC_COLS - 1) * DEC_GAP;
const DEC_X = 960 - DEC_W / 2;
const DEC_Y = 340;

// Bottom half: the id stream and the text that reaches the user.
const RAW_CELL_W = 136;
const RAW_CELL_H = 54;
const RAW_GAP = 8;
const RAW_W = RAW_STREAM.length * RAW_CELL_W + (RAW_STREAM.length - 1) * RAW_GAP;
const RAW_X = Math.round(960 - RAW_W / 2);
const RAW_Y = 700;

export const MILOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const bubbleIn = ramp(frame, 286, 286 + TIMING.base);

  const decodeRows: GridCell[][] = DECODE_ROWS.map((row) =>
    row.cells.map((text) => {
      if (text === null) return { text: "", tone: "ghost" as GridTone };
      if (text === "pad") return { text: "pad", tone: "pad" as GridTone };
      if (text === "⟨end⟩") return { text, tone: "new" as GridTone };
      return { text, tone: "real" as GridTone };
    })
  );

  return (
    <SceneShell title="Decode the ids back to text" duration={MIL_OUTPUT_DURATION}>
      <div
        style={{
          position: "absolute",
          left: DEC_X,
          top: 258,
          fontFamily: AP_FONTS.mono,
          fontSize: 28,
          fontWeight: AP_WEIGHT.heading,
          color: AP_COLORS.accent,
          opacity: ramp(frame, 10, 10 + TIMING.base),
          textShadow: AP_COLORS.textShadow,
        }}
      >
        decode step →
      </div>

      <MiniGrid
        rows={decodeRows}
        x={DEC_X}
        y={DEC_Y}
        cellW={DEC_CELL_W}
        cellH={DEC_CELL_H}
        gap={DEC_GAP}
        rowLabels={DECODE_ROWS.map((r) => r.label)}
        colLabels={Array.from({ length: DEC_COLS }, (_, c) => `step ${c + 1}`)}
        start={24}
        stagger={2}
      />


      <div
        style={{
          position: "absolute",
          left: 0,
          top: 616,
          width: 1920,
          textAlign: "center",
          fontFamily: AP_FONTS.sans,
          fontSize: 28,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.textPrimary,
          opacity: ramp(frame, 150, 150 + TIMING.fast),
          textShadow: AP_COLORS.textShadow,
        }}
      >
        the id stream for req 1 — control tokens included
      </div>

      <TokenRow
        tokens={RAW_STREAM.map((t) => ({
          text: t.text,
          id: t.id,
          tone: t.special ? ("special" as const) : ("normal" as const),
        }))}
        x={RAW_X}
        y={RAW_Y}
        cellW={RAW_CELL_W}
        cellH={RAW_CELL_H}
        gap={RAW_GAP}
        fontSize={24}
        start={172}
        stagger={3}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 792,
          width: 1920,
          textAlign: "center",
          fontFamily: AP_FONTS.sans,
          fontSize: AP_TYPE.label,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.accent,
          opacity: ramp(frame, 246, 246 + TIMING.fast),
          textShadow: AP_COLORS.textShadow,
        }}
      >
        drop ⟨start⟩ · ⟨end⟩ · ⏎ &nbsp;—&nbsp; keep the words
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 848,
          width: 1920,
          display: "flex",
          justifyContent: "center",
          ...enterStyle(bubbleIn, { rise: 18 }),
        }}
      >
        <div
          style={{
            padding: "22px 44px",
            borderRadius: 22,
            background: AP_COLORS.keyBg,
            border: `1.5px solid ${AP_COLORS.keyBorder}`,
            boxShadow: AP_COLORS.cardShadowSoft,
            fontFamily: AP_FONTS.sans,
            fontSize: 44,
            fontWeight: AP_WEIGHT.label,
            color: AP_COLORS.textPrimary,
            textShadow: AP_COLORS.textShadow,
            whiteSpace: "nowrap",
          }}
        >
          {ANSWER_TEXT}
        </div>
      </div>

    </SceneShell>
  );
};
