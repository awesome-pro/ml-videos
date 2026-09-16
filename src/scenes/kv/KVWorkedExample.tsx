import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot } from "../../components/kv/KvSlot";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_WORKED_DURATION = 645; // ~30.7s

const SLOT_W = 128;
const SLOT_H = 58;
const GAP = 16;
const SLOT_Y = 640;

const CENTERS = Array.from({ length: 7 }, (_, i) => {
  const start = 560;
  return start + SLOT_W / 2 + i * (SLOT_W + GAP);
});

const QX = 280;
const QY = 400;

// Timeline helpers
const PROMPT_END = 150;
const PARIS_END = 340;

export const KVWorkedExample: React.FC = () => {
  const frame = useCurrentFrame();

  const cacheCount = (): number => {
    if (frame < PROMPT_END) return 5;
    if (frame < PARIS_END) return 6;
    return 7;
  };

  const phase = (): "prompt" | "paris" | "t7" | "recap" => {
    if (frame < PROMPT_END) return "prompt";
    if (frame < PARIS_END) return "paris";
    if (frame < 520) return "t7";
    return "recap";
  };

  const p = phase();
  const qPrefix = p === "paris" ? 6 : 7;
  const qWord = p === "paris" ? "Paris" : "token 7";

  // The colored Q/K/V chips fade in when the current token is being computed.
  const chipsOpacity = interpolate(frame, [160, 186], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chipsOpacity2 = interpolate(frame, [350, 376], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const activeChips = (p === "paris" ? chipsOpacity : p === "t7" ? chipsOpacity2 : 0);

  const captionA = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionB = interpolate(frame, [240, 270], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionC = interpolate(frame, [430, 460], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionD = interpolate(frame, [560, 600], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const currentCount = cacheCount();
  // Representative attention arcs: first, middle, newest cached key.
  const arcTargets = (p === "prompt" ? [] : [0, Math.floor((currentCount - 1) / 2), currentCount - 1]);
  const arcWeights = [0.22, 0.38, 0.75];
  const arcDelays = [176, 188, 200];

  return (
    <SceneShell kicker="With a cache" duration={KV_WORKED_DURATION} enterDelay={0}>
      {/* Left: the new token's computed Q, K, V */}
      <div style={{ position: "absolute", left: 0, top: 250, width: 560, textAlign: "center", opacity: activeChips }}>
        <div style={{ color: AP_COLORS.textPrimary, fontSize: 28, fontWeight: 700, fontFamily: AP_FONTS.sans }}>the new token</div>
        <div style={{ color: AP_COLORS.accent, fontSize: 34, fontWeight: 800, fontFamily: AP_FONTS.sans, marginTop: 8 }}>{qWord}</div>
      </div>
      <ChipRow x={QX} yRows={[390, 470, 550]} labels={[`Q${qPrefix}`, `K${qPrefix}`, `V${qPrefix}`]} colors={[AP_COLORS.query, AP_COLORS.key, AP_COLORS.value]} opacity={activeChips} />

      {/* Cache rail */}
      <div style={{ position: "absolute", left: 0, top: 560, width: 1920, textAlign: "center", color: AP_COLORS.textMuted, fontSize: 26, fontWeight: 700, letterSpacing: "0.2em", fontFamily: AP_FONTS.sans }}>
        KV CACHE · ALREADY COMPUTED
      </div>
      {CENTERS.map((cx, i) => {
        const present = i < currentCount;
        const isNewest = i === currentCount - 1;
        return (
          <KvSlot
            key={i}
            index={i + 1}
            x={cx}
            y={SLOT_Y}
            width={SLOT_W}
            height={SLOT_H}
            state={present ? "cached" : "empty"}
            appearDelay={20 + i * 10}
            newStart={isNewest ? (i < 6 ? 200 : 396) : null}
          />
        );
      })}

      {/* Attention arcs from the new Query to cached Keys */}
      {p !== "prompt"
        ? arcTargets.map((ti, k) => (
            <AttentionArc
              key={ti}
              x1={QX}
              y1={QY}
              x2={CENTERS[ti]}
              y2={SLOT_Y - 30}
              weight={arcWeights[k]}
              color={AP_COLORS.accent}
              appearDelay={arcDelays[k]}
              drawDuration={20}
              apexLift={40}
            />
          ))
        : null}

      {/* Appended arrow into the newest slot */}
      {p !== "prompt" ? (
        <FlowArrow x1={QX + 60} y1={550} x2={CENTERS[currentCount - 1] - SLOT_W / 2} y2={SLOT_Y} color={AP_COLORS.accent} appearDelay={p === "paris" ? 190 : 386} thickness={3} />
      ) : null}

      {/* Captions */}
      <div style={{ position: "absolute", left: 0, top: 210, width: 1920, textAlign: "center", opacity: captionA, color: AP_COLORS.textSecondary, fontSize: 26, fontWeight: 500, fontFamily: AP_FONTS.sans }}>
        prompt fills the cache
      </div>
      <div style={{ position: "absolute", left: 590, top: 280, width: 1100, textAlign: "center", opacity: captionB, color: AP_COLORS.query, fontSize: 27, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
        compute only Q6, K6, V6
      </div>
      <div style={{ position: "absolute", left: 590, top: 380, width: 1100, textAlign: "center", opacity: captionC, color: AP_COLORS.key, fontSize: 27, fontWeight: 700, fontFamily: AP_FONTS.sans }}>
        Q attends to cached K1…K6 → weighted V from cache
      </div>
      <div style={{ position: "absolute", left: 0, top: 780, width: 1920, textAlign: "center", opacity: captionD, color: AP_COLORS.accent, fontSize: 30, fontWeight: 800, fontFamily: AP_FONTS.sans }}>
        the old K, V are never recomputed — only the new one is appended
      </div>
    </SceneShell>
  );
};

const ChipRow: React.FC<{ x: number; yRows: number[]; labels: string[]; colors: string[]; opacity: number }> = ({ x, yRows, labels, colors, opacity }) => {
  return (
    <>
      {labels.map((label, i) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: x,
            top: yRows[i],
            transform: "translate(-50%, -50%)",
            padding: "12px 30px",
            borderRadius: 999,
            background: `${colors[i]}22`,
            border: `1.5px solid ${colors[i]}`,
            color: colors[i],
            fontSize: 26,
            fontWeight: 700,
            opacity,
            fontFamily: AP_FONTS.mono,
            boxShadow: AP_COLORS.cardShadowSoft,
          }}
        >
          {label}
        </div>
      ))}
    </>
  );
};
