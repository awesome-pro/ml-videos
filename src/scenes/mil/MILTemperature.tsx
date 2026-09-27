import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { ProbRuler, pickIndex, type RulerSeg } from "../../components/mil";
import { ramp, TIMING } from "../../components/math";
import { DRAWS, SAMPLING_SEGS, withTemperature } from "./data";

/**
 * Temperature, shown as the one thing it actually does.
 *
 * The six draws from the sampling scene come back — the SAME six, at the same
 * positions, drawn once and never moved. All that changes underneath them is
 * the ruler. That is the entire lesson: temperature does not touch the dice, it
 * reshapes the odds the dice land on.
 *
 *   T = 1.0  Paris 62%  → 4 of 6 draws take Paris: the model's own opinion
 *   T = 0.5  Paris 92%  → 5 of 6: colder, sharper, almost greedy
 *   T = 2.0  Paris 37%  → 2 of 6: hotter, flatter, genuinely random
 *
 * The numbers are not decorative. `withTemperature` is `p^(1/T)` renormalised,
 * which is exactly what dividing logits by T does to a softmax output.
 */

/** Ruler geometry. Exported so the layout audit checks the rendered numbers. */
export const TEMPERATURE_GEOM = { x: 180, y: 450, width: 1540, height: 96, readoutY: 320, ruleY: 600, noteY: 686 };
const { x: X, y: Y, width: W, height: H } = TEMPERATURE_GEOM;

/** The six draws land early and then never move again. */
const DRAW_AT = 50;
const DRAW_STEP = 20;
const drawFrames = DRAWS.map((_, k) => DRAW_AT + k * DRAW_STEP);
const DRAWN_BY = DRAW_AT + (DRAWS.length - 1) * DRAW_STEP + TIMING.fast; // 164

/** Temperature steps, and the frames each one is held. */
const COLD_AT = 175; // 1.0 -> 0.5
const COLD_BY = COLD_AT + TIMING.base;
const HOT_AT = 285; // 0.5 -> 2.0
const HOT_BY = HOT_AT + TIMING.base;
const NOTE_AT = 435;

const LAST_ANIM = NOTE_AT + TIMING.fast;

export const TEMPERATURE_STEPS = [1, 0.5, 2];
export const MIL_TEMPERATURE_DURATION = LAST_ANIM + 50; // 499 (16.6s)

const BASE = SAMPLING_SEGS.map((s) => s.prob);

/** The temperature on screen at this frame, mid-morph included. */
function temperatureAt(frame: number): number {
  if (frame < COLD_AT) return 1;
  if (frame < COLD_BY) return 1 - 0.5 * ramp(frame, COLD_AT, COLD_BY);
  if (frame < HOT_AT) return 0.5;
  if (frame < HOT_BY) return 0.5 + 1.5 * ramp(frame, HOT_AT, HOT_BY);
  return 2;
}

/** The step the readouts describe: it changes only once the ruler has stopped. */
function settledAt(frame: number): number {
  if (frame < COLD_BY + 6) return 1;
  if (frame < HOT_BY + 6) return 0.5;
  return 2;
}

export const MILTemperature: React.FC = () => {
  const frame = useCurrentFrame();
  const t = temperatureAt(frame);
  const probs = withTemperature(BASE, t);
  const segs: RulerSeg[] = SAMPLING_SEGS.map((s, i) => ({ label: s.label, prob: probs[i] }));

  const settled = settledAt(frame);
  const shown = withTemperature(BASE, settled);
  const shownSegs: RulerSeg[] = SAMPLING_SEGS.map((s, i) => ({ label: s.label, prob: shown[i] }));
  // The picks are read off the *settled* odds, not the moving ones: letting them
  // track the interpolation makes every label flicker as a boundary sweeps past
  // its marker. A held reading that snaps when the ruler stops is legible.
  const picks = DRAWS.map((u) => pickIndex(shownSegs, u));
  const counts = shown.map((_, i) => picks.filter((p) => p === i).length);
  const topCount = counts.reduce((best, n, i) => (n > counts[best] ? i : best), 0);

  return (
    <SceneShell title="Temperature moves the odds" duration={MIL_TEMPERATURE_DURATION}>
      {/* The two readouts: the knob, and what it did to the leader. */}
      <Readout
        x={560}
        label="T"
        value={settled.toFixed(1)}
        color={AP_COLORS.accent}
      />
      <Readout
        x={1360}
        label="P(Paris)"
        value={`${(shown[0] * 100).toFixed(0)}%`}
        color={AP_COLORS.textPrimary}
      />

      <ProbRuler
        segs={segs}
        x={X}
        y={Y}
        width={W}
        height={H}
        start={12}
        draws={DRAWS.map((u, k) => ({ u, at: drawFrames[k] }))}
        hitAt={DRAW_AT}
        pickLabels
      />

      <Rule
        at={DRAWN_BY}
        until={COLD_AT}
        color={AP_COLORS.textSecondary}
        text="T = 1 — the model's own odds, unchanged"
      />
      <Rule
        at={COLD_BY + 6}
        until={HOT_AT}
        color={AP_COLORS.query}
        text="colder: the odds sharpen, so nearly every draw takes Paris"
      />
      <Rule
        at={HOT_BY + 6}
        until={NOTE_AT}
        color={AP_COLORS.value}
        text="hotter: the odds flatten, so unlikely tokens start winning draws"
      />

      <Note
        at={NOTE_AT}
        text={`same six draws, ${counts[topCount]} of them on ${SAMPLING_SEGS[topCount].label}`}
        color={AP_COLORS.key}
      />
    </SceneShell>
  );
};

/** A `name = value` readout, centred on `x`. */
const Readout: React.FC<{ x: number; label: string; value: string; color: string }> = ({
  x,
  label,
  value,
  color,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: TEMPERATURE_GEOM.readoutY,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "baseline",
        gap: 18,
        opacity: ramp(frame, 20, 34),
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: AP_FONTS.sans,
          fontSize: 34,
          fontWeight: AP_WEIGHT.heading,
          color: AP_COLORS.textSecondary,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: AP_FONTS.mono,
          fontSize: 52,
          fontWeight: AP_WEIGHT.heading,
          color,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {value}
      </span>
    </div>
  );
};

/** A centred rule line that fades in at `at` and out at `until`. */
const Rule: React.FC<{ at: number; until: number | null; color: string; text: string }> = ({
  at,
  until,
  color,
  text,
}) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, at, at + TIMING.fast);
  const outP = until === null ? 1 : 1 - ramp(frame, until, until + 10);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: TEMPERATURE_GEOM.ruleY,
        width: 1920,
        textAlign: "center",
        fontFamily: AP_FONTS.sans,
        fontSize: 32,
        fontWeight: AP_WEIGHT.heading,
        color,
        opacity: Math.min(inP, outP),
        transform: `translateY(${(1 - inP) * 8}px)`,
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {text}
    </div>
  );
};

/** The closing line, held to the end of the scene. */
const Note: React.FC<{ at: number; color: string; text: string }> = ({ at, color, text }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, at, at + TIMING.fast);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: TEMPERATURE_GEOM.noteY,
        width: 1920,
        textAlign: "center",
        fontFamily: AP_FONTS.sans,
        fontSize: 34,
        fontWeight: AP_WEIGHT.heading,
        color,
        opacity: inP,
        transform: `translateY(${(1 - inP) * 8}px)`,
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {text}
    </div>
  );
};
