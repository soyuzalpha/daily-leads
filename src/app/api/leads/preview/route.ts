import { NextRequest, NextResponse } from "next/server";
import { discoverDirectory } from "@/services/lead-generation";
export async function GET(req: NextRequest) {
  const limit = Math.min(20, Math.max(1, Number(new URL(req.url).searchParams.get("limit") || 10)));
  try {
    const candidates = await discoverDirectory("Manufacturing Jabodetabek");
    const preview = candidates.slice(0, limit).map(c => ({ companyName: c.companyName, address: c.address, city: c.city, province: c.province, website: c.website, phone: c.phone, category: c.category, sourceName: c.sourceName, sourceUrl: c.sourceUrl }));
    return NextResponse.json({ provider: "Indonetwork public directory", count: preview.length, candidates: preview });
  } catch (error) {
    return NextResponse.json({ provider: "Indonetwork public directory", error: error instanceof Error ? error.message : "Discovery failed" }, { status: 502 });
  }
}
