-- Add featured article and top news fields to articles table
-- This script adds boolean fields to mark articles as featured or top news

-- Add is_featured column to articles table
DO $$ BEGIN
    -- Add is_featured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'is_featured') THEN
        ALTER TABLE "articles" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add is_top_news column to articles table
DO $$ BEGIN
    -- Add is_top_news column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'is_top_news') THEN
        ALTER TABLE "articles" ADD COLUMN "is_top_news" boolean DEFAULT false NOT NULL;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add featured_at timestamp column for when article was marked as featured
DO $$ BEGIN
    -- Add featured_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'featured_at') THEN
        ALTER TABLE "articles" ADD COLUMN "featured_at" timestamp;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add top_news_at timestamp column for when article was marked as top news
DO $$ BEGIN
    -- Add top_news_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'top_news_at') THEN
        ALTER TABLE "articles" ADD COLUMN "top_news_at" timestamp;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add scheduled_at timestamp column for scheduled publication
DO $$ BEGIN
    -- Add scheduled_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'scheduled_at') THEN
        ALTER TABLE "articles" ADD COLUMN "scheduled_at" timestamp;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create indexes for better performance on featured and top news queries
CREATE INDEX IF NOT EXISTS "idx_articles_is_featured" ON "articles" ("is_featured");
CREATE INDEX IF NOT EXISTS "idx_articles_is_top_news" ON "articles" ("is_top_news");
CREATE INDEX IF NOT EXISTS "idx_articles_featured_at" ON "articles" ("featured_at");
CREATE INDEX IF NOT EXISTS "idx_articles_top_news_at" ON "articles" ("top_news_at");
CREATE INDEX IF NOT EXISTS "idx_articles_scheduled_at" ON "articles" ("scheduled_at");

-- Add RLS policies for the new fields
-- Allow authenticated users to update featured status
DO $$ BEGIN
    -- Drop policy if it exists, then create it
    DROP POLICY IF EXISTS "Users can update featured status" ON "articles";
    CREATE POLICY "Users can update featured status" ON "articles" FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            auth.uid()::text = author_id OR 
            EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role IN ('EDITOR', 'ADMIN'))
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Policy might not exist, try to create it
        CREATE POLICY "Users can update featured status" ON "articles" FOR UPDATE USING (
            auth.role() = 'authenticated' AND (
                auth.uid()::text = author_id OR 
                EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role IN ('EDITOR', 'ADMIN'))
            )
        );
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Featured article, top news, and scheduling fields added successfully!';
    RAISE NOTICE 'New fields: is_featured, is_top_news, featured_at, top_news_at, scheduled_at';
    RAISE NOTICE 'Indexes created for better performance';
END $$;
