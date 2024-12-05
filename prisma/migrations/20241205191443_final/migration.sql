/*
  Warnings:

  - The values [BASIC,PREMIUM] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `subscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - The `plan` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'PROFESSIONAL', 'ENTERPRISE');
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "Plan_old";
COMMIT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "subscriptionId",
ADD COLUMN     "paypalId" TEXT,
DROP COLUMN "plan",
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Subscription_paypalId_idx" ON "Subscription"("paypalId");
