# Daily Lead Intelligence
## Product Specification & System Requirements

**Version:** 1.0  
**Document type:** Product Requirements Document (PRD) + System Requirements  
**Target delivery:** One-day MVP  
**Product type:** Internal B2B prospecting web application  
**Primary users:** Marketing, Sales Manager, IT Administrator  
**Timezone:** Asia/Jakarta

---

## 1. Product Overview

Daily Lead Intelligence is an internal web application that automatically discovers, qualifies, stores, and distributes potential B2B customer leads for a logistics company.

Every morning, the system searches for companies in the Jabodetabek area, evaluates their relevance to the company's logistics services, stores qualified company records, generates an Excel report, and emails that report to the Marketing team.

### 1.1 Product principles

- Find relevant businesses, not arbitrary company lists.
- Prefer public, traceable business information.
- Avoid duplicate companies across daily runs.
- Separate verified facts from AI-generated analysis.
- Never fabricate company details, contacts, logistics needs, or source references.
- Deliver a practical Excel report that Marketing can use for prospecting.
- Keep the MVP small enough to implement and deploy in one working day, assuming API credentials and deployment infrastructure are ready.

### 1.2 Product configuration

| Item | Requirement |
|---|---|
| Product name | Daily Lead Intelligence |
| Product type | Internal web application |
| Primary users | Marketing, Sales Manager, IT Administrator |
| Geographic scope | Jabodetabek, Indonesia |
| Daily target | 10 unique, qualified companies |
| Execution mode | Automatic |
| Schedule | Every day at 07:00 Asia/Jakarta |
| Distribution | Excel XLSX attachment by email |
| Application language | Indonesian |
| Initial database | SQLite |
| MVP deployment | Existing company server or Docker host |

### 1.3 Business objectives

1. Reduce time Marketing spends manually searching for potential customers.
2. Provide a consistent daily prospect list.
3. Identify companies likely to need logistics services.
4. Improve prospecting productivity and customer acquisition.
5. Make lead sources and qualification reasoning auditable.

### 1.4 User roles

| Role | Responsibilities |
|---|---|
| Marketing | Receive reports and contact prospects |
| Sales Manager | Review prospect quality and daily output |
| IT Administrator | Configure integrations, monitor jobs, and troubleshoot failures |

---

## 2. Industry and Lead Targeting Strategy

The system must prioritize businesses whose operations may involve recurring transportation, distribution, warehousing, or third-party logistics requirements.

### 2.1 Target industries

| Priority | Industry | Potential logistics needs |
|---|---|---|
| P1 | Manufacturing | Raw material and finished goods transportation |
| P1 | FMCG | Regular and regional distribution |
| P1 | Distribution | Transportation and warehousing |
| P1 | Retail | Inter-branch and store distribution |
| P2 | Food & Beverage | Product distribution |
| P2 | Pharmaceutical | Specialized transportation and distribution |
| P2 | Automotive | Parts and vehicle logistics |
| P2 | E-commerce | Fulfillment and delivery |
| P3 | Agriculture | Agricultural product transportation |
| P3 | Mining & Energy | Heavy logistics and equipment transportation |

The industry list must be configurable. Do not hardcode it throughout the application.

### 2.2 Target business functions

The system should identify which of these business functions are relevant to each prospect:

**Procurement**
- Potential procurement of transportation or logistics services.
- Possible use of third-party logistics providers.
- Procurement activities related to goods distribution.

**Vendor Management**
- Potential management of multiple logistics or transportation vendors.
- Supplier and transportation partner management.
- Vendor performance and SLA evaluation needs.

**Carrier Management**
- Potential trucking and carrier requirements.
- Intercity or inter-island distribution.
- Third-party fleet or carrier network management.

These are prospecting hypotheses, not verified facts. The system must not claim that a company is actively seeking vendors unless a reliable public source explicitly supports that claim.

### 2.3 Geographic scope

Jabodetabek consists of:
- Jakarta (all administrative cities and regency).
- Bogor (city and regency).
- Depok.
- Tangerang (city and regency).
- South Tangerang.

