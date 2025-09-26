const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testScheduledPosts() {
  console.log('🧪 Testing Scheduled Posts System...\n');

  try {
    // Test 1: Check if SCHEDULED status exists
    console.log('1. Checking if SCHEDULED status exists in database...');
    const { data: statusCheck, error: statusError } = await supabase
      .from('articles')
      .select('status')
      .eq('status', 'SCHEDULED')
      .limit(1);

    if (statusError) {
      console.error('❌ Error checking SCHEDULED status:', statusError);
      if (statusError.message.includes('invalid input value for enum')) {
        console.log('🔧 SCHEDULED status does not exist in the enum. Need to add it.');
        console.log('Run this SQL in your Supabase dashboard:');
        console.log('ALTER TYPE "public"."status" ADD VALUE \'SCHEDULED\';');
        return;
      }
    } else {
      console.log('✅ SCHEDULED status exists in database');
    }

    // Test 2: Check for scheduled articles
    console.log('\n2. Checking for scheduled articles...');
    const now = new Date();
    const currentTime = now.toISOString();
    
    const { data: scheduledArticles, error: scheduledError } = await supabase
      .from('articles')
      .select('id, title, slug, scheduled_at, status')
      .not('scheduled_at', 'is', null)
      .eq('status', 'SCHEDULED')
      .lte('scheduled_at', currentTime);

    if (scheduledError) {
      console.error('❌ Error fetching scheduled articles:', scheduledError);
      return;
    }

    console.log(`📝 Found ${scheduledArticles?.length || 0} articles ready for publishing`);
    if (scheduledArticles && scheduledArticles.length > 0) {
      scheduledArticles.forEach(article => {
        console.log(`   - "${article.title}" (ID: ${article.id}) - Scheduled: ${article.scheduled_at}`);
      });
    }

    // Test 3: Check all scheduled articles (regardless of time)
    console.log('\n3. Checking all scheduled articles...');
    const { data: allScheduled, error: allScheduledError } = await supabase
      .from('articles')
      .select('id, title, slug, scheduled_at, status')
      .not('scheduled_at', 'is', null)
      .eq('status', 'SCHEDULED');

    if (allScheduledError) {
      console.error('❌ Error fetching all scheduled articles:', allScheduledError);
    } else {
      console.log(`📅 Total scheduled articles: ${allScheduled?.length || 0}`);
      if (allScheduled && allScheduled.length > 0) {
        allScheduled.forEach(article => {
          const scheduledDate = new Date(article.scheduled_at);
          const isReady = scheduledDate <= now;
          console.log(`   - "${article.title}" (ID: ${article.id}) - Scheduled: ${article.scheduled_at} ${isReady ? '✅ READY' : '⏳ WAITING'}`);
        });
      }
    }

    // Test 4: Test the API endpoint
    console.log('\n4. Testing the publish-scheduled API endpoint...');
    const apiKey = process.env.CRON_API_KEY || 'your-secret-api-key';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${appUrl}/api/publish-scheduled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API endpoint working:', data);
      } else {
        const errorData = await response.json();
        console.error('❌ API endpoint error:', errorData);
      }
    } catch (apiError) {
      console.error('❌ API endpoint connection error:', apiError.message);
      console.log('💡 Make sure your development server is running (npm run dev)');
    }

    console.log('\n🎉 Scheduled posts test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testScheduledPosts();
