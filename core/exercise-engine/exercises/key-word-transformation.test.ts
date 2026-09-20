import { describe, expect, it } from "vitest";
import { keyWordTransformationType as exercise } from "./key-word-transformation";

const payload = {
  originalSentence: "I regret not asking for more details before I signed the contract.",
  keyWord: "WISH",
  gappedSentence: "I _______________ more details before I signed the contract.",
};
const solution = {
  acceptedVariants: ["wish I had asked for", "wish I'd asked for"],
  parts: [["wish i had", "wish i'd"], ["asked for"]] as [string[], string[]],
};

describe("KEY_WORD_TRANSFORMATION", () => {
  it("gives full marks for an exact accepted variant", () => {
    const result = exercise.validate({ payload, solution, response: { text: "wish I had asked for" } });
    expect(result).toEqual({ isCorrect: true, score: 2, maxScore: 2, feedback: "correct" });
  });

  it("gives full marks for a listed alternative variant (contraction)", () => {
    const result = exercise.validate({ payload, solution, response: { text: "wish I'd asked for" } });
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(2);
  });

  it("is insensitive to contraction spelling when checking parts, not just full variants", () => {
    // "I'd" instead of "I had" plus extra words around the required parts.
    const result = exercise.validate({
      payload,
      solution,
      response: { text: "wish I'd asked for a few more details" },
    });
    expect(result.score).toBe(2);
  });

  it("gives partial credit (1/2) when only one component is present", () => {
    const result = exercise.validate({ payload, solution, response: { text: "wish I had known about" } });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(1);
    expect(result.feedback).toBe("partial");
  });

  it("gives zero and flags for review when neither component is present", () => {
    const result = exercise.validate({ payload, solution, response: { text: "I am sorry about it" } });
    expect(result).toEqual({ isCorrect: false, score: 0, maxScore: 2, feedback: "needs_review" });
  });

  it("normalizes whitespace before comparing", () => {
    const result = exercise.validate({ payload, solution, response: { text: "wish  I   had  asked for" } });
    expect(result.isCorrect).toBe(true);
  });
});
