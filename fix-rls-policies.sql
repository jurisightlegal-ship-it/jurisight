-- Fix RLS Policies - Remove Infinite Recursion
-- This script fixes the RLS policies that are causing infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view all users" ON "users";
DROP POLICY IF EXISTS "Users can update own profile" ON "users";
DROP POLICY IF EXISTS "Admins can manage all users" ON "users";

-- Create simpler, non-recursive policies
CREATE POLICY "Enable read access for all users" ON "users" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "users" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON "users" FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Enable delete for users based on user_id" ON "users" FOR DELETE USING (auth.uid()::text = id);

-- Also fix other table policies to prevent similar issues
DROP POLICY IF EXISTS "Anyone can view published articles" ON "articles";
DROP POLICY IF EXISTS "Authors can view own articles" ON "articles";
DROP POLICY IF EXISTS "Editors and Admins can view all articles" ON "articles";
DROP POLICY IF EXISTS "Authors can create articles" ON "articles";
DROP POLICY IF EXISTS "Authors can update own articles" ON "articles";
DROP POLICY IF EXISTS "Editors and Admins can update all articles" ON "articles";

-- Create simpler article policies
CREATE POLICY "Enable read access for all users" ON "articles" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "articles" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on author_id" ON "articles" FOR UPDATE USING (auth.uid()::text = author_id);
CREATE POLICY "Enable delete for users based on author_id" ON "articles" FOR DELETE USING (auth.uid()::text = author_id);

-- Fix legal sections policies
DROP POLICY IF EXISTS "Anyone can view legal sections" ON "legal_sections";
DROP POLICY IF EXISTS "Admins can manage legal sections" ON "legal_sections";

CREATE POLICY "Enable read access for all users" ON "legal_sections" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "legal_sections" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON "legal_sections" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON "legal_sections" FOR DELETE USING (auth.role() = 'authenticated');

-- Fix tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON "tags";
DROP POLICY IF EXISTS "Editors and Admins can manage tags" ON "tags";

CREATE POLICY "Enable read access for all users" ON "tags" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "tags" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON "tags" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON "tags" FOR DELETE USING (auth.role() = 'authenticated');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed successfully! Infinite recursion issues resolved.';
END $$;
