import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot, KvWordLabel } from "../../components/kv/KvSlot";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_NAIVE_DURATION = 960; // 32.0s

const SLOT_W = 146;
const SLOT_H = 62;
const GAP = 20;
const SLOT_Y = 540;
const WORDS = ["The", "capital", "of", "France", "is", "Paris"];

const CENTERS = Array.from({ length: 8 }, (_, i) => {
  const total = 8 * SLOT_W + 7 * GAP;
  const start = 960 - total / 2;
  return start + SLOT_W / 2 + i * (SLOT_W + GAP);
});

const FREEZE = 430;

export const KVNaiveRecompute: React.FC = () => {
  const frame = useCurrentFrame();

  const freeze = interpolate(frame, [FREEZE, FREEZE + 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const leadOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Only one wave label is ever visible at a time: wave 1 fades fully out
  // before wave 2 fades in, so they can't stack on top of each other.
  const wave1Opacity = interpolate(frame, [160, 178, 268, 288], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wave2Opacity = interpolate(frame, [298, 316, 402, 424], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const freezeLine1 = interpolate(frame, [FREEZE + 10, FREEZE + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const freezeLine2 = interpolate(frame, [FREEZE + 30, FREEZE + 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slotState = (i: number): "cached" | "empty" | "recompute" => {
    if (frame >= FREEZE) return i < 7 ? "recompute" : "cached";
    if (i < 6) return "cached";
    if (i === 6) return frame >= 200 ? "cached" : "empty";
    return frame >= 340 ? "cached" : "empty";
  };

  const recomputeStarts = (i: number): number[] => {
    if (frame >= FREEZE) return [];
    const arr: number[] = [];
    if (i < 6) arr.push(178 + i * 16, 316 + i * 16);
    else if (i === 6) arr.push(316 + 6 * 16);
    return arr;
  };

  return (
    <SceneShell kicker="Without a cache" duration={KV_NAIVE_DURATION} enterDelay={0}>
      <div style={{ opacity: 1 - freeze }}>
        <LeadLine text="Every new token needs the previous tokens' Keys and Values" y={300} start={8} />
      </div>

      <div style={{ position: "absolute", left: 0, top: 384, width: 1920, textAlign: "center", color: AP_COLORS.textPrimary, fontSize: 26, fontWeight: 700, opacity: leadOpacity * (1 - freeze), fontFamily: AP_FONTS.sans }}>
        predicted so far · <span style={{ color: AP_COLORS.textSecondary }}>"The capital of France is Paris"</span>
      </div>

      {/* K/V slots */}
      {Array.from({ length: 8 }, (_, i) => {
        const state = slotState(i);
        return (
          <div key={i} style={{ opacity: freeze > 0.5 && state !== "recompute" ? 0.6 : 1 }}>
            <KvSlot
              index={i + 1}
              x={CENTERS[i]}
              y={SLOT_Y}
              width={SLOT_W}
              height={SLOT_H}
              state={state}
              appearDelay={i < 6 ? 20 + i * 12 : 150}
              recomputeStarts={recomputeStarts(i)}
              newStart={i === 6 ? 200 : i === 7 ? 340 : null}
            />
            <div style={{ opacity: 1 - freeze }}>
              <KvWordLabel
                word={i < 6 ? WORDS[i] : i === 6 ? "token 7" : "token 8"}
                x={CENTERS[i]}
                y={604}
                appearDelay={i < 6 ? 30 + i * 12 : 210}
                color={i >= 6 ? AP_COLORS.textMuted : AP_COLORS.textSecondary}
              />
            </div>
          </div>
        );
      })}

      {/* Wave labels (only one visible at a time) */}
      <WaveLabel text="predict next token → recompute K1–K6 · V1–V6" y={446} opacity={wave1Opacity} color={AP_COLORS.negative} />
      <WaveLabel text="predict again → recompute K1–K7 · V1–V7" y={446} opacity={wave2Opacity} color={AP_COLORS.negative} />

      {/* Freeze overlay + question — stronger dim + blur so the past content
          recedes and only the recomputed slots + the question stay crisp. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(2,3,7,0.85)",
          opacity: freeze,
          zIndex: 3,
          backdropFilter: "blur(11px)",
          WebkitBackdropFilter: "blur(11px)",
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 178, width: 1920, textAlign: "center", zIndex: 7, opacity: freezeLine1, transform: `translateY(${20 - freezeLine1 * 20}px)` }}>
        <span style={{ color: AP_COLORS.textPrimary, fontSize: 52, fontWeight: 700, letterSpacing: "-0.02em", textShadow: "0 2px 30px rgba(0,0,0,0.6)" }}>
          We already calculated all of this.
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 284, width: 1920, textAlign: "center", zIndex: 7, opacity: freezeLine2, transform: `translateY(${24 - freezeLine2 * 24}px)` }}>
        <span style={{ color: AP_COLORS.negative, fontSize: 72, fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 2px 34px rgba(0,0,0,0.6)" }}>
          Why are we doing it again?
        </span>
      </div>
    </SceneShell>
  );
};

const WaveLabel: React.FC<{ text: string; y: number; opacity: number; color: string }> = ({ text, y, opacity, color }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: y,
      width: 1920,
      textAlign: "center",
      color,
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: "0.02em",
      opacity,
      fontFamily: AP_FONTS.sans,
    }}
  >
    {text}
  </div>
);
