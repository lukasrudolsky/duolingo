"use client";

import { useState } from "react";

/** Shared by OPEN_CLOZE, WORD_FORMATION, TYPE_THE_WORD and KEY_WORD_TRANSFORMATION: all four
 * are "type an answer" interactions, only the surrounding prompt differs. Enter submits
 * (SPEC.md section 8 keyboard requirement). */
export function TextAnswerInput({
  disabled,
  onSubmit,
  placeholder,
}: {
  disabled: boolean;
  onSubmit: (text: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim().length === 0) return;
        onSubmit(value);
      }}
      className="flex gap-2"
    >
      <input
        autoFocus
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md border border-border bg-background px-3 py-2 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        className="rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-50"
      >
        Check
      </button>
    </form>
  );
}
