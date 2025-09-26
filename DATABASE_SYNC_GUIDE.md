# Database Sync Guide - Fix "isActive" Column Error

## 🚨 Problem
You're getting the error: `"Could not find the 'isActive' column of 'users' in the schema cache"`

This happens because:
1. The database schema is not fully synced with the current codebase
2. The code expects `isActive` (camelCase) but the database has `is_active` (snake_case)
3. Some required tables or columns might be missing

## 🔧 Solution Steps

### Step 1: Run the Database Migration Script

1. **Open your Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Go to **SQL Editor**

2. **Run the Migration Script**
   - Copy the entire contents of `fix-database-schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the script

   This script will:
   - ✅ Add missing columns (`is_active`, `linkedin_url`, `personal_email`)
   - ✅ Create all required tables
   - ✅ Set up foreign key constraints
   - ✅ Insert default legal sections
   - ✅ Configure Row Level Security (RLS) policies
   - ✅ Create storage buckets for media uploads
   - ✅ Add performance indexes

### Step 2: Test the Database Connection

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run the test script**:
   ```bash
   node test-database-connection.js
   ```

   This will verify:
   - ✅ Supabase connection is working
   - ✅ All required tables exist
   - ✅ Users table has the correct schema
   - ✅ Legal sections are populated

### Step 3: Verify Environment Variables

Make sure your `.env.local` file has all required variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Step 4: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Troubleshooting

### If you still get the "isActive" error:

1. **Check the Supabase logs**:
   - Go to Supabase Dashboard → Logs
   - Look for any SQL errors

2. **Verify the migration ran successfully**:
   - Go to Supabase Dashboard → Table Editor
   - Check if the `users` table has the `is_active` column
   - Check if all other tables exist

3. **Clear your browser cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear localStorage and sessionStorage

4. **Check your environment variables**:
   - Make sure `.env.local` is in the project root
   - Verify the Supabase URL and keys are correct

### If you get permission errors:

1. **Check RLS policies**:
   - The migration script sets up RLS policies
   - Make sure they're enabled in Supabase Dashboard → Authentication → Policies

2. **Verify your Supabase project is active**:
   - Check if your project is paused
   - Ensure you have the correct API keys

## 📊 What the Migration Script Does

### Database Schema Updates:
- ✅ Ensures `users` table has `is_active` column
- ✅ Adds `linkedin_url` and `personal_email` columns
- ✅ Creates all required tables (`articles`, `legal_sections`, `tags`, etc.)
- ✅ Sets up proper foreign key relationships
- ✅ Adds performance indexes

### Security Setup:
- ✅ Enables Row Level Security (RLS) on all tables
- ✅ Creates appropriate access policies
- ✅ Sets up storage bucket policies for media uploads

### Data Population:
- ✅ Inserts default legal sections (Constitutional, Corporate, Criminal, etc.)
- ✅ Creates storage bucket for article media
- ✅ Updates existing users to have `is_active = true`

## 🎯 Expected Results

After running the migration:

1. **No more "isActive" errors** - The database schema will match the code expectations
2. **All tables created** - You'll have a complete database structure
3. **Security configured** - RLS policies will protect your data
4. **Performance optimized** - Indexes will improve query performance
5. **Ready for development** - You can start using the application immediately

## 🚀 Next Steps

Once the migration is complete:

1. **Test the application** - Try logging in and creating articles
2. **Create your first user** - Use the signup flow or create via Supabase dashboard
3. **Add some content** - Create legal sections and test the article creation
4. **Verify all features** - Check dashboard, user management, and content creation

## 📞 Need Help?

If you encounter any issues:

1. **Check the test script output** - It will show exactly what's wrong
2. **Review Supabase logs** - Look for specific error messages
3. **Verify your setup** - Make sure all environment variables are correct
4. **Run the migration again** - It's safe to run multiple times

The migration script is designed to be **idempotent** - you can run it multiple times safely without causing issues.
