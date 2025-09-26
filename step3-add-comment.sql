-- STEP 3: Add a comment to document the change
-- Run this AFTER step 2 is completed in Supabase SQL Editor

COMMENT ON TYPE "public"."status" IS 'Article status: DRAFT, IN_REVIEW, NEEDS_REVISIONS, APPROVED, PUBLISHED, SCHEDULED';
