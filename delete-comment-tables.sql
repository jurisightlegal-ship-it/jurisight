-- Delete Comment Section Tables
-- Run this script in your Supabase SQL Editor to remove comment functionality

-- 1. Drop foreign key constraints first (if they exist)
DO $$ BEGIN
    ALTER TABLE "editorial_comments" DROP CONSTRAINT IF EXISTS "editorial_comments_article_id_articles_id_fk";
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "editorial_comments" DROP CONSTRAINT IF EXISTS "editorial_comments_editor_id_users_id_fk";
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 2. Drop RLS policies (if they exist)
DROP POLICY IF EXISTS "editorial_comments_policy" ON "editorial_comments";

-- 3. Drop the editorial_comments table
DROP TABLE IF EXISTS "editorial_comments";

-- 4. Drop any other potential comment tables that might exist
-- (These are common comment table names that might have been created)
DROP TABLE IF EXISTS "comments";
DROP TABLE IF EXISTS "article_comments";
DROP TABLE IF EXISTS "user_comments";
DROP TABLE IF EXISTS "public_comments";

-- 5. Drop any comment-related sequences (if they exist)
DROP SEQUENCE IF EXISTS "editorial_comments_id_seq";
DROP SEQUENCE IF EXISTS "comments_id_seq";
DROP SEQUENCE IF EXISTS "article_comments_id_seq";
DROP SEQUENCE IF EXISTS "user_comments_id_seq";
DROP SEQUENCE IF EXISTS "public_comments_id_seq";

-- 6. Clean up any comment-related functions or triggers (if they exist)
DROP FUNCTION IF EXISTS "handle_new_comment"();
DROP FUNCTION IF EXISTS "handle_comment_update"();
DROP FUNCTION IF EXISTS "handle_comment_delete"();

-- 7. Verify the cleanup
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name LIKE '%comment%';

-- This query should return no results if all comment tables are successfully deleted
