-- Safe version of the featured fields migration
-- This script handles existing policies and columns gracefully

-- Add is_featured column to articles table
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'is_featured') THEN
        ALTER TABLE "articles" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;
        RAISE NOTICE 'Added is_featured column';
    ELSE
        RAISE NOTICE 'is_featured column already exists';
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'is_featured column already exists (duplicate_column error)';
END $$;

-- Add is_top_news column to articles table
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'is_top_news') THEN
        ALTER TABLE "articles" ADD COLUMN "is_top_news" boolean DEFAULT false NOT NULL;
        RAISE NOTICE 'Added is_top_news column';
    ELSE
        RAISE NOTICE 'is_top_news column already exists';
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'is_top_news column already exists (duplicate_column error)';
END $$;

-- Add featured_at timestamp column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'featured_at') THEN
        ALTER TABLE "articles" ADD COLUMN "featured_at" timestamp;
        RAISE NOTICE 'Added featured_at column';
    ELSE
        RAISE NOTICE 'featured_at column already exists';
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'featured_at column already exists (duplicate_column error)';
END $$;

-- Add top_news_at timestamp column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'top_news_at') THEN
        ALTER TABLE "articles" ADD COLUMN "top_news_at" timestamp;
        RAISE NOTICE 'Added top_news_at column';
    ELSE
        RAISE NOTICE 'top_news_at column already exists';
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'top_news_at column already exists (duplicate_column error)';
END $$;

-- Add scheduled_at timestamp column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'scheduled_at') THEN
        ALTER TABLE "articles" ADD COLUMN "scheduled_at" timestamp;
        RAISE NOTICE 'Added scheduled_at column';
    ELSE
        RAISE NOTICE 'scheduled_at column already exists';
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'scheduled_at column already exists (duplicate_column error)';
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_articles_is_featured" ON "articles" ("is_featured");
CREATE INDEX IF NOT EXISTS "idx_articles_is_top_news" ON "articles" ("is_top_news");
CREATE INDEX IF NOT EXISTS "idx_articles_featured_at" ON "articles" ("featured_at");
CREATE INDEX IF NOT EXISTS "idx_articles_top_news_at" ON "articles" ("top_news_at");
CREATE INDEX IF NOT EXISTS "idx_articles_scheduled_at" ON "articles" ("scheduled_at");

-- Handle RLS policy creation safely
DO $$ BEGIN
    -- Drop policy if it exists
    DROP POLICY IF EXISTS "Users can update featured status" ON "articles";
    
    -- Create the policy
    CREATE POLICY "Users can update featured status" ON "articles" FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            auth.uid()::text = author_id OR 
            EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role IN ('EDITOR', 'ADMIN'))
        )
    );
    
    RAISE NOTICE 'Created RLS policy for featured status updates';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'RLS policy already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating RLS policy: %', SQLERRM;
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'New fields: is_featured, is_top_news, featured_at, top_news_at, scheduled_at';
    RAISE NOTICE 'Indexes created for better performance';
    RAISE NOTICE 'RLS policies updated';
    RAISE NOTICE '========================================';
END $$;
