"use client";

import { useState } from "react";

const GRADES = [
  { grade: 1 as const, label: "Again" },
  { grade: 2 as const, label: "Hard" },
  { grade: 3 as const, label: "Good" },
  { grade: 4 as const, label: "Easy" },
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
        {revealed ? <p className="text-muted-foreground">{payload.back}</p> : null}
      </div>
      {revealed ? (
        <div className="flex gap-2">
          {GRADES.map(({ grade, label }) => (
            <button
              key={grade}
              type="button"
              disabled={disabled}
              onClick={() => onSubmit({ grade })}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary disabled:opacity-60"
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
