"use client";

import { useState } from "react";

export function CollocationMatchRenderer({
  payload,
  disabled,
  onSubmit,
}: {
  payload: { left: string[]; right: string[] };
  disabled: boolean;
  onSubmit: (response: { pairs: number[] }) => void;
}) {
  const [pairs, setPairs] = useState<number[]>(() => payload.left.map(() => -1));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  const usedRight = new Set(pairs.filter((p) => p >= 0));
  const allPaired = pairs.every((p) => p >= 0);

  function pairWith(rightIndex: number) {
    if (disabled || selectedLeft === null) return;
    setPairs((prev) => {
      const next = [...prev];
      const stolenFrom = next.indexOf(rightIndex);
      if (stolenFrom !== -1) next[stolenFrom] = -1;
      next[selectedLeft] = rightIndex;
      return next;
    });
    setSelectedLeft(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">Match each phrasal verb with what it usually takes as an object.</p>
      <div className="grid grid-cols-2 gap-4">
        <div data-testid="collocation-left" className="flex flex-col gap-2">
          {payload.left.map((label, index) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedLeft(index)}
              className={`rounded-md border px-3 py-2 text-left transition-all hover:shadow-sm disabled:opacity-60 ${
                selectedLeft === index ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary"
              }`}
            >
              {label}
              {pairs[index] >= 0 ? (
                <span className="ml-2 text-sm text-muted-foreground">→ {payload.right[pairs[index]]}</span>
              ) : null}
            </button>
          ))}
        </div>
        <div data-testid="collocation-right" className="flex flex-col gap-2">
          {payload.right.map((label, index) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => pairWith(index)}
              className={`rounded-md border px-3 py-2 text-left transition-all hover:shadow-sm disabled:opacity-60 ${
                usedRight.has(index) ? "border-primary bg-muted" : "border-border hover:border-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={disabled || !allPaired}
        onClick={() => onSubmit({ pairs })}
        className="self-start rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
      >
        Check
      </button>
    </div>
  );
}
