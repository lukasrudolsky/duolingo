import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";

export default async function LearnPage() {
  const t = await getTranslations("Learn");
  const tracks = await prisma.track.findMany({
    orderBy: { code: "asc" },
    include: { _count: { select: { units: true } } },
  });

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      <ul className="flex flex-col gap-3">
        {tracks.map((track) => (
          <li
            key={track.id}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <span className="font-semibold">{track.title}</span>
            <span className="text-sm text-muted-foreground">
              {t("unitsCount", { count: track._count.units })}
            </span>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
        <p className="font-semibold">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    </section>
  );
}
