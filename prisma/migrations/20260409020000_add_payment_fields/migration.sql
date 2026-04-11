-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFER', 'WEBPAY', 'OTHER');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN "paymentMethod" "PaymentMethod",
ADD COLUMN "paymentAmount" INTEGER,
ADD COLUMN "paymentDate" TIMESTAMP(3),
ADD COLUMN "paymentDueDate" TIMESTAMP(3),
ADD COLUMN "paymentNote" TEXT;

-- CreateIndex
CREATE INDEX "Quote_paymentStatus_idx" ON "Quote"("paymentStatus");
