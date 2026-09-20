import * as Sentry from "@sentry/nextjs";

// Server and edge runtime init. See instrumentation-client.ts for the browser side.
// dsn is undefined in dev (NEXT_PUBLIC_SENTRY_DSN unset), which makes the SDK a no-op.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
