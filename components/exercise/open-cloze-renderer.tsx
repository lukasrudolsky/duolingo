"use client";

import { TextAnswerInput } from "./text-answer-input";

export function OpenClozeRenderer({
  payload,
  disabled,
  onSubmit,
}: {
  payload: { context: string };
  disabled: boolean;
  onSubmit: (response: { text: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">{payload.context}</p>
      <TextAnswerInput
        disabled={disabled}
        placeholder="Type the missing word"
        onSubmit={(text) => onSubmit({ text })}
      />
    </div>
  );
}
