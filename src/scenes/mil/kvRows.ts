import type { BarTone, StepBarRow } from "../../components/mil";
import { SEQ_TOKENS, STEP_LENGTHS } from "./data";

/**
 * The rows the two KV scenes draw, derived once.
 *
 * `MILNaiveLoop` and `MILKVCache` render the identical grid and differ only in
 * how they colour the repeated region — so the derivation lives here rather
 * than in both scenes, and the audit can count the cells the picture actually
 * draws and check them against the numbers the copy states.
 *
 * The claim in one line: the bars draw `RECOMPUTED_POSITIONS` repeated cells,
 * and the readouts beside them add up to `CACHED_POSITIONS`.
 */

export type BarMode = "naive" | "cached";

/** Frames each step's bar enters on — the shared rhythm of both scenes. */
export const BAR_AT = [60, 116, 196, 276, 356];

export function stepBarRows(mode: BarMode): StepBarRow[] {
  return STEP_LENGTHS.map((len, k) => {
    const cells = SEQ_TOKENS.slice(0, len).map((token, j) => {
      // Step 1 computes the whole prompt; every later step computes only the
      // token it just appended. Everything else is either recomputed or read.
      const fresh = k === 0 || j === len - 1;
      const tone: BarTone = fresh ? "new" : mode === "naive" ? "again" : "kept";
      return { text: token.text, tone };
    });
    return {
      label: `step ${k + 1}`,
      // The naive loop counts every position it computes; the cached one counts
      // only the work that is genuinely new this step.
      note: mode === "naive" || k === 0 ? String(len) : "1",
      cells,
      at: BAR_AT[k],
      step: k === 0 ? 0 : 10,
    };
  });
}

/** How many cells of each tone the picture draws. */
export function barToneCounts(mode: BarMode): Record<BarTone, number> {
  const counts: Record<BarTone, number> = { new: 0, again: 0, kept: 0 };
  for (const row of stepBarRows(mode)) {
    for (const cell of row.cells) counts[cell.tone] += 1;
  }
  return counts;
}

/** What the right-hand readouts add up to — the scene's own headline number. */
export function barNoteTotal(mode: BarMode): number {
  return stepBarRows(mode).reduce((total, row) => total + Number(row.note), 0);
}
