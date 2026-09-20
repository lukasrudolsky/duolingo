"use client";

import { TextAnswerInput } from "./text-answer-input";

export function WordFormationRenderer({
  payload,
  disabled,
  onSubmit,
}: {
  payload: { context: string; rootWord: string };
  disabled: boolean;
  onSubmit: (response: { text: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">{payload.context}</p>
      <p className="text-sm text-muted-foreground">
        Root word: <span className="font-mono font-semibold">{payload.rootWord}</span>
      </p>
      <TextAnswerInput
        disabled={disabled}
        placeholder="Type the correct form"
        onSubmit={(text) => onSubmit({ text })}
      />
    </div>
  );
}
