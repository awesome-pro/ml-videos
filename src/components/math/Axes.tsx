import React from "react";
import { AP_COLORS, AP_FONTS } from "../shared/theme";
import { clamp01 } from "./motion";

/**
 * SVG diagram primitives for maths that needs to be *seen*, not just read:
 * axes with real tick geometry, functions that draw themselves, and vectors
 * that grow along a direction.
 *
 * Everything is a plain SVG on the 1920x1080 canvas, so it composes with the
 * DOM-based scenes. All geometry is computed from props + frame — nothing is
 * measured, and there are no SVG filters (blur is a real render-time cost).
 */

export type ScaleConfig = {
  left: number;
  top: number;
  width: number;
  height: number;
  xDomain: [number, number];
  yDomain: [number, number];
};

export type Scale = {
  /** Data x -> canvas px. */
  x: (value: number) => number;
  /** Data y -> canvas px (flipped, so larger values sit higher). */
  y: (value: number) => number;
  xDomain: [number, number];
  yDomain: [number, number];
  area: { left: number; top: number; right: number; bottom: number; width: number; height: number };
};

const EPS = 1e-9;

export function makeScale(config: ScaleConfig): Scale {
  const { left, top, width, height, xDomain, yDomain } = config;
  const xSpan = xDomain[1] - xDomain[0] || EPS;
  const ySpan = yDomain[1] - yDomain[0] || EPS;
  return {
    x: (value: number) => left + ((value - xDomain[0]) / xSpan) * width,
    y: (value: number) => top + height - ((value - yDomain[0]) / ySpan) * height,
    xDomain,
    yDomain,
    area: { left, top, right: left + width, bottom: top + height, width, height },
  };
}

/** Where the x-axis line sits, clamped into the visible domain. */
export function axisY(scale: Scale): number {
  const zero = Math.min(Math.max(0, scale.yDomain[0]), scale.yDomain[1]);
  return scale.y(zero);
}

/** Where the y-axis line sits, clamped into the visible domain. */
export function axisX(scale: Scale): number {
  const zero = Math.min(Math.max(0, scale.xDomain[0]), scale.xDomain[1]);
  return scale.x(zero);
}

export type DiagramProps = ScaleConfig & {
  xTicks?: number[];
  yTicks?: number[];
  xTickFormat?: (value: number) => string;
  yTickFormat?: (value: number) => string;
  xLabel?: string;
  yLabel?: string;
  /** 0 -> axes hidden, 1 -> fully drawn. */
  progress?: number;
  /** Skip axes and ticks, only position children. */
  bare?: boolean;
  children?: (scale: Scale) => React.ReactNode;
};

export const Diagram: React.FC<DiagramProps> = ({
  xTicks,
  yTicks,
  xTickFormat,
  yTickFormat,
  xLabel,
  yLabel,
  progress = 1,
  bare = false,
  children,
  ...config
}) => {
  const scale = makeScale(config);
  const { area } = scale;
  const reveal = clamp01(progress);
  const formatX = xTickFormat ?? ((v: number) => String(v));
  const formatY = yTickFormat ?? ((v: number) => String(v));

  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}
      width={1920}
      height={1080}
    >
      {!bare ? (
        <g opacity={reveal}>
          {(yTicks ?? []).map((tick) => (
            <g key={"yg" + tick}>
              <line
                x1={area.left}
                x2={area.right}
                y1={scale.y(tick)}
                y2={scale.y(tick)}
                stroke={AP_COLORS.gridLine}
                strokeWidth={1}
              />
              <text
                x={area.left - 18}
                y={scale.y(tick)}
                fill={AP_COLORS.textMuted}
                fontSize={24}
                fontFamily={AP_FONTS.mono}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatY(tick)}
              </text>
            </g>
          ))}

          {(xTicks ?? []).map((tick) => (
            <g key={"xg" + tick}>
              <line
                x1={scale.x(tick)}
                x2={scale.x(tick)}
                y1={area.top}
                y2={area.bottom}
                stroke={AP_COLORS.gridLine}
                strokeWidth={1}
              />
              <text
                x={scale.x(tick)}
                y={area.bottom + 32}
                fill={AP_COLORS.textMuted}
                fontSize={24}
                fontFamily={AP_FONTS.mono}
                textAnchor="middle"
              >
                {formatX(tick)}
              </text>
            </g>
          ))}

          <line
            x1={area.left}
            x2={area.right}
            y1={axisY(scale)}
            y2={axisY(scale)}
            stroke="rgba(255,255,255,0.34)"
            strokeWidth={1.6}
            pathLength={1}
            strokeDasharray={`${reveal} 1`}
          />
          <line
            x1={axisX(scale)}
            x2={axisX(scale)}
            y1={area.top}
            y2={area.bottom}
            stroke="rgba(255,255,255,0.34)"
            strokeWidth={1.6}
            pathLength={1}
            strokeDasharray={`${reveal} 1`}
          />

          {xLabel ? (
            <text
              x={area.right}
              y={area.bottom + 76}
              fill={AP_COLORS.textSecondary}
              fontSize={28}
              fontFamily={AP_FONTS.sans}
              textAnchor="end"
            >
              {xLabel}
            </text>
          ) : null}
          {yLabel ? (
            <text
              x={area.left - 70}
              y={area.top - 24}
              fill={AP_COLORS.textSecondary}
              fontSize={28}
              fontFamily={AP_FONTS.sans}
              textAnchor="start"
            >
              {yLabel}
            </text>
          ) : null}
        </g>
      ) : null}

      {children ? children(scale) : null}
    </svg>
  );
};

