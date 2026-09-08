import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { KvSlot } from "../../components/kv/KvSlot";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_FULL_RECAP_DURATION = 720; // 24.0s

const CHAIN = [
  { label: "one token at a time", color: AP_COLORS.textPrimary },
  { label: "attend to previous", color: AP_COLORS.query },
  { label: "needs their K, V", color: AP_COLORS.accent },
  { label: "already computed", color: AP_COLORS.key },
  { label: "store → reuse", color: AP_COLORS.value },
];

const Y = 460;
const X_START = 210;
const X_STEP = 330;
const NODE_W = 280;

export const KVFullRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const build = (i: number) =>
    spring({ frame: frame - (24 + i * 30), fps, config: { mass: 0.7, damping: 16, stiffness: 100 } });

  const bottomOpacity = interpolate(frame, [160, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slideOpacity = interpolate(frame, [420, 470], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="Put it together" duration={KV_FULL_RECAP_DURATION} enterDelay={0}>
      <LeadLine text="The whole loop" y={250} start={6} />

      {CHAIN.map((c, i) => {
        const enter = build(i);
        const x = X_START + i * X_STEP;
        return (
          <div key={c.label} style={{ position: "absolute", left: x, top: Y, transform: `translate(-50%,-50%) translateY(${26 * (1 - enter)}px) scale(${0.82 + enter * 0.18})`, width: NODE_W, padding: "22px 10px", borderRadius: 16, background: AP_COLORS.surface, border: `1.5px solid ${c.color}`, color: c.color, fontSize: 25, fontWeight: 700, textAlign: "center", fontFamily: AP_FONTS.sans, boxShadow: AP_COLORS.cardShadowSoft, opacity: interpolate(frame - (24 + i * 30), [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            {c.label}
          </div>
        );
      })}
      {CHAIN.slice(0, -1).map((_, i) => {
        const x1 = X_START + i * X_STEP + NODE_W / 2;
        const x2 = X_START + (i + 1) * X_STEP - NODE_W / 2;
        return <FlowArrow key={i} x1={x1} y1={Y} x2={x2} y2={Y} color={AP_COLORS.textMuted} appearDelay={38 + i * 30} thickness={3} />;
      })}

      {/* prefill / decode / layers */}
      <div style={{ position: "absolute", left: 0, top: 640, width: 1920, opacity: bottomOpacity }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
          <BottomCard color={AP_COLORS.key} text="prefill builds the cache" />
          <BottomCard color={AP_COLORS.accent} text="decode reads + appends" />
          <BottomCard color={AP_COLORS.value} text="every layer, its own" />
        </div>
      </div>

      {/* A tiny cache rail to book-end */}
      <div style={{ position: "absolute", left: 0, top: 780, width: 1920, opacity: slideOpacity, textAlign: "center" }}>
        <div style={{ display: "inline-flex", gap: 12 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <KvSlot key={i} index={i + 1} x={760 + i * 80} y={20} width={72} height={44} appearDelay={440 + i * 6} />
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const BottomCard: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <div style={{ padding: "18px 30px", borderRadius: 999, background: AP_COLORS.surface, border: `1.5px solid ${color}`, color, fontSize: 26, fontWeight: 700, fontFamily: AP_FONTS.sans, boxShadow: AP_COLORS.cardShadowSoft }}>
    {text}
  </div>
);
