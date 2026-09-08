import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { MathText, MVar, MSup, MSub } from "../../components/shared/MathText";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const SCENE_15_DURATION = 720; // 24.0s

export const Scene15_FullFormula: React.FC = () => {
  const frame = useCurrentFrame();
  const formulaOpacity = interpolate(frame, [12, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const batchOpacity = interpolate(frame, [120, 144], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const matrixOpacity = interpolate(frame, [180, 204], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="The formula, all at once" duration={SCENE_15_DURATION} enterDelay={0}>
      {/* The complete formula */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 350,
          width: 1920,
          opacity: formulaOpacity,
          transform: `translateY(${14 - formulaOpacity * 14}px)`,
        }}
      >
        <MathText size={62} align="center">
          <MVar color={AP_COLORS.value}>Attention</MVar>
          <span style={{ color: AP_COLORS.textSecondary }}>(</span>
          <MVar color={AP_COLORS.query}>Q</MVar>
          <span>, </span>
          <MVar color={AP_COLORS.key}>K</MVar>
          <span>, </span>
          <MVar color={AP_COLORS.value}>V</MVar>
          <span style={{ color: AP_COLORS.textSecondary }}>)</span>
          <span>&nbsp;= softmax(</span>
          <MVar color={AP_COLORS.query}>Q</MVar>
          <MVar color={AP_COLORS.key}>K</MVar>
          <MSup>T</MSup>
          <span>&nbsp;/&nbsp;</span>
          <MVar color={AP_COLORS.value}>√d</MVar>
          <MSub color={AP_COLORS.value}>k</MSub>
          <span>) </span>
          <MVar color={AP_COLORS.value}>V</MVar>
        </MathText>
        <div
          style={{
            textAlign: "center",
            color: AP_COLORS.textMuted,
            fontSize: 24,
            marginTop: 18,
            fontFamily: AP_FONTS.sans,
            fontWeight: 500,
          }}
        >
          (with a causal mask applied before softmax, in a decoder-only model)
        </div>
      </div>

      {/* Batch note */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 580,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 28,
          fontFamily: AP_FONTS.sans,
          opacity: batchOpacity,
        }}
      >
        Not for one token — the matrices hold <span style={{ color: AP_COLORS.textPrimary }}>all tokens</span> at once.
      </div>

      {/* Matrix schematic */}
      <div style={{ position: "absolute", left: 0, top: 680, width: 1920, opacity: matrixOpacity }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 60, alignItems: "flex-start" }}>
          <MatrixSchematic />
          <div style={{ color: AP_COLORS.textSecondary, fontSize: 25, fontWeight: 500, textAlign: "left", lineHeight: 1.5, paddingTop: 60, fontFamily: AP_FONTS.sans }}>
            <div style={{ color: AP_COLORS.query, fontWeight: 700, marginBottom: 8 }}>rows = query tokens</div>
            each row asks: “how much should I attend to each token?”
            <div style={{ color: AP_COLORS.key, fontWeight: 700, margin: 20, marginLeft: 0 }}>
              cols = key tokens
            </div>
            computed together in training / prefill.
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const MatrixSchematic: React.FC = () => {
  const frame = useCurrentFrame();
  const size = 34;
  const gap = 5;
  const highlightRow = 2;
  const glow = interpolate(frame - 220, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", gap }}>
      {/* Row labels */}
      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {["q1", "q2", "q3", "q4"].map((l, i) => (
          <div key={l} style={{ height: size, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10, color: i === highlightRow ? AP_COLORS.query : AP_COLORS.textMuted, fontFamily: AP_FONTS.mono, fontSize: 17, fontWeight: 700 }}>
            {l}
          </div>
        ))}
      </div>
      {/* Cells */}
      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} style={{ display: "flex", gap }}>
            {[0, 1, 2, 3].map((c) => (
              <div
                key={c}
                style={{
                  width: size,
                  height: size,
                  borderRadius: 6,
                  background: c > r ? AP_COLORS.negative : AP_COLORS.accent,
                  opacity: c > r ? 0.25 : 0.35 + 0.4 * (r === highlightRow && c <= r ? 1 : 0),
                  border: `1.5px solid ${r === highlightRow && c <= r ? AP_COLORS.accentBorder : AP_COLORS.gridLine}`,
                  boxShadow: r === highlightRow ? `0 0 16px rgba(154,123,255,${glow * 0.4})` : "none",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
