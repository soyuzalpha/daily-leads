export type LeadScoreInput = { industry: number; logistics: number; scale: number; geography: number; contact: number };
export type Candidate = { companyName: string; website?: string | null; city: string };

export function normalizeKey(candidate: Candidate): string {
  let domain = "";
  if (candidate.website) {
    try { domain = new URL(candidate.website.startsWith("http") ? candidate.website : `https://${candidate.website}`).hostname.toLowerCase().replace(/^www\./, ""); }
    catch { domain = ""; }
  }
  const name = candidate.companyName.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const city = candidate.city.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return `${domain}|${name}|${city}`;
}

export function scoreLead(input: LeadScoreInput): { score: number; category: "high" | "medium" | "low" } {
  const score = Math.max(0, Math.min(100, Object.values(input).reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0)));
  return { score, category: score >= 80 ? "high" : score >= 60 ? "medium" : "low" };
}
