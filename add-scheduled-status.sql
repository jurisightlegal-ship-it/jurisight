-- Add SCHEDULED status to the status enum
-- This script adds SCHEDULED as a new status value for articles
-- IMPORTANT: Run this in two separate transactions in Supabase SQL Editor

-- STEP 1: Add SCHEDULED to the existing status enum (run this first)
ALTER TYPE "public"."status" ADD VALUE 'SCHEDULED';

-- STEP 2: After the above is committed, run this update (run this second)
-- UPDATE "articles" 
-- SET "status" = 'SCHEDULED' 
-- WHERE "scheduled_at" IS NOT NULL 
-- AND "status" != 'PUBLISHED';

-- STEP 3: Add a comment to document the change (run this third)
-- COMMENT ON TYPE "public"."status" IS 'Article status: DRAFT, IN_REVIEW, NEEDS_REVISIONS, APPROVED, PUBLISHED, SCHEDULED';
