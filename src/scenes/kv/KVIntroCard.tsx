import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS } from "../../components/shared/theme";

export const KV_INTRO_DURATION = 360; // 12.0s

const ROADMAP = [
  { label: "The problem", color: AP_COLORS.negative },
  { label: "KV cache", color: AP_COLORS.key },
  { label: "At scale", color: AP_COLORS.value },
];

export const KVIntroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chipPhase = frame - 30;
  const chipEnter = (i: number) =>
    spring({
      frame: chipPhase - i * 12,
      fps,
      config: { mass: 0.7, damping: 16, stiffness: 110 },
    });

  return (
    <SceneShell title="KV Cache" titleSize={92} duration={KV_INTRO_DURATION} enterDelay={6}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 500,
          width: 1920,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
        }}
      >
        {ROADMAP.map((r, i) => (
          <React.Fragment key={r.label}>
            {i > 0 ? <RoadmapArrow appear={chipEnter(i - 1)} /> : null}
            <RoadmapChip
              label={r.label}
              color={r.color}
              scale={chipEnter(i)}
              opacity={interpolate(chipPhase - i * 12, [0, 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
            />
          </React.Fragment>
        ))}
      </div>
    </SceneShell>
  );
};

const RoadmapChip: React.FC<{ label: string; color: string; scale: number; opacity: number }> = ({ label, color, scale, opacity }) => {
  return (
    <div
      style={{
        padding: "20px 40px",
        borderRadius: 999,
        background: AP_COLORS.surface,
        border: `1.5px solid ${color}`,
        color,
        fontSize: 29,
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
    <svg width={110} height={20} viewBox="0 0 110 20" style={{ display: "block", overflow: "visible", opacity: appear }}>
      <line x1={6} y1={10} x2={82} y2={10} stroke={color} strokeWidth={2.5} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
      <polygon points={`90,10 ${76},4 ${76},16`} fill={color} opacity={headPop} />
    </svg>
  );
};
