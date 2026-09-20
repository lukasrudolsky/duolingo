import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import type { TrackCode } from "@prisma/client";

const TRACK_ICON: Record<TrackCode, React.ReactNode> = {
  READING: (
    <path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM20 5.5C20 4.67 19.33 4 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
  ),
  USE_OF_ENGLISH: <path d="M4 19.5 15 4.5l4.5 3.5L9 20l-5 1 0-1.5Zm9-13.2 4.5 3.5" />,
  LISTENING: (
    <path d="M4 12a8 8 0 0 1 16 0v5a2.5 2.5 0 0 1-2.5 2.5H16v-6h3v-1.5a7 7 0 0 0-14 0V14h3v6H6.5A2.5 2.5 0 0 1 4 17.5v-5Z" />
  ),
  WRITING: <path d="M4 20h16M6 16.5 16.5 6a2 2 0 0 1 2.8 2.8L9 19l-4 1 1-4Z" />,
  SPEAKING: (
    <path d="M12 15a3.5 3.5 0 0 0 3.5-3.5V6.5a3.5 3.5 0 0 0-7 0v5A3.5 3.5 0 0 0 12 15Zm-6-3.5a6 6 0 0 0 12 0M12 18v3" />
  ),
};

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
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {TRACK_ICON[track.code]}
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">{track.title}</p>
                  <p className="text-sm text-muted-foreground">{t("unitsCount", { count: track.units.length })}</p>
                </div>
              </div>
              {firstLesson ? (
                <Link
                  href={`/lesson/${firstLesson.id}`}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
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
