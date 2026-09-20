import { useId } from "react";
import Link from "next/link";

export function LessonSummary({ correctCount, totalItems }: { correctCount: number; totalItems: number }) {
  const isPerfect = totalItems > 0 && correctCount === totalItems;
  const percent = totalItems > 0 ? correctCount / totalItems : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);
  const gradientId = useId();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <div className="anim-pop-in relative flex h-32 w-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gradient-primary-from)" />
              <stop offset="55%" stopColor="var(--gradient-primary-via)" />
              <stop offset="100%" stopColor="var(--gradient-primary-to)" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-muted" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            stroke={isPerfect ? "var(--success)" : `url(#${gradientId})`}
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          />
        </svg>
        <span className="absolute text-2xl font-bold">
          {correctCount}/{totalItems}
        </span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Lesson complete</h1>
      <p className="text-sm text-muted-foreground">
        {correctCount} / {totalItems} correct
      </p>

      {isPerfect ? (
        <p className="anim-pop-in inline-flex items-center gap-1.5 rounded-full border border-success bg-success-soft px-3 py-1 text-sm font-semibold text-success">
          Perfect run!
        </p>
      ) : (
        <p className="text-muted-foreground">Nice work. Keep practicing to master this skill.</p>
      )}

      <Link
        href="/learn"
        className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      >
        Back to learning path
      </Link>
    </div>
  );
}
