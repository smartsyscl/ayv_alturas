-- AlterTable: add measurement and pricing columns to Quote
ALTER TABLE "Quote" ADD COLUMN "measurements" JSONB;
ALTER TABLE "Quote" ADD COLUMN "requestVisit" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Quote" ADD COLUMN "calculatedPrice" INTEGER;
