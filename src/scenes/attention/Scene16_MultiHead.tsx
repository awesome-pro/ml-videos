import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { LeadLine } from "../../components/shared/ui";

export const SCENE_16_DURATION = 480; // 16.0s — trimmed tail

const HEADS = [
  { label: "syntactic", color: AP_COLORS.query, caption: "grammar links", pattern: [
    [0.9, 0.2, 0.1, 0.2, 0.1],
    [0.2, 0.9, 0.15, 0.1, 0.1],
    [0.1, 0.15, 0.9, 0.2, 0.2],
    [0.2, 0.1, 0.2, 0.9, 0.15],
    [0.1, 0.1, 0.2, 0.15, 0.9],
  ]},
  { label: "nearby", color: AP_COLORS.key, caption: "local tokens", pattern: [
    [0.3, 0.8, 0.2, 0.1, 0.1],
    [0.8, 0.3, 0.8, 0.2, 0.1],
    [0.2, 0.8, 0.3, 0.8, 0.2],
    [0.1, 0.2, 0.8, 0.3, 0.8],
    [0.1, 0.1, 0.2, 0.8, 0.3],
  ]},
  { label: "entity", color: AP_COLORS.value, caption: "track an entity", pattern: [
    [0.9, 0.3, 0.2, 0.2, 0.2],
    [0.9, 0.3, 0.2, 0.2, 0.2],
    [0.2, 0.2, 0.3, 0.2, 0.2],
    [0.2, 0.2, 0.2, 0.3, 0.2],
    [0.2, 0.2, 0.2, 0.2, 0.3],
  ]},
];

const HEAD_XS = [560, 960, 1360];
const HEAD_Y = 560;

export const Scene16_MultiHead: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const combineOpacity = interpolate(frame, [400, 424], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const noteOpacity = interpolate(frame, [200, 224], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="Multiple heads" duration={SCENE_16_DURATION} enterDelay={0}>
      <LeadLine text="Different heads, different relationships" y={300} start={10} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 360,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 26,
          opacity: noteOpacity,
          fontFamily: "inherit",
        }}
      >
        not told what to do — these roles are <span style={{ color: AP_COLORS.textPrimary }}>learned</span>
      </div>

      {HEADS.map((h, i) => {
        const enter = spring({
          frame: frame - 40 - i * 20,
          fps,
          config: { mass: 0.85, damping: 17, stiffness: 92 },
        });
        return (
          <div
            key={h.label}
            style={{
              position: "absolute",
              left: HEAD_XS[i],
              top: HEAD_Y,
              transform: `translate(-50%, -50%) translateY(${36 * (1 - enter)}px) scale(${0.88 + enter * 0.12})`,
              width: 340,
              padding: "24px 22px",
              borderRadius: 18,
              background: AP_COLORS.surface,
              border: `1.5px solid ${h.color}`,
              boxShadow: AP_COLORS.cardShadow,
              textAlign: "center",
              opacity: interpolate(frame - 40 - i * 20, [0, 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div style={{ color: h.color, fontSize: 26, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 16 }}>head · {h.label}</div>
            <MiniGrid pattern={h.pattern} color={h.color} />
            <div style={{ color: AP_COLORS.textSecondary, fontSize: 22, fontWeight: 500, marginTop: 14 }}>{h.caption}</div>
          </div>
        );
      })}

      {/* Combine */}
      <FlowArrow x1={HEAD_XS[0]} y1={HEAD_Y + 140} x2={960} y2={850} color={AP_COLORS.accent} appearDelay={400} thickness={3} />
      <FlowArrow x1={HEAD_XS[1]} y1={HEAD_Y + 140} x2={960} y2={850} color={AP_COLORS.accent} appearDelay={420} thickness={3} />
      <FlowArrow x1={HEAD_XS[2]} y1={HEAD_Y + 140} x2={960} y2={850} color={AP_COLORS.accent} appearDelay={440} thickness={3} />

      <div
        style={{
          position: "absolute",
          left: 960 - 220,
          top: 890,
          width: 440,
          padding: "20px",
          borderRadius: 16,
          background: AP_COLORS.accentBg,
          border: `1.5px solid ${AP_COLORS.accentBorder}`,
          boxShadow: AP_COLORS.cardShadow,
          textAlign: "center",
          opacity: combineOpacity,
          transform: `translateY(${14 - combineOpacity * 14}px)`,
        }}
      >
        <div style={{ color: AP_COLORS.accent, fontSize: 25, fontWeight: 700, letterSpacing: "0.08em" }}>combine heads → forward</div>
      </div>
    </SceneShell>
  );
};

const MiniGrid: React.FC<{ pattern: number[][]; color: string }> = ({ pattern, color }) => {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      {pattern.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: 4 }}>
          {row.map((v, c) => {
            const mag = Math.max(0, Math.min(1, v));
            return (
              <div
                key={c}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 6,
                  background: color,
                  opacity: 0.16 + mag * 0.54,
                  border: `1px solid ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: AP_COLORS.textPrimary,
                  fontFamily: AP_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                }}
              >
                {v.toFixed(1)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
