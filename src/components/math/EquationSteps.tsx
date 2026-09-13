import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_FONTS } from "../shared/theme";
import { Equation } from "./Equation";
import type { EquationHighlight } from "./Equation";
import { EASE, ramp } from "./motion";

/**
 * Shows one formula evolving across a sequence of steps instead of cutting.
 *
 * Each step crossfades into the next with opposite vertical drift, so the
 * formula reads as being *rearranged* rather than replaced — which is the
 * difference between an explainer and a slideshow.
 */

export type EquationStep = {
  /** LaTeX for this step. Use `hl()` to tag subterms. */
  tex: string;
  /** Frame at which this step takes over. */
  at: number;
  highlights?: EquationHighlight[];
  /** One-line reason shown beneath the formula while this step is active. */
  note?: string;
};

export type EquationStepsProps = {
  steps: EquationStep[];
  size?: number;
  /** Vertical position of the formula in the 1080p canvas. */
  y?: number;
  /** Crossfade length in frames. */
  crossfade?: number;
  showRail?: boolean;
  railY?: number;
};

export const EquationSteps: React.FC<EquationStepsProps> = ({
  steps,
  size = 58,
  y = 372,
  crossfade = 16,
  showRail = true,
  railY = 812,
}) => {
  const frame = useCurrentFrame();

  let activeIndex = 0;
  for (let i = 0; i < steps.length; i++) {
    if (frame >= steps[i].at) activeIndex = i;
  }

  return (
    <>
      {steps.map((step, i) => {
        const next = i + 1 < steps.length ? steps[i + 1] : null;
        const inProgress = ramp(frame, step.at, step.at + crossfade, EASE.out);
        const outProgress = next ? ramp(frame, next.at, next.at + crossfade, EASE.out) : 0;
        const opacity = inProgress * (1 - outProgress);
        // Incoming rises from below, outgoing continues upward: one direction.
        const shift = (1 - inProgress) * 26 - outProgress * 26;

        return (
          <div
            key={step.tex + i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1920,
              height: 1080,
              opacity,
              transform: `translateY(${shift}px)`,
              pointerEvents: "none",
            }}
          >
            <Equation
              tex={step.tex}
              size={size}
              y={y}
              highlights={step.highlights}
              animateIn={false}
            />
            {step.note ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: y + 168,
                  width: 1920,
                  textAlign: "center",
                  color: AP_COLORS.textSecondary,
                  fontSize: 28,
                  fontWeight: 500,
                  fontFamily: AP_FONTS.sans,
                  padding: "0 200px",
                  lineHeight: 1.45,
                }}
              >
                {step.note}
              </div>
            ) : null}
          </div>
        );
      })}

      {showRail ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: railY,
            width: 1920,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
          }}
        >
          {steps.map((step, i) => {
            const on = i <= activeIndex;
            const lit = ramp(frame, step.at, step.at + crossfade, EASE.out);
            const current = i === activeIndex;
            return (
              <div
                key={step.tex + "rail" + i}
                style={{
                  height: 6,
                  borderRadius: 999,
                  width: current ? 46 : 22,
                  background: on
                    ? AP_COLORS.accent
                    : "rgba(255, 255, 255, 0.13)",
                  opacity: on ? 0.35 + 0.65 * lit : 1,
                }}
              />
            );
          })}
          <div
            style={{
              marginLeft: 16,
              color: AP_COLORS.textMuted,
              fontSize: 22,
              fontWeight: 600,
              fontFamily: AP_FONTS.mono,
              letterSpacing: "0.06em",
            }}
          >
            step {activeIndex + 1} / {steps.length}
          </div>
        </div>
      ) : null}
    </>
  );
};
