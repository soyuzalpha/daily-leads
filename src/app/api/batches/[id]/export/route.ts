import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReport } from "@/lib/excel";
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const batch = await prisma.dailyBatch.findUnique({ where: { id }, include: { leads: true } }); if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 }); const buffer = await createReport(batch, batch.leads); return new NextResponse(buffer as BodyInit, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="daily-leads-${batch.runDate}.xlsx"` } }); }
