import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_TRACK, AP_FONTS } from "../../components/shared/theme";
import { MiniGrid, Panel, PanelText, type GridCell } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { PAD_TO, REQUESTS } from "./data";

export const MIL_MASK_DURATION = 305; // 10.2s

const CELL_W = 92;
const CELL_H = 58;
const CELL_GAP = 8;
const GRID_W = PAD_TO * CELL_W + (PAD_TO - 1) * CELL_GAP;
const GRID_H = 3 * CELL_H + 2 * CELL_GAP;
/** Centred in the left half; the explanation panel occupies the right. */
const GRID_X = 540 - GRID_W / 2;
const MASK_Y = 380;
const POS_Y = 700;
const PANEL_BOTTOM = POS_Y + GRID_H;

const BEAT_2 = 130;
const BEAT_3 = 240;

/** attention_mask: 1 for a real token, 0 for padding. */
const MASK_ROWS: GridCell[][] = REQUESTS.map((req) => {
  const pads = PAD_TO - req.tokens.length;
  return Array.from({ length: PAD_TO }, (_, c) =>
    c < pads ? { text: "0", tone: "zero" as const } : { text: "1", tone: "one" as const }
  );
});

/**
 * position_ids, exactly as a real stack builds them:
 * `cumsum(attention_mask) - 1`, floored at 0. Each sequence therefore keeps the
 * positions it would have had on its own, and every pad lands on 0.
 */
const POS_ROWS: GridCell[][] = REQUESTS.map((req) => {
  const pads = PAD_TO - req.tokens.length;
  return Array.from({ length: PAD_TO }, (_, c) => {
    if (c < pads) return { text: "0", tone: "pad" as const };
    const realIndex = c - pads;
    return { text: `${realIndex}`, tone: realIndex === req.tokens.length - 1 ? ("new" as const) : ("one" as const) };
  });
});

export const MILAttentionMask: React.FC = () => {
  return (
    <SceneShell title="Tell the model what is padding" duration={MIL_MASK_DURATION}>
      <GridTitle x={GRID_X} y={296} text="attention_mask" start={10} />

      <MiniGrid
        rows={MASK_ROWS}
        x={GRID_X}
        y={MASK_Y}
        cellW={CELL_W}
        cellH={CELL_H}
        gap={CELL_GAP}
        rowLabels={REQUESTS.map((r) => r.label)}
        colLabels={Array.from({ length: PAD_TO }, (_, c) => `${c}`)}
        start={22}
        stagger={2}
      />

      <GridTitle x={GRID_X} y={614} text="position_ids" start={BEAT_2 - 6} />

      <MiniGrid
        rows={POS_ROWS}
        x={GRID_X}
        y={POS_Y}
        cellW={CELL_W}
        cellH={CELL_H}
        gap={CELL_GAP}
        rowLabels={REQUESTS.map((r) => r.label)}
        colLabels={Array.from({ length: PAD_TO }, (_, c) => `${c}`)}
        start={BEAT_2}
        stagger={2}
      />

      <BeatPanel />

    </SceneShell>
  );
};

const GridTitle: React.FC<{ x: number; y: number; text: string; start: number }> = ({ x, y, text, start }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: AP_FONTS.mono,
        fontSize: 30,
        fontWeight: AP_WEIGHT.heading,
        color: AP_COLORS.accent,
        opacity: ramp(frame, start, start + TIMING.base),
        textShadow: AP_COLORS.textShadow,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

const BEATS: { at: number; title: string; color: string; note: string }[] = [
  {
    at: 0,
    title: "1 = real, 0 = padding",
    color: AP_COLORS.key,
    note: "The mask has the same shape as the input: one flag per position, for every sequence in the batch.",
  },
  {
    at: BEAT_2,
    title: "Each row keeps its own positions",
    color: AP_COLORS.value,
    note: "Position ids come from cumsum(mask) − 1, so each row keeps its own positions. Pads collapse onto 0.",
  },
  {
    at: BEAT_3,
    title: "Without it, padding leaks in",
    color: AP_COLORS.negative,
    note: "Attention would score pad tokens like real ones. (Not the causal mask — that hides the future; this hides padding.)",
  },
];

const BeatPanel: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Panel x={1120} y={MASK_Y} width={620} height={PANEL_BOTTOM - MASK_Y} padding="40px 34px" start={26}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {BEATS.map((b, i) => {
          const next = i + 1 < BEATS.length ? BEATS[i + 1].at : null;
          const on =
            ramp(frame, b.at, b.at + TIMING.fast) * (next === null ? 1 : 1 - ramp(frame, next, next + TIMING.fast));
          return (
            <div
              key={b.title}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                opacity: on,
              }}
            >
              <div
                style={{
                  fontFamily: AP_FONTS.sans,
                  fontSize: 38,
                  fontWeight: AP_WEIGHT.heading,
                  letterSpacing: AP_TRACK.heading,
                  lineHeight: 1.15,
                  color: b.color,
                  textShadow: AP_COLORS.textShadow,
                }}
              >
                {b.title}
              </div>
              <PanelText size={28}>{b.note}</PanelText>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};
