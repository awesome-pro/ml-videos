import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../shared/theme";
import { enterStyle, mixHex, ramp, TIMING } from "../math";
import { MIL_AXIS, type AxisName } from "./theme";

/**
 * A tensor shape, written the way you would in code:
 *
 *     input_ids  [ B=1 , T=5 ]
 *
 * Each axis keeps its own colour for the whole video, and can be "popped"
 * (scaled + glowed) at a chosen frame so a scene can say *this* axis is the
 * one we are introducing. The pop is a transform only, so it can never
 * disturb the layout of its neighbours.
 */

export type ShapeDim = {
  axis: AxisName;
  /** Concrete value, e.g. "3". */
  value: string;
  /** Short gloss shown under the axis, e.g. "batch size". */
  note?: string;
};

/** Scales and lights one axis at a chosen frame. */
export type ShapePop = { index: number; at: number };

export type TensorShapeProps = {
  /** Tensor name, e.g. "logits". Omit for a bare shape. */
  name?: string;
  dims: ShapeDim[];
  /** Top offset of the shape line in the 1920x1080 canvas. */
  y: number;
  size?: number;
  start?: number;
  /** Axes to pop, in order. A popped axis stays lit. */
  pops?: ShapePop[];
  /** Note printed under the whole shape. */
  note?: string;
};

export const TensorShape: React.FC<TensorShapeProps> = ({
  name,
  dims,
  y,
  size = 52,
  start = 0,
  pops = [],
  note,
}) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, start, start + TIMING.base);

  const line: React.CSSProperties = {
    lineHeight: 1.12,
    fontFamily: AP_FONTS.mono,
    fontWeight: AP_WEIGHT.label,
    fontSize: size,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1920, ...enterStyle(appear, { rise: 12 }) }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        {name ? (
          <span style={{ ...line, color: AP_COLORS.textSecondary, fontSize: size * 0.72 }}>{name}</span>
        ) : null}
        <span style={{ ...line, color: AP_COLORS.textMuted }}>[</span>

        {dims.map((dim, i) => {
          let lit = 0;
          for (const pop of pops) {
            if (pop.index === i) lit = Math.max(lit, ramp(frame, pop.at, pop.at + TIMING.fast));
          }
          const color = MIL_AXIS[dim.axis];
          return (
            <React.Fragment key={dim.axis}>
              {i > 0 ? <span style={{ ...line, color: AP_COLORS.textMuted }}>,</span> : null}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  transform: `scale(${1 + lit * 0.16})`,
                  transformOrigin: "center top",
                }}
              >
                <span style={{ ...line, color: mixHex(AP_COLORS.textSecondary, color, lit) }}>
                  {dim.axis}
                  <span style={{ color }}>={dim.value}</span>
                </span>
                {dim.note ? (
                  <span
                    style={{
                      fontFamily: AP_FONTS.sans,
                      fontSize: AP_TYPE.label,
                      fontWeight: AP_WEIGHT.label,
                      color: lit > 0 ? AP_COLORS.textSecondary : AP_COLORS.textMuted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {dim.note}
                  </span>
                ) : null}
              </div>
            </React.Fragment>
          );
        })}

        <span style={{ ...line, color: AP_COLORS.textMuted }}>]</span>
      </div>

      {note ? (
        <div
          style={{
            marginTop: 30,
            textAlign: "center",
            fontFamily: AP_FONTS.sans,
            fontSize: AP_TYPE.label,
            fontWeight: AP_WEIGHT.label,
            color: AP_COLORS.textSecondary,
            padding: "0 200px",
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};
