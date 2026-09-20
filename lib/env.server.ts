import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required, run: npx auth secret"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("onboarding@dev.local"),
});

function loadServerEnv() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${parsed.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data;
}

export const serverEnv = loadServerEnv();

/** Google OAuth is only offered when both credentials are configured (SPEC.md section 0). */
export const isGoogleAuthConfigured = Boolean(
  serverEnv.AUTH_GOOGLE_ID && serverEnv.AUTH_GOOGLE_SECRET,
);

/** Without a Resend key, magic links are logged to the server console instead of emailed. */
export const isEmailProviderConfigured = Boolean(serverEnv.RESEND_API_KEY);