Store the actual city/regency and province when available. Do not rely only on a broad `Jabodetabek` label.

---

## 3. Functional Requirements

Priority definitions:

- **P0:** Required for MVP.
- **P1:** Useful follow-up after MVP.
- **P2:** Future enhancement.

| ID | Feature | Description | Priority |
|---|---|---|---|
| FR-01 | Lead Discovery | Search companies by industry and location | P0 |
| FR-02 | Data Extraction | Collect public business information and source references | P0 |
| FR-03 | AI Classification | Classify industry and potential logistics relevance | P0 |
| FR-04 | Lead Scoring | Calculate a score from 0 to 100 | P0 |
| FR-05 | Deduplication | Prevent duplicate companies across runs | P0 |
| FR-06 | Lead Database | Persist discovered company records | P0 |
| FR-07 | Excel Export | Generate XLSX daily report | P0 |
| FR-08 | Email Distribution | Email the report to configured recipients | P0 |
| FR-09 | Daily Scheduler | Run automatically every morning | P0 |
| FR-10 | Execution Logs | Persist batch execution and error details | P0 |
| FR-11 | Manual Trigger | Allow an administrator to start a run manually | P1 |
| FR-12 | Lead Assignment | Assign leads to Marketing team members | P1 |
| FR-13 | Lead Status Tracking | Track follow-up and conversion status | P1 |
| FR-14 | Advanced Analytics | Analyze lead and sales performance | P2 |

### 3.1 Daily target behavior

The system should attempt to produce 10 qualified, unique leads per daily run.

- Ten is a target, not permission to fabricate or lower quality standards.
- If only seven valid companies are found, send seven and mark the batch as `partial`.
- Continue searching additional candidates within configured provider limits.
- Do not repeatedly query providers without a maximum page, request, or cost limit.
- Do not include a previously stored company as a new lead in another daily report unless an administrator explicitly requests a reactivation workflow (future feature).

---

## 4. Lead Data Structure

Each company record should support these fields:

| Field | Type | Required |
|---|---|---|
| company_name | String | Yes |
| industry | String | Yes |
| business_description | Text | No |
| website | URL | No |
| company_email | String | No |
| company_phone | String | No |
| full_address | Text | Yes |
| city | String | Yes |
| province | String | Recommended |
| postal_code | String | No |
| target_departments | String/JSON | Yes |
| logistics_potential | Text | Yes |
| suggested_service | Text | No |
| qualification_reason | Text | Yes |
| lead_score | Integer | Yes |
| lead_category | Enum/String | Yes |
| confidence_level | String | Recommended |
| source_name | String | Yes |
| source_url | URL | Yes |
| verified_at | DateTime | Yes |
| created_at | DateTime | Yes |

### 4.1 Data quality rules

- A company may remain a valid lead even when a public email or phone number is unavailable.
- Missing contacts must be represented as `null`, not guessed.
- Company name, location, industry, and at least one traceable source are required.
- A source URL must point to the page or provider record that supports the relevant information.
- Distinguish provider-reported information from information verified on the company's official website.
- Record the retrieval or verification timestamp.
- Do not collect unnecessary personal data or private contact details.

---

## 5. Lead Scoring Engine

Use a transparent rule-based scoring model, supplemented by AI analysis. AI must provide reasoning and evidence references, not an unexplained score.

| Criteria | Weight |
|---|---:|
| Industry relevance | 30 |
| Logistics demand indicators | 25 |
| Business scale | 20 |
| Geographic coverage | 15 |
| Public business contact availability | 10 |
| **Total** | **100** |

### 5.1 Score categories

| Score | Category | Recommended action |
|---|---|---|
| 80–100 | High Potential | Prioritize outreach |
| 60–79 | Medium Potential | Prospect |
| 0–59 | Low Potential | Review or retain in database |

### 5.2 AI qualification output

For each candidate, AI should return structured data containing:

- Industry classification.
- Short business profile.
- Potential logistics needs.
- Relevant target department(s): Procurement, Vendor Management, Carrier Management.
- Qualification reason.
- Suggested logistics service offering.
- Confidence level.
- Supporting source references.
- Unknown or unverified fields.

