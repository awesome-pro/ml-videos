// Shared example sentences, kept in one place so every scene uses the same
// tokens and no scene drifts from another.

export const ANIMAL_TIRED: readonly string[] = [
  "Animal",
  "did",
  "not",
  "cross",
  "the",
  "street",
  "because",
  "it",
  "was",
  "too",
  "tired",
];

export const ANIMAL_WIDE: readonly string[] = [
  "Animal",
  "did",
  "not",
  "cross",
  "the",
  "street",
  "because",
  "it",
  "was",
  "too",
  "wide",
];

export const BANK_1: readonly string[] = [
  "I",
  "sat",
  "by",
  "the",
  "river",
  "bank",
];

export const BANK_2: readonly string[] = [
  "I",
  "deposited",
  "money",
  "at",
  "the",
  "bank",
];

/** Indices of the "it" token and the two candidate resolutions. */
export const IT_INDEX = 7; // in ANIMAL_* sentences
export const ANIMAL_INDEX = 0;
export const STREET_INDEX = 5;
