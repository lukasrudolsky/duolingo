import { z } from "zod";
import type { ExerciseDefinition } from "../types";
import { validateWordAnswer } from "../normalize";

const payloadSchema = z.object({ prompt: z.string() });
const solutionSchema = z.object({ acceptedAnswers: z.array(z.string()).min(1) });
const responseSchema = z.object({ text: z.string() });

type Payload = z.infer<typeof payloadSchema>;
type Solution = z.infer<typeof solutionSchema>;
type Response = z.infer<typeof responseSchema>;

export const typeTheWordType: ExerciseDefinition<Payload, Solution, Response> = {
  type: "TYPE_THE_WORD",
  payloadSchema,
  solutionSchema,
  responseSchema,
  validate({ solution, response }) {
    return validateWordAnswer(response.text, solution.acceptedAnswers);
  },
  describeSolution({ solution, result }) {
    const answer = solution.acceptedAnswers[0];
    if (result.feedback === "wrong_spelling") {
      return `Close, but check the spelling. The correct word is "${answer}".`;
    }
    return `The correct word is "${answer}".`;
  },
};