### 5.3 AI safety and factuality rules

- Never invent revenue, employee count, fleet size, branch count, contact person, email, phone, or active vendor requirements.
- Never describe a logistics need as confirmed unless the source explicitly confirms it.
- Use cautious wording such as "potential need" or "possible fit" for inferred opportunities.
- If evidence is insufficient, return `unknown` or lower confidence.
- AI output must be validated against a schema before persistence.
- The scoring calculation must be deterministic and documented. AI may provide criterion assessments, but the application should calculate the final weighted score.

---

## 6. Data Acquisition Architecture

Use provider adapters so that data sources can be changed without rewriting the lead-generation business logic.

### 6.1 Recommended sources

1. **Google Places API:** business names, categories, addresses, phone numbers, websites, and place identifiers where available.
2. **Search API:** discover official company websites and public company information.
3. **Official company websites:** verify company profile, services, locations, and published business contact details.

Use official APIs and sources whose terms permit the intended use. Do not depend on unauthorized Google Maps scraping or unrestricted crawling.

### 6.2 MVP provider strategy

- Implement one primary business discovery provider.
- Add one supplementary web search provider only if its API key is available and time permits.
- The application must still run if the optional provider is not configured.
- Normalize all provider responses into one internal candidate format.
- Keep provider-specific logic inside `src/providers/`.
- Store source name, source URL or provider reference, and retrieval timestamp.
- Respect API quotas, billing limits, rate limits, and provider terms.
- Do not treat a search result snippet alone as proof of every company attribute.

### 6.3 Candidate processing pipeline

1. Build search queries from configured industry and Jabodetabek location.
2. Retrieve candidate businesses from configured providers.
3. Normalize company names, websites, addresses, and locations.
4. Resolve duplicates using provider identifiers, normalized website domains, and normalized company names plus location.
5. Enrich candidates using official websites or permitted search sources.
6. Run AI industry classification and logistics qualification.
7. Calculate deterministic lead scores.
8. Validate required fields and source references.
9. Persist valid, previously unseen companies.
10. Select up to 10 leads for the daily batch.
11. Generate the Excel report.
12. Send the report email and persist delivery status.

---

## 7. Database Schema

Use SQLite and Prisma for the MVP. Keep database access behind a repository/service layer so migration to PostgreSQL remains possible.

### 7.1 Entity relationships

- One `DailyBatch` has many `Lead` records.
- One `DailyBatch` has many `EmailDelivery` records.
- One `Lead` has many `LeadActivity` records.

### 7.2 Prisma schema

The following is a starting schema. Adjust generator and datasource configuration to the installed Prisma version before implementation.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model DailyBatch {
  id             String   @id @default(cuid())
  runDate        String   @unique
  status         String   @default("pending")
  targetCount    Int      @default(10)
  generatedCount Int      @default(0)
  startedAt      DateTime?
  completedAt    DateTime?
  errorMessage   String?
  createdAt      DateTime @default(now())

  leads          Lead[]
  deliveries     EmailDelivery[]
}

model Lead {
  id                  String   @id @default(cuid())
  companyName         String
  normalizedKey       String   @unique
  industry            String
  businessDescription String?
  website             String?
  email               String?
  phone               String?
  address             String
  city                String
  province            String?
  postalCode          String?

  targetDepartments   String
  logisticsPotential  String?
  suggestedService    String?
  qualificationReason String?
  confidenceLevel     String?
  leadScore           Int      @default(0)
  leadCategory        String   @default("medium")

  sourceName          String
  sourceUrl           String
  verifiedAt          DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  batchId             String?
  batch               DailyBatch? @relation(
    fields: [batchId],
    references: [id]
  )

  activities          LeadActivity[]

  @@index([industry])
  @@index([city])
  @@index([leadScore])
  @@index([createdAt])
}

