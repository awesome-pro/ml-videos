import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const SCENE_17_DURATION = 780; // 26.0s

const STEPS = [
  { label: "tokens", color: AP_COLORS.textPrimary },
  { label: "vectors", color: AP_COLORS.textPrimary },
  { label: "Q, K, V", color: AP_COLORS.accent },
  { label: "scores", color: AP_COLORS.accent },
  { label: "÷ √d_k", color: AP_COLORS.value },
  { label: "mask", color: AP_COLORS.negative },
  { label: "softmax", color: AP_COLORS.accent },
  { label: "× V", color: AP_COLORS.value },
  { label: "context", color: AP_COLORS.positive },
];

const Y = 500;
const X_START = 200;
const X_STEP = 190;
const NODE_W = 150;

const MOVES = [
  { text: "Find what matters.", color: AP_COLORS.query },
  { text: "Decide how much.", color: AP_COLORS.key },
  { text: "Take the useful info.", color: AP_COLORS.value },
];

export const Scene17_FullPipelineRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const build = (i: number) =>
    spring({
      frame: frame - (24 + i * 30),
      fps,
      config: { mass: 0.7, damping: 16, stiffness: 100 },
    });

  const movesOpacity = interpolate(frame, [300, 326], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="The whole flow" duration={SCENE_17_DURATION} enterDelay={0}>
      <div style={{ position: "absolute", left: 0, top: 360, width: 1920, textAlign: "center", color: AP_COLORS.textSecondary, fontSize: 28, opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), fontFamily: AP_FONTS.sans }}>
        from raw tokens to a contextual representation
      </div>

      {/* Nodes */}
      {STEPS.map((s, i) => {
        const enter = build(i);
        const x = X_START + i * X_STEP;
        return (
          <div
            key={s.label}
            style={{
              position: "absolute",
              left: x,
              top: Y,
              transform: `translate(-50%, -50%) translateY(${26 * (1 - enter)}px) scale(${0.82 + enter * 0.18})`,
              width: NODE_W,
              padding: "20px 8px",
              borderRadius: 14,
              background: AP_COLORS.surface,
              border: `1.5px solid ${s.color}`,
              color: s.color,
              fontSize: 25,
              fontWeight: 700,
              textAlign: "center",
              fontFamily: AP_FONTS.sans,
              boxShadow: AP_COLORS.cardShadowSoft,
              opacity: interpolate(frame - (24 + i * 30), [0, 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {s.label}
          </div>
        );
      })}

      {/* Arrows */}
      {STEPS.slice(0, -1).map((_, i) => {
        const x1 = X_START + i * X_STEP + NODE_W / 2;
        const x2 = X_START + (i + 1) * X_STEP - NODE_W / 2;
        return <FlowArrow key={i} x1={x1} y1={Y} x2={x2} y2={Y} color={AP_COLORS.textMuted} appearDelay={38 + i * 30} thickness={3} />;
      })}

      {/* Three moves */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 720,
          width: 1920,
          display: "flex",
          justifyContent: "center",
          gap: 30,
          opacity: movesOpacity,
          transform: `translateY(${20 - movesOpacity * 20}px)`,
        }}
      >
        {MOVES.map((m) => (
          <div
            key={m.text}
            style={{
              padding: "18px 30px",
              borderRadius: 999,
              background: AP_COLORS.surface,
              border: `1.5px solid ${m.color}`,
              color: m.color,
              fontSize: 28,
              fontWeight: 700,
              fontFamily: AP_FONTS.sans,
              boxShadow: AP_COLORS.cardShadowSoft,
            }}
          >
            {m.text}
          </div>
        ))}
      </div>
    </SceneShell>
  );
};
