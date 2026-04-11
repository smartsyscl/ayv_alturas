-- AlterTable: add audit field for who responded to a quote
ALTER TABLE "Quote" ADD COLUMN "respondedBy" TEXT;
