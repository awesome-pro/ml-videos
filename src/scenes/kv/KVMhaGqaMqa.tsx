import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { HeadConfig } from "../../components/kv/HeadConfig";
import { LeadLine } from "../../components/shared/ui";
import { AP_COLORS } from "../../components/shared/theme";

export const KV_MHA_GQA_MQA_DURATION = 565; // 24.0s

const CONFIGS = [
  { title: "MHA", qCount: 6, kvCount: 6, qLabel: "32 Q", kvLabel: "32 KV", mem: 1.0, color: AP_COLORS.negative, caption: "full KV cache" },
  { title: "GQA", qCount: 6, kvCount: 3, qLabel: "32 Q", kvLabel: "8 KV", mem: 0.25, color: AP_COLORS.accent, caption: "grouped → smaller" },
  { title: "MQA", qCount: 6, kvCount: 1, qLabel: "32 Q", kvLabel: "1 KV", mem: 0.08, color: AP_COLORS.key, caption: "shared → smallest" },
];

const XS = [430, 960, 1490];

export const KVMhaGqaMqa: React.FC = () => {
  const frame = useCurrentFrame();

  const noteOpacity = interpolate(frame, [480, 520], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell kicker="Head configuration" duration={KV_MHA_GQA_MQA_DURATION} enterDelay={0}>
      <LeadLine text="More Query heads … fewer KV heads" y={300} start={8} />

      {CONFIGS.map((c, i) => (
        <HeadConfig
          key={c.title}
          title={c.title}
          qCount={c.qCount}
          kvCount={c.kvCount}
          qLabel={c.qLabel}
          kvLabel={c.kvLabel}
          memFraction={c.mem}
          x={XS[i]}
          y={360}
          color={c.color}
          appearDelay={40 + i * 40}
          caption={c.caption}
        />
      ))}

      <div style={{ position: "absolute", left: 0, top: 800, width: 1920, textAlign: "center", opacity: noteOpacity, color: AP_COLORS.textSecondary, fontSize: 26, fontWeight: 500, fontFamily: "inherit" }}>
        a quality/efficiency trade-off — but a big save in cache size and bandwidth
      </div>
    </SceneShell>
  );
};
