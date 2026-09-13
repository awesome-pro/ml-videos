import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { TokenCard } from "../../components/shared/TokenCard";
import { NumberVec } from "../../components/shared/NumberVec";
import { cardHeightFor, layoutTokenRow } from "../../components/shared/layout";
import { BANK_1 } from "./examples";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";
import { LeadLine, Tag } from "../../components/shared/ui";

export const SCENE_WORKED_QKV_DURATION = 400; // 13.3s — worked QKV example

const BANK_INDEX = 5;
const ROW_Y = 450;
// What each token "contains" (its Key) — short and readable.
const KEY_LABELS = ["me", "act", "where", "art", "water", "place"];
// How strongly "bank" matches each token's key (river wins).
const SCORES = [0.1, 0.22, 0.14, 0.08, 0.58, 0.3];
const NEW_REP = [0.62, -0.2, 0.9, 0.1];

export const SceneWorkedQKVExample: React.FC = () => {
  const frame = useCurrentFrame();
  const row = layoutTokenRow(BANK_1, { fontSize: 28, gap: 30 });
  const cardH = cardHeightFor(28);

  const repX = 960 - (NEW_REP.length * 62 + (NEW_REP.length - 1) * 6) / 2;

  const scoresOpacity = interpolate(frame, [200, 250], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const combineOpacity = interpolate(frame, [260, 286], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const repOpacity = interpolate(frame, [300, 330], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell kicker="The three ideas, on a real sentence" duration={SCENE_WORKED_QKV_DURATION} enterDelay={0}>
      <LeadLine text="Watch the three ideas happen on “bank”." y={300} start={8} />

      {/* Tokens: bank is the query */}
      {row.centers.map((cx, i) => (
        <TokenCard
          key={`t-${i}`}
          label={BANK_1[i]}
          x={cx}
          y={ROW_Y}
          width={row.widths[i]}
          height={cardH}
          variant={i === BANK_INDEX ? "query" : "neutral"}
          fontSize={28}
          appearDelay={20 + i * 3}
        />
      ))}

      {/* Q under bank, K labels under the others */}
      {row.centers.map((cx, i) => (
        <RoleLabel key={`r-${i}`} x={cx} y={ROW_Y + cardH / 2 + 44} isQuery={i === BANK_INDEX} text={i === BANK_INDEX ? "asks" : KEY_LABELS[i]} start={120 + i * 4} />
      ))}

      {/* Match scores, aligned under each token */}
      <div style={{ position: "absolute", left: 0, top: 664, width: 1920, textAlign: "center", opacity: scoresOpacity }}>
        <div style={{ color: AP_COLORS.textSecondary, fontSize: 24, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>
          MATCH SCORES (Q · K)
        </div>
      </div>
      {row.centers.map((cx, i) => {
        const o = interpolate(frame - (210 + i * 4), [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isStrong = i === 4;
        return (
          <div
            key={`s-${i}`}
            style={{
              position: "absolute",
              left: cx,
              top: 702,
              transform: `translateX(-50%) scale(${0.86 + o * 0.14})`,
              width: 64,
              height: 50,
              borderRadius: 10,
              background: AP_COLORS.accent,
              opacity: o * (0.16 + SCORES[i] * 0.56),
              border: `1.5px solid ${isStrong ? AP_COLORS.accent : AP_COLORS.accentBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: AP_COLORS.textPrimary,
              fontFamily: AP_FONTS.mono,
              fontSize: 21,
              fontWeight: 700,
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {SCORES[i].toFixed(2)}
          </div>
        );
      })}
      <Tag text="river is the match" x={row.centers[4]} y={618} start={236} color={AP_COLORS.accent} />

      {/* Combine: × V */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 792,
          width: 1920,
          textAlign: "center",
          color: AP_COLORS.textSecondary,
          fontSize: 28,
          opacity: combineOpacity,
        }}
      >
        weight each token’s <span style={{ color: AP_COLORS.value }}>value (V)</span> by its score → the token’s new idea
      </div>

      {/* New representation */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 852,
          width: 1920,
          textAlign: "center",
          opacity: repOpacity,
          transform: `translateY(${14 - repOpacity * 14}px)`,
        }}
      >
        <div style={{ color: AP_COLORS.textSecondary, fontSize: 23, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>
          BANK’S NEW REPRESENTATION
        </div>
      </div>
      <NumberVec
        values={NEW_REP}
        color={AP_COLORS.value}
        x={repX}
        y={896}
        cellW={62}
        cellH={44}
        gap={6}
        appearDelay={306}
        format={(v) => v.toFixed(1)}
      />
    </SceneShell>
  );
};

const RoleLabel: React.FC<{ x: number; y: number; isQuery: boolean; text: string; start: number }> = ({
  x,
  y,
  isQuery,
  text,
  start,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - start, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const color = isQuery ? AP_COLORS.query : AP_COLORS.key;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${0.86 + o * 0.14})`,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 11px",
        borderRadius: 999,
        background: isQuery ? AP_COLORS.queryBg : AP_COLORS.keyBg,
        border: `1.5px solid ${color}`,
        color,
        opacity: o,
        whiteSpace: "nowrap",
        fontFamily: AP_FONTS.sans,
      }}
    >
      <span style={{ fontSize: 20, fontWeight: 800, fontFamily: AP_FONTS.mono }}>{isQuery ? "Q" : "K"}</span>
      <span style={{ fontSize: 18, fontWeight: 600 }}>{text}</span>
    </div>
  );
};
