import type { ValidationResult } from "./types";

export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

// Common contractions relevant to C1 grammar (modals, reported speech, conditionals).
// Not exhaustive by design: it only needs to cover what Key Word Transformation and open
// answer items actually test.
const CONTRACTIONS: Record<string, string> = {
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "doesn't": "does not",
  "don't": "do not",
  "didn't": "did not",
  "hasn't": "has not",
  "haven't": "have not",
  "hadn't": "had not",
  "won't": "will not",
  "wouldn't": "would not",
  "can't": "cannot",
  "couldn't": "could not",
  "shouldn't": "should not",
  "mustn't": "must not",
  "i'm": "i am",
  "you're": "you are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "we're": "we are",
  "they're": "they are",
  "i've": "i have",
  "you've": "you have",
  "we've": "we have",
  "they've": "they have",
  "i'll": "i will",
  "you'll": "you will",
  "he'll": "he will",
  "she'll": "she will",
  "we'll": "we will",
  "they'll": "they will",
  "i'd": "i would",
  "you'd": "you would",
  "he'd": "he would",
  "she'd": "she would",
  "we'd": "we would",
  "they'd": "they would",
};

/** Case-insensitive, whitespace-normalized, and contraction-insensitive. */
export function expandContractions(input: string): string {
  let result = normalizeAnswer(input);
  for (const [contraction, expanded] of Object.entries(CONTRACTIONS)) {
    result = result.replaceAll(contraction, expanded);
  }
  return result;
}

export function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/**
 * Levenshtein distance plus adjacent-transposition as a single edit (the "optimal string
 * alignment" variant of Damerau-Levenshtein). Transposing two letters ("recieve" for
 * "receive") is one of the most common human typos, and plain Levenshtein counts it as two
 * edits, which was enough to misclassify it as a wrong word instead of a misspelling.
 */
export function typoDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      const isTransposition = i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1];
      if (isTransposition) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
      }
    }
  }
  return dp[a.length][b.length];
}

export type SpellingMatch = "exact" | "close" | "none";

/**
 * Case-insensitive exact match required, spelling counts on the real exam (SPEC.md section
 * 4.3), but a small edit distance still gets a distinguishing "right word, wrong spelling"
 * result instead of a flat "wrong".
 */
export function matchAcceptedAnswer(response: string, accepted: string[]): SpellingMatch {
  const normalizedResponse = normalizeAnswer(response);
  if (normalizedResponse.length === 0) return "none";
  if (accepted.some((answer) => normalizeAnswer(answer) === normalizedResponse)) return "exact";

  const isCloseEnough = accepted.some((answer) => {
    const normalizedAnswer = normalizeAnswer(answer);
    const distance = typoDistance(normalizedResponse, normalizedAnswer);
    const tolerance = Math.max(1, Math.floor(normalizedAnswer.length * 0.25));
    return distance > 0 && distance <= tolerance;
  });
  return isCloseEnough ? "close" : "none";
}

/** Shared by OPEN_CLOZE, WORD_FORMATION and TYPE_THE_WORD: identical validation semantics,
 * only the payload shown to the user differs. */
export function validateWordAnswer(responseText: string, acceptedAnswers: string[]): ValidationResult {
  const match = matchAcceptedAnswer(responseText, acceptedAnswers);
  const isCorrect = match === "exact";
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    feedback: match === "exact" ? "correct" : match === "close" ? "wrong_spelling" : "incorrect",
  };
}
