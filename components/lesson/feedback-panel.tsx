"use client";

import { useEffect, useRef } from "react";
import type { ValidationResult } from "@/core/exercise-engine";

const FEEDBACK_LABEL: Record<ValidationResult["feedback"], string> = {
  correct: "Correct",
  incorrect: "Incorrect",
  partial: "Partially correct",
  wrong_spelling: "Right word, wrong spelling",
  needs_review: "Flagged for review",
};

export function FeedbackPanel({
  result,
  solutionSummary,
  explanation,
  onContinue,
}: {
  result: ValidationResult;
  solutionSummary: string;
  explanation: string;
  onContinue: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
    // Enter advances to the next item, per SPEC.md section 8's keyboard requirement.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") onContinue();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onContinue]);

  const tone = result.isCorrect
    ? "border-green-500 bg-green-50 dark:bg-green-950/40"
    : "border-amber-500 bg-amber-50 dark:bg-amber-950/40";

  return (
    <div className={`flex flex-col gap-2 rounded-lg border-2 p-4 ${tone}`}>
      <p className="font-semibold">
        {FEEDBACK_LABEL[result.feedback]} ({result.score}/{result.maxScore})
      </p>
      {!result.isCorrect ? <p>{solutionSummary}</p> : null}
      <p className="text-sm text-muted-foreground">{explanation}</p>
      <button
        ref={buttonRef}
        type="button"
        onClick={onContinue}
        className="mt-2 self-start rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground"
      >
        Continue
      </button>
    </div>
  );
}
