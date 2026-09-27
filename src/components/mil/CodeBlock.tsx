import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../shared/theme";
import { crossFade, enterStyle, mixHex, ramp, TIMING } from "../math";
import { MONO_EM } from "./theme";

/**
 * The Python block from the sampler, with the line currently executing lit up.
 *
 * The whole block is on screen from the start rather than being revealed line by
 * line: this is reference material the viewer will keep coming back to, and the
 * frame has to work as a still. Attention moves instead — the unread lines sit
 * dim, the read ones are legible, and the live one carries a band and an accent
 * rule.
 *
 * Widths come from `codeWidth`, which is exact because the face is monospace.
 * Nothing is measured.
 */

export type CodeHighlight = {
  text: string;
  /** Defaults to the accent. */
  color?: string;
};

export type CodeLine = {
  /** The exact source line, indentation included. */
  text: string;
  /** Frame this line becomes the live one. */
  at: number;
  /** Substrings to pick out — one operation per line, not decoration. */
  hl?: CodeHighlight[];
};

export type CodeBlockProps = {
  lines: CodeLine[];
  /** Left edge of the code, and of the band behind the live line. */
  x: number;
  /** Top of the first line. */
  y: number;
  size?: number;
  /** Frame the block arrives. */
  start?: number;
  /** Baseline-to-baseline distance. */
  pitch?: number;
};

/**
 * Frames between a beat starting and its line being written. The explanation is
 * the headline, so it lands first and the code follows it in — the line reads as
 * the consequence of the sentence above rather than as a thing that was already
 * sitting there.
 */
export const CODE_REVEAL_LAG = 8;

/** Exact width of a source line in px, for lining the block up with anything else. */
export function codeWidth(text: string, size: number): number {
  return text.length * size * MONO_EM;
}

/** The widest line in a block. */
export function codeBlockWidth(lines: CodeLine[], size: number): number {
  return Math.max(...lines.map((l) => codeWidth(l.text, size)));
}

/** Wrap every listed substring in its own colour, leaving the rest alone. */
function paint(text: string, hl: CodeHighlight[]): React.ReactNode {
  if (hl.length === 0) return text;
  const out: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    let best: { at: number; h: CodeHighlight } | null = null;
    for (const h of hl) {
      const at = rest.indexOf(h.text);
      if (at >= 0 && (best === null || at < best.at)) best = { at, h };
    }
    if (best === null) {
      out.push(rest);
      break;
    }
    if (best.at > 0) out.push(rest.slice(0, best.at));
    out.push(
      <span key={key++} style={{ color: best.h.color ?? AP_COLORS.accent, fontWeight: AP_WEIGHT.heading }}>
        {best.h.text}
      </span>
    );
    rest = rest.slice(best.at + best.h.text.length);
  }
  return out;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  lines,
  x,
  y,
  size = 30,
  start = 0,
  pitch,
}) => {
  const frame = useCurrentFrame();
  const gap = pitch ?? size * 1.4;
  const width = codeBlockWidth(lines, size);
  const appear = ramp(frame, start, start + TIMING.base);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        ...enterStyle(appear, { rise: 14 }),
      }}
    >
      {lines.map((line, i) => {
        const nextAt = i + 1 < lines.length ? lines[i + 1].at : null;
        const live = ramp(frame, line.at, line.at + TIMING.fast) * (nextAt === null ? 1 : 1 - ramp(frame, nextAt, nextAt + TIMING.fast));
        const reached = ramp(frame, line.at, line.at + TIMING.fast);
        const read = mixHex(AP_COLORS.textMuted, AP_COLORS.textSecondary, reached);
        // The block starts empty and is written as the scene runs. The row keeps
        // its height while it waits, so the live line never shifts the ones below.
        const written = ramp(frame, line.at + CODE_REVEAL_LAG, line.at + CODE_REVEAL_LAG + TIMING.fast);
        return (
          <div key={i} style={{ position: "relative", height: gap, opacity: written }}>
            {/* The band behind the live line. */}
            <div
              style={{
                position: "absolute",
                left: -18,
                top: 1,
                width: width + 36,
                height: gap - 6,
                borderRadius: 8,
                background: AP_COLORS.accent,
                opacity: 0.09 * live,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -18,
                top: 1,
                width: 4,
                height: gap - 6,
                borderRadius: 2,
                background: AP_COLORS.accent,
                opacity: live,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translateY(${(1 - written) * 7}px)`,
                fontFamily: AP_FONTS.mono,
                fontSize: size,
                lineHeight: `${gap}px`,
                fontWeight: AP_WEIGHT.label,
                color: mixHex(read, AP_COLORS.textPrimary, live),
                whiteSpace: "pre",
              }}
            >
              {paint(line.text, line.hl ?? [])}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * The single line of prose under the widget that says what the live code line
 * actually means. One at a time, handing over with `crossFade` so two notes
 * sharing the slot never overprint.
 */
export const CodeNote: React.FC<{
  at: number;
  until: number | null;
  y: number;
  color?: string;
  /** This is the scene's headline, so it defaults larger than body copy. */
  size?: number;
  children: React.ReactNode;
}> = ({ at, until, y, color = AP_COLORS.textPrimary, size = 38, children }) => {
  const frame = useCurrentFrame();
  const f = crossFade(frame, at, until);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1920,
        textAlign: "center",
        transform: `translateY(${f.dy}px)`,
        opacity: f.opacity,
        fontFamily: AP_FONTS.sans,
        fontSize: size,
        fontWeight: AP_WEIGHT.heading,
        color,
        whiteSpace: "nowrap",
        textShadow: AP_COLORS.textShadow,
      }}
    >
      {children}
    </div>
  );
};
