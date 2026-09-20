"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { isPostHogConfigured, publicEnv } from "@/lib/env.public";

let initialized = false;

// STUB: without NEXT_PUBLIC_POSTHOG_KEY (dev), analytics calls are no-ops.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isPostHogConfigured || initialized) return;
    initialized = true;
    posthog.init(publicEnv.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: publicEnv.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }, []);

  if (!isPostHogConfigured) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
