import { describe, expect, it } from "vitest";
import { openClozeType as exercise } from "./open-cloze";

const payload = { context: "The manager asked her assistant to follow ___ on the complaint." };
const solution = { acceptedAnswers: ["up"] };

describe("OPEN_CLOZE", () => {
  it("accepts the exact word, case-insensitively", () => {
    const result = exercise.validate({ payload, solution, response: { text: "Up" } });
    expect(result).toEqual({ isCorrect: true, score: 1, maxScore: 1, feedback: "correct" });
  });

  it("rejects a wrong word outright", () => {
    const result = exercise.validate({ payload, solution, response: { text: "on" } });
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toBe("incorrect");
  });

  it("distinguishes a misspelling of the right word from a wrong word (SPEC.md 4.3)", () => {
    const wf = { acceptedAnswers: ["assessment"] };
    const result = exercise.validate({ payload, solution: wf, response: { text: "assesment" } });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
    expect(result.feedback).toBe("wrong_spelling");
    expect(exercise.describeSolution({ payload, solution: wf, response: { text: "assesment" }, result })).toMatch(
      /spelling/i,
    );
  });

  it("rejects an empty answer", () => {
    const result = exercise.validate({ payload, solution, response: { text: "" } });
    expect(result.isCorrect).toBe(false);
  });
});
