import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { MathText, MVar, MSub } from "../../components/shared/MathText";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const SCENE_11_DURATION = 720; // 24.0s

const X = { cx: 440, cy: 560, cols: 4, rows: 3, cell: 26, gap: 5 };
const X_RIGHT = 500;
const OUT_LEFT = 1260;
const ARROW_END = 1040;
const OUTPUTS = [
  { letter: "Q", name: "QUERY", color: AP_COLORS.query, bg: AP_COLORS.queryBg, border: AP_COLORS.queryBorder, y: 400, w: "Wq" },
  { letter: "K", name: "KEY", color: AP_COLORS.key, bg: AP_COLORS.keyBg, border: AP_COLORS.keyBorder, y: 565, w: "Wk" },
  { letter: "V", name: "VALUE", color: AP_COLORS.value, bg: AP_COLORS.valueBg, border: AP_COLORS.valueBorder, y: 730, w: "Wv" },
];

export const Scene11_QKVProjection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const xEnter = spring({ frame: frame - 10, fps, config: { mass: 0.8, damping: 17, stiffness: 100 } });
  const formulaOpacity = interpolate(frame, [260, 282], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="Three projections, one token" duration={SCENE_11_DURATION} enterDelay={0}>
      {/* X block */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 440,
          width: 880,
          textAlign: "center",
          opacity: interpolate(frame, [10, 26], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${20 * (1 - xEnter)}px)`,
        }}
      >
        <div style={{ color: AP_COLORS.textSecondary, fontSize: 24, fontWeight: 700, letterSpacing: "0.16em", marginBottom: 16 }}>X · TOKEN VECTORS</div>
        <div style={{ display: "inline-flex", flexDirection: "column", gap: X.gap }}>
          {Array.from({ length: X.rows }).map((_, r) => (
            <div key={r} style={{ display: "flex", gap: X.gap }}>
              {Array.from({ length: X.cols }).map((_, c) => {
                const v = ((r * 3 + c) % 6) / 6 + 0.3;
                return (
                  <div key={c} style={{ width: X.cell, height: X.cell, borderRadius: 5, background: AP_COLORS.accent, opacity: v, border: `1px solid ${AP_COLORS.accentBorder}` }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows + W matrices */}
      {OUTPUTS.map((o, i) => (
        <React.Fragment key={o.letter}>
          <FlowArrow x1={X_RIGHT} y1={X.cy} x2={ARROW_END} y2={o.y} color={o.color} appearDelay={110 + i * 26} thickness={4} />
          <div
            style={{
              position: "absolute",
              left: (X_RIGHT + ARROW_END) / 2,
              top: (X.cy + o.y) / 2 - 34,
              color: o.color,
              fontFamily: AP_FONTS.mono,
              fontSize: 34,
              fontWeight: 800,
              opacity: interpolate(frame - (150 + i * 26), [0, 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {o.w}
          </div>
        </React.Fragment>
      ))}

      {/* Outputs */}
      {OUTPUTS.map((o, i) => {
        const enter = spring({
          frame: frame - (140 + i * 26),
          fps,
          config: { mass: 0.85, damping: 17, stiffness: 92 },
        });
        return (
          <div
            key={o.letter}
            style={{
              position: "absolute",
              left: OUT_LEFT,
              top: o.y,
              transform: `translate(-50%, -50%) translateY(${40 * (1 - enter)}px) scale(${0.86 + enter * 0.14})`,
              width: 400,
              padding: "26px 22px",
              borderRadius: 18,
              background: o.bg,
              border: `1.5px solid ${o.border}`,
              boxShadow: AP_COLORS.cardShadow,
              textAlign: "center",
              opacity: interpolate(frame - (140 + i * 26), [0, 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div style={{ fontFamily: AP_FONTS.mono, fontSize: 50, fontWeight: 800, color: o.color, lineHeight: 1 }}>{o.letter}</div>
            <div style={{ color: o.color, fontSize: 21, fontWeight: 700, letterSpacing: "0.2em", marginTop: 4 }}>{o.name}</div>
          </div>
        );
      })}

      {/* Formulas */}
      <div style={{ position: "absolute", left: 0, top: 896, width: 1920, opacity: formulaOpacity, transform: `translateY(${14 - formulaOpacity * 14}px)` }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 70 }}>
          <MathText size={40} align="center">
            <MVar color={AP_COLORS.query}>Q</MVar>
            <span>&nbsp;= X·W</span>
            <MSub color={AP_COLORS.query}>q</MSub>
          </MathText>
          <MathText size={40} align="center">
            <MVar color={AP_COLORS.key}>K</MVar>
            <span>&nbsp;= X·W</span>
            <MSub color={AP_COLORS.key}>k</MSub>
          </MathText>
          <MathText size={40} align="center">
            <MVar color={AP_COLORS.value}>V</MVar>
            <span>&nbsp;= X·W</span>
            <MSub color={AP_COLORS.value}>v</MSub>
          </MathText>
        </div>
      </div>
    </SceneShell>
  );
};
