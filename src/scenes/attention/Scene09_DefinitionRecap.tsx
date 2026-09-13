import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const SCENE_09_DURATION = 280; // 9.3s — trimmed tail

const STEPS = [
  { text: "Find what matters.", color: AP_COLORS.query },
  { text: "Decide how much it matters.", color: AP_COLORS.key },
  { text: "Gather information from it.", color: AP_COLORS.value },
];

export const Scene09_DefinitionRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const defEnter = spring({
    frame: frame - 10,
    fps,
    config: { mass: 0.8, damping: 18, stiffness: 90 },
  });

  return (
    <SceneShell kicker="The definition, in one breath" duration={SCENE_09_DURATION} enterDelay={0}>
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 350,
          width: 1500,
          padding: "40px 58px",
          borderRadius: 22,
          background: AP_COLORS.surface,
          border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
          boxShadow: AP_COLORS.cardShadow,
          textAlign: "center",
          opacity: interpolate(frame - 10, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${24 - defEnter * 24}px)`,
        }}
      >
        <div
          style={{
            color: AP_COLORS.textPrimary,
            fontSize: 34,
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          A token looks at the relevant tokens in its context, sees how much each
          matters, and uses their information to update its own representation.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 640,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textMuted,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "0.12em",
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        OR, SIMPLY
      </div>

      <div style={{ position: "absolute", left: 0, top: 690, width: 1920, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        {STEPS.map((s, i) => {
          const start = 110 + i * 36;
          const enter = spring({
            frame: frame - start,
            fps,
            config: { mass: 0.7, damping: 16, stiffness: 100 },
          });
          return (
            <div
              key={s.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "18px 34px",
                borderRadius: 999,
                background: AP_COLORS.surface,
                border: `1.5px solid ${s.color}`,
                color: s.color,
                fontSize: 32,
                fontWeight: 700,
                fontFamily: AP_FONTS.sans,
                boxShadow: AP_COLORS.cardShadowSoft,
                opacity: interpolate(frame - start, [0, 16], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                transform: `translateY(${28 * (1 - enter)}px) scale(${0.9 + enter * 0.1})`,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: s.color,
                  display: "inline-block",
                }}
              />
              {s.text}
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};
