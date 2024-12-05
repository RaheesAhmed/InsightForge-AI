-- First, create a temporary type for the new enum
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'PROFESSIONAL', 'ENTERPRISE');

-- Update existing records
UPDATE "Subscription"
SET plan = CASE 
    WHEN plan = 'BASIC' THEN 'PROFESSIONAL'
    WHEN plan = 'PREMIUM' THEN 'ENTERPRISE'
    ELSE plan
END::text;

-- Drop the old type and rename the new one
ALTER TABLE "Subscription" ALTER COLUMN plan TYPE "Plan_new" USING (plan::text::"Plan_new");
DROP TYPE IF EXISTS "Plan";
ALTER TYPE "Plan_new" RENAME TO "Plan"; 