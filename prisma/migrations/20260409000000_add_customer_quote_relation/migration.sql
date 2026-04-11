-- AlterTable: add customerId FK column to Quote
ALTER TABLE "Quote" ADD COLUMN "customerId" TEXT;

-- CreateIndex
CREATE INDEX "Quote_customerId_idx" ON "Quote"("customerId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: link existing quotes to customers by email
UPDATE "Quote" q
SET "customerId" = c."id"
FROM "Customer" c
WHERE LOWER(q."clientEmail") = LOWER(c."email")
  AND q."customerId" IS NULL;
