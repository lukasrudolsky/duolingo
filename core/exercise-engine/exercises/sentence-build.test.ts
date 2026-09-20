import { describe, expect, it } from "vitest";
import { sentenceBuildType as exercise } from "./sentence-build";

const payload = { blocks: ["until further notice", "The launch", "postponed", "was"] };
const solution = { correctOrder: [1, 3, 2, 0] };

describe("SENTENCE_BUILD", () => {
  it("accepts the exact correct order", () => {
    const result = exercise.validate({ payload, solution, response: { order: [1, 3, 2, 0] } });
    expect(result.isCorrect).toBe(true);
  });

  it("rejects a different order of the same blocks", () => {
    const result = exercise.validate({ payload, solution, response: { order: [1, 2, 3, 0] } });
    expect(result.isCorrect).toBe(false);
  });

  it("rejects an incomplete arrangement", () => {
    const result = exercise.validate({ payload, solution, response: { order: [1, 3] } });
    expect(result.isCorrect).toBe(false);
  });

  it("reconstructs the correct sentence in the description", () => {
    const result = exercise.validate({ payload, solution, response: { order: [] } });
    expect(exercise.describeSolution({ payload, solution, response: { order: [] }, result })).toBe(
      'The correct sentence is: "The launch was postponed until further notice."',
    );
  });
});
