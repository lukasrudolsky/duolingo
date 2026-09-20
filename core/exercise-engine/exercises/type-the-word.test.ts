import { describe, expect, it } from "vitest";
import { typeTheWordType as exercise } from "./type-the-word";

const payload = { prompt: "Which two-word phrasal verb means 'to investigate a problem'?" };
const solution = { acceptedAnswers: ["look into"] };

describe("TYPE_THE_WORD", () => {
  it("accepts the exact answer, case-insensitively", () => {
    const result = exercise.validate({ payload, solution, response: { text: "Look Into" } });
    expect(result.isCorrect).toBe(true);
  });

  it("rejects an unrelated answer", () => {
    const result = exercise.validate({ payload, solution, response: { text: "carry out" } });
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toBe("incorrect");
  });
});
