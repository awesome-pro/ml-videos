// The maths/motion toolkit.
//
// Use this instead of the old monospace `MathText` helpers for anything that is
// genuinely maths. Everything here is a pure function of the frame.

export { Equation, Tex, hl } from "./Equation";
export type { EquationHighlight, EquationProps } from "./Equation";

export { EquationSteps } from "./EquationSteps";
export type { EquationStep, EquationStepsProps } from "./EquationSteps";

export { Diagram, Curve, VectorArrow, PointMark, makeScale, axisX, axisY } from "./Axes";
export type {
  Scale,
  ScaleConfig,
  DiagramProps,
  CurveProps,
  VectorArrowProps,
  PointMarkProps,
} from "./Axes";

export { WarpedGrid, matrixMap, sineWarpMap } from "./WarpedGrid";
export type { PlaneMap, PlanePoint, GridRegion, WarpedGridProps } from "./WarpedGrid";

export {
  EASE,
  TIMING,
  SPRING_PRESET,
  clamp01,
  ramp,
  useRamp,
  useSpringIn,
  enterStyle,
  stagger,
  pulse,
  usePulse,
} from "./motion";
export type { SpringPreset } from "./motion";

export { mixHex, withAlpha } from "./color";
