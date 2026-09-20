import { describe, expect, it } from "vitest";
import { oddOneOutType as exercise } from "./odd-one-out";

const payload = { words: ["carry out", "conduct", "perform", "postpone"] };
const solution = { oddIndex: 3 };

describe("ODD_ONE_OUT", () => {
  it("accepts the correct odd one out", () => {
    const result = exercise.validate({ payload, solution, response: { selectedIndex: 3 } });
    expect(result.isCorrect).toBe(true);
  });

  it("rejects any other selection", () => {
    const result = exercise.validate({ payload, solution, response: { selectedIndex: 0 } });
    expect(result.isCorrect).toBe(false);
  });

  it("names the odd word in the description", () => {
    const result = exercise.validate({ payload, solution, response: { selectedIndex: 0 } });
    expect(exercise.describeSolution({ payload, solution, response: { selectedIndex: 0 }, result })).toContain(
      "postpone",
    );
  });
});
