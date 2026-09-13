import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS } from "../../components/shared/theme";
import { Equation, Tex } from "../../components/math/Equation";
import { WarpedGrid, matrixMap, sineWarpMap } from "../../components/math/WarpedGrid";
import type { PlaneMap, PlanePoint } from "../../components/math/WarpedGrid";
import { VectorArrow, makeScale } from "../../components/math/Axes";
import { EASE, enterStyle, ramp, TIMING } from "../../components/math/motion";

/**
 * "What a matrix does to the plane" — the 3Blue1Brown grid transformation.
 *
 * Two acts, because the distinction is the whole point:
 *
 *   1. A MATRIX is a linear map. Both basis vectors move, every grid line
 *      moves with them — and every line stays straight. The unit square
 *      becomes a parallelogram of the same area (det = 1 for a shear).
 *   2. A NON-LINEAR map displaces each point by a function of the others, so
 *      the same straight lines bend into curves.
 *
 * Everything is sampled geometry driven by the frame — no randomness, no
 * measurement.
 */

export const SCENE_GRID_TRANSFORM_DURATION = 470;

const CENTER_X = 830;
const CENTER_Y = 578;
const UNIT = 62;
const EXTENT = 5.6;

const BOX_LEFT = CENTER_X - EXTENT * UNIT;
const BOX_TOP = CENTER_Y - EXTENT * UNIT;
const BOX_SIZE = 2 * EXTENT * UNIT;

/** Classic shear: (x, y) -> (x + y, y). */
const SHEAR: readonly [number, number, number, number] = [1, 1, 0, 1];
const shearMap = matrixMap(SHEAR);
const warpMap = sineWarpMap(1.1, 0.8);

const scale = makeScale({
  left: BOX_LEFT,
  top: BOX_TOP,
  width: BOX_SIZE,
  height: BOX_SIZE,
  xDomain: [-EXTENT, EXTENT],
  yDomain: [-EXTENT, EXTENT],
});

const Caption: React.FC<{ text: string; start: number; end: number }> = ({
  text,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, start, start + TIMING.base, EASE.out);
  const outP = ramp(frame, end, end + TIMING.fast, EASE.out);
  const opacity = inP * (1 - outP);
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 956,
        width: 1920,
        textAlign: "center",
        color: AP_COLORS.textPrimary,
        fontSize: 30,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1.4,
        padding: "0 200px",
        opacity,
        transform: `translateY(${(1 - inP) * 12}px)`,
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {text}
    </div>
  );
};

