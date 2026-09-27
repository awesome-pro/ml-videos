// Grounded data for the "Mini Inference Loop" video.
//
// Every token id below is REAL. They were produced by the actual
// Qwen/Qwen2.5-0.5B-Instruct `tokenizer.json` (byte-level BPE, 151,387 merges,
// 151,643 base tokens + 21 added specials) and each string was round-trip
// decoded back to its source text to verify. The architecture numbers come
// straight from that repo's `config.json`.
//
// Do not hand-edit an id: if you change the copy, re-derive the ids.

/** Architecture, from Qwen/Qwen2.5-0.5B-Instruct config.json. */
export const MODEL = {
  name: "Qwen2.5-0.5B-Instruct",
  layers: 24,
  hidden: 896,
  qHeads: 14,
  kvHeads: 2,
  /** hidden / qHeads — 64. */
  headDim: 64,
  /** config.json `vocab_size`: the length of the logits axis. */
  vocab: 151936,
  context: 32768,
} as const;

/** `MODEL.vocab` with thousands separators, for prose copy. */
export const VOCAB_LABEL = MODEL.vocab.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Special token ids, from tokenizer_config.json. */
export const SPECIAL = {
  /** Also the default `pad_token` — what left-padding fills with. */
  endoftext: 151643,
  imStart: 151644,
  /** Also `eos_token`: the stop token that ends a turn. */
  imEnd: 151645,
} as const;

export const PAD_ID = SPECIAL.endoftext;

export type Token = {
  /** Display text. Byte-level BPE words carry a leading space, shown as `_`. */
  text: string;
  id: number;
  /** Special/control token rather than ground text. */
  special?: boolean;
};

/** The running example: T = 5 tokens. */
export const PROMPT_TEXT = "The capital of France is";
export const PROMPT: Token[] = [
  { text: "The", id: 785 },
  { text: "capital", id: 6722 },
  { text: "of", id: 315 },
  { text: "France", id: 9625 },
  { text: "is", id: 374 },
];

/** What the model predicts next. */
export const NEXT_TOKEN: Token = { text: "Paris", id: 12095 };
export const NEXT_TOKEN_2: Token = { text: ".", id: 13 };

/**
 * Three requests of different real lengths, for the batching/padding scenes.
 * `Explain` is two tokens — the tokenizer is not splitting on words.
 */
export type Request = { label: string; text: string; tokens: Token[] };

export const REQUESTS: Request[] = [
  { label: "req 1", text: "Hi", tokens: [{ text: "Hi", id: 13048 }] },
  {
    label: "req 2",
    text: "What is the capital of France?",
    tokens: [
      { text: "What", id: 3838 },
      { text: "is", id: 374 },
      { text: "the", id: 279 },
      { text: "capital", id: 6722 },
      { text: "of", id: 315 },
      { text: "France", id: 9625 },
      { text: "?", id: 30 },
    ],
  },
  {
    label: "req 3",
    text: "Explain gravity simply.",
    tokens: [
      { text: "Ex", id: 840 },
      { text: "plain", id: 20772 },
      { text: "gravity", id: 23249 },
      { text: "simply", id: 4936 },
      { text: ".", id: 13 },
    ],
  },
];

/** T after left-padding every request to the longest one (7). */
export const PAD_TO = 7;

/** One assistant turn of the chat template, as tokens instead of a string. */
export const CHAT_PREFIX: Token[] = [
  { text: "<|im_start|>", id: SPECIAL.imStart, special: true },
  { text: "assistant", id: 77091 },
  { text: "⏎", id: 198 },
];

export const CHAT_SUFFIX: Token[] = [
  { text: "<|im_end|>", id: SPECIAL.imEnd, special: true },
];

