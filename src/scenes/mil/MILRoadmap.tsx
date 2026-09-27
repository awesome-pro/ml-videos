import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS, AP_TRACK, AP_WEIGHT } from "../../components/shared/theme";
import { enterStyle, ramp, TIMING } from "../../components/math";
import { STEPS } from "./data";

export const MIL_ROADMAP_DURATION = 155; // 5.2s

/**
 * The opening contents scene.
 *
 * The first version drew six filled cards stacked 10px apart. That read as
 * congested for four compounding reasons: the cards were wide and short, so
 * every row had ~900px of dead space on its right; the title and its caption
 * were stacked 6px apart; the boxed numeral badge was small and cramped inside
 * a 100px card; and six near-identical filled rectangles gave the eye no
 * rhythm. Six boxes were doing the job one list should do.
 *
 * This is an editorial index instead: hairlines straight on the black canvas,
 * three aligned columns, one line of text per row — so the width is used, the
 * vertical rhythm is generous, and the hierarchy (index / term / gloss) is
 * carried by column, size and colour instead of by six borders.
 */

const X = 340;
const W = 1240;
const ROW_H = 96;
const ROW_Y0 = 320;
const COL_INDEX = 90;
const COL_TITLE = 520;
const COL_GLOSS = W - COL_INDEX - COL_TITLE;

/** Row `i` fades in; its hairline draws in just ahead of it. */
const RULE_AT = (i: number) => 6 + i * 14;
const ROW_AT = (i: number) => 16 + i * 14;

export const MILRoadmap: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell title="Inference Loop" duration={MIL_ROADMAP_DURATION}>
      {/* A rule above every row, plus one closing the list. */}
      {Array.from({ length: STEPS.length + 1 }).map((_, i) => {
        const draw = ramp(frame, RULE_AT(i), RULE_AT(i) + TIMING.base);
        return (
          <div
            key={`rule${i}`}
            style={{
              position: "absolute",
              left: X,
              top: ROW_Y0 + i * ROW_H,
              width: W,
              height: 1,
              background: AP_COLORS.surfaceBorder,
              transform: `scaleX(${draw})`,
              transformOrigin: "left center",
            }}
          />
        );
      })}

      {STEPS.map((step, i) => {
        const appear = ramp(frame, ROW_AT(i), ROW_AT(i) + TIMING.base);
        return (
          <div
            key={step.title}
            style={{
              position: "absolute",
              left: X,
              top: ROW_Y0 + i * ROW_H,
              width: W,
              height: ROW_H,
              display: "flex",
              alignItems: "center",
              ...enterStyle(appear, { rise: 14 }),
            }}
          >
            <div
              style={{
                width: COL_INDEX,
                fontFamily: AP_FONTS.mono,
                fontSize: 30,
                fontWeight: AP_WEIGHT.label,
                color: AP_COLORS.accent,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>

            <div
              style={{
                width: COL_TITLE,
                fontFamily: AP_FONTS.sans,
                fontSize: 42,
                fontWeight: AP_WEIGHT.heading,
                letterSpacing: AP_TRACK.heading,
                color: AP_COLORS.textPrimary,
                textShadow: AP_COLORS.textShadow,
              }}
            >
              {step.title}
            </div>

            <div
              style={{
                width: COL_GLOSS,
                fontFamily: AP_FONTS.sans,
                fontSize: 30,
                fontWeight: AP_WEIGHT.body,
                color: AP_COLORS.textSecondary,
              }}
            >
              {step.sub}
            </div>
          </div>
        );
      })}
    </SceneShell>
  );
};