model EmailDelivery {
  id            String   @id @default(cuid())
  batchId       String
  recipient     String
  subject       String
  status        String   @default("pending")
  errorMessage  String?
  sentAt        DateTime?
  createdAt     DateTime @default(now())

  batch         DailyBatch @relation(
    fields: [batchId],
    references: [id]
  )

  @@index([batchId])
  @@index([status])
}

model LeadActivity {
  id           String   @id @default(cuid())
  leadId       String
  activityType String
  notes        String?
  createdAt    DateTime @default(now())

  lead         Lead @relation(
    fields: [leadId],
    references: [id]
  )

  @@index([leadId])
}
```

### 7.3 Schema implementation notes

- `normalizedKey` must be unique and generated consistently.
- Prefer provider IDs as additional identity evidence. A normalized domain plus company name and location can help resolve duplicates.
- Do not merge two companies solely because their names are similar.
- `targetDepartments` stores a JSON-serialized string array for SQLite MVP.
- Validate all status values at the application layer.
- `DailyBatch.runDate` uses the `YYYY-MM-DD` date in `Asia/Jakarta`.
- A lead should be associated with the batch in which it was first selected. Future reactivation or re-reporting should use an explicit relation or batch-lead join table rather than overwriting historical ownership.
- Consider a separate `LeadSource` table in a later version if multiple sources per company need to be retained.

---

## 8. API Requirements

All application endpoints use the `/api` prefix.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/leads` | List and filter leads |
| GET | `/api/leads/:id` | Lead details |
| POST | `/api/leads/search` | Manual discovery (P1) |
| POST | `/api/leads/generate` | Trigger lead generation (P1/manual admin use) |
| GET | `/api/batches` | Daily batch history |
| GET | `/api/batches/:id` | Batch details |
| GET | `/api/batches/:id/export` | Download XLSX report |
| POST | `/api/batches/:id/email` | Send or retry report email |
| GET | `/api/settings` | Read non-secret application settings |
| PUT | `/api/settings` | Update permitted application settings |
| POST | `/api/cron/daily-leads` | Scheduled daily execution |

### 8.1 Generate leads request

`POST /api/leads/generate`

Example request:

```json
{
  "targetCount": 10,
  "location": "Jabodetabek",
  "industries": [
    "Manufacturing",
    "FMCG",
    "Distribution",
    "Retail",
    "Food & Beverage"
  ]
}
```

Expected behavior:

1. Validate the request and caller permissions.
2. Check for an existing batch for the current Jakarta date.
3. Create or safely resume a batch according to batch state.
4. Execute discovery providers within configured quotas.
5. Normalize and deduplicate candidates.
6. Run AI qualification and deterministic scoring.
7. Validate required fields and source references.
8. Save valid new leads.
9. Update batch counters and status.
10. Return a batch summary.

Example response:

```json
{
  "success": true,
  "batchId": "example_batch_id",
  "targetCount": 10,
  "generatedCount": 10,
  "status": "completed"
}
```

### 8.2 Lead listing

`GET /api/leads?industry=Manufacturing&city=Bekasi&limit=20`

Support:
- Industry filter.
- City filter.
- Lead score range.
- Lead category.
- Date range.
- Search by company name.
- Pagination with bounded page size.

### 8.3 Cron endpoint

`POST /api/cron/daily-leads`

Requirements:
- Require a constant-time-checked `CRON_SECRET` bearer token.
- Reject unauthenticated requests.
- Use the Jakarta calendar date for batch idempotency.
- Prevent concurrent duplicate runs with a database lock or equivalent safe claim mechanism.
- Apply provider timeout, retry, and cost limits.
- Persist job state and error details.
- Do not regenerate leads when only email delivery needs retrying.
- Do not send duplicate emails when a delivery is already marked sent.
- Return a meaningful status and batch ID.

### 8.4 API security

- Protect dashboard and administrative endpoints with authentication.
- Apply role-based authorization.
- Validate and sanitize query parameters and request bodies.
- Never expose API keys, SMTP passwords, or cron secrets to the browser.
- Apply rate limiting to manual generation and export endpoints.
- Restrict CORS to the application origin where applicable.
- Avoid logging credentials or unnecessary personal data.

---

## 9. Excel Export Specification

