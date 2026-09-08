import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { KvSlot } from "../../components/kv/KvSlot";
import { MemBar } from "../../components/kv/MemBar";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS, AP_FONTS } from "../../components/shared/theme";

export const KV_MULTI_USER_DURATION = 600; // 20.0s

const USERS = ["user 1", "user 2", "user 3", "user 4", "… user N"];
const ROW_Y = [360, 420, 480, 540, 600];

export const KVMultiUser: React.FC = () => {
  const frame = useCurrentFrame();

  const rowsOpacity = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const memOpacity = interpolate(frame, [120, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionOpacity = interpolate(frame, [240, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="Serving many requests at once" duration={KV_MULTI_USER_DURATION} enterDelay={0}>
      <LeadLine text="Every active sequence keeps its own KV cache" y={300} start={8} />

      {USERS.map((u, i) => (
        <React.Fragment key={u}>
          <div style={{ position: "absolute", left: 240, top: ROW_Y[i] + 8, color: AP_COLORS.textSecondary, fontSize: 22, fontWeight: 600, fontFamily: AP_FONTS.sans, opacity: rowsOpacity * interpolate(frame - (20 + i * 12), [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            {u}
          </div>
          {Array.from({ length: Math.min(8, 6 + i) }, (_, s) => (
            <KvSlot
              key={s}
              index={s + 1}
              x={380 + s * 96}
              y={ROW_Y[i] + 14}
              width={84}
              height={44}
              appearDelay={40 + i * 6 + s * 4}
            />
          ))}
        </React.Fragment>
      ))}

      <div style={{ position: "absolute", left: 0, top: 660, width: 1920, opacity: memOpacity }}>
        <MemBar x={380} y={0} width={1200} height={26} fill={0.92} color={AP_COLORS.negative} label="total KV-cache memory across all users" appearDelay={140} />
      </div>

      <div style={{ position: "absolute", left: 0, top: 760, width: 1920, textAlign: "center", opacity: captionOpacity, color: AP_COLORS.negative, fontSize: 30, fontWeight: 800, fontFamily: AP_FONTS.sans }}>
        the memory can become enormous — a core serving problem
      </div>
    </SceneShell>
  );
};
