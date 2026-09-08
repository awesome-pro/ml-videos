import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_FONTS } from "./theme";

// Subtle, slow, deterministic background. A soft radial lift toward the
// center plus a faint drifting vignette. Never flashes: everything is a
// smooth sine-of-frame function so the same frame always renders the same.
export const Background: React.FC<{ dim?: boolean }> = ({ dim = false }) => {
  const frame = useCurrentFrame();

  // Slow drift of the highlight across the frame (period ~16s).
  const dx = Math.sin((frame / 480) * Math.PI * 2) * 60;
  const dy = Math.cos((frame / 620) * Math.PI * 2) * 40;
  const pulse = 0.5 + 0.5 * Math.sin((frame / 180) * Math.PI * 2);

  const base = dim ? "#070910" : AP_COLORS.bg;
  const lift = dim ? "#0C0F18" : AP_COLORS.bgLift;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        fontSize: 0,
        fontFamily: AP_FONTS.sans,
      }}
    >
      {/* Base fill */}
      <div style={{ position: "absolute", inset: 0, background: base }} />

      {/* Central radial lift, drifting slowly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(1100px circle at ${960 + dx}px ${520 + dy}px, ${lift} 0%, ${base} 72%)`,
        }}
      />

      {/* Soft cool glow that breathes very gently */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.14 + pulse * 0.05,
          background: `radial-gradient(900px circle at ${960 - dx}px ${560 - dy}px, rgba(154, 123, 255, 0.5) 0%, rgba(10, 12, 20, 0) 70%)`,
        }}
      />

      {/* Faint dot grid for depth (very low contrast, professional) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          backgroundImage: `radial-gradient(circle 1.5px at 1px 1px, rgba(255,255,255,0.05) 0%, transparent 100%)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
};
