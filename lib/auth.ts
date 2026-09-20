import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { authConfig } from "./auth.config";
import { serverEnv } from "./env.server";

// JWT session strategy (see authConfig): Auth.js never calls the adapter's session methods,
// so the field-shape mismatch between its expected Session model and our domain Session
// model (SPEC.md section 7, "běh lekce") never surfaces. See db/schema.prisma header comment.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: serverEnv.AUTH_SECRET,
});