/** The full 9-token templated prompt for "Hi" (the real Qwen chat template). */
export const CHAT_PROMPT: Token[] = [
  { text: "<|im_start|>", id: SPECIAL.imStart, special: true },
  { text: "user", id: 872 },
  { text: "⏎", id: 198 },
  { text: "Hi", id: 13048 },
  { text: "<|im_end|>", id: SPECIAL.imEnd, special: true },
  { text: "⏎", id: 198 },
  { text: "<|im_start|>", id: SPECIAL.imStart, special: true },
  { text: "assistant", id: 77091 },
  { text: "⏎", id: 198 },
];

/** The generated answer, token by token, followed by the stop token. */
export const ANSWER_TEXT = "Hello! How can I help?";
export const ANSWER_TOKENS: Token[] = [
  { text: "Hello", id: 9707 },
  { text: "!", id: 0 },
  { text: "How", id: 2585 },
  { text: "can", id: 646 },
  { text: "I", id: 358 },
  { text: "help", id: 1492 },
  { text: "?", id: 30 },
];

/**
 * What the model actually returns for req 1: the chat control tokens are part
 * of the id stream. "⏎" is token 198 (a newline); "!" really is id 0.
 */
export const RAW_STREAM: Token[] = [
  { text: "⟨start⟩", id: SPECIAL.imStart, special: true },
  { text: "assistant", id: 77091 },
  { text: "⏎", id: 198, special: true },
  ...ANSWER_TOKENS,
  { text: "⟨end⟩", id: SPECIAL.imEnd, special: true },
];

/** Decode-step grid for the three batched requests. "⟨end⟩" stops a row. */
export const DECODE_ROWS: { label: string; cells: (string | null)[] }[] = [
  { label: "req 1", cells: ["Hello", "!", "⟨end⟩", "pad", "pad", "pad"] },
  { label: "req 2", cells: ["The", "capital", "of", "France", "is", "Paris"] },
  { label: "req 3", cells: ["Gravity", "pulls", "things", "down", "⟨end⟩", "pad"] },
];

/** Example next-token distribution after "The capital of France is". */
export const CANDIDATES: { text: string; id: number; prob: number }[] = [
  { text: "Paris", id: 12095, prob: 0.62 },
  { text: "the", id: 279, prob: 0.11 },
  { text: "located", id: 6794, prob: 0.08 },
  { text: "a", id: 264, prob: 0.06 },
  { text: "home", id: 2206, prob: 0.04 },
  { text: "…", id: -1, prob: 0.09 },
];

/**
 * The last position's score vector, as drawn in the two shape scenes.
 *
 * These are NOT invented: they are `ln p` of the five real preferences in
 * `CANDIDATES` — ln 0.62, 0.11, 0.08, 0.06, 0.04 — printed to one decimal the
 * way a logit readout would be. So the biggest of them authenticates as
 * `Paris`, and the shape scenes stay consistent with the sampling scene.
 *
 * Index 0 is the BOTTOM row of the drawn column, i.e. ascending score.
 */
export const LAST_POS_SCORES: string[] = ["-3.2", "-2.8", "-2.5", "-2.2", "-0.5"];

/** The last position of a 5-token prompt — the column both shape scenes keep. */
export const LAST_COL = 4;

/**
 * The same distribution as `CANDIDATES`, written the way the sampling ruler
 * needs it: descending probability, with the whole remaining vocabulary rolled
 * into one last bucket so the widths add to exactly 1.
 *
 * `others` is the other ~151,930 tokens holding 9% between them — the tail that
 * top-k and top-p exist to cut. Keeping it as a segment is what stops the ruler
 * from quietly implying that six tokens are the whole vocabulary.
 */
export const SAMPLING_SEGS = [
  { label: "Paris", prob: 0.62 },
  { label: "the", prob: 0.11 },
  { label: "located", prob: 0.08 },
  { label: "a", prob: 0.06 },
  { label: "home", prob: 0.04 },
  { label: "others", prob: 0.09 },
];

