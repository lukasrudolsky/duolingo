import { describe, expect, it } from "vitest";
import { flashcardType as exercise } from "./flashcard";

const payload = { front: "step down", back: "to resign from an important job or position" };
const solution = {};

describe("FLASHCARD", () => {
  it.each([
    [1, false],
    [2, false],
    [3, true],
    [4, true],
  ] as const)("grade %i maps to isCorrect=%s", (grade, expected) => {
    const result = exercise.validate({ payload, solution, response: { grade } });
    expect(result.isCorrect).toBe(expected);
  });

  it("describes the card content regardless of grade", () => {
    const result = exercise.validate({ payload, solution, response: { grade: 1 } });
    const description = exercise.describeSolution({ payload, solution, response: { grade: 1 }, result });
    expect(description).toContain("step down");
    expect(description).toContain("resign");
  });
});