const ActRow: React.FC<{ text: string; active: boolean; start: number }> = ({
  text,
  active,
  start,
}) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, start, start + TIMING.base, EASE.out);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 14,
        ...enterStyle(appear, { rise: 10 }),
      }}
    >
      <span
        style={{
          width: active ? 30 : 18,
          height: 5,
          borderRadius: 999,
          background: active ? AP_COLORS.accent : "rgba(255,255,255,0.22)",
        }}
      />
      <span
        style={{
          color: active ? AP_COLORS.textPrimary : AP_COLORS.textMuted,
          fontSize: 24,
          fontWeight: active ? 700 : 600,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const SceneGridTransform: React.FC = () => {
  const frame = useCurrentFrame();

  const rawId = React.useId();
  const clipId = "gridclip" + rawId.split("").filter((c) => /[a-zA-Z0-9]/.test(c)).join("");

  // --- Timeline -----------------------------------------------------------
  const gridAppear = ramp(frame, 0, 26, EASE.out);
  const arrowAppear = ramp(frame, 14, 44, EASE.out);

  // Act 1: shear in, hold, then return to square before act 2.
  const shearIn = ramp(frame, 60, 205, EASE.inOut);
  const shearOut = ramp(frame, 252, 298, EASE.inOut);
  const shear = shearIn * (1 - shearOut);

  // Act 2: the non-linear warp.
  const warp = ramp(frame, 306, 436, EASE.inOut);

  const isNonLinear = frame >= 300;

  const regionAppear = ramp(frame, 150, 176, EASE.out);
  const panelAppear = ramp(frame, 24, 24 + TIMING.base, EASE.out);

  // Compose both acts into one map. It is already animated via the closure,
  // so the grid is asked for "fully applied" (t = 1).
  const composed = (x: number, y: number): PlanePoint => {
    const p = shearMap(x, y, shear);
    return warpMap(p.x, p.y, warp);
  };
  const map: PlaneMap = composed;

  const iTip = composed(1, 0);
  const jTip = composed(0, 1);

  const matrixTex =
    "\\begin{bmatrix} 1 & " + shear.toFixed(1) + " \\\\ 0 & 1 \\end{bmatrix}";
  const mapTex =
    "\\begin{bmatrix} x' \\\\ y' \\end{bmatrix} = \\begin{bmatrix} x + A\\sin(ky) \\\\ y + A\\sin(kx) \\end{bmatrix}";

  return (
    <SceneShell
      kicker="Linear algebra · the plane"
      title="What a transformation does to a grid"
      titleSize={58}
      duration={SCENE_GRID_TRANSFORM_DURATION}
      enterDelay={0}
    >
      <svg
        style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}
        width={1920}
        height={1080}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={BOX_LEFT} y={BOX_TOP} width={BOX_SIZE} height={BOX_SIZE} />
          </clipPath>
        </defs>

        {/* The warped plane, clipped to its window so it can't spill onto the
            side panels. */}
        <g clipPath={`url(#${clipId})`}>
          <WarpedGrid
            centerX={CENTER_X}
            centerY={CENTER_Y}
            unit={UNIT}
            extent={EXTENT}
            map={map}
            t={1}
            appear={gridAppear}
            baseColor="#2A3550"
            color="#7B8CC4"
            baseOpacity={0.8}
            opacity={0.95}
            region={{
              x0: 0,
              y0: 0,
              x1: 1,
              y1: 1,
              fill: AP_COLORS.accentBg,
              stroke: AP_COLORS.accent,
              opacity: regionAppear,
            }}
          />
        </g>

        {/* Basis vectors: the two columns of the matrix, drawn as vectors. */}
        <VectorArrow
          scale={scale}
          x={0}
          y={0}
          dx={iTip.x}
          dy={iTip.y}
          color={AP_COLORS.query}
          progress={arrowAppear}
          width={5}
          label="î"
          labelOffset={24}
        />
        <VectorArrow
          scale={scale}
          x={0}
          y={0}
          dx={jTip.x}
          dy={jTip.y}
          color={AP_COLORS.value}
          progress={arrowAppear}
          width={5}
          label="ĵ"
          labelOffset={24}
        />
      </svg>

      {/* Left: which act we're in. */}
      <div style={{ position: "absolute", left: 150, top: 300, width: 320 }}>
        <div
          style={{
            color: AP_COLORS.textMuted,
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 18,
            opacity: panelAppear,
          }}
        >
          Two kinds of map
        </div>
        <ActRow text="A matrix is linear" active={!isNonLinear} start={36} />
        <ActRow text="A non-linear map" active={isNonLinear} start={48} />
        <div
          style={{
            marginTop: 22,
            color: AP_COLORS.textSecondary,
            fontSize: 23,
            fontWeight: 600,
            lineHeight: 1.5,
            opacity: panelAppear,
            textShadow: AP_COLORS.textShadow,
          }}
        >
          {isNonLinear
            ? "Grid lines bend into curves."
            : "Grid lines move, but stay straight."}
        </div>
      </div>

      {/* Right: the object doing the transforming. Kept as siblings (not
          nested) because `Equation` positions itself absolutely in canvas
          coordinates. */}
      <div
        style={{
          position: "absolute",
          left: 1290,
          top: 296,
          width: 480,
          textAlign: "center",
          color: AP_COLORS.textMuted,
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          ...enterStyle(panelAppear, { rise: 12 }),
        }}
      >
        {isNonLinear ? "The map" : "The matrix"}
      </div>

      <Equation
        tex={isNonLinear ? mapTex : matrixTex}
        size={40}
        x={1290}
        width={480}
        y={348}
        displayMode
        animateIn={false}
      />

      <div
        style={{
          position: "absolute",
          left: 1290,
          top: 508,
          width: 480,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          opacity: panelAppear,
        }}
      >
        {isNonLinear ? (
          <span
            style={{
              color: AP_COLORS.textSecondary,
              fontSize: 24,
              fontWeight: 600,
              textShadow: AP_COLORS.textShadow,
            }}
          >
            No single matrix describes it
          </span>
        ) : (
          <>
            <Tex tex="\det = 1" size={27} color={AP_COLORS.textPrimary} />
            <span
              style={{
                color: AP_COLORS.textSecondary,
                fontSize: 23,
                fontWeight: 600,
                textShadow: AP_COLORS.textShadow,
              }}
            >
              area preserved
            </span>
          </>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 1290,
          top: 576,
          width: 480,
          color: AP_COLORS.textSecondary,
          fontSize: 22,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.5,
          opacity: panelAppear,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {isNonLinear ? null : "The unit square becomes a parallelogram."}
      </div>

      {/* Bottom narration, one line per act. */}
      <Caption
        text="A square grid, and the two basis vectors that generate it."
        start={18}
        end={64}
      />
      <Caption
        text="A matrix sends every point somewhere new — but straight lines stay straight."
        start={78}
        end={252}
      />
      <Caption
        text="A non-linear map bends those same lines into curves."
        start={312}
        end={SCENE_GRID_TRANSFORM_DURATION}
      />
    </SceneShell>
  );
};
