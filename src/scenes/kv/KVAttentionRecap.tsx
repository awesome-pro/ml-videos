import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_ATTN_RECAP_DURATION = 255; // 18.0s

const ROLES = [
  { q: "Query", color: AP_COLORS.query, desc: "what am I looking for?" },
  { q: "Key", color: AP_COLORS.key, desc: "when am I relevant to you?" },
  { q: "Value", color: AP_COLORS.value, desc: "what info do I provide?" },
];

const CARD_Y = 560;

export const KVAttentionRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const recapOpacity = interpolate(frame, [180, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="Recap · attention" duration={KV_ATTN_RECAP_DURATION} enterDelay={0}>
      <LeadLine text="Every token produces three vectors" y={300} start={8} />

      {ROLES.map((r, i) => {
        const enter = spring({
          frame: frame - (30 + i * 16),
          fps,
          config: { mass: 0.8, damping: 16, stiffness: 96 },
        });
        const x = 960 + (i - 1) * 420;
        return (
          <div
            key={r.q}
            style={{
              position: "absolute",
              left: x,
              top: CARD_Y,
              transform: `translate(-50%, -50%) translateY(${30 * (1 - enter)}px) scale(${0.86 + enter * 0.14})`,
              width: 360,
              padding: "28px 22px",
              borderRadius: 18,
              background: AP_COLORS.surface,
              border: `1.5px solid ${r.color}`,
              boxShadow: AP_COLORS.cardShadow,
              textAlign: "center",
              opacity: interpolate(frame - (30 + i * 16), [0, 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div style={{ color: r.color, fontSize: 34, fontWeight: 800, letterSpacing: "-0.01em", fontFamily: AP_FONTS.sans }}>
              {r.q}
            </div>
            <div style={{ color: AP_COLORS.textSecondary, fontSize: 24, fontWeight: 500, marginTop: 14, fontFamily: AP_FONTS.sans }}>
              {r.desc}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 780,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.accent,
          fontSize: 28,
          fontWeight: 700,
          opacity: recapOpacity,
          fontFamily: AP_FONTS.sans,
        }}
      >
        the current token's Query is compared with the Keys, then a weighted mix of Values
      </div>
    </SceneShell>
  );
};
