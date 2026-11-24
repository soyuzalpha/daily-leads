import nodemailer from "nodemailer";
export function recipients() { return (process.env.MARKETING_EMAILS || "").split(",").map(x => x.trim()).filter(Boolean); }
export async function sendReport(input: { runDate: string; count: number; attachment: Buffer; recipient: string }) {
  for (const name of ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"]) if (!process.env[name]) throw new Error(`SMTP_SETUP_REQUIRED: set ${name}`);
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT || 587) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
  return transporter.sendMail({ from: process.env.SMTP_FROM, to: input.recipient, subject: `Daily Logistics Prospect Report - ${input.runDate}`, text: `Selamat pagi,\n\nBerikut laporan ${input.count} calon perusahaan potensial untuk prospecting tim Marketing.\n\nGeographic coverage: Jabodetabek\nGeneration date: ${input.runDate}\n\nRegards,\nDaily Lead Intelligence System`, attachments: [{ filename: `daily-leads-${input.runDate}.xlsx`, content: input.attachment }] });
}
