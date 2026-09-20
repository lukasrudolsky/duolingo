"use client";

import { useState } from "react";

const GRADES = [
  { grade: 1 as const, label: "Again", classes: "border-danger text-danger hover:bg-danger-soft" },
  { grade: 2 as const, label: "Hard", classes: "border-warning text-warning hover:bg-warning-soft" },
  { grade: 3 as const, label: "Good", classes: "border-primary text-primary hover:bg-primary/10" },
  { grade: 4 as const, label: "Easy", classes: "border-success text-success hover:bg-success-soft" },
];

export function FlashcardRenderer({
  payload,
  disabled,
  onSubmit,
}: {
  payload: { front: string; back: string };
  disabled: boolean;
  onSubmit: (response: { grade: 1 | 2 | 3 | 4 }) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-border px-6 py-8 text-center">
        <p className="text-xl font-semibold">{payload.front}</p>
        {revealed ? <p className="anim-slide-up-fade text-muted-foreground">{payload.back}</p> : null}
      </div>
      {revealed ? (
        <div className="anim-pop-in flex gap-2">
          {GRADES.map(({ grade, label, classes }) => (
            <button
              key={grade}
              type="button"
              disabled={disabled}
              onClick={() => onSubmit({ grade })}
              className={`rounded-full border bg-background px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${classes}`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
