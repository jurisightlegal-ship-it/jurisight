const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Creating comments table...');
    
    // Create comments table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          is_approved BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createTableError) {
      console.error('Error creating table:', createTableError);
      return;
    }

    console.log('Creating indexes...');
    
    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);',
      'CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (indexError) {
        console.error('Error creating index:', indexError);
      }
    }

    console.log('Setting up RLS policies...');
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE comments ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
    }

    // Create policies
    const policies = [
      `CREATE POLICY "Anyone can read approved comments" ON comments
        FOR SELECT USING (is_approved = true);`,
      `CREATE POLICY "Anyone can insert comments" ON comments
        FOR INSERT WITH CHECK (true);`
    ];

    for (const policySql of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policySql });
      if (policyError) {
        console.error('Error creating policy:', policyError);
      }
    }

    console.log('Creating updated_at trigger...');
    
    // Create trigger function and trigger
    const triggerFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: triggerFunction });
    if (functionError) {
      console.error('Error creating trigger function:', functionError);
    }

    const trigger = `
      CREATE TRIGGER update_comments_updated_at 
        BEFORE UPDATE ON comments 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: trigger });
    if (triggerError) {
      console.error('Error creating trigger:', triggerError);
    }

    console.log('✅ Comments table migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
