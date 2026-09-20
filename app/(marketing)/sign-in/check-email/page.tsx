import { getTranslations } from "next-intl/server";

export default async function CheckEmailPage() {
  const t = await getTranslations("SignIn");

  return (
    <section className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{t("checkEmailTitle")}</h1>
      <p className="text-muted-foreground">{t("checkEmailBody")}</p>
    </section>
  );
}
