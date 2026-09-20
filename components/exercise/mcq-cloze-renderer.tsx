"use client";

import { ChoiceList } from "./choice-list";

export function McqClozeRenderer({
  payload,
  disabled,
  onSubmit,
  reveal,
}: {
  payload: { context: string; options: string[] };
  disabled: boolean;
  onSubmit: (response: { selectedIndex: number }) => void;
  reveal?: { selectedIndex: number; correctIndex: number } | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">{payload.context}</p>
      <ChoiceList
        choices={payload.options}
        disabled={disabled}
        onSelect={(selectedIndex) => onSubmit({ selectedIndex })}
        reveal={reveal}
      />
    </div>
  );
}
