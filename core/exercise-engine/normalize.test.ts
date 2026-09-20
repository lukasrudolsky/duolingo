import { describe, expect, it } from "vitest";
import {
  expandContractions,
  levenshteinDistance,
  matchAcceptedAnswer,
  normalizeAnswer,
  typoDistance,
} from "./normalize";

describe("normalizeAnswer", () => {
  it("trims, lowercases and collapses whitespace", () => {
    expect(normalizeAnswer("  Assessment  \n")).toBe("assessment");
    expect(normalizeAnswer("wish   I  had")).toBe("wish i had");
  });
});

describe("expandContractions", () => {
  it("expands common contractions after normalizing", () => {
    expect(expandContractions("Isn't")).toBe("is not");
    expect(expandContractions("I'd have gone")).toBe("i would have gone");
  });

  it("leaves text without contractions untouched (besides normalization)", () => {
    expect(expandContractions("wish I had asked for")).toBe("wish i had asked for");
  });
});

describe("levenshteinDistance", () => {
  it("is 0 for identical strings", () => {
    expect(levenshteinDistance("assessment", "assessment")).toBe(0);
  });

  it("counts single-character edits", () => {
    expect(levenshteinDistance("cat", "cats")).toBe(1);
    expect(levenshteinDistance("cat", "bat")).toBe(1);
    expect(levenshteinDistance("cat", "at")).toBe(1);
  });
});

describe("typoDistance", () => {
  it("counts an adjacent transposition as a single edit, unlike plain Levenshtein", () => {
    expect(typoDistance("recieve", "receive")).toBe(1);
    expect(levenshteinDistance("recieve", "receive")).toBe(2);
  });
});

describe("matchAcceptedAnswer", () => {
  it("matches exactly regardless of case", () => {
    expect(matchAcceptedAnswer("Assessment", ["assessment"])).toBe("exact");
  });

  it("flags a plausible typo as close, not exact", () => {
    expect(matchAcceptedAnswer("assesment", ["assessment"])).toBe("close");
    expect(matchAcceptedAnswer("recieve", ["receive"])).toBe("close");
  });

  it("rejects a genuinely wrong word as none, even a short one", () => {
    expect(matchAcceptedAnswer("on", ["up"])).toBe("none");
    expect(matchAcceptedAnswer("decision", ["assessment"])).toBe("none");
  });

  it("treats an empty response as none", () => {
    expect(matchAcceptedAnswer("", ["up"])).toBe("none");
    expect(matchAcceptedAnswer("   ", ["up"])).toBe("none");
  });

  it("accepts any of several accepted answers", () => {
    expect(matchAcceptedAnswer("assessing", ["assessment", "assessing"])).toBe("exact");
  });
});
