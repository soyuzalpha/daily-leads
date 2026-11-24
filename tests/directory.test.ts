import { describe, expect, it } from "vitest";
import { parseDirectoryHtml } from "../src/services/lead-generation";

const fixture = `<!doctype html><a href="/company/nav">Jakarta</a>
<div class="company-row"><div class="company-row__identity"><h3 class="company-row__name"><a href="/company/contoh">PT Contoh Manufaktur</a></h3></div><p class="company-row__description">Produsen komponen industri</p><p class="company-row__address">Kawasan Industri, Kota Bekasi, Jawa Barat</p><p>Telepon 021-88990011</p></div>
<div class="company-row"><h3 class="company-row__name"><a href="/company/luar">PT Contoh Luar Area</a></h3><p class="company-row__description">Distributor</p><p class="company-row__address">Surabaya, Jawa Timur</p></div>`;

describe("Indonetwork directory parsing", () => {
  it("extracts only Jabodetabek company rows, not navigation or unrelated listings", () => {
    expect(parseDirectoryHtml(fixture, "https://www.indonetwork.co.id/s/dki-jakarta/k/fabrikasi/perusahaan", "Jakarta", "DKI Jakarta")).toEqual([
      expect.objectContaining({ companyName: "PT Contoh Manufaktur", city: "Bekasi", province: "Jawa Barat", phone: "021-88990011", sourceName: "Indonetwork public directory", sourceUrl: "https://www.indonetwork.co.id/company/contoh" }),
    ]);
  });
});
