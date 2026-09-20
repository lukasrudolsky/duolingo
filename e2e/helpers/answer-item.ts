import type { Locator, Page } from "@playwright/test";

/** Waits briefly for at least one match, rather than checking the DOM synchronously: the
 * lesson runner swaps to the next item via client-side state, not a navigation, so there's
 * no page load event to wait on. */
async function isPresent(locator: Locator, timeout = 2_000): Promise<boolean> {
  try {
    await locator.first().waitFor({ state: "visible", timeout });
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

  if (await isPresent(showAnswerButton)) {
    // FLASHCARD: reveal, then grade.
    await showAnswerButton.click();
    await page.getByRole("button", { name: "Good" }).click();
    return;
  }

  if (await isPresent(textInput)) {
    // OPEN_CLOZE / WORD_FORMATION / TYPE_THE_WORD / KEY_WORD_TRANSFORMATION.
    await textInput.fill("test answer");
    await page.getByRole("button", { name: "Check" }).click();
    return;
  }

  if (await isPresent(collocationLeft)) {
    const collocationRight = page.getByTestId("collocation-right").locator("button");
    const pairCount = await collocationLeft.count();
    for (let i = 0; i < pairCount; i++) {
      await collocationLeft.nth(i).click();
      await collocationRight.nth(i).click();
    }
    await page.getByRole("button", { name: "Check" }).click();
    return;
  }

  if (await isPresent(sentenceAvailable)) {
    let remaining = await sentenceAvailable.count();
    while (remaining > 0) {
      await sentenceAvailable.first().click();
      remaining = await sentenceAvailable.count();
    }
    await page.getByRole("button", { name: "Check" }).click();
    return;
  }

  if (await isPresent(numberedChoice)) {
    // MCQ_CLOZE / ODD_ONE_OUT: pick the first option.
    await numberedChoice.click();
    return;
  }

  throw new Error("answerCurrentItem: could not detect exercise type on screen");
}
