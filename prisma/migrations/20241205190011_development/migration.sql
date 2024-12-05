/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - The `plan` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'SUSPENDED', 'PAYMENT_FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'PAYMENT_FAILED';

-- DropIndex
DROP INDEX "User_email_idx";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripeCustomerId",
ADD COLUMN     "documentsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionId" TEXT,
DROP COLUMN "plan",
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'Free',
DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "documentsLimit" SET DEFAULT 3,
ALTER COLUMN "questionsLimit" SET DEFAULT 20;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hashedPassword" TEXT,
ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "paypalOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paypalOrderId_key" ON "Payment"("paypalOrderId");

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
