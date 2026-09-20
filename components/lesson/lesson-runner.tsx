"use client";

import { useEffect, useRef, useState } from "react";
import { ItemRenderer } from "@/components/exercise/item-renderer";
import { FeedbackPanel } from "./feedback-panel";
import { LessonSummary } from "./lesson-summary";
import { completeLessonAction, submitAttemptAction, type LessonItemView } from "@/app/(app)/lesson/[id]/actions";
import type { ValidationResult } from "@/core/exercise-engine";

interface Feedback {
  result: ValidationResult;
  solutionSummary: string;
  explanation: string;
}

export function LessonRunner({ sessionId, items }: { sessionId: string; items: LessonItemView[] }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<{ correctCount: number; totalItems: number } | null>(null);
  // Date.now() is impure, so it can't run during render (React's purity rule): capture the
  // per-item start time in an effect instead, keyed on `index` so it resets each question.
  const startedAtRef = useRef(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [index]);

  const currentItem = items[index];

  async function handleSubmit(response: unknown) {
    if (isSubmitting || feedback) return;
    setIsSubmitting(true);
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
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${(index / items.length) * 100}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {index + 1} / {items.length}
      </p>

      <ItemRenderer
        type={currentItem.type}
        payload={currentItem.payload}
        disabled={isSubmitting || feedback !== null}
        onSubmit={handleSubmit}
      />

      {feedback ? (
        <FeedbackPanel
          result={feedback.result}
          solutionSummary={feedback.solutionSummary}
          explanation={feedback.explanation}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}
