import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const SCENE_05_DURATION = 540; // 18.0s

export const Scene05_AttentionDefinition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const defEnter = spring({
    frame: frame - 12,
    fps,
    config: { mass: 0.8, damping: 18, stiffness: 90 },
  });
  const defOpacity = interpolate(frame - 12, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const q1Opacity = interpolate(frame - 90, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const q2Opacity = interpolate(frame - 140, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resultOpacity = interpolate(frame - 200, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="The core idea" duration={SCENE_05_DURATION} enterDelay={0}>
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 350,
          width: 1500,
          padding: "40px 60px",
          borderRadius: 22,
          background: AP_COLORS.surface,
          border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
          boxShadow: AP_COLORS.cardShadow,
          opacity: defOpacity,
          transform: `translateY(${24 - defEnter * 24}px)`,
        }}
      >
        <div
          style={{
            color: AP_COLORS.textSecondary,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Attention
        </div>
        <div
          style={{
            color: AP_COLORS.textPrimary,
            fontSize: 40,
            fontWeight: 600,
            lineHeight: 1.32,
            letterSpacing: "-0.01em",
          }}
        >
          A token looks at the <span style={{ color: AP_COLORS.accent }}>other relevant tokens</span> in its
          available context, and <span style={{ color: AP_COLORS.value }}>gathers information</span> from them.
        </div>
      </div>

      {/* The two model questions */}
      <QuestionRow icon="❓" text="Which other tokens matter to me?" y={652} opacity={q1Opacity} />
      <QuestionRow icon="⚖️" text="How much does each of them matter?" y={768} opacity={q2Opacity} />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 880,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 32,
          fontWeight: 500,
          opacity: resultOpacity,
          transform: `translateY(${12 - resultOpacity * 12}px)`,
        }}
      >
        → a new, <span style={{ color: AP_COLORS.textPrimary }}>contextual</span> representation of this token
      </div>
    </SceneShell>
  );
};

const QuestionRow: React.FC<{
  icon: string;
  text: string;
  y: number;
  opacity: number;
}> = ({ icon, text, y, opacity }) => {
  const slide = interpolate(opacity, [0, 1], [18, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 470,
        top: y,
        width: 980,
        padding: "18px 30px",
        borderRadius: 16,
        background: AP_COLORS.surfaceRaised,
        border: `1.5px solid ${AP_COLORS.surfaceBorderActive}`,
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity,
        transform: `translateY(${slide}px)`,
        boxShadow: AP_COLORS.cardShadowSoft,
        fontFamily: AP_FONTS.sans,
      }}
    >
      <span style={{ fontSize: 34 }}>{icon}</span>
      <span style={{ color: AP_COLORS.textPrimary, fontSize: 34, fontWeight: 600 }}>{text}</span>
    </div>
  );
};
