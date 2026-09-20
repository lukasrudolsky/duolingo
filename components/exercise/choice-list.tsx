"use client";

import { useEffect } from "react";

interface ChoiceReveal {
  selectedIndex: number;
  correctIndex: number;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="anim-check-draw" style={{ strokeDasharray: 24 }} d="M4 12.5l5 5L20 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Shared by MCQ_CLOZE and ODD_ONE_OUT. Number keys 1-9 select+submit immediately, per
 * SPEC.md section 8 ("1 až 4 = volba"). Once `reveal` is set (after the server has graded
 * the answer), the picked option and the correct one light up green/red instead of relying
 * only on the FeedbackPanel text below. */
export function ChoiceList({
  choices,
  disabled,
  onSelect,
  reveal,
}: {
  choices: string[];
  disabled: boolean;
  onSelect: (index: number) => void;
  reveal?: ChoiceReveal | null;
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
      {choices.map((choice, index) => {
        const isSelected = reveal?.selectedIndex === index;
        const isCorrectChoice = reveal?.correctIndex === index;

        let toneClass =
          "border-border hover:border-primary hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.99]";
        let badgeClass = "border-border text-muted-foreground";
        let icon: React.ReactNode = index + 1;
        let animationClass = "";

        if (reveal) {
          if (isCorrectChoice) {
            toneClass = "border-success bg-success-soft";
            badgeClass = "border-success bg-success text-success-foreground";
            icon = <CheckIcon />;
          } else if (isSelected) {
            toneClass = "border-danger bg-danger-soft";
            badgeClass = "border-danger bg-danger text-danger-foreground";
            icon = <XIcon />;
            animationClass = "anim-shake";
          } else {
            toneClass = "border-border opacity-45";
          }
        }

        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(index)}
            className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left transition-all duration-150 disabled:cursor-default ${toneClass} ${animationClass}`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${badgeClass}`}>
              {icon}
            </span>
            {choice}
          </button>
        );
      })}
    </div>
  );
}
