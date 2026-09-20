import Link from "next/link";

export function LessonSummary({ correctCount, totalItems }: { correctCount: number; totalItems: number }) {
  const isPerfect = totalItems > 0 && correctCount === totalItems;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Lesson complete</h1>
      <p className="text-lg">
        {correctCount} / {totalItems} correct
      </p>
      {isPerfect ? <p className="font-semibold text-primary">Perfect run!</p> : null}
      <Link href="/learn" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
        Back to learning path
      </Link>
    </div>
  );
}
