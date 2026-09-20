export const locales = ["en", "cs"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Locale is a per-visitor preference stored in a cookie, not part of the URL (SPEC.md
// section 1 target user studies on mobile; URL-based locale routing adds no value here
// and would mean duplicating every route under app/[locale]).
export const localeCookieName = "NEXT_LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}
