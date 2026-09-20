"use client";

import { TextAnswerInput } from "./text-answer-input";

export function KeyWordTransformationRenderer({
  payload,
  disabled,
  onSubmit,
}: {
  payload: { originalSentence: string; keyWord: string; gappedSentence: string };
  disabled: boolean;
  onSubmit: (response: { text: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">{payload.originalSentence}</p>
      <p className="text-sm text-muted-foreground">
        Key word: <span className="font-mono font-semibold tracking-wide">{payload.keyWord}</span>
      </p>
      <p className="text-lg">{payload.gappedSentence}</p>
      <TextAnswerInput
        disabled={disabled}
        placeholder="Type the missing words"
        onSubmit={(text) => onSubmit({ text })}
      />
    </div>
  );
}
