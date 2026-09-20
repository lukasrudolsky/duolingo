import { z } from "zod";
import type { ExerciseDefinition } from "../types";

const payloadSchema = z.object({ words: z.array(z.string()).min(3) });
const solutionSchema = z.object({ oddIndex: z.number().int().min(0) });
const responseSchema = z.object({ selectedIndex: z.number().int().min(0) });

type Payload = z.infer<typeof payloadSchema>;
type Solution = z.infer<typeof solutionSchema>;
type Response = z.infer<typeof responseSchema>;

export const oddOneOutType: ExerciseDefinition<Payload, Solution, Response> = {
  type: "ODD_ONE_OUT",
  payloadSchema,
  solutionSchema,
  responseSchema,
  validate({ solution, response }) {
    const isCorrect = response.selectedIndex === solution.oddIndex;
    return { isCorrect, score: isCorrect ? 1 : 0, maxScore: 1, feedback: isCorrect ? "correct" : "incorrect" };
  },
  describeSolution({ payload, solution }) {
    return `The odd one out is "${payload.words[solution.oddIndex]}".`;
  },
};
