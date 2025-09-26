# Manual Database Update for Featured Articles and Top News

## Required Database Changes

To enable featured articles and top news functionality, you need to add the following columns to the `articles` table in your Supabase database:

### 1. Add New Columns

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Add is_featured column
ALTER TABLE "articles" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;

-- Add is_top_news column  
ALTER TABLE "articles" ADD COLUMN "is_top_news" boolean DEFAULT false NOT NULL;

-- Add featured_at timestamp column
ALTER TABLE "articles" ADD COLUMN "featured_at" timestamp;

-- Add top_news_at timestamp column
ALTER TABLE "articles" ADD COLUMN "top_news_at" timestamp;

-- Add scheduled_at timestamp column for scheduled publication
ALTER TABLE "articles" ADD COLUMN "scheduled_at" timestamp;
```

### 2. Create Indexes for Performance

```sql
-- Create indexes for better performance
CREATE INDEX "idx_articles_is_featured" ON "articles" ("is_featured");
CREATE INDEX "idx_articles_is_top_news" ON "articles" ("is_top_news");
CREATE INDEX "idx_articles_featured_at" ON "articles" ("featured_at");
CREATE INDEX "idx_articles_top_news_at" ON "articles" ("top_news_at");
CREATE INDEX "idx_articles_scheduled_at" ON "articles" ("scheduled_at");
```

### 3. Add RLS Policies (Optional)

```sql
-- Allow authenticated users to update featured status
-- First drop the policy if it exists, then create it
DROP POLICY IF EXISTS "Users can update featured status" ON "articles";
CREATE POLICY "Users can update featured status" ON "articles" FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
        auth.uid()::text = author_id OR 
        EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role IN ('EDITOR', 'ADMIN'))
    )
);
```

**Note**: If you get an error that the policy already exists, you can safely ignore it or run the DROP POLICY command first.

## How to Apply These Changes

### Option 1: Use the Safe Migration Script (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `add-featured-fields-safe.sql`
4. Execute the script
5. Check the output for success messages

### Option 2: Manual Step-by-Step

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL commands above
4. Execute them one by one
5. If you get a "policy already exists" error, run the DROP POLICY command first
6. Verify the columns were added by checking the table structure

## Verification

After applying the changes, you can verify they worked by running:

```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('is_featured', 'is_top_news', 'featured_at', 'top_news_at', 'scheduled_at');
```

## Features Enabled

Once these database changes are applied, the following features will be available:

- ✅ Mark articles as "Featured Articles" in the edit page
- ✅ Mark articles as "Top News" in the edit page  
- ✅ Schedule articles for future publication with date/time picker
- ✅ Real-time validation for scheduled dates (must be in future, max 1 year)
- ✅ Visual indicators for scheduled articles
- ✅ Automatic timestamp tracking when articles are marked as featured/top news
- ✅ Database indexes for efficient querying of featured, top news, and scheduled articles
- ✅ Proper RLS policies for secure updates

## Next Steps

After applying the database changes:

1. Test the edit article page to ensure checkboxes work
2. Verify that featured/top news status is saved correctly
3. Create API endpoints to fetch featured articles and top news for the homepage
4. Update the homepage to display featured articles prominently
5. Update the news page to highlight top news articles
