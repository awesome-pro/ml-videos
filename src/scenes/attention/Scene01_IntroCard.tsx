import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS } from "../../components/shared/theme";

export const SCENE_01_DURATION = 360; // 12.0s

const ROADMAP = [
  { label: "Intuition", color: AP_COLORS.query },
  { label: "Implementation", color: AP_COLORS.value },
];

export const Scene01_IntroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Roadmap chips appear after the heading settles.
  const chipPhase = frame - 30;
  const chipEnter = (i: number) =>
    spring({
      frame: chipPhase - i * 12,
      fps,
      config: { mass: 0.7, damping: 16, stiffness: 110 },
    });

  return (
    <SceneShell
      title="What is Attention"
      titleSize={92}
      duration={SCENE_01_DURATION}
      enterDelay={6}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 500,
          width: 1920,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <RoadmapChip
          label={ROADMAP[0].label}
          color={ROADMAP[0].color}
          scale={chipEnter(0)}
          opacity={interpolate(chipPhase, [0, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
        <RoadmapArrow appear={chipEnter(0)} />
        <RoadmapChip
          label={ROADMAP[1].label}
          color={ROADMAP[1].color}
          scale={chipEnter(1)}
          opacity={interpolate(chipPhase - 12, [0, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      </div>
    </SceneShell>
  );
};

const RoadmapChip: React.FC<{ label: string; color: string; scale: number; opacity: number }> = ({
  label,
  color,
  scale,
  opacity,
}) => {
  return (
    <div
      style={{
        padding: "22px 46px",
        borderRadius: 999,
        background: AP_COLORS.surface,
        border: `1.5px solid ${color}`,
        color,
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: "0.02em",
        textAlign: "center",
        transform: `translateY(${20 * (1 - scale)}px) scale(${0.9 + scale * 0.1})`,
        opacity,
        boxShadow: AP_COLORS.cardShadowSoft,
      }}
    >
      {label}
    </div>
  );
};

// A small forward arrow that draws in between the two roadmap badges.
const RoadmapArrow: React.FC<{ appear: number }> = ({ appear }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - 30, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headPop = interpolate(draw, [0.45, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const color = "rgba(154, 123, 255, 0.7)";
  return (
    <svg width={150} height={20} viewBox="0 0 150 20" style={{ display: "block", overflow: "visible", opacity: appear }}>
      <line
        x1={6}
        y1={10}
        x2={122}
        y2={10}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - draw}
      />
      <polygon
        points={`130,10 ${116},4 ${116},16`}
        fill={color}
        opacity={headPop}
      />
    </svg>
  );
};
