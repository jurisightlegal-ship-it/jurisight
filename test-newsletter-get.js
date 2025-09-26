const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewsletterGet() {
  console.log('🧪 Testing Newsletter GET API...\n');

  try {
    // Step 1: Create a few test subscribers
    console.log('1. Creating test subscribers...');
    const testEmails = [
      `test-get-1-${Date.now()}@example.com`,
      `test-get-2-${Date.now()}@example.com`,
      `test-get-3-${Date.now()}@example.com`
    ];
    
    for (const email of testEmails) {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: email,
            subscribed_at: new Date().toISOString(),
            is_active: true
          }
        ])
        .select();

      if (error) {
        console.error('❌ Error creating test subscriber:', error);
      } else {
        console.log(`✅ Created subscriber: ${email}`);
      }
    }

    // Step 2: Test the GET API endpoint
    console.log('\n2. Testing GET API endpoint...');
    const apiKey = process.env.CRON_API_KEY || 'your-secret-api-key';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${appUrl}/api/dashboard/newsletter?limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ GET API endpoint working:');
        console.log(`   Total subscribers: ${data.stats.total}`);
        console.log(`   Active subscribers: ${data.stats.active}`);
        console.log(`   Inactive subscribers: ${data.stats.inactive}`);
        console.log(`   Subscribers returned: ${data.subscribers.length}`);
      } else {
        const errorData = await response.json();
        console.error('❌ GET API endpoint error:', errorData);
        console.log('Response status:', response.status);
      }
    } catch (apiError) {
      console.error('❌ GET API endpoint connection error:', apiError.message);
      console.log('💡 Make sure your development server is running (npm run dev)');
    }

    // Step 3: Clean up test data
    console.log('\n3. Cleaning up test data...');
    for (const email of testEmails) {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('email', email);

      if (error) {
        console.error(`❌ Error cleaning up ${email}:`, error);
      } else {
        console.log(`✅ Cleaned up: ${email}`);
      }
    }

    console.log('\n🎉 Newsletter GET test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testNewsletterGet();
