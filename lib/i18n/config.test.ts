import { describe, expect, it } from "vitest";
import { defaultLocale, isLocale, locales } from "./config";

describe("isLocale", () => {
  it("accepts every configured locale", () => {
    for (const locale of locales) {
      expect(isLocale(locale)).toBe(true);
    }
  });

  it("rejects unknown or missing values", () => {
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale("")).toBe(false);
  });

  it("keeps the default locale in the configured list", () => {
    expect(locales).toContain(defaultLocale);
  });
});
