import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useCurrentFrame } from "remotion";
import { AP_COLORS } from "../shared/theme";
import { mixHex, withAlpha } from "./color";
import { enterStyle, pulse, ramp, TIMING } from "./motion";

/**
 * Real LaTeX typesetting inside Remotion.
 *
 * The previous approach composed formulas out of monospace spans, which is why
 * they read as code rather than maths. KaTeX gives proper fraction bars, roots,
 * italic variables and operator spacing — and it lays out synchronously, so it
 * stays deterministic (no measurement, no async fonts).
 *
 * Subterm emphasis is done with KaTeX's `\htmlClass`, which means we never
 * measure the DOM: the highlight is a CSS rule we regenerate per frame.
 */

/** Marks a subterm so it can be lit up later. Pair with an `EquationHighlight`. */
export function hl(id: string, body: string): string {
  return "\\htmlClass{eq-hl-" + id + "}{" + body + "}";
}

export type EquationHighlight = {
  /** Must match the id passed to `hl(id, ...)` inside the TeX. */
  id: string;
  /** Accent colour this term lights up with. */
  color: string;
  /** Frame (in scene time) at which the term lights up. */
  start: number;
  /** Light-up duration in frames. */
  duration?: number;
};

export type EquationProps = {
  /** LaTeX source. Use `hl()` to tag subterms you want to emphasise. */
  tex: string;
  size?: number;
  /** Base text colour, used for anything not highlighted. */
  color?: string;
  highlights?: EquationHighlight[];
  /** Dim the untouched parts of the formula once emphasis begins. */
  dimBase?: boolean;
  /** Top offset in the 1920x1080 canvas. */
  y?: number;
  align?: "center" | "left";
  /** Horizontal offset of the layout box — use for side panels. */
  x?: number;
  /** Width of the layout box. Defaults to the full 1920 canvas. */
  width?: number;
  /** Frame at which the equation enters. */
  start?: number;
  enterDuration?: number;
  displayMode?: boolean;
  /** Set false when a parent (e.g. `EquationSteps`) owns the entrance motion. */
  animateIn?: boolean;
};

export const Equation: React.FC<EquationProps> = ({
  tex,
  size = 56,
  color = AP_COLORS.textPrimary,
  highlights,
  dimBase = true,
  y = 0,
  align = "center",
  x = 0,
  width = 1920,
  start = 0,
  enterDuration = TIMING.base,
  displayMode = true,
  animateIn = true,
}) => {
  const frame = useCurrentFrame();

  // Stable, collision-free scope so two equations on screen can both use
  // `hl("q", ...)` without their CSS rules fighting each other.
  const rawId = React.useId();
  const scope = "eq" + rawId.split("").filter((c) => /[a-zA-Z0-9]/.test(c)).join("");

  // Parsing the TeX every frame would be a real render cost; the markup is a
  // pure function of the source, so cache it.
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        trust: true,
        strict: false,
        output: "html",
      }),
    [tex, displayMode]
  );

  const list = highlights ?? [];
  let focus = 0;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    focus = Math.max(focus, ramp(frame, item.start, item.start + (item.duration ?? TIMING.fast)));
  }

  const rules: string[] = [
    // Neutralise KaTeX's document-oriented defaults so `size` is exact.
    "." + scope + " .katex{font-size:1em;}",
    "." + scope + " .katex-display{margin:0;}",
  ];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const duration = item.duration ?? TIMING.fast;
    const lit = ramp(frame, item.start, item.start + duration);
    const glow = pulse(frame, item.start, 8, 30);
    const haloRadius = 10 + 22 * glow;
    rules.push(
      "." +
        scope +
        " .eq-hl-" +
        item.id +
        "{" +
        "color:" +
        mixHex(AP_COLORS.textSecondary, item.color, lit) +
        ";" +
        "background:" +
        withAlpha(item.color, 0.07 * lit + 0.16 * glow) +
        ";" +
        "text-shadow:0 0 " +
        haloRadius.toFixed(1) +
        "px " +
        withAlpha(item.color, 0.55 * glow) +
        ";" +
        "border-radius:6px;padding:0.06em 0.16em;margin:-0.06em -0.16em;" +
        "}"
    );
  }

  const baseColor = dimBase ? mixHex(color, AP_COLORS.textMuted, focus) : color;

  const content = (
    <div
      className={scope}
      style={{
        display: "inline-block",
        color: baseColor,
        fontSize: size,
        lineHeight: 1.18,
        whiteSpace: "nowrap",
        padding: "0 60px",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  const shellStyle: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width,
    textAlign: align,
  };

  return (
    <div
      style={
        animateIn
          ? { ...shellStyle, ...enterStyle(ramp(frame, start, start + enterDuration), { rise: 14 }) }
          : shellStyle
      }
    >
      <style>{rules.join("")}</style>
      {content}
    </div>
  );
};

/** Inline variant for maths embedded in a sentence or a label. */
export const Tex: React.FC<{
  tex: string;
  size?: number;
  color?: string;
}> = ({ tex, size = 30, color = AP_COLORS.textPrimary }) => {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: false,
        throwOnError: false,
        strict: false,
        output: "html",
      }),
    [tex]
  );
  return (
    <span
      style={{ color, fontSize: size, display: "inline-block", verticalAlign: "middle" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
