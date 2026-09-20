import { describe, expect, it } from "vitest";
import { collocationMatchType as exercise } from "./collocation-match";

const payload = {
  left: ["carry out", "come up with", "follow up on", "take on"],
  right: ["a solution", "an investigation", "a new role", "a complaint"],
};
const solution = { correctPairs: [1, 0, 3, 2] };

describe("COLLOCATION_MATCH", () => {
  it("gives full marks when every pair is correct", () => {
    const result = exercise.validate({ payload, solution, response: { pairs: [1, 0, 3, 2] } });
    expect(result).toEqual({ isCorrect: true, score: 4, maxScore: 4, feedback: "correct" });
  });

  it("gives partial credit for some correct pairs", () => {
    const result = exercise.validate({ payload, solution, response: { pairs: [1, 0, 0, 0] } });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(2);
    expect(result.feedback).toBe("partial");
  });

  it("gives zero when nothing matches", () => {
    const result = exercise.validate({ payload, solution, response: { pairs: [0, 1, 2, 3] } });
    expect(result.score).toBe(0);
    expect(result.feedback).toBe("incorrect");
  });
});
