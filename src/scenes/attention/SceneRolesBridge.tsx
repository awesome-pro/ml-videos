import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { LeadLine } from "../../components/shared/ui";

export const SCENE_ROLES_BRIDGE_DURATION = 290; // 9.7s — "every token plays three roles"

const CENTER_X = 960;
const CENTER_Y = 540;

const ROLES = [
  { letter: "Q", caption: "asks a question", color: AP_COLORS.query, bg: AP_COLORS.queryBg, x: 470, y: 540 },
  { letter: "K", caption: "offers what it contains", color: AP_COLORS.key, bg: AP_COLORS.keyBg, x: 1290, y: 470 },
  { letter: "V", caption: "provides information", color: AP_COLORS.value, bg: AP_COLORS.valueBg, x: 1290, y: 640 },
];

export const SceneRolesBridge: React.FC = () => {
  const frame = useCurrentFrame();

  const bottomOpacity = interpolate(frame, [200, 226], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="Aha" duration={SCENE_ROLES_BRIDGE_DURATION} enterDelay={0}>
      <LeadLine text="Look closely — every token does all three at once." y={320} start={8} />

      <TokenCard
        label="bank"
        x={CENTER_X}
        y={CENTER_Y}
        width={230}
        height={104}
        variant="neutral"
        fontSize={60}
        appearDelay={40}
        radius={20}
      />

      {ROLES.map((r, i) => {
        const o = interpolate(frame - (110 + i * 22), [0, 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const lift = 18 * (1 - o);
        return (
          <div
            key={r.letter}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              transform: `translate(-50%, -50%) translateY(${lift}px) scale(${0.86 + o * 0.14})`,
              textAlign: "center",
              opacity: o,
            }}
          >
            <div
              style={{
                width: 66,
                height: 66,
                margin: "0 auto",
                borderRadius: 18,
                background: r.bg,
                border: `1.5px solid ${r.color}`,
                color: r.color,
                fontFamily: AP_FONTS.mono,
                fontSize: 36,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: AP_COLORS.cardShadowSoft,
              }}
            >
              {r.letter}
            </div>
            <div style={{ color: r.color, fontSize: 20, fontWeight: 600, marginTop: 8, whiteSpace: "nowrap" }}>
              {r.caption}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 860,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 30,
          fontWeight: 500,
          opacity: bottomOpacity,
          transform: `translateY(${12 - bottomOpacity * 12}px)`,
          padding: "0 140px",
        }}
      >
        So each token needs <span style={{ color: AP_COLORS.textPrimary }}>three versions of itself</span> — that’s
        Q, K, V.
      </div>
    </SceneShell>
  );
};
