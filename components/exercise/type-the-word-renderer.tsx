"use client";

import { TextAnswerInput } from "./text-answer-input";

export function TypeTheWordRenderer({
  payload,
  disabled,
  onSubmit,
}: {
  payload: { prompt: string };
  disabled: boolean;
  onSubmit: (response: { text: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">{payload.prompt}</p>
      <TextAnswerInput disabled={disabled} placeholder="Type the word" onSubmit={(text) => onSubmit({ text })} />
    </div>
  );
}
