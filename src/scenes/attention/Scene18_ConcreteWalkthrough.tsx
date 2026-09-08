import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { ANIMAL_INDEX, ANIMAL_TIRED } from "./examples";
import { AP_COLORS } from "../../components/shared/theme";
import { LeadLine } from "../../components/shared/ui";

export const SCENE_18_DURATION = 1080; // 36.0s

const IT_INDEX = 7;
const Y = 470;
const BASE = 70;
const WINDOW = 78;
const N = ANIMAL_TIRED.length;

// Which previous/self tokens each token attends to (deterministic, plausible).
// Only the top few, so the stepping stays legible.
const ATTEND: number[][][] = [
  [[0, 0.8]],
  [[0, 0.4], [1, 0.8]],
  [[1, 0.4], [2, 0.7]],
  [[0, 0.5], [3, 0.7]],
  [[3, 0.5], [4, 0.7]],
  [[3, 0.3], [4, 0.4], [5, 0.7]],
  [[3, 0.4], [5, 0.4], [6, 0.7]],
  [[0, 0.9], [5, 0.45]], // "it" → animal strongly, street weakly
  [[7, 0.7], [8, 0.6]],
  [[8, 0.5], [9, 0.7]],
  [[0, 0.6], [9, 0.4], [10, 0.7]],
];

export const Scene18_ConcreteWalkthrough: React.FC = () => {
  const frame = useCurrentFrame();
  const row = layoutTokenRow(ANIMAL_TIRED, { fontSize: 28 });
  const cardH = cardHeightFor(28);

  const t = clamp(Math.floor((frame - BASE) / WINDOW), 0, N - 1);
  const within = frame - (BASE + t * WINDOW);

  const conclusionOpacity = interpolate(frame, [BASE + N * WINDOW + 6, BASE + N * WINDOW + 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="See it on a real sentence" duration={SCENE_18_DURATION} enterDelay={0}>
      <LeadLine text="Stepping through the sentence, token by token" y={330} start={14} />

      {/* Token row */}
      {row.centers.map((cx, i) => {
        const isCurrent = i === t && within < WINDOW;
        return (
          <TokenCard
            key={i}
            label={ANIMAL_TIRED[i]}
            x={cx}
            y={Y}
            width={row.widths[i]}
            height={cardH}
            variant={
              i === IT_INDEX && t >= IT_INDEX
                ? "accent"
                : isCurrent
                ? "query"
                : "neutral"
            }
            fontSize={28}
            appearDelay={20 + i * 3}
          />
        );
      })}

      {/* Attention arcs for the current token (skip the degenerate self-arc) */}
      {ATTEND[t].map(([target, w], idx) => {
        if (target === t) return null;
        return (
          <AttentionArc
            key={`${t}-${idx}`}
            x1={row.centers[t]}
            y1={Y - cardH / 2}
            x2={row.centers[target]}
            y2={Y - cardH / 2}
            weight={w}
            color={target === ANIMAL_INDEX && t === IT_INDEX ? AP_COLORS.positive : AP_COLORS.accent}
            appearDelay={BASE + t * WINDOW}
            apexLift={120}
            drawDuration={20}
          />
        );
      })}

      {/* Resolution beat for "it" */}
      {t === IT_INDEX && within >= 30 ? (
        <div
          style={{
            position: "absolute",
            left: row.centers[ANIMAL_INDEX],
            top: Y + cardH / 2 + 46,
            transform: "translate(-50%, -50%)",
            padding: "10px 24px",
            borderRadius: 999,
            background: AP_COLORS.keyBg,
            border: `1.5px solid ${AP_COLORS.key}`,
            color: AP_COLORS.key,
            fontSize: 28,
            fontWeight: 700,
            opacity: interpolate(within, [30, 48], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: "1",
          }}
        >
          it = animal
        </div>
      ) : null}

      {/* Conclusion */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 884,
          width: 1920,
          textAlign: "center",
          opacity: conclusionOpacity,
          transform: `translateY(${16 - conclusionOpacity * 16}px)`,
          padding: "0 120px",
        }}
      >
        <div style={{ color: AP_COLORS.textPrimary, fontSize: 36, fontWeight: 700 }}>
          Each token selectively gathers what it needs.
        </div>
        <div style={{ color: AP_COLORS.textSecondary, fontSize: 29, fontWeight: 500, marginTop: 10 }}>
          That’s attention.
        </div>
      </div>
    </SceneShell>
  );
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
