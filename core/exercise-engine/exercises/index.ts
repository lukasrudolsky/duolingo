import { registerExerciseType } from "../registry";
import { mcqClozeType } from "./mcq-cloze";
import { openClozeType } from "./open-cloze";
import { wordFormationType } from "./word-formation";
import { keyWordTransformationType } from "./key-word-transformation";
import { flashcardType } from "./flashcard";
import { typeTheWordType } from "./type-the-word";
import { collocationMatchType } from "./collocation-match";
import { oddOneOutType } from "./odd-one-out";
import { sentenceBuildType } from "./sentence-build";

// Side-effecting on purpose: importing this module registers every exercise type implemented
// so far (Phase 1, SPEC.md sections 4.1 and 4.2). The remaining ItemType values are added by
// later phases (see PLAN.md) and throw via getExerciseType() until then.
registerExerciseType(mcqClozeType);
registerExerciseType(openClozeType);
registerExerciseType(wordFormationType);
registerExerciseType(keyWordTransformationType);
registerExerciseType(flashcardType);
registerExerciseType(typeTheWordType);
registerExerciseType(collocationMatchType);
registerExerciseType(oddOneOutType);
registerExerciseType(sentenceBuildType);
