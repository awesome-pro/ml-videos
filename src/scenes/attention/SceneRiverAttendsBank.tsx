import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { LeadLine } from "../../components/shared/ui";

export const SCENE_RIVER_ATTENDS_BANK_DURATION = 480; // 16.0s — "when river attends to bank"

const ROLES = [
  { letter: "Q", caption: "asks a question", color: AP_COLORS.query, bg: AP_COLORS.queryBg },
  { letter: "K", caption: "provides what I contain", color: AP_COLORS.key, bg: AP_COLORS.keyBg },
  { letter: "V", caption: "provides the value", color: AP_COLORS.value, bg: AP_COLORS.valueBg },
];

const RIVER_X = 660;
const BANK_X = 1260;
const Y = 440;
const CARD_W = 220;
const CARD_H = 92;

export const SceneRiverAttendsBank: React.FC = () => {
  const frame = useCurrentFrame();

  const captionOpacity = interpolate(frame, [190, 214], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const threeOpacity = interpolate(frame, [260, 284], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagOpacity = interpolate(frame, [420, 444], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slim pills, clearly separated so nothing crowds.
  const pillY = (i: number) => 686 + i * 80;

  return (
    <SceneShell kicker="The second example" duration={SCENE_RIVER_ATTENDS_BANK_DURATION} enterDelay={0}>
      <LeadLine text="Now — when river attends to bank." y={270} start={8} />

      {/* The attending pair */}
      <TokenCard label="river" x={RIVER_X} y={Y} width={CARD_W} height={CARD_H} variant="query" fontSize={44} appearDelay={40} radius={18} />
      <TokenCard label="bank" x={BANK_X} y={Y} width={CARD_W} height={CARD_H} variant="key" fontSize={44} appearDelay={56} radius={18} />
      <AttentionArc x1={RIVER_X} y1={Y - CARD_H / 2} x2={BANK_X} y2={Y - CARD_H / 2} weight={0.82} color={AP_COLORS.accent} appearDelay={120} apexLift={72} />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 562,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 27,
          opacity: captionOpacity,
        }}
      >
        river’s <span style={{ color: AP_COLORS.value }}>value</span> adds to the meaning of bank
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 616,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textMuted,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.12em",
          opacity: threeOpacity,
        }}
      >
        SO THERE ARE THREE THINGS
      </div>

      {/* The three roles, stacked */}
      {ROLES.map((r, i) => {
        const o = interpolate(frame - (300 + i * 24), [0, 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const lift = 16 * (1 - o);
        return (
          <div
            key={r.letter}
            style={{
              position: "absolute",
              left: 960,
              top: pillY(i),
              transform: `translate(-50%, -50%) translateY(${lift}px) scale(${0.88 + o * 0.12})`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              borderRadius: 999,
              background: r.bg,
              border: `1.5px solid ${r.color}`,
              color: r.color,
              opacity: o,
              whiteSpace: "nowrap",
              fontFamily: AP_FONTS.sans,
              boxShadow: AP_COLORS.cardShadowSoft,
            }}
          >
            <span style={{ fontFamily: AP_FONTS.mono, fontSize: 22, fontWeight: 800 }}>{r.letter}</span>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{r.caption}</span>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 944,
          width: 1920,
          textAlign: "center",
          opacity: tagOpacity,
          transform: `translateY(${12 - tagOpacity * 12}px)`,
        }}
      >
        <div style={{ color: AP_COLORS.textPrimary, fontSize: 32, fontWeight: 700 }}>these three are attention.</div>
      </div>
    </SceneShell>
  );
};
