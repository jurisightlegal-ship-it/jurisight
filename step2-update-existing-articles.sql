-- STEP 2: Update existing scheduled articles to use SCHEDULED status
-- Run this AFTER step 1 is committed in Supabase SQL Editor

UPDATE "articles" 
SET "status" = 'SCHEDULED' 
WHERE "scheduled_at" IS NOT NULL 
AND "status" != 'PUBLISHED';
