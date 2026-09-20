import { describe, expect, it } from "vitest";
import { wordFormationType as exercise } from "./word-formation";

const payload = { context: "The consultant's ___ of the merger was blunt but fair.", rootWord: "ASSESS" };
const solution = { acceptedAnswers: ["assessment"] };

describe("WORD_FORMATION", () => {
  it("accepts the correctly formed word", () => {
    const result = exercise.validate({ payload, solution, response: { text: "assessment" } });
    expect(result.isCorrect).toBe(true);
  });

  it("rejects the unmodified root word", () => {
    const result = exercise.validate({ payload, solution, response: { text: "assess" } });
    expect(result.isCorrect).toBe(false);
    // "assess" -> "assessment" is a 5-character edit on a 10-character word: too far for the
    // spelling-tolerance heuristic, so this is a wrong word, not a typo.
    expect(result.feedback).toBe("incorrect");
  });

  it("flags a spelling slip on the correctly formed word", () => {
    const result = exercise.validate({ payload, solution, response: { text: "assesment" } });
    expect(result.feedback).toBe("wrong_spelling");
  });
});
