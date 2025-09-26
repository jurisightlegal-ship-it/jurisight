-- STEP 1: Add SCHEDULED to the existing status enum
-- Run this first in Supabase SQL Editor

ALTER TYPE "public"."status" ADD VALUE 'SCHEDULED';
