import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth, signIn } from "@/lib/auth";
import { isGoogleAuthConfigured } from "@/lib/env.server";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/learn");
  }

  const t = await getTranslations("SignIn");

  return (
    <section className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-24">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      <form
        action={async (formData: FormData) => {
          "use server";
          await signIn("resend", formData);
        }}
        className="flex flex-col gap-3"
      >
        <label htmlFor="email" className="text-sm font-medium">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          className="rounded-md border border-border bg-background px-3 py-2 transition-colors focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
        >
          {t("submit")}
        </button>
      </form>

      {isGoogleAuthConfigured ? (
        <>
          <div className="text-center text-sm text-muted-foreground">{t("or")}</div>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/learn" });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-full border border-border px-4 py-2 font-semibold transition-colors hover:border-primary"
            >
              {t("googleButton")}
            </button>
          </form>
        </>
      ) : null}
    </section>
  );
}
