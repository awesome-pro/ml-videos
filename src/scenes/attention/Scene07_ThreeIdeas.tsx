import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const SCENE_07_DURATION = 290; // 9.7s — trimmed tail

const IDEAS = [
  {
    num: "1",
    icon: "❓",
    color: AP_COLORS.query,
    title: "A token asks a question",
    body: "“What kind of context is relevant to me?”",
  },
  {
    num: "2",
    icon: "🏷️",
    color: AP_COLORS.key,
    title: "Each token offers a label",
    body: "“This is what I contain, and when I’m relevant.” Match labels → score → normalize into weights.",
  },
  {
    num: "3",
    icon: "➕",
    color: AP_COLORS.value,
    title: "Combine the information",
    body: "Blend the useful info by those weights → the token’s new representation.",
  },
];

export const Scene07_ThreeIdeas: React.FC = () => {
  const frame = useCurrentFrame();

  const reveal = (i: number) =>
    interpolate(frame - 20 - i * 40, [0, 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <SceneShell kicker="A deeper look" duration={SCENE_07_DURATION} enterDelay={0}>
      <div style={{ position: "absolute", left: 0, top: 390, width: 1920 }} className="flex flex-col items-center gap-9">
        {IDEAS.map((idea, i) => {
          const o = reveal(i);
          const lift = 22 * (1 - o);
          return (
            <div
              key={idea.num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                width: 1240,
                padding: "26px 36px",
                borderRadius: 18,
                background: AP_COLORS.surface,
                border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
                boxShadow: AP_COLORS.cardShadowSoft,
                opacity: o,
                transform: `translateY(${lift}px)`,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: `${idea.color}22`,
                  border: `1.5px solid ${idea.color}`,
                  color: idea.color,
                  fontSize: 26,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {idea.num}
              </div>
              <div style={{ fontSize: 40, flexShrink: 0 }}>{idea.icon}</div>
              <div>
                <div style={{ color: idea.color, fontSize: 30, fontWeight: 700, marginBottom: 6 }}>
                  {idea.title}
                </div>
                <div style={{ color: AP_COLORS.textSecondary, fontSize: 27, fontWeight: 500, lineHeight: 1.35 }}>
                  {idea.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 990,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textMuted,
          fontSize: 26,
          fontWeight: 500,
          fontFamily: AP_FONTS.sans,
          opacity: interpolate(frame, [200, 224], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Question · Labels · Match · Combine
      </div>
    </SceneShell>
  );
};
