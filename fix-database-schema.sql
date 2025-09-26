-- Fix Database Schema - Sync Supabase with Current Infrastructure
-- This script ensures the database schema matches the current codebase

-- 1. Ensure all required columns exist in users table
DO $$ BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    -- Add linkedin_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'linkedin_url') THEN
        ALTER TABLE "users" ADD COLUMN "linkedin_url" varchar(500);
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    -- Add personal_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'personal_email') THEN
        ALTER TABLE "users" ADD COLUMN "personal_email" varchar(255);
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 2. Ensure all required tables exist
CREATE TABLE IF NOT EXISTS "legal_sections" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "slug" varchar(100) NOT NULL,
    "description" text,
    "color" varchar(7) NOT NULL,
    "icon" varchar(50),
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "legal_sections_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "tags" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "slug" varchar(100) NOT NULL,
    "description" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "articles" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar(255) NOT NULL,
    "slug" varchar(255) NOT NULL,
    "dek" text,
    "body" text NOT NULL,
    "featured_image" varchar(500),
    "status" "status" DEFAULT 'DRAFT' NOT NULL,
    "author_id" varchar(255) NOT NULL,
    "section_id" integer NOT NULL,
    "reading_time" integer,
    "views" integer DEFAULT 0 NOT NULL,
    "published_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "article_tags" (
    "id" serial PRIMARY KEY NOT NULL,
    "article_id" integer NOT NULL,
    "tag_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "case_citations" (
    "id" serial PRIMARY KEY NOT NULL,
    "article_id" integer NOT NULL,
    "name" varchar(255) NOT NULL,
    "court" varchar(255),
    "citation" varchar(255),
    "year" integer,
    "url" varchar(500),
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "editorial_comments" (
    "id" serial PRIMARY KEY NOT NULL,
    "article_id" integer NOT NULL,
    "editor_id" varchar(255) NOT NULL,
    "comment" text NOT NULL,
    "is_internal" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "source_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "article_id" integer NOT NULL,
    "title" varchar(255) NOT NULL,
    "url" varchar(500) NOT NULL,
    "description" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- 3. Add foreign key constraints if they don't exist
DO $$ BEGIN
    ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" 
    FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "articles" ADD CONSTRAINT "articles_section_id_legal_sections_id_fk" 
    FOREIGN KEY ("section_id") REFERENCES "public"."legal_sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" 
    FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" 
    FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "case_citations" ADD CONSTRAINT "case_citations_article_id_articles_id_fk" 
    FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_article_id_articles_id_fk" 
    FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_editor_id_users_id_fk" 
    FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "source_links" ADD CONSTRAINT "source_links_article_id_articles_id_fk" 
    FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Insert default legal sections if they don't exist
INSERT INTO "legal_sections" ("name", "slug", "description", "color", "icon") VALUES
('Constitutional', 'constitutional', 'Constitutional law and fundamental rights', '#005C99', 'scale'),
('Corporate', 'corporate', 'Corporate law and business regulations', '#00A99D', 'building'),
('Criminal', 'criminal', 'Criminal law and procedures', '#dc2626', 'shield'),
('Civil', 'civil', 'Civil law and procedures', '#0F224A', 'gavel'),
('Academic', 'academic', 'Legal education and research', '#8CC63F', 'book-open'),
('Policy', 'policy', 'Policy and regulatory matters', '#1a75b3', 'file-text')
ON CONFLICT (slug) DO NOTHING;

-- 5. Create storage bucket for media uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-media', 'article-media', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Set up Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "legal_sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "article_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "case_citations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "editorial_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "source_links" ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all users" ON "users" FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON "users" FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Admins can manage all users" ON "users" FOR ALL USING (
    EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role = 'ADMIN')
);

-- Articles table policies
CREATE POLICY "Anyone can view published articles" ON "articles" FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Authors can view own articles" ON "articles" FOR SELECT USING (author_id = auth.uid()::text);
CREATE POLICY "Editors and Admins can view all articles" ON "articles" FOR SELECT USING (
    EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role IN ('EDITOR', 'ADMIN'))
);
CREATE POLICY "Authors can create articles" ON "articles" FOR INSERT WITH CHECK (author_id = auth.uid()::text);
CREATE POLICY "Authors can update own articles" ON "articles" FOR UPDATE USING (author_id = auth.uid()::text);
CREATE POLICY "Editors and Admins can update all articles" ON "articles" FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role IN ('EDITOR', 'ADMIN'))
);

-- Legal sections policies
CREATE POLICY "Anyone can view legal sections" ON "legal_sections" FOR SELECT USING (true);
CREATE POLICY "Admins can manage legal sections" ON "legal_sections" FOR ALL USING (
    EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role = 'ADMIN')
);

-- Tags policies
CREATE POLICY "Anyone can view tags" ON "tags" FOR SELECT USING (true);
CREATE POLICY "Editors and Admins can manage tags" ON "tags" FOR ALL USING (
    EXISTS (SELECT 1 FROM "users" WHERE id = auth.uid()::text AND role IN ('EDITOR', 'ADMIN'))
);

-- Storage policies for article media
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'article-media');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'article-media' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (
    bucket_id = 'article-media' AND auth.uid()::text = (storage.foldername(name))[2]
);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (
    bucket_id = 'article-media' AND auth.uid()::text = (storage.foldername(name))[2]
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_articles_status" ON "articles" ("status");
CREATE INDEX IF NOT EXISTS "idx_articles_author_id" ON "articles" ("author_id");
CREATE INDEX IF NOT EXISTS "idx_articles_section_id" ON "articles" ("section_id");
CREATE INDEX IF NOT EXISTS "idx_articles_published_at" ON "articles" ("published_at");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "users" ("is_active");

-- 8. Update any existing users to have is_active = true if null
UPDATE "users" SET "is_active" = true WHERE "is_active" IS NULL;

-- 9. Ensure all users have proper timestamps
UPDATE "users" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "users" SET "updated_at" = now() WHERE "updated_at" IS NULL;

-- 10. Schema cache refresh (removed pg_stat_reset as it requires superuser privileges)
-- The schema changes will be automatically reflected in Supabase

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema successfully synced with current infrastructure!';
    RAISE NOTICE 'All required tables, columns, and policies have been created/updated.';
    RAISE NOTICE 'The isActive column issue should now be resolved.';
END $$;
