const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewsletterTable() {
  console.log('🧪 Testing Newsletter Functionality...\n');

  try {
    // Test 1: Check if table exists by trying to query it
    console.log('1. Checking if newsletter_subscribers table exists...');
    const { data: testData, error: tableError } = await supabase
      .from('newsletter_subscribers')
      .select('count')
      .limit(1);

    if (tableError) {
      if (tableError.code === 'PGRST116' || tableError.message.includes('does not exist')) {
        console.log('❌ newsletter_subscribers table does not exist');
        console.log('Please run the SQL script: add-newsletter-table.sql in your Supabase dashboard');
        return;
      } else {
        console.error('❌ Error checking table:', tableError);
        return;
      }
    }

    console.log('✅ newsletter_subscribers table exists');

    // Test 2: Try to insert a test subscription
    console.log('\n2. Testing newsletter subscription...');
    const testEmail = `test-${Date.now()}@example.com`;
    
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
      console.error('❌ Error inserting newsletter subscription:', insertError);
      return;
    }

    console.log('✅ Successfully inserted test subscription:', insertData[0]);

    // Test 3: Check for duplicate email
    console.log('\n3. Testing duplicate email prevention...');
    const { data: duplicateData, error: duplicateError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: testEmail, // Same email
          subscribed_at: new Date().toISOString(),
          is_active: true
        }
      ])
      .select();

    if (duplicateError) {
      console.log('✅ Duplicate email correctly prevented:', duplicateError.message);
    } else {
      console.log('❌ Duplicate email was not prevented');
    }

    // Test 4: Clean up test data
    console.log('\n4. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', testEmail);

    if (deleteError) {
      console.error('❌ Error cleaning up test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }

    console.log('\n🎉 Newsletter functionality test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Make sure to run add-newsletter-table.sql in your Supabase dashboard');
    console.log('2. Test the newsletter form on your website');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testNewsletterTable();
