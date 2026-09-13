import type { ComponentType } from "react";
import { FPS, HEIGHT, WIDTH } from "../videoConfig";
import {
  ATTENTION_PRIMER_DURATION,
  AttentionPrimer,
} from "../episodes/AttentionPrimer";
import {
  SCENE_01_DURATION as AP_SCENE_01_DURATION,
  Scene01_IntroCard,
} from "./attention/Scene01_IntroCard";
import {
  SCENE_02_DURATION as AP_SCENE_02_DURATION,
  Scene02_AmbiguityHook,
} from "./attention/Scene02_AmbiguityHook";
import {
  SCENE_03_DURATION as AP_SCENE_03_DURATION,
  Scene03_BankAmbiguity,
} from "./attention/Scene03_BankAmbiguity";
import {
  SCENE_04_DURATION as AP_SCENE_04_DURATION,
  Scene04_ContextIntuition,
} from "./attention/Scene04_ContextIntuition";
import {
  SCENE_ANIMAL_INFERENCE_DURATION as AP_SCENE_ANIMAL_INFERENCE_DURATION,
  SceneAnimalInference,
} from "./attention/SceneAnimalInference";
import {
  SCENE_05_DURATION as AP_SCENE_05_DURATION,
  Scene05_AttentionDefinition,
} from "./attention/Scene05_AttentionDefinition";
import {
  SCENE_06_DURATION as AP_SCENE_06_DURATION,
  Scene06_BankAttentionWeights,
} from "./attention/Scene06_BankAttentionWeights";
import {
  SCENE_07_DURATION as AP_SCENE_07_DURATION,
  Scene07_ThreeIdeas,
} from "./attention/Scene07_ThreeIdeas";
import {
  SCENE_WORKED_QKV_DURATION as AP_SCENE_WORKED_QKV_DURATION,
  SceneWorkedQKVExample,
} from "./attention/SceneWorkedQKVExample";
import {
  SCENE_ROLES_BRIDGE_DURATION as AP_SCENE_ROLES_BRIDGE_DURATION,
  SceneRolesBridge,
} from "./attention/SceneRolesBridge";
import {
  SCENE_08_DURATION as AP_SCENE_08_DURATION,
  Scene08_QKVNames,
} from "./attention/Scene08_QKVNames";
import {
  SCENE_09_DURATION as AP_SCENE_09_DURATION,
  Scene09_DefinitionRecap,
} from "./attention/Scene09_DefinitionRecap";
import {
  SCENE_TOKENS_TO_IDS_DURATION as AP_SCENE_TOKENS_TO_IDS_DURATION,
  SceneTokensToIDs,
} from "./attention/SceneTokensToIDs";
import {
  SCENE_10_DURATION as AP_SCENE_10_DURATION,
  Scene10_TokensToVectors,
} from "./attention/Scene10_TokensToVectors";
import {
  SCENE_11_DURATION as AP_SCENE_11_DURATION,
  Scene11_QKVProjection,
} from "./attention/Scene11_QKVProjection";
import {
  SCENE_12_DURATION as AP_SCENE_12_DURATION,
  Scene12_ScoresAndScale,
} from "./attention/Scene12_ScoresAndScale";
import {
  SCENE_13_DURATION as AP_SCENE_13_DURATION,
  Scene13_CausalMask,
} from "./attention/Scene13_CausalMask";
import {
  SCENE_14_DURATION as AP_SCENE_14_DURATION,
  Scene14_SoftmaxAggregate,
} from "./attention/Scene14_SoftmaxAggregate";
import {
  SCENE_15_DURATION as AP_SCENE_15_DURATION,
  Scene15_FullFormula,
} from "./attention/Scene15_FullFormula";
import {
  SCENE_16_DURATION as AP_SCENE_16_DURATION,
  Scene16_MultiHead,
} from "./attention/Scene16_MultiHead";
import {
  SCENE_17_DURATION as AP_SCENE_17_DURATION,
  Scene17_FullPipelineRecap,
} from "./attention/Scene17_FullPipelineRecap";
import {
  SCENE_18_DURATION as AP_SCENE_18_DURATION,
  Scene18_ConcreteWalkthrough,
} from "./attention/Scene18_ConcreteWalkthrough";
import {
  SCENE_EXAMPLE_IT_DURATION,
  SceneExampleIt,
} from "./attention/SceneExampleIt";
import {
  SCENE_RIVER_ATTENDS_BANK_DURATION,
  SceneRiverAttendsBank,
} from "./attention/SceneRiverAttendsBank";
import { KVCACHE_DURATION, KVCache } from "../episodes/KVCache";
import { KV_INTRO_DURATION, KVIntroCard } from "./kv/KVIntroCard";
import { KV_AUTOREG_DURATION, KVAutoregressive } from "./kv/KVAutoregressive";
import { KV_ATTN_RECAP_DURATION, KVAttentionRecap } from "./kv/KVAttentionRecap";
import { KV_NAIVE_DURATION, KVNaiveRecompute } from "./kv/KVNaiveRecompute";
import { KV_DEFINITION_DURATION, KVDefinition } from "./kv/KVDefinition";
import { KV_WORKED_DURATION, KVWorkedExample } from "./kv/KVWorkedExample";
import { KV_AS_MEMORY_DURATION, KVCacheAsMemory } from "./kv/KVCacheAsMemory";
import { KV_WHY_NOT_Q_DURATION, KVWhyNotQ } from "./kv/KVWhyNotQ";
import { KV_PREFILL_DURATION, KVPrefill } from "./kv/KVPrefill";
import { KV_DECODE_DURATION, KVDecode } from "./kv/KVDecode";
import { KV_PER_LAYER_DURATION, KVPerLayer } from "./kv/KVPerLayer";
import { KV_SIZE_DURATION, KVCacheSize } from "./kv/KVCacheSize";
import { KV_MULTI_USER_DURATION, KVMultiUser } from "./kv/KVMultiUser";
import { KV_PRACTICAL_DURATION, KVPracticalExample } from "./kv/KVPracticalExample";
import { KV_TRADEOFF_DURATION, KVTradeoff } from "./kv/KVTradeoff";
import { KV_NOT_CONSTANT_DURATION, KVNotConstantTime } from "./kv/KVNotConstantTime";
import { KV_MHA_GQA_MQA_DURATION, KVMhaGqaMqa } from "./kv/KVMhaGqaMqa";
import { KV_FULL_RECAP_DURATION, KVFullRecap } from "./kv/KVFullRecap";
import { KV_REAL_MODEL_DURATION, KVRealModelFlow } from "./kv/KVRealModelFlow";
import { KV_CLOSING_DURATION, KVClosing } from "./kv/KVClosing";

