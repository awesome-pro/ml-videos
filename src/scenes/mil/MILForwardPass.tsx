import React from "react";
import { useCurrentFrame } from "remotion";
import { SceneShell } from "../../components/shared/SceneShell";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../../components/shared/theme";
import { FlowArrow } from "../../components/shared/FlowArrow";
import { MIL_AXIS } from "../../components/mil";
import { enterStyle, ramp, TIMING } from "../../components/math";
import { MODEL, NEXT_TOKEN, PROMPT, VOCAB_LABEL } from "./data";

export const MIL_FORWARD_DURATION = 350; // 11.7s

// Three boxes across the top: what goes in, what the stack emits, and the one
// token we keep. Below, the last-position slice is opened up.
const BOX_Y = 350;
const BOX_H = 280;

const STRIP_N = 64;
const STRIP_X = 200;
const STRIP_PITCH = 13;
const STRIP_BASE = 800;
const ARGMAX_I = 22;

/** Deterministic per-index value in [0,1): Math.random is not allowed. */
function hash(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export const MILForwardPass: React.FC = () => {
  const frame = useCurrentFrame();

  const stripLabel = ramp(frame, 150, 150 + TIMING.fast);
  const argmaxIn = ramp(frame, 240, 240 + TIMING.fast);
  const tallH = 58 + 26 * argmaxIn;

  return (
    <SceneShell title="input_ids → logits → next token" duration={MIL_FORWARD_DURATION}>

      {/* Stage 1 — the ids going in. */}
      <StageBox x={150} width={380} label="input_ids" start={20}>
        <Mono>
          [<A color={MIL_AXIS.B}>1</A>, <A color={MIL_AXIS.T}>5</A>]
        </Mono>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {PROMPT.map((t) => (
            <div
              key={t.id}
              style={{
                width: 56,
                height: 44,
                borderRadius: 8,
                background: AP_COLORS.surfaceRaised,
                border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
              }}
            />
          ))}
        </div>
      </StageBox>

      <FlowArrow x1={544} y1={BOX_Y + BOX_H / 2} x2={688} y2={BOX_Y + BOX_H / 2} color={AP_COLORS.accent} appearDelay={40} thickness={4} />
      <ArrowLabel x={616} y={424} text="forward pass" start={52} />

      {/* Stage 2 — the (T, V) score plane. The last column is the one that counts. */}
      <StageBox x={700} width={520} label="logits" start={50}>
        <Mono>
          [<A color={MIL_AXIS.B}>1</A>, <A color={MIL_AXIS.T}>5</A>, <A color={MIL_AXIS.V}>{MODEL.vocab}</A>]
        </Mono>
        <div style={{ display: "flex", gap: 22, justifyContent: "center" }}>
          {PROMPT.map((t, col) => {
            const bright = col === PROMPT.length - 1;
            return (
              <div key={t.id} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {Array.from({ length: 6 }).map((_, row) => (
                  <div
                    key={row}
                    style={{
                      width: 40,
                      height: 12,
                      borderRadius: 2,
                      background: bright ? MIL_AXIS.V : AP_COLORS.surfaceRaised,
                      border: `1px solid ${bright ? MIL_AXIS.V : AP_COLORS.surfaceBorder}`,
                      opacity: bright ? 0.5 + 0.09 * row : 0.7,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </StageBox>

      <FlowArrow x1={1234} y1={BOX_Y + BOX_H / 2} x2={1368} y2={BOX_Y + BOX_H / 2} color={AP_COLORS.accent} appearDelay={70} thickness={4} />
      <ArrowLabel x={1301} y={424} text="argmax" start={82} />

      {/* Stage 3 — one token. */}
      <StageBox x={1380} width={390} label="next_token" start={92}>
        <TokenChip start={110} />
      </StageBox>

      {/* The last-position slice, opened up. */}
      <div
        style={{
          position: "absolute",
          left: STRIP_X,
          top: 664,
          fontFamily: AP_FONTS.sans,
          fontSize: 28,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.textSecondary,
          opacity: stripLabel,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        only the last position matters →{" "}
        <span style={{ fontFamily: AP_FONTS.mono, color: MIL_AXIS.V }}>{VOCAB_LABEL}</span> scores
      </div>

      {Array.from({ length: STRIP_N }).map((_, i) => {
        const appear = ramp(frame, 168 + i * 0.6, 168 + i * 0.6 + 10);
        const isMax = i === ARGMAX_I;
        const h = isMax ? tallH : 22 + 56 * hash(i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: STRIP_X + i * STRIP_PITCH,
              top: STRIP_BASE - h,
              width: 11,
              height: h * appear,
              borderRadius: 2,
              background: isMax ? MIL_AXIS.V : AP_COLORS.accent,
              opacity: isMax ? 1 : 0.34,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: STRIP_X + ARGMAX_I * STRIP_PITCH + 5,
          top: 816,
          transform: "translateX(-50%)",
          fontFamily: AP_FONTS.mono,
          fontSize: AP_TYPE.label,
          fontWeight: AP_WEIGHT.heading,
          color: MIL_AXIS.V,
          opacity: argmaxIn,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        biggest score
      </div>

      <FlowArrow x1={1056} y1={745} x2={1200} y2={745} color={MIL_AXIS.V} appearDelay={258} thickness={4} />

      <div style={{ position: "absolute", left: 1250, top: 745, transform: "translateY(-50%)" }}>
        <TokenChip start={278} />
      </div>

    </SceneShell>
  );
};

const StageBox: React.FC<{
  x: number;
  width: number;
  label: string;
  start: number;
  children?: React.ReactNode;
}> = ({ x, width, label, start, children }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, start, start + TIMING.base);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: BOX_Y,
        width,
        height: BOX_H,
        boxSizing: "border-box",
        padding: "26px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        borderRadius: 20,
        background: AP_COLORS.surface,
        border: `1.5px solid ${AP_COLORS.surfaceBorder}`,
        boxShadow: AP_COLORS.cardShadowSoft,
        ...enterStyle(appear, { rise: 18 }),
      }}
    >
      <div
        style={{
          fontFamily: AP_FONTS.mono,
          fontSize: 30,
          fontWeight: AP_WEIGHT.heading,
          color: AP_COLORS.textPrimary,
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
};

const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: AP_FONTS.mono,
      fontSize: 30,
      fontWeight: AP_WEIGHT.label,
      color: AP_COLORS.textSecondary,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const A: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ color, fontWeight: AP_WEIGHT.heading }}>{children}</span>
);

const TokenChip: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, start, start + TIMING.base);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        ...enterStyle(appear, { rise: 10 }),
      }}
    >
      <div
        style={{
          padding: "14px 30px",
          borderRadius: 14,
          background: AP_COLORS.keyBg,
          border: `1.5px solid ${AP_COLORS.keyBorder}`,
          color: AP_COLORS.key,
          fontFamily: AP_FONTS.sans,
          fontSize: 34,
          fontWeight: AP_WEIGHT.heading,
          textShadow: AP_COLORS.textShadow,
          whiteSpace: "nowrap",
        }}
      >
        {NEXT_TOKEN.text}
      </div>
      <div
        style={{
          fontFamily: AP_FONTS.mono,
          fontSize: AP_TYPE.label,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.textSecondary,
        }}
      >
        id {NEXT_TOKEN.id}
      </div>
    </div>
  );
};

const ArrowLabel: React.FC<{ x: number; y: number; text: string; start: number }> = ({ x, y, text, start }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translateX(-50%)",
        fontFamily: AP_FONTS.sans,
        fontSize: AP_TYPE.label,
        fontWeight: AP_WEIGHT.label,
        color: AP_COLORS.textSecondary,
        opacity: ramp(frame, start, start + TIMING.fast),
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {text}
    </div>
  );
};
