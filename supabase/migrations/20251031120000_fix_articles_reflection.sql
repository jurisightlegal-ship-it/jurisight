-- Migration: Fix articles visibility and scheduling reflection
-- Date: 2025-10-31 12:00:00

-- 1) Ensure SCHEDULED exists in status enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'status' AND e.enumlabel = 'SCHEDULED'
  ) THEN
    ALTER TYPE "public"."status" ADD VALUE 'SCHEDULED';
  END IF;
END $$;

-- 2) Backfill status for scheduled articles
UPDATE "public"."articles"
SET "status" = 'SCHEDULED'
WHERE "scheduled_at" IS NOT NULL
  AND "status" != 'PUBLISHED';

-- 3) Enable RLS on articles (safe to rerun)
ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;

-- 4) Remove overly-permissive read-all policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'articles'
      AND policyname = 'Enable read access for all users'
  ) THEN
    DROP POLICY "Enable read access for all users" ON "public"."articles";
  END IF;
END $$;

-- 5) Ensure public can only read published articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'articles'
      AND policyname = 'Anyone can view published articles'
  ) THEN
    CREATE POLICY "Anyone can view published articles"
      ON "public"."articles"
      FOR SELECT
      USING (status = 'PUBLISHED');
  END IF;
END $$;

-- 6) Backfill published_at for published articles missing timestamp
UPDATE "public"."articles"
SET "published_at" = COALESCE("published_at", NOW())
WHERE "status" = 'PUBLISHED'
  AND "published_at" IS NULL;

-- 7) Helpful indexes
CREATE INDEX IF NOT EXISTS "idx_articles_published_at" ON "public"."articles" ("published_at");
CREATE INDEX IF NOT EXISTS "idx_articles_status" ON "public"."articles" ("status");

