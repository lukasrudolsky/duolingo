import { expect, test } from "@playwright/test";
import { answerCurrentItem } from "./helpers/answer-item";
import { waitForMagicLink } from "./helpers/magic-link";

test("signs in and completes the demo lesson end to end", async ({ page }) => {
  // 12 items x a real Server Action round trip each, plus the magic-link poll, adds up.
  test.setTimeout(120_000);
  const email = `e2e-lesson-${Date.now()}@example.com`;

  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole("button", { name: /send magic link/i }).click();
  await page.getByRole("heading", { name: /check your email/i }).waitFor();

  const magicLink = await waitForMagicLink(email);
  await page.goto(magicLink);

  await page.goto("/learn");
  await page
    .getByRole("link", { name: /start lesson/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/lesson\//);

  // Work through every item in the demo lesson (SPEC.md section 15, Phase 1 acceptance:
  // complete a lesson, see an explanation for each answer, then a summary). Completing the
  // last item triggers an async completeLessonAction before the summary renders, so each
  // loop turn explicitly waits for that transition rather than immediately re-checking for
  // the next item (which would race the still-in-flight request).
  const summaryHeading = page.getByRole("heading", { name: /lesson complete/i });
  for (let i = 0; i < 20; i++) {
    await answerCurrentItem(page);
    const continueButton = page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeVisible();
    await continueButton.click();

    const reachedSummary = await summaryHeading
      .waitFor({ state: "visible", timeout: 3_000 })
      .then(() => true)
      .catch(() => false);
    if (reachedSummary) break;
  }

  await expect(summaryHeading).toBeVisible();
  await expect(page.getByText(/\d+ \/ \d+ correct/)).toBeVisible();
});
