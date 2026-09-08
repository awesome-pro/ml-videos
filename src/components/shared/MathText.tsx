import React from "react";
import { AP_COLORS, AP_FONTS } from "./theme";

// Small helpers for building math formulas without a LaTeX dependency.
// Formulas are composed from colored variables + superscript/subscript spans,
// all in the mono face for a clean, readable, technical look.

export const MathText: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  lineHeight?: number;
  align?: "center" | "left";
}> = ({ children, size = 40, color = AP_COLORS.textPrimary, lineHeight = 1.25, align = "center" }) => {
  return (
    <div
      style={{
        fontFamily: AP_FONTS.mono,
        fontSize: size,
        color,
        lineHeight,
        textAlign: align,
        display: "flex",
        alignItems: "baseline",
        justifyContent: align === "center" ? "center" : "flex-start",
        fontWeight: 600,
        letterSpacing: "0.01em",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
};

export const MVar: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
}> = ({ children, color = AP_COLORS.textPrimary, size }) => (
  <span style={{ color, fontSize: size ?? undefined }}>{children}</span>
);

export const MSup: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = AP_COLORS.textSecondary,
}) => (
  <span style={{ color, fontSize: "0.62em", alignSelf: "flex-start", transform: "translateY(-0.32em)" }}>
    {children}
  </span>
);

export const MSub: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = AP_COLORS.textSecondary,
}) => (
  <span style={{ color, fontSize: "0.62em", alignSelf: "flex-start", transform: "translateY(0.26em)" }}>
    {children}
  </span>
);
