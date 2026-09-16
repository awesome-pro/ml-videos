import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AP_COLORS, AP_FONTS } from "../shared/theme";
import { MemBar } from "./MemBar";

export type HeadConfigProps = {
  /** Block title, e.g. "Multi-Head Attention". */
  title: string;
  /** Query heads to draw. */
  qCount: number;
  /** KV heads to draw. */
  kvCount: number;
  /** Human-facing numbers, e.g. "32 Q" / "32 KV". */
  qLabel: string;
  kvLabel: string;
  /** 0..1 — relative KV-cache size (memory bar under the block). */
  memFraction: number;
  /** Horizontal center of the block (canvas coords). */
  x: number;
  /** Top of the block (canvas coords). */
  y: number;
  /** Accent color for borders / grouping. */
  color?: string;
  appearDelay?: number;
  /** Sub caption under the memory bar. */
  caption?: string;
};

const Q_COLOR = AP_COLORS.query;
const KV_COLOR = AP_COLORS.value;

const WIDTH = 430;
const HEIGHT = 340;

// Block-relative layout.
const Q_LABEL_Y = 78;
const Q_Y = 104;
const Q_CAPTION_Y = 132;
const KV_LABEL_Y = 176;
const KV_Y = 202;
const KV_CAPTION_Y = 230;
const BAR_Y = 268;
const BAR_X = 18;
const BAR_H = 16;

export const HeadConfig: React.FC<HeadConfigProps> = ({
  title,
  qCount,
  kvCount,
  qLabel,
  kvLabel,
  memFraction,
  x,
  y,
  color = AP_COLORS.accent,
  appearDelay = 0,
  caption,
}) => {
  const frame = useCurrentFrame();

  const qStartX = 52;
  const qSpan = WIDTH - 104;
  const kvStartX = 52;
  const kvSpan = WIDTH - 104;

  const qXs = Array.from({ length: qCount }, (_, i) =>
    qCount === 1 ? WIDTH / 2 : qStartX + (i * qSpan) / (qCount - 1)
  );
  const kvXs = Array.from({ length: kvCount }, (_, i) =>
    kvCount === 1 ? WIDTH / 2 : kvStartX + (i * kvSpan) / (kvCount - 1)
  );

  // Group: query dot -> kv dot index (multiple Q share a KV head).
  const kvOf = (qi: number) => Math.min(kvCount - 1, Math.floor((qi * kvCount) / qCount));

  const enter = interpolate(frame - appearDelay, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame - appearDelay, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x - WIDTH / 2,
        top: y,
        width: WIDTH,
        height: HEIGHT,
        padding: "18px 18px 18px",
        borderRadius: 18,
        background: AP_COLORS.surface,
        border: `1.5px solid ${color}`,
        boxShadow: AP_COLORS.cardShadow,
        opacity,
        transform: `translateY(${22 * (1 - enter)}px)`,
      }}
    >
      {/* Title */}
      <div style={{ color: AP_COLORS.textPrimary, fontSize: 24, fontWeight: 700, textAlign: "center", fontFamily: AP_FONTS.sans }}>
        {title}
      </div>

      {/* Query head label + dots */}
      <Label text={qLabel} y={Q_LABEL_Y} color={AP_COLORS.query} />
      {qXs.map((qx, i) => (
        <HeadDot key={`q${i}`} x={qx} y={Q_Y} color={Q_COLOR} label={`Q${i + 1}`} delay={appearDelay + i * 4} />
      ))}
      <Label text="Query heads" y={Q_CAPTION_Y} color={AP_COLORS.query} />

      {/* KV head label + dots */}
      <Label text={kvLabel} y={KV_LABEL_Y} color={AP_COLORS.value} />
      {kvXs.map((kx, i) => (
        <HeadDot key={`kv${i}`} x={kx} y={KV_Y} color={KV_COLOR} label={`KV${i + 1}`} delay={appearDelay + 40 + i * 6} />
      ))}
      <Label text="KV heads" y={KV_CAPTION_Y} color={AP_COLORS.value} />

      {/* Grouping connectors */}
      <svg width={WIDTH} height={KV_Y - Q_Y} viewBox={`0 0 ${WIDTH} ${KV_Y - Q_Y}`} style={{ position: "absolute", left: 0, top: Q_Y, pointerEvents: "none" }}>
        {qXs.map((qx, qi) => (
          <line
            key={`c${qi}`}
            x1={qx}
            y1={0}
            x2={kvXs[kvOf(qi)]}
            y2={KV_Y - Q_Y}
            stroke={color}
            strokeWidth={1.5}
            opacity={0.28 * opacity}
          />
        ))}
      </svg>

      {/* Memory bar (fraction of a full MH KV cache) */}
      <MemBar x={BAR_X} y={BAR_Y} width={WIDTH - BAR_X * 2} height={BAR_H} fill={memFraction} color={color} label={`KV cache · ${Math.round(memFraction * 100)}%`} appearDelay={appearDelay + 60} />
      {caption ? (
        <div style={{ marginTop: 12, textAlign: "center", color: AP_COLORS.textSecondary, fontSize: 24, fontWeight: 500, fontFamily: AP_FONTS.sans }}>
          {caption}
        </div>
      ) : null}
    </div>
  );
};

const Label: React.FC<{ text: string; y: number; color: string }> = ({ text, y, color }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: WIDTH, textAlign: "center", color, fontSize: 24, fontWeight: 600, letterSpacing: "0.04em", fontFamily: AP_FONTS.sans }}>
    {text}
  </div>
);

const HeadDot: React.FC<{ x: number; y: number; color: string; label: string; delay: number }> = ({ x, y, color, label, delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x - 15, top: y - 15, width: 30, height: 30, borderRadius: "50%", background: `${color}33`, border: `1.5px solid ${color}`, boxShadow: AP_COLORS.cardShadowSoft, opacity, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color, fontSize: 19, fontWeight: 700, fontFamily: AP_FONTS.mono }}>{label}</span>
    </div>
  );
};
