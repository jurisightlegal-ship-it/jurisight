# SCHEDULED Status Implementation Guide

## Overview
This guide explains how to implement the new SCHEDULED status for articles that are scheduled for future publication.

## Database Migration Required

**IMPORTANT**: You must run these SQL commands in your Supabase SQL Editor in the exact order shown below. Each step must be run separately and committed before running the next step.

### Step 1: Add SCHEDULED to the enum
Run this first in Supabase SQL Editor:
```sql
ALTER TYPE "public"."status" ADD VALUE 'SCHEDULED';
```

### Step 2: Update existing scheduled articles
After Step 1 is committed, run this:
```sql
UPDATE "articles" 
SET "status" = 'SCHEDULED' 
WHERE "scheduled_at" IS NOT NULL 
AND "status" != 'PUBLISHED';
```

### Step 3: Add documentation comment
After Step 2 is completed, run this:
```sql
COMMENT ON TYPE "public"."status" IS 'Article status: DRAFT, IN_REVIEW, NEEDS_REVISIONS, APPROVED, PUBLISHED, SCHEDULED';
```

## What's Already Implemented

### 1. API Changes
- **Article Creation** (`/api/articles/route.ts`): Automatically sets status to 'SCHEDULED' when `scheduledAt` is provided
- **Article Editing** (`/api/dashboard/articles/[id]/route.ts`): Automatically sets status to 'SCHEDULED' when `scheduledAt` is provided
- **Automatic Publishing** (`/api/publish-scheduled/route.ts`): Looks for articles with 'SCHEDULED' status and publishes them

### 2. Database Logic Changes
- **Review Queue** (`src/lib/supabase-db.ts`): Excludes articles with 'SCHEDULED' status from review queue
- **Dashboard Stats** (`src/lib/supabase-db.ts`): Counts 'SCHEDULED' articles separately

### 3. UI Changes
- **Enhanced Post Form** (`src/components/ui/enhanced-post-form.tsx`): Added 'SCHEDULED' option to status dropdown
- **Articles Page** (`src/app/dashboard/articles/page.tsx`): Added purple badge for 'SCHEDULED' status
- **Review Queue** (`src/app/dashboard/review-queue/page.tsx`): Added purple badge with calendar icon for 'SCHEDULED' status

## How It Works

1. **When Creating/Editing Articles**: If a `scheduledAt` time is provided, the article status is automatically set to 'SCHEDULED'
2. **Review Queue**: Articles with 'SCHEDULED' status are excluded from the review queue
3. **Dashboard Stats**: 'SCHEDULED' articles are counted separately from drafts and in-review articles
4. **Automatic Publishing**: The cron job looks for articles with 'SCHEDULED' status and publishes them when their scheduled time arrives

## Status Flow
- **DRAFT** → **SCHEDULED** (when scheduled_at is set)
- **SCHEDULED** → **PUBLISHED** (when scheduled time arrives)
- **SCHEDULED** → **DRAFT** (if scheduled_at is removed)

## Testing
After running the database migration, you can test by:
1. Creating a new article with a future `scheduledAt` time
2. Verifying it gets 'SCHEDULED' status
3. Checking it doesn't appear in the review queue
4. Verifying it appears in the content calendar
5. Testing automatic publishing when the scheduled time arrives

## Files Modified
- `src/app/api/articles/route.ts`
- `src/app/api/dashboard/articles/[id]/route.ts`
- `src/app/api/publish-scheduled/route.ts`
- `src/lib/supabase-db.ts`
- `src/components/ui/enhanced-post-form.tsx`
- `src/app/dashboard/articles/page.tsx`
- `src/app/dashboard/review-queue/page.tsx`
