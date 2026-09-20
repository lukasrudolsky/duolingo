import { z } from "zod";
import type { ExerciseDefinition } from "../types";
import { expandContractions } from "../normalize";

const payloadSchema = z.object({
  originalSentence: z.string(),
  keyWord: z.string(),
  gappedSentence: z.string(),
});
const solutionSchema = z.object({
  acceptedVariants: z.array(z.string()).min(1),
  // Two independently-checkable components of the answer, each worth 1 point, mirroring the
  // real exam's 0/1/2 marking (SPEC.md section 4.3).
  parts: z.tuple([z.array(z.string()).min(1), z.array(z.string()).min(1)]),
});
const responseSchema = z.object({ text: z.string() });

type Payload = z.infer<typeof payloadSchema>;
type Solution = z.infer<typeof solutionSchema>;
type Response = z.infer<typeof responseSchema>;

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(expandContractions(needle)));
}

export const keyWordTransformationType: ExerciseDefinition<Payload, Solution, Response> = {
  type: "KEY_WORD_TRANSFORMATION",
  payloadSchema,
  solutionSchema,
  responseSchema,
  validate({ solution, response }) {
    const normalizedResponse = expandContractions(response.text);
    const isExactMatch = solution.acceptedVariants.some(
      (variant) => expandContractions(variant) === normalizedResponse,
    );
    if (isExactMatch) {
      return { isCorrect: true, score: 2, maxScore: 2, feedback: "correct" };
    }

    const [partA, partB] = solution.parts;
    const score = Number(containsAny(normalizedResponse, partA)) + Number(containsAny(normalizedResponse, partB));

    if (score === 0) {
      // STUB: SPEC.md section 4.3 wants an LLM fallback assessment when the answer matches
      // no known variant or part (it might still be a valid paraphrase). That needs
      // /core/llm, which doesn't exist until Phase 4+ (see TODO.md). Until then this scores
      // 0 and is flagged distinctly so it can be routed to human review instead of being
      // silently marked wrong forever.
      return { isCorrect: false, score: 0, maxScore: 2, feedback: "needs_review" };
    }
    const isCorrect = score === 2;
    return { isCorrect, score, maxScore: 2, feedback: isCorrect ? "correct" : "partial" };
  },
  describeSolution({ solution, result }) {
    const target = solution.acceptedVariants[0];
    if (result.isCorrect) return `Correct: "${target}".`;
    if (result.feedback === "partial") {
      return `Partly correct (${result.score}/2). The full answer is "${target}".`;
    }
    return `The correct answer is "${target}".`;
  },
};
