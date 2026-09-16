import React from "react";
import { Series } from "remotion";
import { KV_INTRO_DURATION, KVIntroCard } from "../scenes/kv/KVIntroCard";
import { KV_AUTOREG_DURATION, KVAutoregressive } from "../scenes/kv/KVAutoregressive";
import { KV_ATTN_RECAP_DURATION, KVAttentionRecap } from "../scenes/kv/KVAttentionRecap";
import { KV_NAIVE_DURATION, KVNaiveRecompute } from "../scenes/kv/KVNaiveRecompute";
import { KV_DEFINITION_DURATION, KVDefinition } from "../scenes/kv/KVDefinition";
import { KV_WORKED_DURATION, KVWorkedExample } from "../scenes/kv/KVWorkedExample";
import { KV_AS_MEMORY_DURATION, KVCacheAsMemory } from "../scenes/kv/KVCacheAsMemory";
import { KV_WHY_NOT_Q_DURATION, KVWhyNotQ } from "../scenes/kv/KVWhyNotQ";
import { KV_PREFILL_DURATION, KVPrefill } from "../scenes/kv/KVPrefill";
import { KV_DECODE_DURATION, KVDecode } from "../scenes/kv/KVDecode";
import { KV_PER_LAYER_DURATION, KVPerLayer } from "../scenes/kv/KVPerLayer";
import { KV_SIZE_DURATION, KVCacheSize } from "../scenes/kv/KVCacheSize";
import { KV_MULTI_USER_DURATION, KVMultiUser } from "../scenes/kv/KVMultiUser";
import { KV_PRACTICAL_DURATION, KVPracticalExample } from "../scenes/kv/KVPracticalExample";
import { KV_TRADEOFF_DURATION, KVTradeoff } from "../scenes/kv/KVTradeoff";
import { KV_NOT_CONSTANT_DURATION, KVNotConstantTime } from "../scenes/kv/KVNotConstantTime";
import { KV_MHA_GQA_MQA_DURATION, KVMhaGqaMqa } from "../scenes/kv/KVMhaGqaMqa";
import { KV_FULL_RECAP_DURATION, KVFullRecap } from "../scenes/kv/KVFullRecap";
import { KV_REAL_MODEL_DURATION, KVRealModelFlow } from "../scenes/kv/KVRealModelFlow";
import { KV_CLOSING_DURATION, KVClosing } from "../scenes/kv/KVClosing";

export const KVCACHE_DURATION =
  KV_INTRO_DURATION +
  KV_AUTOREG_DURATION +
  KV_ATTN_RECAP_DURATION +
  KV_NAIVE_DURATION +
  KV_DEFINITION_DURATION +
  KV_WORKED_DURATION +
  KV_AS_MEMORY_DURATION +
  KV_WHY_NOT_Q_DURATION +
  KV_PREFILL_DURATION +
  KV_DECODE_DURATION +
  KV_PER_LAYER_DURATION +
  KV_SIZE_DURATION +
  KV_MULTI_USER_DURATION +
  KV_PRACTICAL_DURATION +
  KV_TRADEOFF_DURATION +
  KV_NOT_CONSTANT_DURATION +
  KV_MHA_GQA_MQA_DURATION +
  KV_FULL_RECAP_DURATION +
  KV_REAL_MODEL_DURATION +
  KV_CLOSING_DURATION;

// "The KV Cache From First Principles" — a full, deterministic episode.
export const KVCache: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={KV_INTRO_DURATION}>
        <KVIntroCard />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_AUTOREG_DURATION}>
        <KVAutoregressive />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_ATTN_RECAP_DURATION}>
        <KVAttentionRecap />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_NAIVE_DURATION}>
        <KVNaiveRecompute />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_DEFINITION_DURATION}>
        <KVDefinition />
      </Series.Sequence>
      <Series.Sequence
        durationInFrames={KV_WORKED_DURATION}
        style={{
          scale: 1.001,
        }}
      >
        <KVWorkedExample />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_AS_MEMORY_DURATION}>
        <KVCacheAsMemory />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_WHY_NOT_Q_DURATION}>
        <KVWhyNotQ />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_PREFILL_DURATION}>
        <KVPrefill />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_DECODE_DURATION}>
        <KVDecode />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_PER_LAYER_DURATION}>
        <KVPerLayer />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_SIZE_DURATION}>
        <KVCacheSize />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_MULTI_USER_DURATION}>
        <KVMultiUser />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_PRACTICAL_DURATION}>
        <KVPracticalExample />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_TRADEOFF_DURATION}>
        <KVTradeoff />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_NOT_CONSTANT_DURATION}>
        <KVNotConstantTime />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_MHA_GQA_MQA_DURATION}>
        <KVMhaGqaMqa />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_FULL_RECAP_DURATION}>
        <KVFullRecap />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_REAL_MODEL_DURATION}>
        <KVRealModelFlow />
      </Series.Sequence>
      <Series.Sequence durationInFrames={KV_CLOSING_DURATION}>
        <KVClosing />
      </Series.Sequence>
    </Series>
  );
};
