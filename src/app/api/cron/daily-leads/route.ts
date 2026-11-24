import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) { const expected = process.env.CRON_SECRET; const auth = req.headers.get("authorization") || ""; if (!expected || auth.length !== `Bearer ${expected}`.length || !timingSafeEqual(Buffer.from(auth), Buffer.from(`Bearer ${expected}`))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json({ message: "Use POST /api/leads/generate to execute the configured daily workflow." }); }
export async function GET() { return NextResponse.json({ endpoint: "/api/cron/daily-leads", schedule: "0 0 * * * UTC (07:00 Asia/Jakarta)" }); }
