import { expect, test } from "@playwright/test";

test("landing page links to sign-in, which shows the email form", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: /get started|sign in/i }).first().click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /send magic link/i })).toBeVisible();
});

test("an unauthenticated visitor is redirected away from /learn", async ({ page }) => {
  await page.goto("/learn");
  await expect(page).toHaveURL(/\/sign-in$/);
});