### 9.1 File naming

`daily-leads-YYYY-MM-DD.xlsx`

### 9.2 Worksheet: `Daily Leads`

| Column | Field |
|---:|---|
| 1 | Company Name |
| 2 | Industry |
| 3 | Business Description |
| 4 | Address |
| 5 | City |
| 6 | Province |
| 7 | Website |
| 8 | Public Email |
| 9 | Public Phone |
| 10 | Target Department |
| 11 | Logistics Potential |
| 12 | Suggested Service |
| 13 | Lead Score |
| 14 | Lead Category |
| 15 | Qualification Reason |
| 16 | Source Name |
| 17 | Source URL |
| 18 | Verified Date |

### 9.3 Worksheet: `Summary`

Include:
- Generation date.
- Target count.
- Actual qualified lead count.
- Industry breakdown.
- City breakdown.
- High, Medium, and Low potential counts.
- Batch status.

### 9.4 Formatting

- Bold header row with contrasting background.
- Freeze the first row.
- Enable auto-filter.
- Set sensible column widths.
- Make website and source URLs clickable.
- Apply conditional formatting to lead score/category.
- Use `DD/MM/YYYY` for dates.
- Display missing values as `Not Available`.
- Prevent spreadsheet formula injection: escape or neutralize untrusted text values beginning with `=`, `+`, `-`, or `@`.
- Do not include fabricated or sample records in production reports.

---

## 10. Email Distribution Specification

### 10.1 Email configuration

Use SMTP via Nodemailer.

