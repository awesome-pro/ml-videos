import React from "react";

/**
 * A square grid pushed through a map — the 3Blue1Brown "grid on the plane"
 * visual.
 *
 * The grid is *sampled as curves*, not drawn as straight lines, which is what
 * lets the same code show both cases honestly:
 *
 *   - A **matrix** is linear, so every grid line stays straight and parallel;
 *     the square becomes a parallelogram. Nothing curves.
 *   - A **non-linear map** bends those same lines into curves.
 *
 * Both are just different `PlaneMap`s, blended from the identity by `t` so the
 * animation is always a pure function of the frame (AGENTS.md).
 *
 * Renders a `<g>`, so the caller owns the surrounding `<svg>` (and any
 * clipping).
 */

export type PlanePoint = { x: number; y: number };

/**
 * A map from plane to plane, blended from the identity by `t`.
 * `t = 0` must return the input unchanged so the grid starts square.
 */
export type PlaneMap = (x: number, y: number, t: number) => PlanePoint;

/** Linear map: blends the identity matrix into `m` as `t` goes 0 -> 1. */
export function matrixMap(m: readonly [number, number, number, number]): PlaneMap {
  return (x, y, t) => {
    const a = 1 + (m[0] - 1) * t;
    const b = m[1] * t;
    const c = m[2] * t;
    const d = 1 + (m[3] - 1) * t;
    return { x: a * x + b * y, y: c * x + d * y };
  };
}

/**
 * Non-linear map: displaces each point by a sine of the *other* coordinate,
 * which ripples the grid into curves. Origin stays fixed.
 */
export function sineWarpMap(amplitude = 1.1, frequency = 0.8): PlaneMap {
  return (x, y, t) => ({
    x: x + amplitude * Math.sin(frequency * y) * t,
    y: y + amplitude * Math.sin(frequency * x) * t,
  });
}

export type GridRegion = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  fill: string;
  stroke: string;
  opacity?: number;
  samples?: number;
};

export type WarpedGridProps = {
  /** Canvas position of the plane's origin. */
  centerX: number;
  centerY: number;
  /** Pixels per unit. */
  unit: number;
  /** Half-width of the grid, in units. */
  extent: number;
  /** Spacing between grid lines, in units. */
  step?: number;
  map: PlaneMap;
  /** Blend: 0 = square grid, 1 = fully transformed. */
  t: number;
  /** Points sampled per line. More = smoother curves. */
  samples?: number;
  baseColor?: string;
  color?: string;
  axisColor?: string;
  baseOpacity?: number;
  opacity?: number;
  strokeWidth?: number;
  baseStrokeWidth?: number;
  /** Optional mapped rectangle, e.g. the unit square. */
  region?: GridRegion;
  /** Fade the whole grid in/out. */
  appear?: number;
};

export const WarpedGrid: React.FC<WarpedGridProps> = ({
  centerX,
  centerY,
  unit,
  extent,
  step = 1,
  map,
  t,
  samples = 44,
  baseColor = "#2A3550",
  color = "#7B8CC4",
  axisColor = "rgba(255, 255, 255, 0.42)",
  baseOpacity = 0.75,
  opacity = 1,
  strokeWidth = 1.7,
  baseStrokeWidth = 1.2,
  region,
  appear = 1,
}) => {
  const toX = (v: number) => centerX + v * unit;
  const toY = (v: number) => centerY - v * unit;
  const count = Math.floor(extent / step);
  const fade = appear < 0 ? 0 : appear > 1 ? 1 : appear;

  // --- Static reference grid: where everything started. -------------------
  const baseLines: React.ReactNode[] = [];
  if (baseOpacity > 0) {
    for (let i = -count; i <= count; i++) {
      const c = i * step;
      const isAxis = i === 0;
      baseLines.push(
        <line
          key={"bv" + i}
          x1={toX(c)}
          y1={toY(-extent)}
          x2={toX(c)}
          y2={toY(extent)}
          stroke={isAxis ? axisColor : baseColor}
          strokeWidth={isAxis ? baseStrokeWidth + 0.6 : baseStrokeWidth}
          opacity={baseOpacity * fade}
        />,
        <line
          key={"bh" + i}
          x1={toX(-extent)}
          y1={toY(c)}
          x2={toX(extent)}
          y2={toY(c)}
          stroke={isAxis ? axisColor : baseColor}
          strokeWidth={isAxis ? baseStrokeWidth + 0.6 : baseStrokeWidth}
          opacity={baseOpacity * fade}
        />
      );
    }
  }

  // --- Mapped rectangle (unit square), drawn under the warped lines. ------
  let regionNode: React.ReactNode = null;
  if (region) {
    const rs = region.samples ?? 18;
    const ptsX: number[] = [];
    const ptsY: number[] = [];
    const pushEdge = (
      fromX: number,
      fromY: number,
      toXv: number,
      toYv: number
    ) => {
      for (let s = 0; s <= rs; s++) {
        const k = s / rs;
        const p = map(fromX + (toXv - fromX) * k, fromY + (toYv - fromY) * k, t);
        ptsX.push(toX(p.x));
        ptsY.push(toY(p.y));
      }
    };
    pushEdge(region.x0, region.y0, region.x1, region.y0);
    pushEdge(region.x1, region.y0, region.x1, region.y1);
    pushEdge(region.x1, region.y1, region.x0, region.y1);
    pushEdge(region.x0, region.y1, region.x0, region.y0);

    let d = "";
    for (let i = 0; i < ptsX.length; i++) {
      d += (i === 0 ? "M" : " L") + ptsX[i].toFixed(2) + " " + ptsY[i].toFixed(2);
    }
    d += " Z";

    regionNode = (
      <path
        d={d}
        fill={region.fill}
        stroke={region.stroke}
        strokeWidth={2}
        opacity={(region.opacity ?? 1) * fade}
      />
    );
  }

  // --- The transformed grid: sampled polylines, so they can curve. --------
  const lines: React.ReactNode[] = [];
  for (let i = -count; i <= count; i++) {
    const c = i * step;
    const isAxis = i === 0;

    let dv = "";
    for (let s = 0; s <= samples; s++) {
      const y = -extent + 2 * extent * (s / samples);
      const p = map(c, y, t);
      dv += (s === 0 ? "M" : " L") + toX(p.x).toFixed(2) + " " + toY(p.y).toFixed(2);
    }

    let dh = "";
    for (let s = 0; s <= samples; s++) {
      const x = -extent + 2 * extent * (s / samples);
      const p = map(x, c, t);
      dh += (s === 0 ? "M" : " L") + toX(p.x).toFixed(2) + " " + toY(p.y).toFixed(2);
    }

    lines.push(
      <path
        key={"tv" + i}
        d={dv}
        fill="none"
        stroke={isAxis ? axisColor : color}
        strokeWidth={isAxis ? strokeWidth + 0.8 : strokeWidth}
        strokeLinecap="round"
        opacity={opacity * fade}
      />,
      <path
        key={"th" + i}
        d={dh}
        fill="none"
        stroke={isAxis ? axisColor : color}
        strokeWidth={isAxis ? strokeWidth + 0.8 : strokeWidth}
        strokeLinecap="round"
        opacity={opacity * fade}
      />
    );
  }

  return (
    <g>
      {baseLines}
      {regionNode}
      {lines}
    </g>
  );
};
