import { z } from "zod";
import type { ExerciseDefinition } from "../types";

const payloadSchema = z.object({
  context: z.string(),
  options: z.array(z.string()).length(4),
});
const solutionSchema = z.object({ correctIndex: z.number().int().min(0).max(3) });
const responseSchema = z.object({ selectedIndex: z.number().int().min(0).max(3) });

type Payload = z.infer<typeof payloadSchema>;
type Solution = z.infer<typeof solutionSchema>;
type Response = z.infer<typeof responseSchema>;

export const mcqClozeType: ExerciseDefinition<Payload, Solution, Response> = {
  type: "MCQ_CLOZE",
  payloadSchema,
  solutionSchema,
  responseSchema,
  validate({ solution, response }) {
    const isCorrect = response.selectedIndex === solution.correctIndex;
    return { isCorrect, score: isCorrect ? 1 : 0, maxScore: 1, feedback: isCorrect ? "correct" : "incorrect" };
  },
  describeSolution({ payload, solution }) {
    return `The correct answer is "${payload.options[solution.correctIndex]}".`;
  },
};
