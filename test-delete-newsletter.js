const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeleteNewsletter() {
  console.log('🧪 Testing Newsletter Delete Functionality...\n');

  try {
    // Step 1: Create a test subscriber
    console.log('1. Creating a test subscriber...');
    const testEmail = `test-delete-${Date.now()}@example.com`;
    
    const { data: insertData, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: testEmail,
          subscribed_at: new Date().toISOString(),
          is_active: true
        }
      ])
      .select();

    if (insertError) {
      console.error('❌ Error creating test subscriber:', insertError);
      return;
    }

    const testSubscriber = insertData[0];
    console.log('✅ Test subscriber created:', testSubscriber);

    // Step 2: Test the delete API endpoint
    console.log('\n2. Testing delete API endpoint...');
    const apiKey = process.env.CRON_API_KEY || 'your-secret-api-key';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${appUrl}/api/dashboard/newsletter`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ id: testSubscriber.id })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Delete API endpoint working:', data);
      } else {
        const errorData = await response.json();
        console.error('❌ Delete API endpoint error:', errorData);
        console.log('Response status:', response.status);
      }
    } catch (apiError) {
      console.error('❌ Delete API endpoint connection error:', apiError.message);
      console.log('💡 Make sure your development server is running (npm run dev)');
    }

    // Step 3: Verify the subscriber was deleted
    console.log('\n3. Verifying subscriber was deleted...');
    const { data: checkData, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('id', testSubscriber.id);

    if (checkError) {
      console.error('❌ Error checking deleted subscriber:', checkError);
    } else if (checkData && checkData.length === 0) {
      console.log('✅ Subscriber successfully deleted from database');
    } else {
      console.log('❌ Subscriber still exists in database:', checkData);
    }

    console.log('\n🎉 Newsletter delete test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDeleteNewsletter();
