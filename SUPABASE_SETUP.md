# Supabase Setup Guide for Jurisight

## ✅ What's Been Configured

### 1. **Packages Installed**
- `@supabase/supabase-js` - Supabase client library
- `@supabase/ssr` - Server-side rendering support
- `postgres` - PostgreSQL client for Drizzle
- `drizzle-orm` - Database ORM

### 2. **Configuration Files Created/Updated**
- `src/lib/supabase.ts` - Client-side Supabase client
- `src/lib/supabase-server.ts` - Server-side Supabase client
- `src/lib/db.ts` - Updated to use Supabase PostgreSQL
- `drizzle.config.ts` - Updated for Supabase connection
- `.env.example` - Environment variables template

### 3. **Database Schema**
- All existing Drizzle schemas are compatible with Supabase
- No changes needed to `src/lib/schema.ts`

## 🚀 Next Steps

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Set a strong database password

### 2. **Get Your Supabase Credentials**
From your Supabase project dashboard:
- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → Project API keys → anon/public
- **Database URL**: Settings → Database → Connection string → URI

### 3. **Set Environment Variables**
Create/update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_database_url

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. **Run Database Migrations**
```bash
# Generate migrations from your schema
npm run db:generate

# Push schema to Supabase
npm run db:push
```

### 5. **Enable Row Level Security (RLS)**
In Supabase dashboard → Authentication → Policies:
- Enable RLS on all tables
- Create policies for your use cases

### 6. **Test the Connection**
```bash
# Start development server
npm run dev

# Test in browser console
import { testSupabaseConnection } from './src/lib/test-supabase'
testSupabaseConnection()
```

## 🔧 Supabase Features You Can Use

### **Authentication**
- Built-in user management
- Social logins (Google, GitHub, etc.)
- Email/password authentication
- Magic links

### **Database**
- PostgreSQL with full SQL support
- Real-time subscriptions
- Row Level Security (RLS)
- Database functions and triggers

### **Storage**
- File uploads and management
- Image optimization
- CDN distribution

#### Storage Bucket Setup
```sql
-- Create storage bucket for article media
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-media', 'article-media', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'article-media');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'article-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (bucket_id = 'article-media' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'article-media' AND auth.uid()::text = (storage.foldername(name))[2]);
```

### **Edge Functions**
- Serverless functions
- API endpoints
- Background jobs

## 📊 Database Schema Migration

Your existing schema will work with Supabase. Key tables:
- `users` - User accounts and profiles
- `articles` - Blog posts and legal content
- `legal_sections` - Legal practice areas
- `case_citations` - Legal case references
- `source_links` - Reference links

## 🔐 Security Considerations

1. **Row Level Security**: Enable RLS on all tables
2. **API Keys**: Keep anon key public, service role key secret
3. **CORS**: Configure allowed origins in Supabase settings
4. **Rate Limiting**: Set up rate limits for API calls

## 🚀 Deployment

### **Vercel Deployment**
1. Add environment variables in Vercel dashboard
2. Deploy as usual - Supabase works seamlessly with Vercel

### **Database Migrations in Production**
```bash
# Generate production migrations
npm run db:generate

# Apply to production
npm run db:push
```

## 📈 Benefits of Supabase

- **Real-time**: Live updates for collaborative features
- **Scalability**: Handles growth automatically
- **Developer Experience**: Great dashboard and tooling
- **Cost-effective**: Generous free tier
- **Open Source**: No vendor lock-in

## 🆘 Troubleshooting

### **Connection Issues**
- Verify environment variables are correct
- Check Supabase project is active
- Ensure database URL includes SSL parameters

### **Migration Issues**
- Check Drizzle schema matches Supabase expectations
- Verify table permissions in Supabase dashboard
- Review RLS policies if data access fails

### **Build Issues**
- Ensure all environment variables are set
- Check for TypeScript errors in Supabase client usage
- Verify package versions are compatible

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle with Supabase](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
