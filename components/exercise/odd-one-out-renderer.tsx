"use client";

import { ChoiceList } from "./choice-list";

export function OddOneOutRenderer({
  payload,
  disabled,
  onSubmit,
  reveal,
}: {
  payload: { words: string[] };
  disabled: boolean;
  onSubmit: (response: { selectedIndex: number }) => void;
  reveal?: { selectedIndex: number; correctIndex: number } | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">Which one doesn&apos;t belong?</p>
      <ChoiceList
        choices={payload.words}
        disabled={disabled}
        onSelect={(selectedIndex) => onSubmit({ selectedIndex })}
        reveal={reveal}
      />
    </div>
  );
}
