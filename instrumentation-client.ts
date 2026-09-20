import * as Sentry from "@sentry/nextjs";

// dsn is undefined in dev (NEXT_PUBLIC_SENTRY_DSN unset), which makes the SDK a no-op.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
