import { readFileSync } from "node:fs";
import { DEV_SERVER_LOG_PATH } from "../../playwright.config";

/** Polls the dev server's log for the magic link it printed for `email` (see
 * lib/auth.config.ts's dev fallback), returning the most recent one. */
export async function waitForMagicLink(email: string, timeoutMs = 15_000): Promise<string> {
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `\\[dev\\] Magic link for ${escapedEmail}:\\nhttp://localhost:3100/api/auth/callback/resend\\?[^\\s]+`,
    "g",
  );

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const log = readFileSync(DEV_SERVER_LOG_PATH, "utf8");
      const matches = [...log.matchAll(pattern)];
      const last = matches.at(-1)?.[0];
      if (last) {
        return last.split("\n")[1];
      }
    } catch {
      // Log file may not exist yet on the very first poll.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Magic link for ${email} did not appear in ${DEV_SERVER_LOG_PATH} within ${timeoutMs}ms`);
}
