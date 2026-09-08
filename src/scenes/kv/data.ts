// Shared example for the KV-cache video. Keep the sentence in one place so
// every scene uses the exact same tokens as the narration.
//
// The prompt is the first 5 tokens ("The capital of France is"); "Paris" is
// token 6, and each subsequent generation appends one more token.

export const CAPITAL_TOKENS: readonly string[] = [
  "The", // 1
  "capital", // 2
  "of", // 3
  "France", // 4
  "is", // 5
  "Paris", // 6
];
