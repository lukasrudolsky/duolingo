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

const TONE: Record<ValidationResult["feedback"], "success" | "danger" | "warning"> = {
  correct: "success",
  incorrect: "danger",
  partial: "warning",
  wrong_spelling: "warning",
  needs_review: "warning",
};

const TONE_CLASSES = {
  success: "border-success bg-success-soft",
  danger: "border-danger bg-danger-soft",
  warning: "border-warning bg-warning-soft",
};

const BADGE_CLASSES = {
  success: "bg-success text-success-foreground",
  danger: "bg-danger text-danger-foreground",
  warning: "bg-warning text-warning-foreground",
};

function ToneIcon({ tone }: { tone: "success" | "danger" | "warning" }) {
  if (tone === "success") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path className="anim-check-draw" style={{ strokeDasharray: 24 }} d="M4 12.5l5 5L20 7" />
      </svg>
    );
  }
  if (tone === "danger") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8v5" />
      <circle cx="12" cy="16.2" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
  const tone = TONE[result.feedback];

  useEffect(() => {
    buttonRef.current?.focus();
    // Enter advances to the next item, per SPEC.md section 8's keyboard requirement.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") onContinue();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onContinue]);

  return (
    <div className={`anim-slide-up-fade flex flex-col gap-2 rounded-lg border-2 p-4 ${TONE_CLASSES[tone]}`}>
      <p className="flex items-center gap-2 font-semibold">
        <span className={`anim-pop-in flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${BADGE_CLASSES[tone]}`}>
          <ToneIcon tone={tone} />
        </span>
        {FEEDBACK_LABEL[result.feedback]} ({result.score}/{result.maxScore})
      </p>
      {!result.isCorrect ? <p>{solutionSummary}</p> : null}
      <p className="text-sm text-muted-foreground">{explanation}</p>
      <button
        ref={buttonRef}
        type="button"
        onClick={onContinue}
        className="mt-2 self-start rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      >
        Continue
      </button>
    </div>
  );
}
