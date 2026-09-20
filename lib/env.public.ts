import { z } from "zod";

// .env files conventionally leave an unset var as "" rather than omitting it, but
// z.string().url().optional() only treats `undefined` as "unset", not "". Normalize first.
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalUrl = () => z.preprocess(emptyToUndefined, z.string().url().optional());

// NEXT_PUBLIC_* values must be referenced as literal `process.env.NEXT_PUBLIC_X` so Next.js
// can inline them at build time. Do not read them through a computed key or a loop.
const schema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://eu.i.posthog.com"),
  // Sentry DSNs are not secrets (they only accept writes), so this is intentionally public.
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl(),
});

export const publicEnv = schema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const isPostHogConfigured = Boolean(publicEnv.NEXT_PUBLIC_POSTHOG_KEY);
