import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AP_COLORS, AP_FONTS, AP_TYPE } from "./theme";

export type TokenVariant =
  | "neutral"
  | "query"
  | "key"
  | "value"
  | "accent"
  | "mask"
  | "positive";

const VARIANT_STYLE: Record<
  TokenVariant,
  { color: string; bg: string; border: string; shadow: string }
> = {
  neutral: {
    color: AP_COLORS.textPrimary,
    bg: AP_COLORS.surfaceRaised,
    border: AP_COLORS.surfaceBorder,
    shadow: AP_COLORS.cardShadowSoft,
  },
  query: {
    color: AP_COLORS.query,
    bg: AP_COLORS.queryBg,
    border: AP_COLORS.queryBorder,
    shadow: AP_COLORS.cardShadow,
  },
  key: {
    color: AP_COLORS.key,
    bg: AP_COLORS.keyBg,
    border: AP_COLORS.keyBorder,
    shadow: AP_COLORS.cardShadow,
  },
  value: {
    color: AP_COLORS.value,
    bg: AP_COLORS.valueBg,
    border: AP_COLORS.valueBorder,
    shadow: AP_COLORS.cardShadow,
  },
  accent: {
    color: AP_COLORS.accent,
    bg: AP_COLORS.accentBg,
    border: AP_COLORS.accentBorder,
    shadow: AP_COLORS.cardShadow,
  },
  mask: {
    color: AP_COLORS.negative,
    bg: "rgba(255, 124, 136, 0.15)",
    border: "rgba(255, 124, 136, 0.65)",
    shadow: AP_COLORS.cardShadowSoft,
  },
  positive: {
    color: AP_COLORS.positive,
    bg: AP_COLORS.keyBg,
    border: AP_COLORS.keyBorder,
    shadow: AP_COLORS.cardShadowSoft,
  },
};

export type TokenCardProps = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  variant?: TokenVariant;
  /** Frame at which this card should start its entrance (stagger). */
  appearDelay?: number;
  fontSize?: number;
  /** Optional caption rendered just below the card. */
  caption?: string;
  /** Radius in px (rounded rectangles). Default 14. */
  radius?: number;
  /** Optional frame-start for a soft highlight pulse when this is "active". */
  activeStart?: number | null;
};

export const TokenCard: React.FC<TokenCardProps> = ({
  label,
  x,
  y,
  width,
  height,
  variant = "neutral",
  appearDelay = 0,
  fontSize = 36,
  caption,
  radius = 14,
  activeStart = null,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = VARIANT_STYLE[variant];

  const entrance = spring({
    frame: frame - appearDelay,
    fps,
    config: { mass: 0.7, damping: 16, stiffness: 110 },
  });
  const scale = interpolate(entrance, [0, 1], [0.86, 1]);
  const opacity = interpolate(frame - appearDelay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(entrance, [0, 1], [18, 0]);

  let glow = "0 0 0 rgba(0,0,0,0)";
  if (activeStart !== null) {
    const activePhase = frame - activeStart;
    if (activePhase >= 0) {
      const pulse = 0.5 + 0.5 * Math.sin((activePhase / 22) * Math.PI * 2);
      const fadeOut = interpolate(activePhase, [0, 26], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      glow = `0 0 ${Math.round(18 + pulse * 22)}px rgba(255,255,255,${0.08 * fadeOut})`;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${lift}px) scale(${scale})`,
        opacity,
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        borderRadius: radius,
        boxShadow: `${s.shadow}, ${glow}`,
        color: s.color,
        fontFamily: AP_FONTS.sans,
        fontWeight: 700,
        fontSize,
        letterSpacing: "-0.01em",
        textShadow: AP_COLORS.textShadow,
        padding: "0 18px",
        whiteSpace: "nowrap",
        zIndex: 5,
        userSelect: "none",
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {caption ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: height + 10,
            textAlign: "center",
            color: AP_COLORS.textSecondary,
            fontSize: Math.max(AP_TYPE.captionMin, fontSize - 10),
            fontWeight: 600,
            textShadow: AP_COLORS.textShadow,
            opacity: interpolate(frame - appearDelay - 8, [0, 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};
