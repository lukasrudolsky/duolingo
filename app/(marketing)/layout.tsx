import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          C1 Prep
        </Link>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Link
            href="/sign-in"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {t("Nav.signIn")}
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        {t("Footer.disclaimer")}
      </footer>
    </div>
  );
}
