import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot } from "../../components/kv/KvSlot";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_PREFILL_DURATION = 325; // 20.0s

const TOKEN_GRID_Y = 520;
const CACHE_Y = 520;

export const KVPrefill: React.FC = () => {
  const frame = useCurrentFrame();

  const gridOpacity = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cacheOpacity = interpolate(frame, [140, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionOpacity = interpolate(frame, [240, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="Prefill" duration={KV_PREFILL_DURATION} enterDelay={0}>
      <LeadLine text="The prompt is fully known up front" y={300} start={8} />

      {/* Prompt block onto the left */}
      <div style={{ position: "absolute", left: 0, top: 380, width: 700, textAlign: "center", opacity: gridOpacity }}>
        <div style={{ color: AP_COLORS.textPrimary, fontSize: 26, fontWeight: 700, fontFamily: AP_FONTS.sans, marginBottom: 18 }}>
          the prompt · all tokens at once
        </div>
        <TokenGrid />
      </div>

      <FlowArrow x1={760} y1={TOKEN_GRID_Y} x2={940} y2={TOKEN_GRID_Y} color={AP_COLORS.accent} appearDelay={100} thickness={4} />

      {/* Cache fills */}
      <div style={{ position: "absolute", left: 0, top: 380, width: 1920, textAlign: "center", opacity: cacheOpacity }}>
        <div style={{ color: AP_COLORS.textPrimary, fontSize: 26, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
          KV cache · populated
        </div>
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={{ opacity: cacheOpacity }}>
          <KvSlot index={i + 1} x={1000 + i * 100} y={CACHE_Y} width={90} height={58} appearDelay={150 + i * 10} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 1000 + 8 * 100, top: CACHE_Y, transform: "translate(-50%,-50%)", opacity: cacheOpacity, color: AP_COLORS.textMuted, fontSize: 34, fontWeight: 700, fontFamily: AP_FONTS.mono }}>
        …
      </div>

      <div style={{ position: "absolute", left: 0, top: 690, width: 1920, textAlign: "center", opacity: captionOpacity, color: AP_COLORS.accent, fontSize: 30, fontWeight: 800, fontFamily: AP_FONTS.sans }}>
        every prompt token's K, V computed together → cache
      </div>
      <div style={{ position: "absolute", left: 0, top: 740, width: 1920, textAlign: "center", opacity: captionOpacity, color: AP_COLORS.textSecondary, fontSize: 24, fontWeight: 500, fontFamily: AP_FONTS.sans }}>
        e.g. 1000 prompt tokens → 1000 cached K/V entries
      </div>
    </SceneShell>
  );
};

const TokenGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = 5;
  const cols = 7;
  const opacity = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const els: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const delay = 34 + (r * cols + c) * 4;
      els.push(
        <div
          key={`${r}-${c}`}
          style={{
            width: 86,
            height: 40,
            borderRadius: 8,
            background: AP_COLORS.surfaceRaised,
            border: `1px solid ${AP_COLORS.surfaceBorder}`,
            color: AP_COLORS.textMuted,
            fontSize: 24,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: opacity * interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            fontFamily: AP_FONTS.sans,
          }}
        >
          token
        </div>
      );
    }
  }
  return (
    <div style={{ position: "absolute", left: 350 - 297, top: 420 }}>
      <div style={{ display: "flex", flexWrap: "wrap", width: 7 * 78 + 6 * 8, gap: 8 }}>
        {els}
      </div>
    </div>
  );
};
