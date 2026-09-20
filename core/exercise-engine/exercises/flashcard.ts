import { z } from "zod";
import type { ExerciseDefinition } from "../types";

const payloadSchema = z.object({ front: z.string(), back: z.string() });
const solutionSchema = z.object({});
// Self-graded, same 1-4 scale FSRS uses (Again/Hard/Good/Easy). This deliberately matches
// UserItemState.lastGrade's shape (SPEC.md section 7) so Phase 2 can wire it straight into
// the FSRS scheduler without changing the response contract.
const responseSchema = z.object({
  grade: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

type Payload = z.infer<typeof payloadSchema>;
type Solution = z.infer<typeof solutionSchema>;
type Response = z.infer<typeof responseSchema>;

export const flashcardType: ExerciseDefinition<Payload, Solution, Response> = {
  type: "FLASHCARD",
  payloadSchema,
  solutionSchema,
  responseSchema,
  validate({ response }) {
    const isCorrect = response.grade >= 3;
    return { isCorrect, score: isCorrect ? 1 : 0, maxScore: 1, feedback: isCorrect ? "correct" : "incorrect" };
  },
  describeSolution({ payload }) {
    return `"${payload.front}" means "${payload.back}".`;
  },
};
