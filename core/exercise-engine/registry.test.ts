import { describe, expect, it } from "vitest";
import { getExerciseType, isExerciseTypeImplemented } from ".";

describe("exercise-engine registry", () => {
  it("resolves every Phase 1 exercise type", () => {
    const implemented = [
      "MCQ_CLOZE",
      "OPEN_CLOZE",
      "WORD_FORMATION",
      "KEY_WORD_TRANSFORMATION",
      "FLASHCARD",
      "TYPE_THE_WORD",
      "COLLOCATION_MATCH",
      "ODD_ONE_OUT",
      "SENTENCE_BUILD",
    ] as const;
    for (const type of implemented) {
      expect(isExerciseTypeImplemented(type)).toBe(true);
      expect(getExerciseType(type).type).toBe(type);
    }
  });

  it("throws a clear error for a type from a later phase", () => {
    expect(isExerciseTypeImplemented("WRITING_TASK")).toBe(false);
    expect(() => getExerciseType("WRITING_TASK")).toThrow(/not implemented yet/);
  });
});
