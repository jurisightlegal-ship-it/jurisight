const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPolicies() {
  console.log('🧪 Testing RLS Policies for Newsletter Subscribers...\n');

  try {
    // Test 1: Check if we can read from the table
    console.log('1. Testing read access...');
    const { data: readData, error: readError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .limit(1);

    if (readError) {
      console.error('❌ Read error:', readError);
    } else {
      console.log('✅ Read access working');
    }

    // Test 2: Check if we can insert into the table
    console.log('\n2. Testing insert access...');
    const testEmail = `test-rls-${Date.now()}@example.com`;
    
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
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Insert access working');
      
      // Test 3: Check if we can delete from the table
      console.log('\n3. Testing delete access...');
      const testId = insertData[0].id;
      
      const { error: deleteError } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', testId);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        console.log('🔧 This might be due to RLS policies. You may need to:');
        console.log('   1. Check RLS policies on newsletter_subscribers table');
        console.log('   2. Ensure the policies allow delete operations');
        console.log('   3. Or use the service role key for admin operations');
      } else {
        console.log('✅ Delete access working');
      }
    }

    // Test 4: Check RLS status
    console.log('\n4. Checking RLS status...');
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_enabled', { table_name: 'newsletter_subscribers' })
      .catch(() => {
        // If the function doesn't exist, try a different approach
        return supabase
          .from('information_schema.tables')
          .select('*')
          .eq('table_name', 'newsletter_subscribers')
          .eq('table_schema', 'public');
      });

    if (rlsError) {
      console.log('ℹ️  Could not check RLS status directly');
    } else {
      console.log('ℹ️  RLS check result:', rlsData);
    }

    console.log('\n🎉 RLS policy test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRLSPolicies();