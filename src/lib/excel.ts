import ExcelJS from "exceljs";
import type { Lead, DailyBatch } from "@prisma/client";

const columns = ["Company Name", "Industry", "Business Description", "Address", "City", "Province", "Website", "Public Email", "Public Phone", "Target Department", "Logistics Potential", "Suggested Service", "Lead Score", "Lead Category", "Qualification Reason", "Source Name", "Source URL", "Verified Date"];
const safe = (value: unknown) => { const text = value == null || value === "" ? "Not Available" : String(value); return /^[=+\-@]/.test(text) ? `'${text}` : text; };
export async function createReport(batch: DailyBatch, leads: Lead[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Daily Leads");
  sheet.addRow(columns); sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }; sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16324F" } }; sheet.views = [{ state: "frozen", ySplit: 1 }]; sheet.autoFilter = { from: "A1", to: `R${Math.max(1, leads.length + 1)}` };
  for (const lead of leads) { const row = sheet.addRow([lead.companyName, lead.industry, lead.businessDescription, lead.address, lead.city, lead.province, lead.website, lead.email, lead.phone, lead.targetDepartments, lead.logisticsPotential, lead.suggestedService, lead.leadScore, lead.leadCategory, lead.qualificationReason, lead.sourceName, lead.sourceUrl, lead.verifiedAt]); row.eachCell(cell => { cell.value = safe(cell.value); }); if (lead.website) row.getCell(7).value = { text: lead.website, hyperlink: lead.website }; if (lead.sourceUrl) row.getCell(17).value = { text: lead.sourceUrl, hyperlink: lead.sourceUrl }; }
  sheet.columns.forEach(column => { column.width = Math.min(45, Math.max(14, String(column.header || "").length + 4)); });
  const summary = workbook.addWorksheet("Summary"); summary.addRows([["Generation Date", batch.runDate], ["Target Count", batch.targetCount], ["Actual Qualified Lead Count", leads.length], ["Batch Status", batch.status], [], ["Industry", "Count"], ...Object.entries(Object.groupBy(leads, x => x.industry)).map(([k, v]) => [k, v?.length ?? 0]), [], ["City", "Count"], ...Object.entries(Object.groupBy(leads, x => x.city)).map(([k, v]) => [k, v?.length ?? 0])]); summary.getColumn(1).width = 32; summary.getColumn(2).width = 22; summary.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}
