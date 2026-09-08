import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot } from "../../components/kv/KvSlot";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_REAL_MODEL_DURATION = 720; // 24.0s

const LAYERS = [
  { label: "Layer 1", y: 330 },
  { label: "Layer 2", y: 460 },
  { label: "Layer 3", y: 590 },
  { label: "Layer L", y: 720 },
];

const CARD_LEFT = 280;
const CARD_W = 360;
const TOKEN_X = 720;
const CACHE_LABEL_X = 880;
const CACHE_X0 = 920;
const CACHE_GAP = 84;
const CACHE_SLOT_W = 72;
const CACHE_SLOT_H = 48;

const DECODE_START = 360;
const PREFILL_BASE = 80;
const PREFILL_STEP = 18;
const PREFILL_SPAN = 14;
const LAYER_SPAN = 80;

const ARROW_X = CARD_LEFT + CARD_W / 2;

export const KVRealModelFlow: React.FC = () => {
  const frame = useCurrentFrame();

  const oStack = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const prefillOpacity = interpolate(frame, [150, 185, 288, 314], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const decodeOpacity = interpolate(frame, [344, 376], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tokenY = interpolate(frame, [DECODE_START, 690], [LAYERS[0].y, LAYERS[LAYERS.length - 1].y], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tokenOpacity = interpolate(frame, [340, 372], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const decodePhase = frame - DECODE_START;
  const layerZone = Math.max(0, Math.min(LAYERS.length - 1, Math.floor(decodePhase / LAYER_SPAN)));

  return (
    <SceneShell kicker="Inside a real model" duration={KV_REAL_MODEL_DURATION} enterDelay={0}>
      <LeadLine text="The same loop — every layer, every token" y={250} start={8} />

      {/* Layer stack (a simplified transformer) */}
      {LAYERS.map((l) => (
        <div key={l.label} style={{ position: "absolute", left: CARD_LEFT, top: l.y, width: CARD_W, padding: "18px 20px", borderRadius: 16, background: AP_COLORS.surface, border: `1.5px solid ${AP_COLORS.surfaceBorderActive}`, boxShadow: AP_COLORS.cardShadowSoft, opacity: oStack }}>
          <div style={{ color: AP_COLORS.textPrimary, fontSize: 26, fontWeight: 700, fontFamily: AP_FONTS.sans }}>{l.label}</div>
          <div style={{ marginTop: 10, color: AP_COLORS.textMuted, fontSize: 19, fontWeight: 500, fontFamily: AP_FONTS.sans }}>
            attention → reads its cache → writes a new K, V
          </div>
        </div>
      ))}

      {/* Down arrows between layers */}
      {LAYERS.slice(0, -1).map((l, i) => (
        <FlowArrow key={i} x1={ARROW_X} y1={l.y + 90} x2={ARROW_X} y2={LAYERS[i + 1].y - 16} color={AP_COLORS.accent} appearDelay={60 + i * 16} thickness={3} />
      ))}

      {/* Per-layer KV caches that fill at prefill then extend at decode */}
      {LAYERS.map((l, i) => {
        const prefillCount = Math.max(0, Math.min(4, Math.floor((frame - (PREFILL_BASE + i * PREFILL_STEP)) / PREFILL_SPAN)));
        const appendSlot = decodePhase >= 0 && layerZone === i;
        const slotCount = 4 + (appendSlot ? 1 : 0);
        const appendStart = DECODE_START + i * LAYER_SPAN;
        return (
          <React.Fragment key={`c${i}`}>
            <div style={{ position: "absolute", left: CACHE_LABEL_X, top: l.y + 4, transform: "translateX(-50%)", color: AP_COLORS.accent, fontSize: 20, fontWeight: 700, opacity: oStack, fontFamily: AP_FONTS.sans }}>
              {l.label} cache
            </div>
            {Array.from({ length: slotCount }, (_, s) => {
              const idx = s + 1;
              const isPrefill = idx <= prefillCount;
              const isAppend = appendSlot && idx === 5;
              const present = isPrefill || isAppend;
              return (
                <KvSlot
                  key={idx}
                  index={idx}
                  x={CACHE_X0 + s * CACHE_GAP}
                  y={l.y + 46}
                  width={CACHE_SLOT_W}
                  height={CACHE_SLOT_H}
                  state={present ? "cached" : "empty"}
                  appearDelay={40 + i * 16 + s * 10}
                  newStart={isAppend ? appendStart : null}
                />
              );
            })}
          </React.Fragment>
        );
      })}

      {/* The single new token descending during decode */}
      <div style={{ position: "absolute", left: TOKEN_X, top: tokenY, transform: "translate(-50%,-50%)", padding: "9px 18px", borderRadius: 999, background: `${AP_COLORS.query}22`, border: `1.5px solid ${AP_COLORS.query}`, color: AP_COLORS.query, fontSize: 21, fontWeight: 700, opacity: tokenOpacity, fontFamily: AP_FONTS.sans, boxShadow: AP_COLORS.cardShadowSoft, whiteSpace: "nowrap" }}>
        new token
      </div>

      {/* Phase captions (only one visible at a time) */}
      <div style={{ position: "absolute", left: 0, top: 186, width: 1920, textAlign: "center", opacity: prefillOpacity, color: AP_COLORS.key, fontSize: 26, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
        prefill → process the prompt through every layer → fill each cache
      </div>
      <div style={{ position: "absolute", left: 0, top: 186, width: 1920, textAlign: "center", opacity: decodeOpacity, color: AP_COLORS.query, fontSize: 26, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
        decode → one new token down every layer, reading + extending each cache
      </div>

      <div style={{ position: "absolute", left: 0, top: 830, width: 1920, textAlign: "center", opacity: oStack, color: AP_COLORS.textSecondary, fontSize: 24, fontWeight: 500, fontFamily: AP_FONTS.sans }}>
        (simplified — real models have many more layers &amp; steps)
      </div>
    </SceneShell>
  );
};
