import { describe, expect, it } from "vitest";
import { normalizeKey, scoreLead } from "../src/lib/leads";

describe("lead identity and scoring", () => {
  it("normalizes domain and company identity consistently", () => {
    expect(normalizeKey({ companyName: "PT. Contoh Indonesia", website: "https://www.contoh.co.id/", city: "Bekasi" }))
      .toBe("contoh.co.id|pt contoh indonesia|bekasi");
  });
  it("calculates the weighted score, clamps it, and labels categories", () => {
    expect(scoreLead({ industry: 30, logistics: 25, scale: 20, geography: 15, contact: 10 })).toEqual({ score: 100, category: "high" });
    expect(scoreLead({ industry: 30, logistics: 20, scale: 10, geography: 10, contact: 0 })).toEqual({ score: 70, category: "medium" });
    expect(scoreLead({ industry: -1, logistics: 0, scale: 0, geography: 0, contact: 0 }).score).toBe(0);
  });
});
