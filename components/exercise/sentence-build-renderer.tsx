"use client";

import { useState } from "react";

export function SentenceBuildRenderer({
  payload,
  disabled,
  onSubmit,
}: {
  payload: { blocks: string[] };
  disabled: boolean;
  onSubmit: (response: { order: number[] }) => void;
}) {
  const [order, setOrder] = useState<number[]>([]);

  const usedSet = new Set(order);
  const remainingIndices = payload.blocks.map((_, i) => i).filter((i) => !usedSet.has(i));

  function addBlock(index: number) {
    if (disabled) return;
    setOrder((prev) => [...prev, index]);
  }

  function removeAt(position: number) {
    if (disabled) return;
    setOrder((prev) => prev.filter((_, i) => i !== position));
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">Tap the blocks to build the sentence.</p>
      <div
        data-testid="sentence-build-selected"
        className="flex min-h-12 flex-wrap gap-2 rounded-md border border-dashed border-border p-3"
      >
        {order.length === 0 ? <span className="text-muted-foreground">Tap a block below to start</span> : null}
        {order.map((blockIndex, position) => (
          <button
            key={blockIndex}
            type="button"
            disabled={disabled}
            onClick={() => removeAt(position)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {payload.blocks[blockIndex]}
          </button>
        ))}
      </div>
      <div data-testid="sentence-build-available" className="flex flex-wrap gap-2">
        {remainingIndices.map((index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => addBlock(index)}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
          >
            {payload.blocks[index]}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled || order.length !== payload.blocks.length}
        onClick={() => onSubmit({ order })}
        className="self-start rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-50"
      >
        Check
      </button>
    </div>
  );
}
