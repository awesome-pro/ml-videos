import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { TokenRow, TensorShape, MIL_PAD } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { PAD_TO, REQUESTS } from "./data";

export const MIL_BATCHING_DURATION = 335; // 11.2s

// One uniform grid for every request: that is what makes left-padding visible.
const CELL_W = 150;
const CELL_H = 62;
const CELL_GAP = 10;
const COLS = PAD_TO;
const GRID_W = COLS * CELL_W + (COLS - 1) * CELL_GAP;
const GRID_X = 960 - GRID_W / 2;
const ROW_Y = [410, 520, 630];

/** Frame the pads start filling in. */
const PAD_AT = 150;

export const MILBatching: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell title="One rectangle for many requests" duration={MIL_BATCHING_DURATION}>

      {/* Column ruler: the positions the model will see. */}
      {Array.from({ length: COLS }).map((_, c) => (
        <div
          key={`ruler${c}`}
          style={{
            position: "absolute",
            left: GRID_X + c * (CELL_W + CELL_GAP) + CELL_W / 2,
            top: 340,
            transform: "translateX(-50%)",
            fontFamily: AP_FONTS.mono,
            fontSize: AP_TYPE.label,
            fontWeight: AP_WEIGHT.label,
            color: AP_COLORS.textMuted,
            opacity: ramp(frame, 20 + c * 2, 20 + c * 2 + TIMING.fast),
          }}
        >
          {c}
        </div>
      ))}

      {REQUESTS.map((req, i) => {
        const pads = PAD_TO - req.tokens.length;
        return (
          <React.Fragment key={req.label}>
            <div
              style={{
                position: "absolute",
                left: GRID_X - 26,
                top: ROW_Y[i],
                transform: "translate(-100%, -50%)",
                fontFamily: AP_FONTS.sans,
                fontSize: AP_TYPE.label,
                fontWeight: AP_WEIGHT.label,
                color: AP_COLORS.textSecondary,
                opacity: ramp(frame, 30 + i * 10, 30 + i * 10 + TIMING.fast),
                whiteSpace: "nowrap",
              }}
            >
              {req.label}
            </div>

            <TokenRow
              tokens={req.tokens}
              x={GRID_X}
              y={ROW_Y[i]}
              cellW={CELL_W}
              cellH={CELL_H}
              gap={CELL_GAP}
              fontSize={26}
              start={30 + i * 10}
              stagger={4}
              padCount={pads}
              padShift={pads * ramp(frame, PAD_AT, PAD_AT + 20)}
              padStart={PAD_AT}
            />

            <RowCount x={GRID_X + GRID_W + 26} y={ROW_Y[i]} real={req.tokens.length} pads={pads} />
          </React.Fragment>
        );
      })}


      <TensorShape
        name="input_ids"
        dims={[
          { axis: "B", value: "3", note: "three requests" },
          { axis: "T", value: `${PAD_TO}`, note: "padded to the longest" },
        ]}
        y={800}
        size={46}
        start={214}
        pops={[
          { index: 1, at: 240 },
          { index: 0, at: 268 },
        ]}
      />

    </SceneShell>
  );
};

/** The row's real length, crossfading into its padded breakdown. */
const RowCount: React.FC<{ x: number; y: number; real: number; pads: number }> = ({ x, y, real, pads }) => {
  const frame = useCurrentFrame();
  const after = ramp(frame, PAD_AT + 4, PAD_AT + 20);
  const before = 1 - after;

  const style: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    transform: "translateY(-50%)",
    fontFamily: AP_FONTS.mono,
    fontSize: AP_TYPE.label,
    fontWeight: AP_WEIGHT.label,
    whiteSpace: "nowrap",
  };

  return (
    <>
      <div style={{ ...style, color: MIL_PAD, opacity: before }}>{real} token{real === 1 ? "" : "s"}</div>
      <div style={{ ...style, color: AP_COLORS.key, opacity: after }}>
        {pads === 0 ? `${real} · no pad` : `${pads} pad + ${real}`}
      </div>
    </>
  );
};
