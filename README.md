# Daily Lead Intelligence

MVP Next.js/TypeScript untuk menemukan dan mengkualifikasi prospek B2B di Jabodetabek.

## Setup

```bash
cp .env.example .env
# isi GOOGLE_PLACES_API_KEY, AI_API_KEY, AI_MODEL, dan konfigurasi SMTP
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

- Discovery saat ini menggunakan directory publik Indonetwork; Google Places dan Search API key tidak diperlukan.
- `.env` wajib untuk AI qualification (AI_API_KEY, AI_MODEL) jika ingin membuat lead qualified.
- Tanpa AI key, run discovery bisa diuji tetapi tidak akan menyimpan lead yang belum dikualifikasi.
- Search provider tambahan tetap opsional dan belum dipakai.

## API utama

- `GET /api/dashboard`
- `GET /api/leads?industry=Manufacturing&city=Bekasi&limit=20`
- `GET /api/leads/preview?limit=10` — ambil preview direktori publik tanpa AI atau API key provider.
- `POST /api/leads/generate` — discovery + AI classification; AI_API_KEY dan AI_MODEL tetap wajib agar leads tersimpan.
- `GET /api/batches/:id/export`
- `POST /api/batches/:id/email` (Bearer CRON_SECRET untuk retry email)
- `POST /api/cron/daily-leads` (Bearer CRON_SECRET)

## Cron

Jadwal 07:00 Asia/Jakarta = 00:00 UTC:

```cron
0 0 * * * curl -fsS -X POST http://localhost:3000/api/cron/daily-leads -H 'Authorization: Bearer YOUR_CRON_SECRET'
```

Endpoint cron masih mengembalikan instruksi; jalankan orchestration dengan `POST /api/leads/generate` dari scheduler setelah deployment. Untuk produksi, tambahkan auth dashboard dan worker/lock database sebelum membuka akses publik.

## Verifikasi

```bash
npm test
npm run lint
npm run build
```

## Backup

SQLite berada di lokasi sesuai `DATABASE_URL`; backup file database dan direktori report persistent sebelum migration. Email dan live discovery belum dapat diverifikasi tanpa credential provider/SMTP yang valid.
