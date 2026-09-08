import React from "react";
import { Series } from "remotion";
import { SCENE_01_DURATION, Scene01_IntroCard } from "../scenes/attention/Scene01_IntroCard";
import { SCENE_02_DURATION, Scene02_AmbiguityHook } from "../scenes/attention/Scene02_AmbiguityHook";
import { SCENE_03_DURATION, Scene03_BankAmbiguity } from "../scenes/attention/Scene03_BankAmbiguity";
import { SCENE_04_DURATION, Scene04_ContextIntuition } from "../scenes/attention/Scene04_ContextIntuition";
import { SCENE_05_DURATION, Scene05_AttentionDefinition } from "../scenes/attention/Scene05_AttentionDefinition";
import { SCENE_06_DURATION, Scene06_BankAttentionWeights } from "../scenes/attention/Scene06_BankAttentionWeights";
import { SCENE_07_DURATION, Scene07_ThreeIdeas } from "../scenes/attention/Scene07_ThreeIdeas";
import { SCENE_08_DURATION, Scene08_QKVNames } from "../scenes/attention/Scene08_QKVNames";
import { SCENE_09_DURATION, Scene09_DefinitionRecap } from "../scenes/attention/Scene09_DefinitionRecap";
import { SCENE_10_DURATION, Scene10_TokensToVectors } from "../scenes/attention/Scene10_TokensToVectors";
import { SCENE_11_DURATION, Scene11_QKVProjection } from "../scenes/attention/Scene11_QKVProjection";
import { SCENE_12_DURATION, Scene12_ScoresAndScale } from "../scenes/attention/Scene12_ScoresAndScale";
import { SCENE_13_DURATION, Scene13_CausalMask } from "../scenes/attention/Scene13_CausalMask";
import { SCENE_14_DURATION, Scene14_SoftmaxAggregate } from "../scenes/attention/Scene14_SoftmaxAggregate";
import { SCENE_15_DURATION, Scene15_FullFormula } from "../scenes/attention/Scene15_FullFormula";
import { SCENE_16_DURATION, Scene16_MultiHead } from "../scenes/attention/Scene16_MultiHead";
import { SCENE_17_DURATION, Scene17_FullPipelineRecap } from "../scenes/attention/Scene17_FullPipelineRecap";
import { SCENE_18_DURATION, Scene18_ConcreteWalkthrough } from "../scenes/attention/Scene18_ConcreteWalkthrough";

export const ATTENTION_PRIMER_DURATION =
  SCENE_01_DURATION +
  SCENE_02_DURATION +
  SCENE_03_DURATION +
  SCENE_04_DURATION +
  SCENE_05_DURATION +
  SCENE_06_DURATION +
  SCENE_07_DURATION +
  SCENE_08_DURATION +
  SCENE_09_DURATION +
  SCENE_10_DURATION +
  SCENE_11_DURATION +
  SCENE_12_DURATION +
  SCENE_13_DURATION +
  SCENE_14_DURATION +
  SCENE_15_DURATION +
  SCENE_16_DURATION +
  SCENE_17_DURATION +
  SCENE_18_DURATION;

// "Attention From First Principles" — a fresh, deterministic full video.
export const AttentionPrimer: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={SCENE_01_DURATION}>
        <Scene01_IntroCard />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_02_DURATION}>
        <Scene02_AmbiguityHook />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_03_DURATION}>
        <Scene03_BankAmbiguity />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_04_DURATION}>
        <Scene04_ContextIntuition />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_05_DURATION}>
        <Scene05_AttentionDefinition />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_06_DURATION}>
        <Scene06_BankAttentionWeights />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_07_DURATION}>
        <Scene07_ThreeIdeas />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_08_DURATION}>
        <Scene08_QKVNames />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_09_DURATION}>
        <Scene09_DefinitionRecap />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_10_DURATION}>
        <Scene10_TokensToVectors />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_11_DURATION}>
        <Scene11_QKVProjection />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_12_DURATION}>
        <Scene12_ScoresAndScale />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_13_DURATION}>
        <Scene13_CausalMask />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_14_DURATION}>
        <Scene14_SoftmaxAggregate />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_15_DURATION}>
        <Scene15_FullFormula />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_16_DURATION}>
        <Scene16_MultiHead />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_17_DURATION}>
        <Scene17_FullPipelineRecap />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_18_DURATION}>
        <Scene18_ConcreteWalkthrough />
      </Series.Sequence>
    </Series>
  );
};
