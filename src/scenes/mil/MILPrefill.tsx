import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { ramp, TIMING } from "../../components/math";
import { Panel, PanelText, TokenRow, tokenRowWidth } from "../../components/mil";
import { KV_SHAPE, PROMPT, VOCAB_LABEL } from "./data";

/**
 * Prefill: the first pass, and the reason it is only one pass.
 *
 * Every prompt token is already known, and the causal mask only ever lets a
 * position look *left* — so position 4 never waits on position 5. The whole
 * prompt therefore goes through in a single forward pass, which is why this
 * half of inference looks nothing like the token-at-a-time loop that follows.
 *
 * Two things come out of that one pass: K and V for all five positions, which
 * is the cache arriving already full, and a row of scores per position, of
 * which only the last is read (the next scene explains why).
 *
 * The five arrows draw in together. That simultaneity is the whole idea; the
 * previous scene's bars arrive one step at a time.
 */

const COLS = PROMPT.length;
const CELL_W = 190;
const GAP = 14;
const ROW_W = tokenRowWidth(COLS, CELL_W, GAP); // 898
const ROW_X = 960 - ROW_W / 2; // 511
const ROW_Y = 300;
/** TokenRow prints ids 8px under the cells; the arrows start clear of them. */
const ID_BOTTOM = ROW_Y + 29 + 8 + 28;

const BAND_X = ROW_X;
const BAND_Y = 410;
const BAND_W = ROW_W;
const BAND_H = 68;

const PANEL_Y = 542;
const PANEL_W = 720;
const PANEL_H = 234;

const centreOf = (i: number) => ROW_X + CELL_W / 2 + i * (CELL_W + GAP);

/** Frames. */
const TOKENS = 60;
const ARROWS = 112;
const BAND = 130;
const PANELS = 236;
const NOTE = 350;

const LAST_ANIM = NOTE + TIMING.base; // 370
export const MIL_PREFILL_DURATION = LAST_ANIM + 50; // 420 (14.0s)

/** The numbers the layout audit checks against the 1920x1080 frame. */
export const PREFILL_GEOM = {
  rowX: ROW_X,
  rowY: ROW_Y,
  rowW: ROW_W,
  bandX: BAND_X,
  bandY: BAND_Y,
  bandW: BAND_W,
  bandH: BAND_H,
  panelY: PANEL_Y,
  panelW: PANEL_W,
  panelH: PANEL_H,
  leftPanelX: 220,
  rightPanelX: 984,
  noteY: 822,
  bottom: PANEL_Y + PANEL_H,
} as const;

export const MILPrefill: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell title="Prefill: the prompt in one pass" duration={MIL_PREFILL_DURATION}>

      <TokenRow
        tokens={PROMPT}
        x={ROW_X}
        y={ROW_Y}
        cellW={CELL_W}
        cellH={58}
        gap={GAP}
        fontSize={30}
        start={TOKENS}
        stagger={5}
      />

      {/* All five draw at once. That is the difference from decode. */}
      {Array.from({ length: COLS }).map((_, i) => (
        <FlowArrow
          key={`in${i}`}
          x1={centreOf(i)}
          y1={ID_BOTTOM + 8}
          x2={centreOf(i)}
          y2={BAND_Y - 4}
          color={AP_COLORS.accent}
          appearDelay={ARROWS}
          drawDuration={18}
          thickness={3}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: BAND_X,
          top: BAND_Y,
          width: BAND_W,
          height: BAND_H,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          background: AP_COLORS.accentBg,
          border: `1.5px solid ${AP_COLORS.accentBorder}`,
          opacity: ramp(frame, BAND, BAND + TIMING.base),
          transform: `scaleY(${0.7 + 0.3 * ramp(frame, BAND, BAND + TIMING.base)})`,
        }}
      >
        <span
          style={{
            fontFamily: AP_FONTS.sans,
            fontSize: 34,
            fontWeight: AP_WEIGHT.heading,
            color: AP_COLORS.accent,
            whiteSpace: "nowrap",
            textShadow: AP_COLORS.textShadow,
          }}
        >
          one forward pass · all {COLS} positions at once
        </span>
      </div>

      <FlowArrow
        x1={580}
        y1={BAND_Y + BAND_H}
        x2={580}
        y2={PANEL_Y - 4}
        color={AP_COLORS.textMuted}
        appearDelay={PANELS - 24}
        thickness={3}
      />
      <FlowArrow
        x1={1344}
        y1={BAND_Y + BAND_H}
        x2={1344}
        y2={PANEL_Y - 4}
        color={AP_COLORS.textMuted}
        appearDelay={PANELS - 24}
        thickness={3}
      />

      <Panel
        x={220}
        y={PANEL_Y}
        width={PANEL_W}
        height={PANEL_H}
        title="K and V"
        titleColor={AP_COLORS.key}
        start={PANELS}
      >
        <PanelText mono size={28} color={AP_COLORS.textPrimary}>
          [B={KV_SHAPE.batch}, {KV_SHAPE.heads} heads, T={COLS}, {KV_SHAPE.dim}]
        </PanelText>
        <PanelText size={28}>one pair per position.</PanelText>
      </Panel>

      <Panel
        x={984}
        y={PANEL_Y}
        width={PANEL_W}
        height={PANEL_H}
        title="logits"
        titleColor={AP_COLORS.value}
        start={PANELS + 30}
      >
        <PanelText mono size={28} color={AP_COLORS.textPrimary}>
          [B={KV_SHAPE.batch}, T={COLS}, V={VOCAB_LABEL}]
        </PanelText>
        <PanelText size={28}>only the last row is read.</PanelText>
      </Panel>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 822,
          width: 1920,
          textAlign: "center",
          opacity: ramp(frame, NOTE, NOTE + TIMING.fast),
          color: AP_COLORS.textSecondary,
          fontFamily: AP_FONTS.sans,
          fontSize: 30,
          fontWeight: AP_WEIGHT.body,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        One pass over the prompt — this is what TTFT measures.
      </div>
    </SceneShell>
  );
};