Environment variables:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
MARKETING_EMAILS=
```

`MARKETING_EMAILS` accepts comma-separated recipients.

### 10.2 Email content

**Subject:** `Daily Logistics Prospect Report - YYYY-MM-DD`

**Body:**

> Selamat pagi,
>
> Berikut adalah laporan daftar calon perusahaan potensial untuk kegiatan prospecting tim Marketing hari ini.
>
> **Daily Summary**
> - Target leads: 10 companies
> - New qualified leads: [actual count]
> - Geographic coverage: Jabodetabek
> - Generation date: [date]
>
> Silakan gunakan data pada attachment untuk aktivitas prospecting dan customer acquisition.
>
> Regards,  
> Daily Lead Intelligence System

### 10.3 Delivery behavior

- Send only after the XLSX file has been generated and validated.
- Persist one delivery record per recipient.
- Mark successful deliveries as `sent`, with timestamp.
- Mark failures as `failed`, with a sanitized error message.
- A failed email must not invalidate successfully generated leads or the batch.
- Allow an administrator to retry failed deliveries without regenerating leads.
- Do not retry an already successful delivery unless an explicit resend action is requested.
- Do not expose SMTP credentials in application settings responses or logs.

---

## 11. UI Pages and Dashboard Requirements

The MVP should contain four main pages.

### 11.1 Dashboard

Display:
- Total leads generated.
- Leads generated today.
- Leads by industry.
- Leads by city.
- Lead score distribution.
- Last generation status.
- Latest lead records.
- Last email delivery status.

Primary actions:
- View leads.
- View generation history.
- Download latest report.

### 11.2 Lead Database

Features:
- Search by company name.
- Filter by industry.
- Filter by city.
- Filter by score/category.
- Paginated lead table.
- Lead detail view.
- Website and source links.
- Export report.

### 11.3 Generation History

Display:
- Execution date.
- Start and completion time.
- Target count.
- Generated count.
- Batch status.
- Email delivery status.
- Error summary.
- Download report action.
- Retry failed email action for authorized users.

### 11.4 Settings

Configurable settings:
- Daily execution time (default 07:00).
- Target lead count (default 10).
- Industry preferences.
- Geographic scope (MVP default Jabodetabek).
- Email recipients.
- Provider configuration status.

For one-day MVP, sensitive provider credentials may be configured only through environment variables. Never return secret values to the frontend.

---

## 12. Automated Daily Workflow

### 12.1 Schedule

- Execute every day at 07:00.
- Timezone: `Asia/Jakarta`.
- Use Linux Cron to call the protected cron endpoint or execute a Node.js job.
- Do not rely on an in-process timer that stops when the web server restarts or scales down.

### 12.2 Workflow

1. Cron triggers the daily job.
2. System checks whether a batch already exists for the Jakarta date.
3. System safely claims or creates the batch.
4. System searches configured industries across Jabodetabek.
5. Candidates are normalized and deduplicated.
6. AI classifies and qualifies candidates.
7. Application calculates deterministic lead scores.
8. System validates required fields and source references.
9. System persists valid new leads.
10. System selects up to 10 qualified leads.
11. System generates and validates the XLSX report.
12. System sends the report to configured Marketing recipients.
13. System updates batch and email delivery statuses.
14. System records completion or failure details.

### 12.3 Batch statuses

Use these application-level statuses:

- `pending`
- `running`
- `completed`
- `partial`
- `failed`

A batch is:
- `completed` when the target is met and the report is generated.
- `partial` when fewer than the target number of valid leads are found but the report is generated.
- `failed` when the process cannot produce a usable report or complete its essential processing.

Email delivery status is independent of batch status.

### 12.4 Failure handling

- If an optional provider fails, continue with available providers.
- If all discovery providers fail, mark the batch failed and notify the administrator if an admin notification recipient is configured.
- If AI is unavailable, do not silently fabricate AI output. Either use a clearly defined deterministic fallback qualification mode or mark candidates as pending review. For the strict MVP, prefer marking unqualified candidates as requiring review.
- If Excel generation fails, do not send an email.
- If email delivery fails, retain the batch and report, record the failure, and allow email-only retry.
- Enforce provider request, pagination, timeout, and daily cost limits.
- Ensure concurrent cron calls cannot create duplicate batches or emails.

---

## 13. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Dashboard should load within 3 seconds for normal MVP data volume |
| Reliability | Failure of an optional provider must not stop other available providers |
| Security | Secrets stored only in server-side environment variables |
| Authentication | Dashboard protected by login |
| Authorization | Admin and Marketing access controlled by role |
| Data integrity | Unique normalized company identity |
| Logging | Persist batch and delivery logs |
| Timezone | Asia/Jakarta |
| Backup | Database and report files can be backed up |
| Privacy | Collect only necessary public business information |
| Maintainability | Provider adapters and business logic separated |
| Cost control | Provider quotas and maximum daily spend/request limits configured |

### 13.1 Data retention

For MVP:
- Retain lead records until an administrator deletes them under an approved retention policy.
- Retain batch and email delivery history for audit.
- Store report files in a configured persistent location.
- Do not assume temporary local files are durable.
- Document backup and restore procedure.

### 13.2 SQLite deployment requirements

- Use a persistent volume for the SQLite database.
- Ensure the web app and scheduled job use the same database path.
- Avoid running multiple application instances that write concurrently to a local SQLite file.
- Back up the database before schema migrations.
- Consider PostgreSQL if concurrent writes, multiple application replicas, or larger workload become necessary.

---

## 14. MVP Development Scope: One Working Day

This is an aggressive implementation target, not a guarantee. It assumes the developer already has the API credentials, SMTP access, server, and deployment permissions.

| Task | Estimated time |
|---|---:|
| Next.js project foundation | 30 minutes |
| Prisma schema and database | 30 minutes |
| Primary discovery provider integration | 90 minutes |
| Normalization and deduplication | 45 minutes |
| AI qualification and scoring | 60 minutes |
| Dashboard and lead table | 75 minutes |
| Excel export | 45 minutes |
| SMTP integration | 30 minutes |
| Cron configuration | 30 minutes |
| Testing and deployment | 45 minutes |
| **Total** | **8 hours** |

### 14.1 Must-have MVP

- One working business discovery provider.
- Jabodetabek location filtering.
- Configurable industry list.
- Candidate normalization and deduplication.
- AI qualification with structured output.
- Deterministic lead scoring.
- SQLite persistence.
- Dashboard and lead database.
- Excel report with Summary worksheet.
- SMTP email distribution.
- Daily Cron execution.
- Batch and email delivery logs.
- Basic authentication and admin protection.

### 14.2 Explicitly excluded from MVP

- WhatsApp outreach automation.
- CRM integration.
- Automatic sales assignment.
- Advanced AI market intelligence.
- Predictive revenue estimation.
- Automatic personal contact discovery.
- Complex multi-user collaboration.
- Advanced analytics.
- Complex multi-provider orchestration.

---

## 15. Recommended Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui |
| Database | SQLite |
| ORM | Prisma |
| AI gateway | HematToken API |
| AI model | Configurable through environment |
| Business discovery | Google Places API |
| Web discovery | Search API, optional |
| Excel generation | ExcelJS |
| Email | Nodemailer |
| Scheduler | Linux Cron |
| Deployment | Docker or existing server |

Use the current project-compatible versions of each dependency. Check installed Prisma version and its configuration conventions before generating the schema or running migrations.

### 15.1 Suggested project structure

```text
daily-lead-intelligence/
├── prisma/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── history/
│   │   ├── settings/
│   │   └── api/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── layout/
│   │   └── shared/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── ai.ts
│   │   ├── email.ts
│   │   └── excel.ts
│   ├── services/
│   │   ├── lead-discovery.service.ts
│   │   ├── lead-scoring.service.ts
│   │   ├── lead-generation.service.ts
│   │   └── report.service.ts
│   ├── providers/
│   │   ├── places.provider.ts
│   │   └── search.provider.ts
│   └── types/
├── scripts/
│   └── daily-leads.ts
├── .env.example
└── package.json
```

The structure is a guide. Keep it consistent with the existing repository if this is being added to an existing application.

---

## 16. Environment Configuration

Create `.env.example` with placeholders only:

```env
# Application
DATABASE_URL="file:./dev.db"
APP_URL="http://localhost:3000"
APP_TIMEZONE="Asia/Jakarta"