/**
 * `softmax(z / T)` written directly on probabilities: `p^(1/T)` renormalised.
 * T < 1 sharpens toward the leader, T > 1 flattens. Exact, not decorative.
 */
export function withTemperature(probs: number[], t: number): number[] {
  const raw = probs.map((p) => Math.pow(p, 1 / t));
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((x) => x / total);
}

/**
 * Six fixed draws, in [0, 1]. The sampling scenes reuse the SAME six at every
 * temperature, because that is the whole point: the dice never change, only the
 * odds they land on. Their outcomes are:
 *
 *   T = 1.0  → Paris ×4, located, others     (the model's own odds)
 *   T = 0.5  → Paris ×5, a                   (sharper, nearly greedy)
 *   T = 2.0  → Paris ×2, the, located, home, others   (flatter, more random)
 */
export const DRAWS = [0.1, 0.28, 0.44, 0.6, 0.8, 0.97];

/** Deterministic pseudo-random in [0,1). `Math.random` is not allowed. */
export function hash(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * The eight-token example the top-k / top-p code scenes walk through.
 *
 * Deliberately in VOCABULARY order, not sorted: the four winners sit at indices
 * 3, 0, 5 and 1. That is the whole reason `top_k_indices` exists and the reason
 * the `scatter_` on the next line is not a no-op — with a sorted example both
 * lines would look like pointless ceremony.
 *
 * The values are `ln p` of the same eight options the sampling scenes use, so
 * Paris still wins at -0.5 and every scene in the video agrees about the odds.
 */
export const FILTER_VECTOR: { token: string; logit: number }[] = [
  { token: "the", logit: -2.2 },
  { token: "a", logit: -2.8 },
  { token: "home", logit: -3.2 },
  { token: "Paris", logit: -0.5 },
  { token: "of", logit: -3.6 },
  { token: "located", logit: -2.5 },
  { token: "is", logit: -4.1 },
  { token: "capital", logit: -3.9 },
];

/** `top_k` used by the walkthrough. */
export const FILTER_K = 4;
/** `top_p` used by the walkthrough. */
export const FILTER_P = 0.9;

/** Plain softmax of `FILTER_VECTOR`. */
export const FILTER_PROBS: number[] = (() => {
  const exps = FILTER_VECTOR.map((v) => Math.exp(v.logit));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
})();

/**
 * The indices `torch.sort(descending=True)` returns: the order the tokens are
 * visited in, and the thing the `scatter_` at the end has to undo.
 */
export const FILTER_SORTED: number[] = FILTER_VECTOR.map((_, i) => i).sort(
  (a, b) => FILTER_VECTOR[b].logit - FILTER_VECTOR[a].logit
);

/** The `top_k` winners, best first. */
export const FILTER_TOP_K: number[] = FILTER_SORTED.slice(0, FILTER_K);

/**
 * The indices `(cum_probs - sorted_probs) <= top_p` keeps, in sorted order.
 *
 * `home` survives on a whisker: the mass *before* it is 0.8913, still under 0.9,
 * and its own share is what pushes the running total past the line. That
 * one-cell margin is the whole point of using the exclusive cumsum here, and
 * the reason this scene exists.
 */
export const FILTER_TOP_P: number[] = (() => {
  let exclusive = 0;
  const keep: number[] = [];
  for (const draw of FILTER_SORTED) {
    if (exclusive <= FILTER_P) keep.push(draw);
    exclusive += FILTER_PROBS[draw];
  }
  return keep;
})();

/** The mass each rule hands on to the softmax, for the "renormalised" readouts. */
export const FILTER_K_MASS = FILTER_TOP_K.reduce((a, i) => a + FILTER_PROBS[i], 0);
export const FILTER_P_MASS = FILTER_TOP_P.reduce((a, i) => a + FILTER_PROBS[i], 0);

/**
 * The mass strictly *before* each token in sorted order — which is exactly what
 * `cum_probs - sorted_probs` computes, and the number the top-p test compares
 * against `top_p`. Exported separately because the scene prints this, not the
 * inclusive total: the exclusive one is the thing that decides.
 */
export const FILTER_EXCL: number[] = (() => {
  const out: number[] = new Array(FILTER_VECTOR.length).fill(0);
  let running = 0;
  for (const i of FILTER_SORTED) {
    out[i] = running;
    running += FILTER_PROBS[i];
  }
  return out;
})();

/** The inclusive running total, `torch.cumsum(sorted_probs)`, per index. */
export const FILTER_CUM: number[] = FILTER_EXCL.map((e, i) => e + FILTER_PROBS[i]);

/**
 * What top-p is really about: the mass the kept set actually covers.
 *
 * The predicate works on the *exclusive* running total, but its whole purpose is
 * to make the kept set's *inclusive* total reach `top_p`. Here the deepest kept
 * token is `home`: the four tokens before it cover 89.13%, which is short, and
 * adding home takes the set to 93.35%. So top-p did not keep home because
 * something was under a threshold — it kept home because without it the set does
 * not reach 90%.
 */
export const FILTER_P_COVER = FILTER_CUM[FILTER_TOP_P[FILTER_TOP_P.length - 1]];
/** The coverage one token short of that — the total that fell under the line. */
export const FILTER_P_COVER_PREV = FILTER_EXCL[FILTER_TOP_P[FILTER_TOP_P.length - 1]];
/** The token that crosses the line. */
export const FILTER_P_CROSSING = FILTER_TOP_P[FILTER_TOP_P.length - 1];

/**
 * Round a set of shares to whole percentages that still add up to 100, by the
 * largest-remainder method. Rounding each one independently is what makes a row
 * of survivors print 71 + 13 + 10 + 7 = 101%, and someone in the audience will
 * add them up.
 */
export function toWholePercents(shares: number[]): number[] {
  const exact = shares.map((s) => s * 100);
  const out = exact.map((e) => Math.floor(e));
  let left = 100 - out.reduce((a, b) => a + b, 0);
  const byRemainder = exact
    .map((e, i) => ({ i, rem: e - Math.floor(e) }))
    .sort((a, b) => b.rem - a.rem);
  for (const { i } of byRemainder) {
    if (left <= 0) break;
    out[i] += 1;
    left -= 1;
  }
  return out;
}

const kPct = toWholePercents(FILTER_TOP_K.map((i) => FILTER_PROBS[i] / FILTER_K_MASS));
const pPct = toWholePercents(FILTER_TOP_P.map((i) => FILTER_PROBS[i] / FILTER_P_MASS));

/** Whole percents after top-k, indexed by vocabulary index; 0 where dropped. */
export const FILTER_K_PCT: number[] = FILTER_VECTOR.map((_, i) => {
  const at = FILTER_TOP_K.indexOf(i);
  return at < 0 ? 0 : kPct[at];
});

/** Whole percents after top-p, indexed by vocabulary index; 0 where dropped. */
export const FILTER_P_PCT: number[] = FILTER_VECTOR.map((_, i) => {
  const at = FILTER_TOP_P.indexOf(i);
  return at < 0 ? 0 : pPct[at];
});


/**
 * A plausible logit at `row` of the vocabulary for position `col`, one decimal.
 *
 * The last column is the position the model generates from, so its five drawn
 * rows are the real derived scores above — which is why the biggest of them
 * authenticates as `Paris` in the shape scenes and in the sampling scene. It is
 * also the *peaked* position: Paris holds 62%, so its leader sits at -0.5 while
 * the others trail off below -2.
 *
 * Every earlier position is flatter, so its scores sit lower — nothing outside
 * the last column ever approaches -0.5. That is the honest reason, and it has a
 * happy side effect: the score the scene picks as the winner is the biggest
 * number anywhere on screen, not merely the biggest in its own column.
 */
export function logitAt(col: number, row: number): string {
  if (col === LAST_COL && row < LAST_POS_SCORES.length) return LAST_POS_SCORES[row];
  const v = Math.round((-1.1 - hash(col * 53 + row * 11 + 7) * 3.3) * 10) / 10;
  return v.toFixed(1);
}

/** The six-step roadmap copy, used by both the roadmap and the closing card. */
export const STEPS: { title: string; sub: string }[] = [
  { title: "Greedy generation", sub: "always take the single highest score" },
  { title: "Sampling", sub: "temperature · top-k · top-p" },
  { title: "KV cache", sub: "stop recomputing the past" },
  { title: "Batching", sub: "many requests, one forward pass" },
  { title: "Attention mask", sub: "tell the model what is padding" },
  { title: "TTFT & ITL", sub: "the two numbers users actually feel" },
];

/* ------------------------------------------------------------------------- *
 * KV cache: the work the greedy loop does twice
 *
 * The whole argument of the prefill / decode scenes is an arithmetic one, so
 * these numbers are derived rather than typed into the scenes. With a 5-token
 * prompt and a 5-step answer:
 *
 *   naive    5 + 6 + 7 + 8 + 9 = 35 position-computations
 *   cached   5 (prefill) + 4 x 1 (decode) = 9
 *
 * and the 26 between them are the same positions, computed again. That is why
 * the cache exists, and it is the only reason the second half of the video
 * gets to talk about time at all.
 * ------------------------------------------------------------------------- */

/**
 * The prompt, then what the model actually answers. All four continuation ids
 * are real Qwen2.5 ids — "." is 13, the newline is 198, and 151645 is
 * `<|im_end|>` — so this is the literal token stream for
 * "The capital of France is Paris.⏎⟨end⟩".
 */
export const GEN_TOKENS: Token[] = [
  NEXT_TOKEN,
  { text: ".", id: 13 },
  { text: "⏎", id: 198 },
  { text: "⟨end⟩", id: SPECIAL.imEnd, special: true },
];

/** Positions 1..9: the five prompt tokens, then the four fed back in. */
export const SEQ_TOKENS: Token[] = [...PROMPT, ...GEN_TOKENS];

/** How many times the walkthrough runs the loop. */
export const GEN_STEPS = 5;

/**
 * The length of the sequence the naive loop feeds the model at each step. It
 * appends one token and then re-runs everything: 5, 6, 7, 8, 9.
 */
export const STEP_LENGTHS: number[] = Array.from(
  { length: GEN_STEPS },
  (_, k) => PROMPT.length + k
);

/** 35 position-computations, to produce four tokens that can be fed back. */
export const NAIVE_POSITIONS = STEP_LENGTHS.reduce((a, b) => a + b, 0);

/**
 * 9 with a cache: prefill computes the five prompt positions in its single
 * pass, and each of the four decode steps after it computes exactly one.
 */
export const CACHED_POSITIONS = PROMPT.length + (GEN_STEPS - 1);

/** 26 of the 35 are positions the loop has already computed at least once. */
export const RECOMPUTED_POSITIONS = NAIVE_POSITIONS - CACHED_POSITIONS;

/**
 * Per-layer cache shape, as `[B, kv_heads, T, head_dim]` spelled out — the
 * numbers come from `MODEL` and are the real Qwen2.5-0.5B ones. This model has
 * 2 KV heads against 14 query heads (grouped-query attention), which is why the
 * cache is `kvHeads` wide and not `qHeads`.
 */
export const KV_SHAPE = {
  batch: "1",
  heads: String(MODEL.kvHeads),
  /** Grows by one per step — printed as T. */
  seq: "T",
  dim: String(MODEL.headDim),
} as const;

/** Two tensors per layer (`K` and `V`), for all 24 layers. */
export const KV_TENSORS_PER_LAYER = 2;
export const KV_TOTAL_TENSORS = KV_TENSORS_PER_LAYER * MODEL.layers;
