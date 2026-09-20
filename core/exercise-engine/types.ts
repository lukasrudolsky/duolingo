import type { ItemType } from "@prisma/client";
import type { ZodType } from "zod";

export interface ValidationResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  /** Machine-readable category for UI styling and analytics, not a user-facing string. */
  feedback: "correct" | "incorrect" | "partial" | "wrong_spelling" | "needs_review";
}

export interface ExerciseContext<Payload, Solution, Response> {
  payload: Payload;
  solution: Solution;
  response: Response;
}

export interface ExerciseDefinition<Payload = unknown, Solution = unknown, Response = unknown> {
  type: ItemType;
  payloadSchema: ZodType<Payload>;
  solutionSchema: ZodType<Solution>;
  responseSchema: ZodType<Response>;
  validate(context: ExerciseContext<Payload, Solution, Response>): ValidationResult;
  /**
   * Short, factual "what the correct answer was", derived from payload/solution shape.
   * This is not the pedagogical "why" (that's the Item.explanation column, authored per
   * item and shown alongside it, see SPEC.md section 3.5).
   */
  describeSolution(
    context: ExerciseContext<Payload, Solution, Response> & { result: ValidationResult },
  ): string;
}

// `any` here is deliberate: the registry stores heterogeneous exercise definitions keyed by
// ItemType, each fully typed at its own definition site (see exercises/*.ts).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyExerciseDefinition = ExerciseDefinition<any, any, any>;
