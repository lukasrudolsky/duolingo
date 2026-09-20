"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ padding: 32, textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p>The error has been reported. Please try again.</p>
        </div>
      </body>
    </html>
  );
}
