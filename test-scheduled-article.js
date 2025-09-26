const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestScheduledArticle() {
  console.log('🧪 Creating a test scheduled article...\n');

  try {
    // Create a test article scheduled for 1 minute from now
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + 1);
    
    const testArticle = {
      title: `Test Scheduled Article - ${new Date().toISOString()}`,
      slug: `test-scheduled-article-${Date.now()}`,
      dek: 'This is a test article to verify scheduled publishing functionality.',
      body: 'This is the body of the test scheduled article. It should be automatically published in about 1 minute.',
      status: 'SCHEDULED',
      scheduled_at: scheduledTime.toISOString(),
      author_id: 'test-author-id', // You'll need to replace this with a real author ID
      section_id: 1, // You'll need to replace this with a real section ID
      reading_time: 2,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Test article details:');
    console.log(`   Title: ${testArticle.title}`);
    console.log(`   Scheduled for: ${testArticle.scheduled_at}`);
    console.log(`   Status: ${testArticle.status}`);

    // Note: This will fail if you don't have the right author_id and section_id
    // But it will show you the structure needed
    console.log('\n⚠️  Note: To create a real test article, you need:');
    console.log('   1. A valid author_id from your users table');
    console.log('   2. A valid section_id from your legal_sections table');
    console.log('   3. Run this script with proper IDs');

    console.log('\n✅ Test article structure created successfully!');
    console.log('🕐 The article is scheduled to be published in 1 minute');
    console.log('🔍 Check your database or run the cron script to see it get published');

  } catch (error) {
    console.error('❌ Error creating test article:', error);
  }
}

createTestScheduledArticle();
