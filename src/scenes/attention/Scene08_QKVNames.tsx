import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const SCENE_08_DURATION = 600; // 20.0s

const CARDS = [
  {
    letter: "Q",
    name: "QUERY",
    color: AP_COLORS.query,
    bg: AP_COLORS.queryBg,
    border: AP_COLORS.queryBorder,
    meaning: "What am I looking for?",
  },
  {
    letter: "K",
    name: "KEY",
    color: AP_COLORS.key,
    bg: AP_COLORS.keyBg,
    border: AP_COLORS.keyBorder,
    meaning: "What do I contain? / When am I relevant?",
  },
  {
    letter: "V",
    name: "VALUE",
    color: AP_COLORS.value,
    bg: AP_COLORS.valueBg,
    border: AP_COLORS.valueBorder,
    meaning: "What do I provide if you attend to me?",
  },
];

const XS = [560, 960, 1360];
const Y = 560;

export const Scene08_QKVNames: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneShell kicker="The three roles" duration={SCENE_08_DURATION} enterDelay={0}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 360,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 30,
          fontWeight: 500,
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Every token plays three roles at once
      </div>

      {CARDS.map((c, i) => {
        const enter = spring({
          frame: frame - 30 - i * 16,
          fps,
          config: { mass: 0.8, damping: 17, stiffness: 95 },
        });
        return (
          <div
            key={c.letter}
            style={{
              position: "absolute",
              left: XS[i],
              top: Y,
              transform: `translate(-50%, -50%) translateY(${44 * (1 - enter)}px) scale(${0.86 + enter * 0.14})`,
              width: 380,
              padding: "40px 24px",
              borderRadius: 22,
              background: c.bg,
              border: `1.5px solid ${c.border}`,
              boxShadow: AP_COLORS.cardShadow,
              textAlign: "center",
              opacity: interpolate(frame - 30 - i * 16, [0, 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontFamily: AP_FONTS.mono,
                fontSize: 92,
                fontWeight: 800,
                color: c.color,
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {c.letter}
            </div>
            <div
              style={{
                color: c.color,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.24em",
                marginBottom: 18,
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                color: AP_COLORS.textPrimary,
                fontSize: 27,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {c.meaning}
            </div>
          </div>
        );
      })}
    </SceneShell>
  );
};
