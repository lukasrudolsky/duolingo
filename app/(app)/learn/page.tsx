import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";

export default async function LearnPage() {
  const t = await getTranslations("Learn");
  const tracks = await prisma.track.findMany({
    orderBy: { code: "asc" },
    include: { units: { include: { skills: { include: { lessons: true } } } } },
  });

  const hasAnyUnits = tracks.some((track) => track.units.length > 0);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      <ul className="flex flex-col gap-3">
        {tracks.map((track) => {
          const firstLesson = track.units
            .flatMap((unit) => unit.skills)
            .flatMap((skill) => skill.lessons)
            .at(0);

          return (
            <li
              key={track.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div>
                <p className="font-semibold">{track.title}</p>
                <p className="text-sm text-muted-foreground">{t("unitsCount", { count: track.units.length })}</p>
              </div>
              {firstLesson ? (
                <Link
                  href={`/lesson/${firstLesson.id}`}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  {t("startLesson")}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>

      {!hasAnyUnits ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
          <p className="font-semibold">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyBody")}</p>
        </div>
      ) : null}
    </section>
  );
}
