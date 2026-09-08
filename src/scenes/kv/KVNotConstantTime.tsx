import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot } from "../../components/kv/KvSlot";
import { MemBar } from "../../components/kv/MemBar";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_NOT_CONSTANT_DURATION = 600; // 20.0s

const QX = 320;
const SLOT_START = 440;
const SLOT_W = 80;
const SLOT_H = 44;
const SLOT_GAP = 12;

export const KVNotConstantTime: React.FC = () => {
  const frame = useCurrentFrame();

  const oA = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const oB = interpolate(frame, [90, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const caption = interpolate(frame, [200, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="A common misconception" duration={KV_NOT_CONSTANT_DURATION} enterDelay={0}>
      <LeadLine text="So is the next token now constant-time?" y={300} start={8} />

      <CompareRow
        label="short context · 100 tokens"
        count={6}
        labelY={350}
        rowY={432}
        barFill={0.3}
        barColor={AP_COLORS.key}
        opacity={oA}
        delayBase={26}
      />
      <CompareRow
        label="long context · 100,000 tokens"
        count={8}
        labelY={530}
        rowY={612}
        barFill={0.98}
        barColor={AP_COLORS.negative}
        opacity={oB}
        delayBase={100}
      />

      <div style={{ position: "absolute", left: 0, top: 770, width: 1920, textAlign: "center", opacity: caption, color: AP_COLORS.negative, fontSize: 30, fontWeight: 800, fontFamily: AP_FONTS.sans }}>
        it still attends to all the cached Keys &amp; Values → memory-bandwidth bound
      </div>
    </SceneShell>
  );
};

const CompareRow: React.FC<{
  label: string;
  count: number;
  labelY: number;
  rowY: number;
  barFill: number;
  barColor: string;
  opacity: number;
  delayBase: number;
}> = ({ label, count, labelY, rowY, barFill, barColor, opacity, delayBase }) => {
  const frame = useCurrentFrame();
  const slots = Array.from({ length: count }, (_, i) => SLOT_START + i * (SLOT_W + SLOT_GAP));

  return (
    <>
      <div style={{ position: "absolute", left: 0, top: labelY, width: 1920, textAlign: "center", opacity, color: AP_COLORS.textSecondary, fontSize: 24, fontWeight: 600, fontFamily: AP_FONTS.sans }}>
        {label}
      </div>

      <div style={{ position: "absolute", left: QX, top: rowY, transform: "translate(-50%,-50%)", padding: "8px 22px", borderRadius: 999, background: `${AP_COLORS.query}22`, border: `1.5px solid ${AP_COLORS.query}`, color: AP_COLORS.query, fontSize: 24, fontWeight: 700, fontFamily: AP_FONTS.mono, opacity: opacity * interpolate(frame - delayBase, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Q
      </div>

      {slots.map((x, i) => (
        <KvSlot key={i} index={i + 1} x={x} y={rowY} width={SLOT_W} height={SLOT_H} appearDelay={delayBase + 16 + i * 5} />
      ))}

      <div style={{ position: "absolute", left: SLOT_START, top: rowY + 52, opacity }}>
        <MemBar x={0} y={0} width={count * (SLOT_W + SLOT_GAP) - SLOT_GAP} height={16} fill={barFill} color={barColor} label={`data read · ${Math.round(barFill * 100)}%`} appearDelay={delayBase + 30} />
      </div>
    </>
  );
};
