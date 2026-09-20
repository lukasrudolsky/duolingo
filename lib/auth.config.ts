import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { isEmailProviderConfigured, isGoogleAuthConfigured, serverEnv } from "./env.server";

// Split from auth.ts on purpose (Auth.js convention): this file has no Prisma adapter, so it
// can be imported from edge middleware. lib/auth.ts adds the adapter for the Node runtime.
export const authConfig = {
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/check-email",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // JWT strategy doesn't expose the user id on session.user by default; token.sub is the
    // user id under this strategy (see lib/auth.d.ts for the matching type augmentation).
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  providers: [
    Resend({
      apiKey: serverEnv.RESEND_API_KEY,
      from: serverEnv.EMAIL_FROM,
      // STUB: without a Resend key (dev), log the magic link instead of emailing it.
      ...(isEmailProviderConfigured
        ? {}
        : {
            sendVerificationRequest: ({ identifier, url }) => {
              console.log(`\n[dev] Magic link for ${identifier}:\n${url}\n`);
            },
          }),
    }),
    // Google button only appears once AUTH_GOOGLE_ID/SECRET are set (SPEC.md section 0).
    ...(isGoogleAuthConfigured
      ? [
          Google({
            clientId: serverEnv.AUTH_GOOGLE_ID,
            clientSecret: serverEnv.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
} satisfies NextAuthConfig;
