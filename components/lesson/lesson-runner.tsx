"use client";

import { useEffect, useRef, useState } from "react";
import { ItemRenderer } from "@/components/exercise/item-renderer";
import { FeedbackPanel } from "./feedback-panel";
import { LessonSummary } from "./lesson-summary";
import { completeLessonAction, submitAttemptAction, type LessonItemView } from "@/app/(app)/lesson/[id]/actions";
import type { ValidationResult } from "@/core/exercise-engine";

interface Feedback {
  result: ValidationResult;
  solution: unknown;
  solutionSummary: string;
  explanation: string;
}

export function LessonRunner({ sessionId, items }: { sessionId: string; items: LessonItemView[] }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [lastResponse, setLastResponse] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<{ correctCount: number; totalItems: number } | null>(null);
  // Date.now() is impure, so it can't run during render (React's purity rule): capture the
  // per-item start time in an effect instead, keyed on `index` so it resets each question.
  const startedAtRef = useRef(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [index]);

  const currentItem = items[index];
  const progressPercent = ((index + (feedback ? 1 : 0)) / items.length) * 100;

  async function handleSubmit(response: unknown) {
    if (isSubmitting || feedback) return;
    setIsSubmitting(true);
    setLastResponse(response);
    const timeMs = Date.now() - startedAtRef.current;
    const outcome = await submitAttemptAction({
      attemptId: crypto.randomUUID(),
      sessionId,
      itemId: currentItem.id,
      response,
      timeMs,
    });
    setFeedback(outcome);
    setIsSubmitting(false);
  }

  async function handleContinue() {
    setFeedback(null);
    setLastResponse(null);
    if (index + 1 < items.length) {
      setIndex(index + 1);
      return;
    }
    const result = await completeLessonAction(sessionId);
    setSummary(result);
  }

  if (summary) {
    return <LessonSummary correctCount={summary.correctCount} totalItems={summary.totalItems} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%`, background: "var(--gradient-primary)" }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {index + 1} / {items.length}
      </p>

      <div key={currentItem.id}>
        <ItemRenderer
          type={currentItem.type}
          payload={currentItem.payload}
          disabled={isSubmitting || feedback !== null}
          onSubmit={handleSubmit}
          response={lastResponse}
          solution={feedback?.solution}
        />
      </div>

      {feedback ? (
        <FeedbackPanel
          key={`feedback-${currentItem.id}`}
          result={feedback.result}
          solutionSummary={feedback.solutionSummary}
          explanation={feedback.explanation}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}
