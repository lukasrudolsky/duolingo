import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function MarketingPage() {
  const t = await getTranslations("Marketing");

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
      <p className="max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
      <Link
        href="/sign-in"
        className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
      >
        {t("cta")}
      </Link>
    </section>
  );
}
