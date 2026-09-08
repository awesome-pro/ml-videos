import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot } from "../../components/kv/KvSlot";
import { AttentionArc } from "../../components/shared/AttentionArc";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_DECODE_DURATION = 600; // 20.0s

const SLOT_W = 120;
const SLOT_H = 56;
const GAP = 14;
const SLOT_Y = 620;
const START = 470;

// Each decode step appends one entry; the rail grows and the step counter ticks.
const STEP_AT = 160;
const STEP_LEN = 96;

export const KVDecode: React.FC = () => {
  const frame = useCurrentFrame();

  const step = Math.min(4, Math.max(0, Math.floor((frame - STEP_AT) / STEP_LEN)));
  const count = 3 + step;

  const chipOpacity = interpolate(frame, [STEP_AT, STEP_AT + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionOpacity = interpolate(frame, [360, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const loopOpacity = interpolate(frame, [420, 460], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const centers = Array.from({ length: 7 }, (_, i) => START + SLOT_W / 2 + i * (SLOT_W + GAP));

  return (
    <SceneShell kicker="Decode" duration={KV_DECODE_DURATION} enterDelay={0}>
      <LeadLine text="One new token at a time" y={300} start={8} />

      <div style={{ position: "absolute", left: 0, top: 372, width: 1920, textAlign: "center", opacity: chipOpacity, color: AP_COLORS.textMuted, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", fontFamily: AP_FONTS.sans }}>
        KV CACHE · read + append
      </div>

      {/* Cache rail, growing each step */}
      {centers.map((cx, i) => {
        const present = i < count;
        const isNewest = i === count - 1 && present;
        return (
          <KvSlot
            key={i}
            index={i + 1}
            x={cx}
            y={SLOT_Y}
            width={SLOT_W}
            height={SLOT_H}
            state={present ? "cached" : "empty"}
            appearDelay={60 + i * 8}
            newStart={isNewest ? STEP_AT + 24 : null}
          />
        );
      })}

      {/* New token's Q / K / V (freshly computed) */}
      <div style={{ position: "absolute", left: START + 7 * (SLOT_W + GAP) + 16, top: 340, width: 300, opacity: chipOpacity }}>
        <div style={{ color: AP_COLORS.textPrimary, fontSize: 24, fontWeight: 700, fontFamily: AP_FONTS.sans, marginBottom: 12 }}>new token</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <MiniChip label={`Q${count}`} color={AP_COLORS.query} />
          <MiniChip label={`K${count}`} color={AP_COLORS.key} />
          <MiniChip label={`V${count}`} color={AP_COLORS.value} />
        </div>
      </div>

      {/* Newest Query reads cached keys */}
      {centers.map((cx, i) =>
        i < count - 1 ? (
          <AttentionArc key={i} x1={START + 7 * (SLOT_W + GAP) + 40} y1={360} x2={cx} y2={SLOT_Y - 26} weight={0.34} color={AP_COLORS.accent} appearDelay={STEP_AT + 20 + i * 6} drawDuration={16} apexLift={30} />
        ) : null
      )}

      {/* Append arrow into the newest slot */}
      {count > 0 ? (
        <div style={{ position: "absolute", left: START + 7 * (SLOT_W + GAP) + 30, top: SLOT_Y - 70, color: AP_COLORS.accent, fontSize: 22, fontWeight: 700, opacity: chipOpacity, fontFamily: AP_FONTS.sans }}>
          → append
        </div>
      ) : null}

      {/* Loop back */}
      <div style={{ position: "absolute", left: 0, top: 760, width: 1920, textAlign: "center", opacity: captionOpacity, color: AP_COLORS.textSecondary, fontSize: 26, fontWeight: 600, fontFamily: AP_FONTS.sans }}>
        read the cache → compute this token's Q, K, V → append its K, V → next
      </div>
      <div style={{ position: "absolute", left: 0, top: 820, width: 1920, textAlign: "center", opacity: loopOpacity, color: AP_COLORS.accent, fontSize: 26, fontWeight: 800, fontFamily: AP_FONTS.sans }}>
        the cache keeps growing one entry at a time
      </div>
    </SceneShell>
  );
};

const MiniChip: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div style={{ padding: "9px 20px", borderRadius: 999, background: `${color}22`, border: `1.5px solid ${color}`, color, fontSize: 22, fontWeight: 700, fontFamily: AP_FONTS.mono, textAlign: "center" }}>
    {label}
  </div>
);
