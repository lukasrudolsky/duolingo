import type { Locator, Page } from "@playwright/test";

/** Waits briefly for at least one match to be visible *and* enabled, rather than checking
 * the DOM synchronously: the lesson runner swaps to the next item via client-side state, not
 * a navigation, and the just-answered item's controls stay in the DOM in a disabled state for
 * a beat during that transition (matching accessible name, e.g. two OPEN_CLOZE items in a
 * row) - visibility alone isn't enough to tell "old, disabled" from "new, ready". */
async function isPresent(locator: Locator, timeout = 2_000): Promise<boolean> {
  const deadline = Date.now() + timeout;
  try {
    const el = locator.first();
    await el.waitFor({ state: "visible", timeout });
    while (await el.isDisabled()) {
      if (Date.now() > deadline) return false;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Answers whichever exercise is currently on screen, without knowing its type ahead of time.
 * The goal is to exercise the full lesson flow end to end (SPEC.md's "kritická uživatelská
 * cesta"), not to assert correctness of any one answer - the lesson runner shows feedback
 * regardless of whether the answer was right.
 */
export async function answerCurrentItem(page: Page): Promise<void> {
  const showAnswerButton = page.getByRole("button", { name: "Show answer" });
  const textInput = page.locator('input[type="text"]');
  const collocationLeft = page.getByTestId("collocation-left").locator("button");
  const sentenceAvailable = page.getByTestId("sentence-build-available").locator("button");
  const numberedChoice = page.getByRole("button", { name: /^1/ });

  // Every action below targets `.first()`, never the bare multi-match locator: the lesson
  // advances via client-side state, not navigation, so the outgoing item's elements (same
  // accessible name, e.g. two OPEN_CLOZE items in a row) can still be mid-unmount in the DOM
  // for a frame after the next item's are already present, which trips Playwright's strict
  // mode on a bare `.fill()`/`.click()`.

  if (await isPresent(showAnswerButton)) {
    // FLASHCARD: reveal, then grade.
    await showAnswerButton.first().click();
    await page.getByRole("button", { name: "Good" }).first().click();
    return;
  }

  if (await isPresent(textInput)) {
    // OPEN_CLOZE / WORD_FORMATION / TYPE_THE_WORD / KEY_WORD_TRANSFORMATION.
    await textInput.first().fill("test answer");
    await page.getByRole("button", { name: "Check" }).first().click();
    return;
  }

  if (await isPresent(collocationLeft)) {
    const collocationRight = page.getByTestId("collocation-right").first().locator("button");
    const leftScoped = page.getByTestId("collocation-left").first().locator("button");
    const pairCount = await leftScoped.count();
    for (let i = 0; i < pairCount; i++) {
      await leftScoped.nth(i).click();
      await collocationRight.nth(i).click();
    }
    await page.getByRole("button", { name: "Check" }).first().click();
    return;
  }

  if (await isPresent(sentenceAvailable)) {
    const availableScoped = page.getByTestId("sentence-build-available").first().locator("button");
    let remaining = await availableScoped.count();
    while (remaining > 0) {
      await availableScoped.first().click();
      remaining = await availableScoped.count();
    }
    await page.getByRole("button", { name: "Check" }).first().click();
    return;
  }

  if (await isPresent(numberedChoice)) {
    // MCQ_CLOZE / ODD_ONE_OUT: pick the first option.
    await numberedChoice.first().click();
    return;
  }

  throw new Error("answerCurrentItem: could not detect exercise type on screen");
}
