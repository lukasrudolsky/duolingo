"use client";

import { useEffect } from "react";

/** Shared by MCQ_CLOZE and ODD_ONE_OUT. Number keys 1-9 select+submit immediately, per
 * SPEC.md section 8 ("1 až 4 = volba"). */
export function ChoiceList({
  choices,
  disabled,
  onSelect,
}: {
  choices: string[];
  disabled: boolean;
  onSelect: (index: number) => void;
}) {
  useEffect(() => {
    if (disabled) return;
    function handleKeyDown(event: KeyboardEvent) {
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < choices.length) {
        onSelect(index);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choices.length, disabled, onSelect]);

  return (
    <div className="flex flex-col gap-2">
      {choices.map((choice, index) => (
        <button
          key={choice}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(index)}
          className="flex items-center gap-3 rounded-md border border-border px-4 py-3 text-left hover:border-primary disabled:opacity-60"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">
            {index + 1}
          </span>
          {choice}
        </button>
      ))}
    </div>
  );
}
