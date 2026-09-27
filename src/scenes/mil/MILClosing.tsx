import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_WEIGHT, AP_TRACK, AP_FONTS } from "../../components/shared/theme";
import { enterStyle, ramp, TIMING } from "../../components/math";
import { STEPS } from "./data";

export const MIL_CLOSING_DURATION = 255; // 8.5s

const CHIP_W = 460;
const CHIP_H = 88;
const CHIP_GAP = 24;
const CHIP_X0 = 960 - (3 * CHIP_W + 2 * CHIP_GAP) / 2;
const CHIP_Y = [440, 440 + CHIP_H + CHIP_GAP];

export const MILClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const head = ramp(frame, 6, 6 + TIMING.slow);

  return (
    <SceneShell duration={MIL_CLOSING_DURATION}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 248,
          width: 1920,
          textAlign: "center",
          fontFamily: AP_FONTS.sans,
          fontSize: 96,
          fontWeight: AP_WEIGHT.title,
          letterSpacing: AP_TRACK.display,
          lineHeight: 1.1,
          color: AP_COLORS.textPrimary,
          textShadow: AP_COLORS.textShadowStrong,
          ...enterStyle(head, { rise: 24 }),
        }}
      >
        That is the whole loop
      </div>

      {STEPS.map((step, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const appear = ramp(frame, 70 + i * 12, 70 + i * 12 + TIMING.base);
        return (
          <div
            key={step.title}
            style={{
              position: "absolute",
              left: CHIP_X0 + col * (CHIP_W + CHIP_GAP),
              top: CHIP_Y[row],
              width: CHIP_W,
              height: CHIP_H,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 26px",
              borderRadius: 18,
              background: AP_COLORS.surface,
              border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
              boxShadow: AP_COLORS.cardShadowSoft,
              ...enterStyle(appear, { rise: 18 }),
            }}
          >
            <span
              style={{
                fontFamily: AP_FONTS.mono,
                fontSize: 28,
                fontWeight: AP_WEIGHT.heading,
                color: AP_COLORS.accent,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontFamily: AP_FONTS.sans,
                fontSize: 32,
                fontWeight: AP_WEIGHT.label,
                letterSpacing: AP_TRACK.heading,
                color: AP_COLORS.textPrimary,
                textShadow: AP_COLORS.textShadow,
              }}
            >
              {step.title}
            </span>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 700,
          width: 1920,
          textAlign: "center",
          fontFamily: AP_FONTS.mono,
          fontSize: 34,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.key,
          opacity: ramp(frame, 170, 170 + TIMING.slow),
          textShadow: AP_COLORS.textShadow,
        }}
      >
        prompt → ids → logits → next token → repeat
      </div>

    </SceneShell>
  );
};
