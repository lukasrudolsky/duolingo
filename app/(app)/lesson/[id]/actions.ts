"use server";

import type { ItemType, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getExerciseType } from "@/core/exercise-engine";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  // DefaultUser.id is optional in next-auth's own types; the session callback (see
  // lib/auth.config.ts) always sets it under the JWT strategy, so this is really just an
  // auth check, not a real "id happens to be missing" case.
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export interface LessonItemView {
  id: string;
  type: ItemType;
  payload: unknown;
}

export async function startLessonAction(
  lessonId: string,
): Promise<{ sessionId: string; items: LessonItemView[] }> {
  const userId = await requireUserId();

  const lesson = await prisma.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    include: { items: { orderBy: { order: "asc" }, include: { item: true } } },
  });

  const session = await prisma.session.create({
    data: { userId, kind: "LESSON" },
  });

  // Never send `solution` to the client before the user answers (SPEC.md section 9).
  const items = lesson.items.map(({ item }) => {
    const exercise = getExerciseType(item.type);
    return { id: item.id, type: item.type, payload: exercise.payloadSchema.parse(item.payload) };
  });

  return { sessionId: session.id, items };
}

export async function submitAttemptAction(input: {
  attemptId: string;
  sessionId: string;
  itemId: string;
  response: unknown;
  timeMs: number;
}) {
  const userId = await requireUserId();

  const item = await prisma.item.findUniqueOrThrow({ where: { id: input.itemId } });
  const exercise = getExerciseType(item.type);
  const payload = exercise.payloadSchema.parse(item.payload);
  const solution = exercise.solutionSchema.parse(item.solution);
  const response = exercise.responseSchema.parse(input.response);

  const result = exercise.validate({ payload, solution, response });

  // `attemptId` is client-generated (ARCHITECTURE.md decision 6), so this upsert is
  // idempotent: a retried submission keeps the first recorded result instead of double
  // counting.
  await prisma.attempt.upsert({
    where: { id: input.attemptId },
    create: {
      id: input.attemptId,
      userId,
      itemId: item.id,
      sessionId: input.sessionId,
      response: input.response as Prisma.InputJsonValue,
      isCorrect: result.isCorrect,
      score: result.score,
      timeMs: input.timeMs,
    },
    update: {},
  });

  return {
    result,
    solutionSummary: exercise.describeSolution({ payload, solution, response, result }),
    explanation: item.explanation,
  };
}

export async function completeLessonAction(
  sessionId: string,
): Promise<{ totalItems: number; correctCount: number }> {
  await requireUserId();

  const attempts = await prisma.attempt.findMany({ where: { sessionId } });
  const correctCount = attempts.filter((attempt) => attempt.isCorrect).length;

  await prisma.session.update({ where: { id: sessionId }, data: { endedAt: new Date() } });

  return { totalItems: attempts.length, correctCount };
}