export type CurveProps = {
  scale: Scale;
  fn: (x: number) => number;
  /** Defaults to the x domain of the scale. */
  from?: number;
  to?: number;
  samples?: number;
  color: string;
  strokeWidth?: number;
  /** 0 -> not drawn, 1 -> fully drawn. */
  draw?: number;
  dashed?: boolean;
  /** Halo strength behind the line (0 disables). */
  glow?: number;
};

export const Curve: React.FC<CurveProps> = ({
  scale,
  fn,
  from,
  to,
  samples = 160,
  color,
  strokeWidth = 4,
  draw = 1,
  dashed = false,
  glow = 0,
}) => {
  const startX = from ?? scale.xDomain[0];
  const endX = to ?? scale.xDomain[1];

  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const xv = startX + (endX - startX) * t;
    const yv = fn(xv);
    if (!isFinite(yv)) continue;
    points.push(scale.x(xv).toFixed(2) + "," + scale.y(yv).toFixed(2));
  }
  if (points.length < 2) return null;
  const d = "M" + points.join(" L");

  return (
    <g>
      {glow > 0 ? (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 12}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.16 * glow}
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={dashed ? "0.018 0.02" : `${clamp01(draw)} 1`}
      />
    </g>
  );
};

export type VectorArrowProps = {
  scale: Scale;
  /** Tail position in data coordinates. */
  x: number;
  y: number;
  /** Vector components in data coordinates. */
  dx: number;
  dy: number;
  color: string;
  /** 0 -> tail only, 1 -> full length. */
  progress?: number;
  width?: number;
  label?: string;
  labelOffset?: number;
};

export const VectorArrow: React.FC<VectorArrowProps> = ({
  scale,
  x,
  y,
  dx,
  dy,
  color,
  progress = 1,
  width = 4,
  label,
  labelOffset = 30,
}) => {
  const p = clamp01(progress);
  const tailX = scale.x(x);
  const tailY = scale.y(y);
  const fullX = scale.x(x + dx);
  const fullY = scale.y(y + dy);
  const tipX = tailX + (fullX - tailX) * p;
  const tipY = tailY + (fullY - tailY) * p;

  const angle = Math.atan2(tipY - tailY, tipX - tailX);
  const head = 16;
  const spread = 0.42;
  const h1x = tipX - head * Math.cos(angle - spread);
  const h1y = tipY - head * Math.sin(angle - spread);
  const h2x = tipX - head * Math.cos(angle + spread);
  const h2y = tipY - head * Math.sin(angle + spread);

  return (
    <g opacity={p > 0 ? 1 : 0}>
      <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke={color} strokeWidth={width} strokeLinecap="round" />
      {p > 0.02 ? <polygon points={`${tipX},${tipY} ${h1x},${h1y} ${h2x},${h2y}`} fill={color} /> : null}
      {label ? (
        <text
          x={tipX + labelOffset}
          y={tipY - labelOffset * 0.55}
          fill={color}
          fontSize={30}
          fontWeight={700}
          fontFamily={AP_FONTS.mono}
          textAnchor="middle"
          dominantBaseline="middle"
          opacity={p}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

export type PointMarkProps = {
  scale: Scale;
  x: number;
  y: number;
  color: string;
  /** 0 -> hidden, 1 -> fully shown. */
  appear?: number;
  radius?: number;
  label?: string;
  /** Dashed drop line down to the x-axis. */
  dropLine?: boolean;
};

export const PointMark: React.FC<PointMarkProps> = ({
  scale,
  x,
  y,
  color,
  appear = 1,
  radius = 9,
  label,
  dropLine = false,
}) => {
  const p = clamp01(appear);
  const px = scale.x(x);
  const py = scale.y(y);

  return (
    <g opacity={p}>
      {dropLine ? (
        <line
          x1={px}
          y1={py}
          x2={px}
          y2={axisY(scale)}
          stroke={color}
          strokeWidth={1.6}
          strokeDasharray="5 6"
          opacity={0.5}
        />
      ) : null}
      <circle cx={px} cy={py} r={radius * 2.1 * p} fill={color} opacity={0.16} />
      <circle cx={px} cy={py} r={radius * p} fill={color} />
      {label ? (
        <text
          x={px + 22}
          y={py - 22}
          fill={AP_COLORS.textPrimary}
          fontSize={28}
          fontWeight={700}
          fontFamily={AP_FONTS.mono}
          opacity={p}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};
