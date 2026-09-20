"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import { locales } from "@/lib/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-1" aria-label="Language">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={isPending || l === locale}
          onClick={() => {
            startTransition(async () => {
              await setLocaleAction(l);
              router.refresh();
            });
          }}
          aria-current={l === locale}
          className="rounded px-2 py-1 text-sm font-medium text-foreground/70 hover:text-foreground disabled:text-foreground disabled:underline"
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
