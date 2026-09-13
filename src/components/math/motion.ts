import type { CSSProperties } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * One motion language for the whole video.
 *
 * The reason explainer videos feel amateur is usually not the tool — it is
 * inconsistent motion: every scene inventing its own duration, distance and
 * curve. Everything here is a pure function of the frame number, so a given
 * frame always renders identically (AGENTS.md). No CSS transitions, no
 * wall-clock timers, no layout measurement.
 */

/** Signature easing curves. Use `out` for almost everything. */
export const EASE = {
  /** Fast start, long soft landing — the house curve. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Slight overshoot, for deliberate emphasis only. */
  emphasis: Easing.bezier(0.2, 1.2, 0.35, 1),
} as const;

/** Frame budgets at 30fps. */
export const TIMING = {
  micro: 8,
  fast: 14,
  base: 20,
  slow: 30,
} as const;

/** Spring presets tuned for scale/position changes. */
export const SPRING_PRESET = {
  settle: { damping: 20, mass: 0.9, stiffness: 95 },
  snappy: { damping: 17, mass: 0.7, stiffness: 150 },
  heavy: { damping: 26, mass: 1.5, stiffness: 80 },
} as const;

export type SpringPreset = keyof typeof SPRING_PRESET;

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** 0 -> 1 ramp between two frames, clamped at both ends. */
export function ramp(frame: number, from: number, to: number, easing = EASE.out): number {
  return interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

/** `ramp` measured from the current frame: pass the frame the motion starts at. */
export function useRamp(start: number, duration: number = TIMING.base, easing = EASE.out): number {
  return ramp(useCurrentFrame() - start, 0, duration, easing);
}

/** Springy 0 -> 1 entrance for anything that should feel physical. */
export function useSpringIn(delay = 0, preset: SpringPreset = "settle"): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: SPRING_PRESET[preset] });
}

/**
 * The default entrance: rises and settles. Returns layout-neutral styles
 * (opacity + transform only) so callers can compose it freely.
 */
export function enterStyle(
  progress: number,
  opts: { rise?: number; scaleFrom?: number } = {}
): CSSProperties {
  const rise = opts.rise ?? 16;
  const scaleFrom = opts.scaleFrom ?? 1;
  const scale = scaleFrom === 1 ? "" : ` scale(${scaleFrom + (1 - scaleFrom) * progress})`;
  return {
    opacity: clamp01(progress),
    transform: `translateY(${(1 - progress) * rise}px)${scale}`,
  };
}

/** Start frame for item `index` of a staggered group. */
export function stagger(index: number, start: number, step = 5): number {
  return start + index * step;
}

/** A glow that spikes at `start` then settles back to zero. */
export function pulse(frame: number, start: number, up = 9, down = 26): number {
  const t = frame - start;
  if (t < 0) return 0;
  if (t <= up) return interpolate(t, [0, up], [0, 1], { easing: EASE.out });
  return interpolate(t, [up, up + down], [1, 0], { easing: EASE.out });
}

/** `pulse` measured from the current frame. */
export function usePulse(start: number, up = 9, down = 26): number {
  return pulse(useCurrentFrame(), start, up, down);
}
