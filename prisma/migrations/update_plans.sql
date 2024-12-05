-- Step 1: Create a temporary column
ALTER TABLE "Subscription" ADD COLUMN temp_plan text;

-- Step 2: Copy data to the temporary column with the mapping
UPDATE "Subscription"
SET temp_plan = CASE 
    WHEN plan::text = 'BASIC' THEN 'PROFESSIONAL'
    WHEN plan::text = 'PREMIUM' THEN 'ENTERPRISE'
    ELSE plan::text
END;

-- Step 3: Drop the original column and type
ALTER TABLE "Subscription" DROP COLUMN plan;
DROP TYPE "Plan";

-- Step 4: Create the new enum type
CREATE TYPE "Plan" AS ENUM ('FREE', 'PROFESSIONAL', 'ENTERPRISE');

-- Step 5: Add the new column with the correct type and default
ALTER TABLE "Subscription" ADD COLUMN plan "Plan" NOT NULL DEFAULT 'FREE';

-- Step 6: Copy data from temporary column
UPDATE "Subscription"
SET plan = temp_plan::"Plan";

-- Step 7: Drop the temporary column
ALTER TABLE "Subscription" DROP COLUMN temp_plan; 