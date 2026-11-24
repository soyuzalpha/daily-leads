# Deploy to Dokploy

## 1. Create application
- Push this project to a Git repository reachable by Dokploy.
- Dokploy → Project → Create Service → Application → select the repository/branch.
- Build type: Dockerfile; Dockerfile path: `./Dockerfile`; build context: repository root.
- Alternatively create a Docker Compose service and use `docker-compose.yml` in the repo root.
- Do not deploy through Cloudflare Tunnel directly. Dokploy's Traefik routes the app; the existing Cloudflare DNS record can proxy to the Dokploy host.

## 2. Runtime environment
Set these in Dokploy service Environment Variables (do not commit secrets):
- `DATABASE_URL=file:/app/data/leads.db` (fixed for the SQLite persistent volume)
- `APP_URL=https://YOUR_HOSTNAME`
- `AI_BASE_URL=https://api.hemattoken.id/v1`
- `AI_API_KEY=...` and `AI_MODEL=...` (needed for AI classification and saved leads)
- SMTP settings and `MARKETING_EMAILS` only if enabling report delivery.
- `CRON_SECRET` only when configuring the protected cron route.

Neither `GOOGLE_PLACES_API_KEY` nor `SEARCH_API_KEY` is needed for current Indonetwork directory preview/discovery.

## 3. Persistent database
Mount a named volume at `/app/data`. The compose example declares `lead-data:/app/data`; keep it when deploying. The container runs `prisma migrate deploy` at startup. Back up the named volume before replacing it or changing the schema.

## 4. Domain
- In Dokploy service → Domains → Add Domain.
- Set the hostname, service/container port `3000`, HTTPS enabled.
- For Cloudflare DNS, use a proxied CNAME to the Dokploy/Traefik hostname or the IP/record your server setup requires. Keep Cloudflare SSL/TLS mode Full (strict) when origin cert is configured.
- If using the included Compose file, replace `leads.example.com` in the Traefik Host label with your real hostname, or set `DLI_DOMAIN` in the Compose environment. Avoid defining both Dokploy-managed domains and manual router labels unless you know the router names do not conflict.

## 5. Test after deployment
- Open `https://YOUR_HOSTNAME`.
- Test public directory preview: `GET /api/leads/preview?limit=3`.
- Test generation only after setting AI variables; use a small target count first.
- Verify XLSX download and SMTP separately.

Current limitations: preview uses public Indonetwork listings; provider HTML can change or rate-limit. Google Places and Search API adapters/keys are not required. The application still needs auth hardening before exposing admin/generation routes publicly.
