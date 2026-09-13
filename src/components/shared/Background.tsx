import React from "react";
import { AP_COLORS } from "./theme";

export const Background: React.FC<{ dim?: boolean; texture?: boolean }> = ({
  dim = false,
  texture = false,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: dim ? "#000000" : AP_COLORS.bg,
      }}
    >
      {texture ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            backgroundImage:
              "radial-gradient(circle 1.5px at 1px 1px, rgba(255,255,255,0.035) 0%, transparent 100%)",
            backgroundSize: "48px 48px",
          }}
        />
      ) : null}
    </div>
  );
};