export type SceneDef = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps: Record<string, unknown>;
};

// HOW TO ADD A SCENE:
// 1. Create src/scenes/<video>/MyScene.tsx exporting MyScene + MY_SCENE_DURATION.
// 2. Append one entry below. It appears in Remotion Studio instantly
//    and renders with: npm run render -- MyScene out/my-scene.mp4

export const scenes: SceneDef[] = [
  {
    id: "AttentionPrimer",
    component: AttentionPrimer,
    durationInFrames: ATTENTION_PRIMER_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APIntroCard",
    component: Scene01_IntroCard,
    durationInFrames: AP_SCENE_01_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APAmbiguityHook",
    component: Scene02_AmbiguityHook,
    durationInFrames: AP_SCENE_02_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APBankAmbiguity",
    component: Scene03_BankAmbiguity,
    durationInFrames: AP_SCENE_03_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APContextIntuition",
    component: Scene04_ContextIntuition,
    durationInFrames: AP_SCENE_04_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APAnimalInference",
    component: SceneAnimalInference,
    durationInFrames: AP_SCENE_ANIMAL_INFERENCE_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APAttentionDefinition",
    component: Scene05_AttentionDefinition,
    durationInFrames: AP_SCENE_05_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APBankAttentionWeights",
    component: Scene06_BankAttentionWeights,
    durationInFrames: AP_SCENE_06_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APThreeIdeas",
    component: Scene07_ThreeIdeas,
    durationInFrames: AP_SCENE_07_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APWorkedQKVExample",
    component: SceneWorkedQKVExample,
    durationInFrames: AP_SCENE_WORKED_QKV_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APRolesBridge",
    component: SceneRolesBridge,
    durationInFrames: AP_SCENE_ROLES_BRIDGE_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APQKVNames",
    component: Scene08_QKVNames,
    durationInFrames: AP_SCENE_08_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APDefinitionRecap",
    component: Scene09_DefinitionRecap,
    durationInFrames: AP_SCENE_09_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APTokensToIDs",
    component: SceneTokensToIDs,
    durationInFrames: AP_SCENE_TOKENS_TO_IDS_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APTokensToVectors",
    component: Scene10_TokensToVectors,
    durationInFrames: AP_SCENE_10_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APQKVProjection",
    component: Scene11_QKVProjection,
    durationInFrames: AP_SCENE_11_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APScoresAndScale",
    component: Scene12_ScoresAndScale,
    durationInFrames: AP_SCENE_12_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APCausalMask",
    component: Scene13_CausalMask,
    durationInFrames: AP_SCENE_13_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APSoftmaxAggregate",
    component: Scene14_SoftmaxAggregate,
    durationInFrames: AP_SCENE_14_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APFullFormula",
    component: Scene15_FullFormula,
    durationInFrames: AP_SCENE_15_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APMultiHead",
    component: Scene16_MultiHead,
    durationInFrames: AP_SCENE_16_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APFullPipelineRecap",
    component: Scene17_FullPipelineRecap,
    durationInFrames: AP_SCENE_17_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APConcreteWalkthrough",
    component: Scene18_ConcreteWalkthrough,
    durationInFrames: AP_SCENE_18_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APExampleIt",
    component: SceneExampleIt,
    durationInFrames: SCENE_EXAMPLE_IT_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "APRiverAttendsBank",
    component: SceneRiverAttendsBank,
    durationInFrames: SCENE_RIVER_ATTENDS_BANK_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVCache",
    component: KVCache,
    durationInFrames: KVCACHE_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVIntroCard",
    component: KVIntroCard,
    durationInFrames: KV_INTRO_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVAutoregressive",
    component: KVAutoregressive,
    durationInFrames: KV_AUTOREG_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVAttentionRecap",
    component: KVAttentionRecap,
    durationInFrames: KV_ATTN_RECAP_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVNaiveRecompute",
    component: KVNaiveRecompute,
    durationInFrames: KV_NAIVE_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVDefinition",
    component: KVDefinition,
    durationInFrames: KV_DEFINITION_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVWorkedExample",
    component: KVWorkedExample,
    durationInFrames: KV_WORKED_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVCacheAsMemory",
    component: KVCacheAsMemory,
    durationInFrames: KV_AS_MEMORY_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVWhyNotQ",
    component: KVWhyNotQ,
    durationInFrames: KV_WHY_NOT_Q_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVPrefill",
    component: KVPrefill,
    durationInFrames: KV_PREFILL_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVDecode",
    component: KVDecode,
    durationInFrames: KV_DECODE_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVPerLayer",
    component: KVPerLayer,
    durationInFrames: KV_PER_LAYER_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVCacheSize",
    component: KVCacheSize,
    durationInFrames: KV_SIZE_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVMultiUser",
    component: KVMultiUser,
    durationInFrames: KV_MULTI_USER_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVPracticalExample",
    component: KVPracticalExample,
    durationInFrames: KV_PRACTICAL_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVTradeoff",
    component: KVTradeoff,
    durationInFrames: KV_TRADEOFF_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVNotConstantTime",
    component: KVNotConstantTime,
    durationInFrames: KV_NOT_CONSTANT_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVMhaGqaMqa",
    component: KVMhaGqaMqa,
    durationInFrames: KV_MHA_GQA_MQA_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVFullRecap",
    component: KVFullRecap,
    durationInFrames: KV_FULL_RECAP_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVRealModelFlow",
    component: KVRealModelFlow,
    durationInFrames: KV_REAL_MODEL_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
  {
    id: "KVClosing",
    component: KVClosing,
    durationInFrames: KV_CLOSING_DURATION,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: {},
  },
];
