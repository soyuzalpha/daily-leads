import { z } from "zod";
import { normalizeKey, scoreLead } from "@/lib/leads";
import * as cheerio from "cheerio";

export const INDUSTRIES = ["Manufacturing", "FMCG", "Distribution", "Retail", "Food & Beverage", "Pharmaceutical", "Automotive", "E-commerce", "Agriculture", "Mining & Energy"] as const;
export const candidateSchema = z.object({
  companyName: z.string().min(2), industry: z.string().min(2), businessDescription: z.string().optional(),
  website: z.string().url().optional().nullable(), email: z.string().email().optional().nullable(), phone: z.string().optional().nullable(),
  address: z.string().min(3), city: z.string().min(2), province: z.string().optional().nullable(), postalCode: z.string().optional().nullable(),
  targetDepartments: z.array(z.enum(["Procurement", "Vendor Management", "Carrier Management"])),
  logisticsPotential: z.string().min(1), suggestedService: z.string().optional(), qualificationReason: z.string().min(1),
  confidenceLevel: z.enum(["high", "medium", "low", "unknown"]),
  scoreCriteria: z.object({ industry: z.number().min(0).max(30), logistics: z.number().min(0).max(25), scale: z.number().min(0).max(20), geography: z.number().min(0).max(15), contact: z.number().min(0).max(10) }),
  sourceName: z.string().min(1), sourceUrl: z.string().url(),
});
export type QualifiedCandidate = z.infer<typeof candidateSchema>;
export function scoreCandidate(c: QualifiedCandidate) { return scoreLead(c.scoreCriteria); }
export function candidateKey(c: Pick<QualifiedCandidate, "companyName" | "website" | "city">) { return normalizeKey(c); }

export async function qualifyWithAI(input: { companyName: string; category: string; address: string; website?: string | null; sourceUrl: string }) {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error("AI_SETUP_REQUIRED: set AI_API_KEY before live qualification");
  const base = process.env.AI_BASE_URL || "https://api.hemattoken.id/v1";
  const response = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.AI_MODEL, temperature: 0, response_format: { type: "json_object" }, messages: [
      { role: "system", content: `You qualify public business leads for logistics prospecting in Indonesian. Never invent facts or contacts. Inferences must say potential/possible. Return JSON matching this shape: {industry,businessDescription,targetDepartments:string[],logisticsPotential,suggestedService,qualificationReason,confidenceLevel,scoreCriteria:{industry:0-30,logistics:0-25,scale:0-20,geography:0-15,contact:0-10}}. If unsupported use unknown/zero. Departments: Procurement, Vendor Management, Carrier Management.` },
      { role: "user", content: JSON.stringify(input) },
    ] }), signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`AI provider returned HTTP ${response.status}`);
  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI provider returned empty qualification");
  return z.object({ industry: z.string(), businessDescription: z.string().optional(), targetDepartments: z.array(z.enum(["Procurement", "Vendor Management", "Carrier Management"])), logisticsPotential: z.string(), suggestedService: z.string().optional(), qualificationReason: z.string(), confidenceLevel: z.enum(["high", "medium", "low", "unknown"]), scoreCriteria: candidateSchema.shape.scoreCriteria }).parse(JSON.parse(text));
}

const DIRECTORY = "https://www.indonetwork.co.id";
const pages = [
  { url: `${DIRECTORY}/s/dki-jakarta/k/fabrikasi/perusahaan`, cityHint: "Jakarta", provinceHint: "DKI Jakarta" },
  { url: `${DIRECTORY}/s/dki-jakarta/k/mesin-peralatan-industri/perusahaan`, cityHint: "Jakarta", provinceHint: "DKI Jakarta" },
  { url: `${DIRECTORY}/s/banten/k/manufaktur/perusahaan`, cityHint: "Tangerang", provinceHint: "Banten" },
  { url: `${DIRECTORY}/s/jawa-barat/k/manufaktur/perusahaan`, cityHint: "Bekasi", provinceHint: "Jawa Barat" },
];
const cityFromText = (text: string, fallback: string) => {
  const s = text.toLowerCase();
  for (const city of ["Jakarta Selatan", "Jakarta Timur", "Jakarta Barat", "Jakarta Utara", "Jakarta Pusat", "Tangerang Selatan", "Tangerang", "Kabupaten Bekasi", "Bekasi", "Depok", "Kabupaten Bogor", "Bogor"]) if (s.includes(city.toLowerCase())) return city;
  return fallback;
};
export function parseDirectoryHtml(html: string, pageUrl: string, cityHint: string, provinceHint: string) {
  const $ = cheerio.load(html); const candidates = new Map<string, { id: string; companyName: string; address: string; city: string; province: string; website: string | null; phone: string | null; category: string; sourceName: string; sourceUrl: string }>();
  $(".company-row").each((_, element) => {
    const row = $(element); const link = row.find(".company-row__name a").first(); const href = link.attr("href"); const companyName = link.text().trim();
    const description = row.find(".company-row__description").text().trim(); const address = row.find(".company-row__address").text().trim() || row.text().match(/Alamat\s*([^\n]+?)(?:Telepon|WhatsApp|$)/i)?.[1]?.trim() || "";
    if (!href || !companyName || !address || !/jakarta|tangerang|bekasi|depok|bogor/i.test(address)) return;
    const sourceUrl = href.startsWith("http") ? href : `${DIRECTORY}${href}`;
    const websiteRaw = row.find('a[href^="http"]').toArray().map(a => $(a).attr("href") || "").find(x => !x.includes("indonetwork.co.id"));
    const phone = row.text().match(/Telepon\s+([+\d][\d\s()-]{6,})/i)?.[1]?.trim() || null;
    const city = cityFromText(address, cityHint);
    const item = { id: href, companyName, address, city, province: /jakarta/i.test(address) ? "DKI Jakarta" : /jawa barat/i.test(address) ? "Jawa Barat" : /banten|tangerang/i.test(address) ? "Banten" : provinceHint, website: websiteRaw || null, phone, category: description || "business", sourceName: "Indonetwork public directory", sourceUrl };
    candidates.set(href, item);
  });
  return [...candidates.values()];
}
export async function discoverDirectory(query: string) {
  const categoryPath = /manufactur|factory|pabrik/i.test(query) ? "mesin-peralatan-industri" : /food|f&b|makanan/i.test(query) ? "makanan-minuman" : /distribution|distributor/i.test(query) ? "distributor" : "fabrikasi";
  const selected = pages;
  const candidates = new Map<string, ReturnType<typeof parseDirectoryHtml>[number]>();
  for (const page of selected) {
    const url = page.url.replace(/\/k\/[^/]+\//, `/k/${categoryPath}/`);
    const response = await fetch(url, { headers: { "user-agent": "DailyLeadIntelligence/1.0 (public business directory discovery)" }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Indonetwork directory returned HTTP ${response.status}`);
    const html = await response.text(); if (html.length > 5_000_000) throw new Error("Directory response exceeds size limit");
    for (const candidate of parseDirectoryHtml(html, url, page.cityHint, page.provinceHint)) candidates.set(candidate.id, candidate);
  }
  return [...candidates.values()].slice(0, 40);
}
export const discoverPlaces = discoverDirectory;

