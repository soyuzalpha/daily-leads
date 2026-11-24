import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { candidateKey, candidateSchema, discoverPlaces, qualifyWithAI, scoreCandidate } from "@/services/lead-generation";

const requestSchema = z.object({ targetCount: z.number().int().min(1).max(50).default(10), location: z.string().default("Jabodetabek"), industries: z.array(z.string()).min(1).default(["Manufacturing", "FMCG", "Distribution", "Retail", "Food & Beverage"]) });
const jakartaDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
export async function POST(req: NextRequest) {
  try {
    const body = requestSchema.parse(await req.json().catch(() => ({}))); const runDate = jakartaDate();
    const existing = await prisma.dailyBatch.findUnique({ where: { runDate } });
    if (existing?.status === "completed" || existing?.status === "partial") return NextResponse.json({ success: true, batchId: existing.id, targetCount: existing.targetCount, generatedCount: existing.generatedCount, status: existing.status });
    const batch = existing || await prisma.dailyBatch.create({ data: { runDate, targetCount: body.targetCount, status: "running", startedAt: new Date() } });
    if (existing) await prisma.dailyBatch.update({ where: { id: batch.id }, data: { status: "running", startedAt: new Date(), errorMessage: null } });
    const seen = new Set<string>(); let generated = 0; const providerErrors: string[] = [];
    for (const industry of body.industries) { if (generated >= body.targetCount) break; let places; try { places = await discoverPlaces(`${industry} ${body.location} Indonesia`); } catch (error) { providerErrors.push(error instanceof Error ? error.message : "provider error"); continue; }
      for (const place of places) { if (generated >= body.targetCount) break; const key = candidateKey({ companyName: place.companyName, website: place.website, city: place.city }); if (seen.has(key) || await prisma.lead.findUnique({ where: { normalizedKey: key } })) continue; seen.add(key); let ai; try { ai = await qualifyWithAI({ companyName: place.companyName, category: place.category, address: place.address, website: place.website, sourceUrl: place.sourceUrl }); } catch { continue; }
        const candidate = candidateSchema.parse({ ...place, ...ai, sourceName: place.sourceName, sourceUrl: place.sourceUrl }); const scored = scoreCandidate(candidate); await prisma.lead.create({ data: { companyName: candidate.companyName, normalizedKey: key, industry: candidate.industry, businessDescription: candidate.businessDescription, website: candidate.website, email: candidate.email, phone: candidate.phone, address: candidate.address, city: candidate.city, province: candidate.province, postalCode: candidate.postalCode, targetDepartments: JSON.stringify(candidate.targetDepartments), logisticsPotential: candidate.logisticsPotential, suggestedService: candidate.suggestedService, qualificationReason: candidate.qualificationReason, confidenceLevel: candidate.confidenceLevel, leadScore: scored.score, leadCategory: scored.category, sourceName: candidate.sourceName, sourceUrl: candidate.sourceUrl, verifiedAt: new Date(), batchId: batch.id } }); generated++; }
    }
    const status = generated >= body.targetCount ? "completed" : generated > 0 ? "partial" : "failed"; const updated = await prisma.dailyBatch.update({ where: { id: batch.id }, data: { status, generatedCount: generated, completedAt: new Date(), errorMessage: providerErrors.length ? providerErrors.join("; ").slice(0, 1000) : null } });
    if (status === "failed") return NextResponse.json({ success: false, batchId: updated.id, targetCount: body.targetCount, generatedCount: generated, status, error: "No valid leads generated. Check provider and AI configuration." }, { status: 502 });
    return NextResponse.json({ success: true, batchId: updated.id, targetCount: body.targetCount, generatedCount: generated, status });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 }); }
}
