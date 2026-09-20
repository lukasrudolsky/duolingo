"use client";

import type { ItemType } from "@prisma/client";
import { McqClozeRenderer } from "./mcq-cloze-renderer";
import { OpenClozeRenderer } from "./open-cloze-renderer";
import { WordFormationRenderer } from "./word-formation-renderer";
import { KeyWordTransformationRenderer } from "./key-word-transformation-renderer";
import { FlashcardRenderer } from "./flashcard-renderer";
import { TypeTheWordRenderer } from "./type-the-word-renderer";
import { CollocationMatchRenderer } from "./collocation-match-renderer";
import { OddOneOutRenderer } from "./odd-one-out-renderer";
import { SentenceBuildRenderer } from "./sentence-build-renderer";

// The payload shape is only known at runtime (it comes from the Item.payload Json column,
// keyed by ItemType), so this dispatcher trusts it rather than statically narrowing it. Each
// exercise's own payloadSchema already validated the shape server-side before it got here
// (see app/(app)/lesson/[id]/actions.ts).
export function ItemRenderer({
  type,
  payload,
  disabled,
  onSubmit,
  response,
  solution,
}: {
  type: ItemType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  disabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (response: any) => void;
  /** The response just submitted, once graded (see LessonRunner). Used to highlight the
   * picked option for choice-based types; ignored by the rest. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: any;
  /** The graded item's solution, echoed back by submitAttemptAction only after answering
   * (SPEC.md section 9's "before" the user answers is what's protected, not "ever"). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  solution?: any;
}) {
  const choiceReveal =
    response && solution
      ? { selectedIndex: response.selectedIndex, correctIndex: solution.correctIndex ?? solution.oddIndex }
      : null;

  switch (type) {
    case "MCQ_CLOZE":
      return <McqClozeRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} reveal={choiceReveal} />;
    case "OPEN_CLOZE":
      return <OpenClozeRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} />;
    case "WORD_FORMATION":
      return <WordFormationRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} />;
    case "KEY_WORD_TRANSFORMATION":
      return <KeyWordTransformationRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} />;
    case "FLASHCARD":
      return <FlashcardRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} />;
    case "TYPE_THE_WORD":
      return <TypeTheWordRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} />;
    case "COLLOCATION_MATCH":
      return <CollocationMatchRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} />;
    case "ODD_ONE_OUT":
      return <OddOneOutRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} reveal={choiceReveal} />;
    case "SENTENCE_BUILD":
      return <SentenceBuildRenderer payload={payload} disabled={disabled} onSubmit={onSubmit} />;
    default:
      // Reachable once a later-phase ItemType is seeded before its renderer exists.
      return <p className="text-red-600 dark:text-red-400">No renderer yet for exercise type &quot;{type}&quot;.</p>;
  }
}
