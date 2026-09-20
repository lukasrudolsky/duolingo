import { z } from "zod";
import type { ExerciseDefinition } from "../types";

const payloadSchema = z.object({
  left: z.array(z.string()).min(2),
  right: z.array(z.string()).min(2),
});
// One entry per `left` item, giving the index into `right` it pairs with.
const solutionSchema = z.object({ correctPairs: z.array(z.number().int().min(0)) });
const responseSchema = z.object({ pairs: z.array(z.number().int().min(0)) });

type Payload = z.infer<typeof payloadSchema>;
type Solution = z.infer<typeof solutionSchema>;
type Response = z.infer<typeof responseSchema>;

export const collocationMatchType: ExerciseDefinition<Payload, Solution, Response> = {
  type: "COLLOCATION_MATCH",
  payloadSchema,
  solutionSchema,
  responseSchema,
  validate({ solution, response }) {
    const total = solution.correctPairs.length;
    const correctCount = solution.correctPairs.reduce(
      (count, correctIndex, i) => count + (response.pairs[i] === correctIndex ? 1 : 0),
      0,
    );
    return {
      isCorrect: correctCount === total,
      score: correctCount,
      maxScore: total,
      feedback: correctCount === total ? "correct" : correctCount === 0 ? "incorrect" : "partial",
    };
  },
  describeSolution({ payload, solution }) {
    const pairs = solution.correctPairs.map((rightIndex, i) => `"${payload.left[i]}" -> "${payload.right[rightIndex]}"`);
    return `Correct pairs: ${pairs.join(", ")}.`;
  },
};
