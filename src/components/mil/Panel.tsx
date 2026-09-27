import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_TRACK, AP_FONTS } from "../shared/theme";
import { enterStyle, ramp, TIMING } from "../math";

/**
 * A raised card used for side explanations. Children flow normally inside it,
 * so panels never suffer the nested-absolute-positioning offset trap.
 */

export const Panel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  titleColor?: string;
  start?: number;
  /** Vertical alignment of the content block. */
  justify?: "flex-start" | "center";
  /** Centre the content horizontally (badge-style panels). */
  center?: boolean;
  padding?: string;
  children?: React.ReactNode;
}> = ({
  x,
  y,
  width,
  height,
  title,
  titleColor = AP_COLORS.textPrimary,
  start = 0,
  justify = "flex-start",
  center = false,
  padding = "30px 34px",
  children,
}) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, start, start + TIMING.base);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        boxSizing: "border-box",
        padding,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        alignItems: center ? "center" : "stretch",
        textAlign: center ? "center" : "left",
        gap: 18,
        borderRadius: 20,
        background: AP_COLORS.surface,
        border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
        boxShadow: AP_COLORS.cardShadowSoft,
        ...enterStyle(appear, { rise: 16 }),
      }}
    >
      {title ? (
        <div
          style={{
            fontFamily: AP_FONTS.sans,
            fontSize: 40,
            fontWeight: AP_WEIGHT.heading,
            letterSpacing: AP_TRACK.heading,
            color: titleColor,
            textShadow: AP_COLORS.textShadow,
          }}
        >
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
};

/** Body copy inside a `Panel`. */
export const PanelText: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  /** Defaults from `size`: prose weight at 28px+, label weight below it. */
  weight?: number;
  mono?: boolean;
}> = ({
  children,
  size = AP_TYPE.body,
  color = AP_COLORS.textSecondary,
  weight = size < 28 ? AP_WEIGHT.label : AP_WEIGHT.body,
  mono = false,
}) => (
  <div
    style={{
      fontFamily: mono ? AP_FONTS.mono : AP_FONTS.sans,
      fontSize: size,
      fontWeight: weight,
      lineHeight: 1.42,
      color,
      textShadow: AP_COLORS.textShadow,
    }}
  >
    {children}
  </div>
);
