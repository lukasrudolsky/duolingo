import type { ItemType } from "@prisma/client";
import type { AnyExerciseDefinition } from "./types";

const registry = new Map<ItemType, AnyExerciseDefinition>();

export function registerExerciseType(definition: AnyExerciseDefinition): void {
  registry.set(definition.type, definition);
}

export function isExerciseTypeImplemented(type: ItemType): boolean {
  return registry.has(type);
}

/**
 * Throws for an ItemType that exists in the Prisma enum but has no exercise definition yet
 * (most exam-native types land in later phases, see PLAN.md). This is deliberate: a missing
 * type should fail loudly, not silently render nothing.
 */
export function getExerciseType(type: ItemType): AnyExerciseDefinition {
  const definition = registry.get(type);
  if (!definition) {
    throw new Error(
      `Exercise type "${type}" is not implemented yet. See PLAN.md for which phase adds it.`,
    );
  }
  return definition;
}
