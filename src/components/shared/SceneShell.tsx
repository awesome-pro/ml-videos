import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_TRACK, AP_FONTS, AP_MARGINS } from "./theme";
import { Background } from "./Background";

/** Frames of fade at the end of every scene. */
export const EXIT_FADE_FRAMES = 18;

export type SceneShellProps = {
  /** Small eyebrow label above the title. */
  kicker?: string;
  /** Optional big heading. */
  title?: string;
  titleSize?: number;
  /** Total scene duration in frames — used for the exit fade. */
  duration: number;
  /** Frames before content starts entering. */
  enterDelay?: number;
  children?: React.ReactNode;
};

// Shared scaffolding: animated background, an entrance-staggered header,
// a centered content area, and an automatic exit fade. Keeps every scene's
// typography and motion identical so the whole video feels like one piece.
export const SceneShell: React.FC<SceneShellProps> = ({
  kicker,
  title,
  titleSize = AP_TYPE.title,
  duration,
  enterDelay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - enterDelay,
    fps,
    config: { mass: 0.8, damping: 18, stiffness: 90 },
  });
  const kickerOpacity = interpolate(frame - enterDelay, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame - enterDelay, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(entrance, [0, 1], [26, 0]);

  const exitOpacity = interpolate(frame, [duration - EXIT_FADE_FRAMES, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1920,
        height: 1080,
        overflow: "hidden",
        background: AP_COLORS.bg,
        fontFamily: AP_FONTS.sans,
      }}
    >
      <Background />

      <div style={{ position: "absolute", inset: 0, opacity: exitOpacity }}>
        {kicker ? (
          <div
            style={{
              position: "absolute",
              top: AP_MARGINS.headerTop,
              width: 1920,
              textAlign: "center",
              color: AP_COLORS.accent,
              fontSize: AP_TYPE.kicker,
              fontWeight: AP_WEIGHT.heading,
              letterSpacing: AP_TRACK.kicker,
              textTransform: "uppercase",
              opacity: kickerOpacity,
              textShadow: AP_COLORS.textShadow,
              userSelect: "none",
            }}
          >
            {kicker}
          </div>
        ) : null}

        {title ? (
          <div
            style={{
              position: "absolute",
              // With no kicker the title moves up to use the freed band.
              top: kicker ? AP_MARGINS.titleWithKicker : AP_MARGINS.titleTop,
              width: 1920,
              textAlign: "center",
              color: AP_COLORS.textPrimary,
              fontSize: titleSize,
              fontWeight: AP_WEIGHT.title,
              letterSpacing: AP_TRACK.display,
              lineHeight: 1.08,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              textShadow: AP_COLORS.textShadowStrong,
              userSelect: "none",
              padding: `0 ${AP_MARGINS.titlePad}px`,
            }}
          >
            {title}
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1920,
            height: 1080,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
