-- CreateTable
CREATE TABLE "DailyBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "targetCount" INTEGER NOT NULL DEFAULT 10,
    "generatedCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "businessDescription" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "postalCode" TEXT,
    "targetDepartments" TEXT NOT NULL,
    "logisticsPotential" TEXT,
    "suggestedService" TEXT,
    "qualificationReason" TEXT,
    "confidenceLevel" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "leadCategory" TEXT NOT NULL DEFAULT 'medium',
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "batchId" TEXT,
    CONSTRAINT "Lead_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DailyBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailDelivery_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DailyBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyBatch_runDate_key" ON "DailyBatch"("runDate");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_normalizedKey_key" ON "Lead"("normalizedKey");

-- CreateIndex
CREATE INDEX "Lead_industry_idx" ON "Lead"("industry");

-- CreateIndex
CREATE INDEX "Lead_city_idx" ON "Lead"("city");

-- CreateIndex
CREATE INDEX "Lead_leadScore_idx" ON "Lead"("leadScore");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "EmailDelivery_status_idx" ON "EmailDelivery"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailDelivery_batchId_recipient_key" ON "EmailDelivery"("batchId", "recipient");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");
