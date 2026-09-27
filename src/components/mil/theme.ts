import { AP_COLORS } from "../shared/theme";

/**
 * One colour per tensor axis, used everywhere that axis appears so the eye can
 * track B / T / V across scenes. All of them clear 9:1 contrast on the black
 * canvas (see AGENTS.md).
 */
export const MIL_AXIS = {
  /** Batch size — violet. */
  B: AP_COLORS.accent,
  /** Sequence length — teal. */
  T: AP_COLORS.key,
  /** Vocabulary size — amber. */
  V: AP_COLORS.value,
} as const;

export type AxisName = keyof typeof MIL_AXIS;

/** Padding is rose everywhere: pad cells, mask zeros, wasted slots. */
export const MIL_PAD = AP_COLORS.negative;

/**
 * Advance widths in em. We never measure the DOM (AGENTS.md forbids it, and it
 * would break frame determinism), so anything that has to reserve space for
 * text does the arithmetic instead. JetBrains Mono is exactly 0.6em; system-ui
 * averages a little under 0.5em per lowercase character, so 0.52 is the safe
 * side for the sans face.
 */
export const MONO_EM = 0.6;
export const SANS_EM = 0.52;