# Authentication
AUTH_SECRET=""

# AI Gateway
AI_BASE_URL="https://api.hemattoken.id/v1"
AI_API_KEY=""
AI_MODEL=""

# Business Discovery
GOOGLE_PLACES_API_KEY=""
SEARCH_API_KEY=""

# Email
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""
MARKETING_EMAILS=""

# Scheduler
CRON_SECRET=""
```

Never commit real secrets. Validate required environment variables at startup and provide clear errors for missing configuration. The optional search provider must not prevent startup when its key is absent.

---

## 17. Acceptance Criteria

The MVP is accepted when all P0 criteria pass.

| ID | Acceptance criteria | Expected result |
|---|---|---|
| AC-01 | Scheduler execution | Runs at 07:00 Asia/Jakarta |
| AC-02 | Geographic filtering | Only companies located in Jabodetabek are selected |
| AC-03 | Industry classification | Each selected lead has an industry classification |
| AC-04 | Lead generation | Generates up to 10 valid, unique leads |
| AC-05 | Data completeness | Company name, address, industry, and source are present |
| AC-06 | Contact validation | Missing public contact data remains empty, not fabricated |
| AC-07 | AI scoring | Each qualified lead has a score from 0 to 100 |
| AC-08 | Deduplication | No duplicate company identity in the database or daily report |
| AC-09 | Database persistence | Saved leads can be viewed in the dashboard |
| AC-10 | Excel export | Valid XLSX file can be opened in Microsoft Excel |
| AC-11 | Email delivery | Configured recipients receive the XLSX attachment |
| AC-12 | Execution logging | Batch and error history are persisted |
| AC-13 | Idempotency | Repeated cron call does not create a duplicate daily batch or duplicate delivery |
| AC-14 | Security | API secrets and SMTP credentials are not exposed to the client |

### 17.1 Definition of Done

- [ ] Application is deployed and reachable.
- [ ] Administrator can log in.
- [ ] Lead discovery retrieves real business data.
- [ ] Location and industry filtering work.
- [ ] AI returns validated structured classification output.
- [ ] Scoring is deterministic and explainable.
- [ ] Duplicate detection works.
- [ ] Leads are persisted and displayed.
- [ ] Excel report contains the expected columns and Summary worksheet.
- [ ] Email is delivered with the XLSX attachment.
- [ ] Cron is configured for 07:00 Asia/Jakarta.
- [ ] Failed jobs and email deliveries can be diagnosed from logs.
- [ ] Secrets are not committed or exposed.
- [ ] Backup path and database persistence are verified.

---

## 18. Success Metrics

Measure the system using operational and business metrics:

- Target: up to 10 new qualified prospects per scheduled run.
- At least 90% of reported leads have traceable source references.
- Duplicate leads in a daily report: zero.
- Successful email delivery rate: at least 98% of generated reports, measured over time.
- Reduction in time Marketing spends preparing prospect lists.
- Percentage of leads successfully contacted.
- Percentage of contacted leads that become qualified opportunities.
- Lead-to-customer conversion rate, when sufficient CRM or sales outcome data is available.

Do not claim revenue impact until actual sales outcomes are measured.

---

## 19. Post-MVP Roadmap

| Version | Feature | Objective |
|---|---|---|
| V1.0 | Daily Lead Generator | Automated prospecting |
| V1.1 | Lead Assignment | Distribute leads to sales representatives |
| V1.2 | Follow-up Tracking | Monitor sales activity |
| V1.3 | AI Outreach Generator | Draft outreach emails |
| V1.4 | CRM Integration | Connect prospect and customer records |
| V2.0 | Lead Intelligence | Market opportunity analysis |

---

## 20. Implementation Instructions for AI Coding Agent

Build this application from the requirements in this document. Prioritize a working, testable MVP over speculative features.

### 20.1 Before coding

1. Inspect the existing repository, package manager, framework version, and current architecture.
2. Determine whether this is a new project or an existing codebase.
3. Reuse existing conventions and dependencies where practical.
4. Check the installed Prisma version and use compatible schema/configuration conventions.
5. Identify which API credentials and SMTP settings are available. Do not invent credentials.
6. If a provider credential is missing, implement the provider interface and a clearly labeled setup requirement. Do not use fake production data.
7. Present a concise implementation plan, then proceed without waiting for approval unless a destructive or ambiguous action is required.

### 20.2 Implementation rules

- Use TypeScript with strict typing.
- Use server-side access for all provider APIs and secrets.
- Keep business logic out of React components and route handlers.
- Implement provider adapters with a normalized internal candidate type.
- Validate external provider responses and AI output with a schema validation library.
- Use deterministic scoring logic.
- Implement robust deduplication.
- Make daily job execution idempotent and safe against concurrent calls.
- Separate lead generation from report email delivery so email retries do not regenerate leads.
- Use persistent storage for SQLite and generated reports.
- Include loading, empty, success, and error states in the UI.
- Use responsive, accessible UI components.
- Include basic authentication and role protection.
- Add useful logs without leaking secrets.
- Add tests for scoring, normalization, deduplication, batch idempotency, Excel generation, and email retry behavior.
- Do not add features excluded from the MVP unless required to make a P0 feature work.
- Do not claim completion for integrations that have not been configured and tested.

### 20.3 Required implementation deliverables

1. Working Next.js application.
2. Prisma schema and database migration/setup instructions.
3. `.env.example`.
4. Lead discovery provider adapter.
5. AI qualification and scoring service.
6. Daily generation orchestration.
7. Dashboard, lead database, history, and settings pages.
8. Excel XLSX generation.
9. SMTP email delivery.
10. Cron setup instructions and example schedule.
11. Basic automated tests.
12. README with local development, configuration, deployment, backup, and troubleshooting instructions.

### 20.4 Final verification report

At completion, provide:
- Features implemented.
- Files and modules created or modified.
- Environment variables still required.
- Database setup and migration commands.
- Test results.
- Deployment steps.
- Cron installation instructions.
- Known limitations.
- Any acceptance criteria not yet met.

**Final instruction:** Do not substitute mock data for real lead discovery. If external credentials are unavailable, finish the application with a clearly identified integration setup state and report that live discovery/email delivery has not yet been verified.
