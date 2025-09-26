const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addFeaturedFields() {
  try {
    console.log('Adding featured article fields to database...');

    // Add is_featured column
    const { error: featuredError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'articles' AND column_name = 'is_featured') THEN
            ALTER TABLE "articles" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;
          END IF;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END $$;
      `
    });

    if (featuredError) {
      console.error('Error adding is_featured column:', featuredError);
    } else {
      console.log('✅ Added is_featured column');
    }

    // Add is_top_news column
    const { error: topNewsError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'articles' AND column_name = 'is_top_news') THEN
            ALTER TABLE "articles" ADD COLUMN "is_top_news" boolean DEFAULT false NOT NULL;
          END IF;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END $$;
      `
    });

    if (topNewsError) {
      console.error('Error adding is_top_news column:', topNewsError);
    } else {
      console.log('✅ Added is_top_news column');
    }

    // Add featured_at column
    const { error: featuredAtError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'articles' AND column_name = 'featured_at') THEN
            ALTER TABLE "articles" ADD COLUMN "featured_at" timestamp;
          END IF;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END $$;
      `
    });

    if (featuredAtError) {
      console.error('Error adding featured_at column:', featuredAtError);
    } else {
      console.log('✅ Added featured_at column');
    }

    // Add top_news_at column
    const { error: topNewsAtError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'articles' AND column_name = 'top_news_at') THEN
            ALTER TABLE "articles" ADD COLUMN "top_news_at" timestamp;
          END IF;
        EXCEPTION
          WHEN duplicate_column THEN null;
        END $$;
      `
    });

    if (topNewsAtError) {
      console.error('Error adding top_news_at column:', topNewsAtError);
    } else {
      console.log('✅ Added top_news_at column');
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS "idx_articles_is_featured" ON "articles" ("is_featured");
        CREATE INDEX IF NOT EXISTS "idx_articles_is_top_news" ON "articles" ("is_top_news");
        CREATE INDEX IF NOT EXISTS "idx_articles_featured_at" ON "articles" ("featured_at");
        CREATE INDEX IF NOT EXISTS "idx_articles_top_news_at" ON "articles" ("top_news_at");
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Created indexes for better performance');
    }

    console.log('🎉 Featured article fields added successfully!');
    console.log('New fields: is_featured, is_top_news, featured_at, top_news_at');

  } catch (error) {
    console.error('Error adding featured fields:', error);
  }
}

addFeaturedFields();
