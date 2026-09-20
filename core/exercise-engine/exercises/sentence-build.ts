import { z } from "zod";
import type { ExerciseDefinition } from "../types";

const payloadSchema = z.object({ blocks: z.array(z.string()).min(2) });
// Indices into `blocks`, in the correct sequence.
const solutionSchema = z.object({ correctOrder: z.array(z.number().int().min(0)).min(2) });
const responseSchema = z.object({ order: z.array(z.number().int().min(0)) });

type Payload = z.infer<typeof payloadSchema>;
type Solution = z.infer<typeof solutionSchema>;
type Response = z.infer<typeof responseSchema>;

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

export const sentenceBuildType: ExerciseDefinition<Payload, Solution, Response> = {
  type: "SENTENCE_BUILD",
  payloadSchema,
  solutionSchema,
  responseSchema,
  validate({ solution, response }) {
    const isCorrect = arraysEqual(response.order, solution.correctOrder);
    return { isCorrect, score: isCorrect ? 1 : 0, maxScore: 1, feedback: isCorrect ? "correct" : "incorrect" };
  },
  describeSolution({ payload, solution }) {
    const sentence = solution.correctOrder.map((i) => payload.blocks[i]).join(" ");
    return `The correct sentence is: "${sentence}."`;
  },
};
