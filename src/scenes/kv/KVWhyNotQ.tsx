import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_WHY_NOT_Q_DURATION = 720; // 24.0s

const TOKEN_X = 960;
const TOKEN_Y = 300;

const FUTURE_QUERIES = [4, 5, 6, 7, 8, 9, 10];

export const KVWhyNotQ: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const token3Enter = spring({ frame: frame - 20, fps, config: { mass: 0.8, damping: 16, stiffness: 100 } });

  const qDead = interpolate(frame, [120, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kvAlive = interpolate(frame, [200, 240], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const arcsOpacity = interpolate(frame, [300, 360], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const punchOpacity = interpolate(frame, [420, 456], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const arcUse = (i: number) => interpolate(frame - (280 + i * 10), [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="Why cache K and V, but not Q?" duration={KV_WHY_NOT_Q_DURATION} enterDelay={0}>
      {/* token 3 */}
      <div
        style={{
          position: "absolute",
          left: TOKEN_X - 170,
          top: TOKEN_Y - 56,
          width: 340,
          height: 112,
          transform: `translateY(${26 * (1 - token3Enter)}px)`,
          borderRadius: 18,
          background: AP_COLORS.surface,
          border: `1.5px solid ${AP_COLORS.textPrimary}`,
          boxShadow: AP_COLORS.cardShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          fontWeight: 700,
          color: AP_COLORS.textPrimary,
          fontFamily: AP_FONTS.sans,
        }}
      >
        token 3
      </div>

      {/* Q3 — used once */}
      <div style={{ position: "absolute", left: TOKEN_X - 260, top: 520, width: 520, textAlign: "center", opacity: qDead }}>
        <div style={{ padding: "16px 26px", borderRadius: 14, background: "rgba(109,139,255,0.06)", border: "1.5px dashed rgba(255,255,255,0.16)", color: AP_COLORS.textMuted, fontSize: 28, fontWeight: 700, fontFamily: AP_FONTS.mono }}>
          Q3
        </div>
        <div style={{ marginTop: 12, color: AP_COLORS.textSecondary, fontSize: 22, fontWeight: 500, fontFamily: AP_FONTS.sans }}>
          used <span style={{ color: AP_COLORS.negative, fontWeight: 700 }}>once</span> — when token 3 was current
        </div>
        <div style={{ marginTop: 6, color: AP_COLORS.textMuted, fontSize: 20, fontWeight: 500, fontFamily: AP_FONTS.sans }}>
          no future token needs it
        </div>
      </div>

      {/* K3, V3 — reused */}
      <div style={{ position: "absolute", left: TOKEN_X + 60, top: 520, width: 600, textAlign: "center", opacity: kvAlive }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
          <KvMini label="K3" color={AP_COLORS.key} />
          <KvMini label="V3" color={AP_COLORS.value} />
        </div>
        <div style={{ marginTop: 12, color: AP_COLORS.key, fontSize: 22, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
          reused by every future token
        </div>
      </div>

      {/* Future queries arcing into K3/V3 */}
      <div style={{ opacity: arcsOpacity }}>
        {FUTURE_QUERIES.map((n, i) => {
          const qy = 470 + i * 34;
          const use = arcUse(i);
          return (
            <div key={n} style={{ position: "absolute", left: 250, top: qy, opacity: use, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: AP_COLORS.query, fontSize: 22, fontWeight: 700, fontFamily: AP_FONTS.mono }}>Q{n}</span>
            </div>
          );
        })}
      </div>
      {arcsOpacity > 0
        ? FUTURE_QUERIES.map((n, i) => {
            const qy = 470 + i * 34;
            return (
              <AttentionArc key={n} x1={330} y1={qy} x2={TOKEN_X + 80} y2={540} weight={0.55} color={AP_COLORS.accent} appearDelay={280 + i * 10} drawDuration={18} apexLift={28} />
            );
          })
        : null}

      {/* punchline */}
      <div style={{ position: "absolute", left: 0, top: 800, width: 1920, textAlign: "center", opacity: punchOpacity }}>
        <span style={{ color: AP_COLORS.textPrimary, fontSize: 40, fontWeight: 800, fontFamily: AP_FONTS.sans }}>
          that's why it's{" "}
          <span style={{ color: AP_COLORS.accent }}>K·V</span> cache — not Q·K·V
        </span>
      </div>
    </SceneShell>
  );
};

const KvMini: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div style={{ padding: "14px 24px", borderRadius: 12, background: `${color}20`, border: `1.5px solid ${color}`, color, fontSize: 26, fontWeight: 700, fontFamily: AP_FONTS.mono, boxShadow: AP_COLORS.cardShadowSoft }}>
    {label}
  </div>
);
