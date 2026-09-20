import { describe, expect, it } from "vitest";
import { mcqClozeType as exercise } from "./mcq-cloze";

const payload = {
  context: "The board decided to ___ the investigation themselves.",
  options: ["carry out", "carry on", "carry off", "carry over"],
};
const solution = { correctIndex: 0 };

describe("MCQ_CLOZE", () => {
  it("scores the correct option as correct", () => {
    const result = exercise.validate({ payload, solution, response: { selectedIndex: 0 } });
    expect(result).toEqual({ isCorrect: true, score: 1, maxScore: 1, feedback: "correct" });
  });

  it("scores any other option as incorrect", () => {
    const result = exercise.validate({ payload, solution, response: { selectedIndex: 1 } });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it("describes the correct option by name", () => {
    const result = exercise.validate({ payload, solution, response: { selectedIndex: 1 } });
    expect(exercise.describeSolution({ payload, solution, response: { selectedIndex: 1 }, result })).toContain(
      "carry out",
    );
  });
});
