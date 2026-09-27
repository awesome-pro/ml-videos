// The "Mini Inference Loop" widget kit.
//
// These are the pieces that recur across the loop scenes: a tensor shape, a row
// of token ids, a labelled grid, a next-token distribution, and the shared panel
// and caption furniture. Scene-specific motion lives in the scenes themselves.

export { MIL_AXIS, MIL_PAD, MONO_EM, SANS_EM } from "./theme";
export type { AxisName } from "./theme";

export { TensorShape } from "./TensorShape";
export type { ShapeDim, ShapePop, TensorShapeProps } from "./TensorShape";

export { MorphShape, shapeLayout } from "./MorphShape";
export type { ShapeLayout, ShapeStage as MorphShapeStage, MorphShapeProps } from "./MorphShape";

export { TokenRow, tokenRowWidth } from "./TokenRow";
export type { RowToken, TokenTone, TokenRowProps } from "./TokenRow";

export { MiniGrid, gridWidth, gridHeight } from "./MiniGrid";
export type { GridCell, GridTone, MiniGridProps } from "./MiniGrid";

export {
  ProbRuler,
  rulerLayout,
  rulerLabelRows,
  pickIndex,
  labelWidth,
  monoWidth,
} from "./ProbRuler";
export type { RulerSeg, RulerDraw, RulerLayout, ProbRulerProps } from "./ProbRuler";

export { Panel, PanelText } from "./Panel";

export { CodeBlock, CodeNote, codeWidth, codeBlockWidth, CODE_REVEAL_LAG } from "./CodeBlock";
export type { CodeLine, CodeHighlight, CodeBlockProps } from "./CodeBlock";

export { TokenVector, tokenVectorWidth } from "./TokenVector";
export type { VectorCell, VectorValue, VectorTone, TokenVectorProps } from "./TokenVector";

export { StepBars, STEP_BAR, stepBarsWidth } from "./StepBars";
export type { BarTone, StepBarCell, StepBarRow, StepBarsProps } from "./StepBars";
