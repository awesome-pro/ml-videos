import React from "react";
import { Series } from "remotion";
import { MIL_ROADMAP_DURATION, MILRoadmap } from "../scenes/mil/MILRoadmap";
import { MIL_INPUT_IDS_DURATION, MILInputIds } from "../scenes/mil/MILInputIds";
import { MIL_VOCAB_DURATION, MILVocab } from "../scenes/mil/MILVocab";
import { MIL_FORWARD_DURATION, MILForwardPass } from "../scenes/mil/MILForwardPass";
import { MIL_SHAPE_GROW_DURATION, MILShapeGrow } from "../scenes/mil/MILShapeGrow";
import { MIL_SAMPLING_DURATION, MILSampling } from "../scenes/mil/MILSampling";
import { MIL_TEMPERATURE_DURATION, MILTemperature } from "../scenes/mil/MILTemperature";
import { MIL_TRUNCATION_DURATION, MILTruncation } from "../scenes/mil/MILTruncation";
import { MIL_TOP_K_DURATION, MILTopKCode } from "../scenes/mil/MILTopKCode";
import { MIL_TOP_P_DURATION, MILTopPCode } from "../scenes/mil/MILTopPCode";
import { MIL_NAIVE_DURATION, MILNaiveLoop } from "../scenes/mil/MILNaiveLoop";
import { MIL_KV_CACHE_DURATION, MILKVCache } from "../scenes/mil/MILKVCache";
import { MIL_PREFILL_DURATION, MILPrefill } from "../scenes/mil/MILPrefill";
import { MIL_DECODE_DURATION, MILDecode } from "../scenes/mil/MILDecode";
import { MIL_LAST_LOGITS_DURATION, MILLastLogits } from "../scenes/mil/MILLastLogits";
import { MIL_BATCHING_DURATION, MILBatching } from "../scenes/mil/MILBatching";
import { MIL_MASK_DURATION, MILAttentionMask } from "../scenes/mil/MILAttentionMask";
import { MIL_OUTPUT_DURATION, MILOutput } from "../scenes/mil/MILOutput";
import { MIL_TTFT_DURATION, MILTTFTITL } from "../scenes/mil/MILTTFTITL";
import { MIL_METRICS_DURATION, MILMetrics } from "../scenes/mil/MILMetrics";
import { MIL_CLOSING_DURATION, MILClosing } from "../scenes/mil/MILClosing";
import { VOCAB_LABEL } from "../scenes/mil/data";

/**
 * The episode as an ordered manifest, not a hand-written chain of sequences.
 *
 * Both the video and the presenter deck (`npm run deck`) read this list, so the
 * two can never disagree about which scenes exist, what order they are in, or
 * how long the whole thing runs. Adding a scene is one line here and the total
 * duration follows.
 */
export type EpisodeScene = {
  /** Registry id — the same string `remotion render` takes. */
  id: string;
  /**
   * The scene's own on-screen headline, used as the slide title in the deck.
   * These mirror the `title` prop each scene passes to `SceneShell`; if you
   * change one there, change it here too.
   */
  title: string;
  component: React.FC;
  durationInFrames: number;
};

export const MINI_INFERENCE_SCENES: EpisodeScene[] = [
  { id: "MILRoadmap", title: "Inference Loop", component: MILRoadmap, durationInFrames: MIL_ROADMAP_DURATION },
  {
    id: "MILInputIds",
    title: "A prompt is a row of token ids",
    component: MILInputIds,
    durationInFrames: MIL_INPUT_IDS_DURATION,
  },
  { id: "MILVocab", title: `V = ${VOCAB_LABEL}`, component: MILVocab, durationInFrames: MIL_VOCAB_DURATION },
  {
    id: "MILForwardPass",
    title: "input_ids → logits → next token",
    component: MILForwardPass,
    durationInFrames: MIL_FORWARD_DURATION,
  },
  {
    id: "MILShapeGrow",
    title: "How the shape changes",
    component: MILShapeGrow,
    durationInFrames: MIL_SHAPE_GROW_DURATION,
  },
  {
    id: "MILSampling",
    title: "Greedy takes the top; sampling draws",
    component: MILSampling,
    durationInFrames: MIL_SAMPLING_DURATION,
  },
  {
    id: "MILTemperature",
    title: "Temperature moves the odds",
    component: MILTemperature,
    durationInFrames: MIL_TEMPERATURE_DURATION,
  },
  {
    id: "MILTruncation",
    title: "Cutting the tail before you draw",
    component: MILTruncation,
    durationInFrames: MIL_TRUNCATION_DURATION,
  },
  {
    id: "MILTopKCode",
    title: "top-k: keep the four, -inf the rest",
    component: MILTopKCode,
    durationInFrames: MIL_TOP_K_DURATION,
  },
  {
    id: "MILTopPCode",
    title: "top-p: keep the shortest 90% prefix",
    component: MILTopPCode,
    durationInFrames: MIL_TOP_P_DURATION,
  },
  {
    id: "MILNaiveLoop",
    title: "Every step redoes the whole prefix",
    component: MILNaiveLoop,
    durationInFrames: MIL_NAIVE_DURATION,
  },
  {
    id: "MILKVCache",
    title: "Keep the K and V",
    component: MILKVCache,
    durationInFrames: MIL_KV_CACHE_DURATION,
  },
  {
    id: "MILPrefill",
    title: "Prefill: the prompt in one pass",
    component: MILPrefill,
    durationInFrames: MIL_PREFILL_DURATION,
  },
  {
    id: "MILDecode",
    title: "Decode: one token, one column",
    component: MILDecode,
    durationInFrames: MIL_DECODE_DURATION,
  },
  {
    id: "MILLastLogits",
    title: "Only the newest row is used",
    component: MILLastLogits,
    durationInFrames: MIL_LAST_LOGITS_DURATION,
  },
  {
    id: "MILBatching",
    title: "One rectangle for many requests",
    component: MILBatching,
    durationInFrames: MIL_BATCHING_DURATION,
  },
  {
    id: "MILAttentionMask",
    title: "Tell the model what is padding",
    component: MILAttentionMask,
    durationInFrames: MIL_MASK_DURATION,
  },
  { id: "MILOutput", title: "Decode the ids back to text", component: MILOutput, durationInFrames: MIL_OUTPUT_DURATION },
  { id: "MILTTFTITL", title: "TTFT and ITL", component: MILTTFTITL, durationInFrames: MIL_TTFT_DURATION },
  {
    id: "MILMetrics",
    title: "How they are computed",
    component: MILMetrics,
    durationInFrames: MIL_METRICS_DURATION,
  },
  { id: "MILClosing", title: "Recap", component: MILClosing, durationInFrames: MIL_CLOSING_DURATION },
];

export const MINI_INFERENCE_DURATION = MINI_INFERENCE_SCENES.reduce(
  (total, scene) => total + scene.durationInFrames,
  0
);

// "The Mini Inference Loop" — from a prompt to a streamed answer, grounded in
// Qwen2.5-0.5B and its real tokenizer ids.
export const MiniInferenceLoop: React.FC = () => {
  return (
    <Series>
      {MINI_INFERENCE_SCENES.map((scene) => (
        <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
          <scene.component />
        </Series.Sequence>
      ))}
    </Series>
  );
};
