"use client";

import { ChoiceList } from "./choice-list";

export function McqClozeRenderer({
  payload,
  disabled,
  onSubmit,
}: {
  payload: { context: string; options: string[] };
  disabled: boolean;
  onSubmit: (response: { selectedIndex: number }) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">{payload.context}</p>
      <ChoiceList
        choices={payload.options}
        disabled={disabled}
        onSelect={(selectedIndex) => onSubmit({ selectedIndex })}
      />
    </div>
  );
}
