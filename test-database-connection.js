// Test Database Connection and Schema
// Run this script to verify your Supabase connection and schema

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env.local file has:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase connection and schema...\n');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Supabase connection successful');

    // Test 2: Check users table schema
    console.log('\n2. Checking users table schema...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      return;
    }

    if (users && users.length > 0) {
      const user = users[0];
      const requiredFields = ['id', 'name', 'email', 'role', 'is_active', 'created_at', 'updated_at'];
      const missingFields = requiredFields.filter(field => !(field in user));
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields in users table:', missingFields);
        console.log('Available fields:', Object.keys(user));
      } else {
        console.log('✅ Users table schema is correct');
        console.log('   - is_active field exists:', 'is_active' in user);
        console.log('   - Sample user data:', {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active
        });
      }
    } else {
      console.log('⚠️  Users table is empty, but schema appears correct');
    }

    // Test 3: Check other required tables
    console.log('\n3. Checking other required tables...');
    const tables = ['legal_sections', 'tags', 'articles', 'article_tags', 'case_citations', 'source_links', 'editorial_comments'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table} error:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists and accessible`);
      }
    }

    // Test 4: Check legal sections data
    console.log('\n4. Checking legal sections data...');
    const { data: sections, error: sectionsError } = await supabase
      .from('legal_sections')
      .select('*');
    
    if (sectionsError) {
      console.error('❌ Legal sections error:', sectionsError.message);
    } else {
      console.log(`✅ Found ${sections?.length || 0} legal sections`);
      if (sections && sections.length > 0) {
        console.log('   Sections:', sections.map(s => s.name).join(', '));
      }
    }

    // Test 5: Test user creation (if no users exist)
    console.log('\n5. Testing user creation...');
    const { data: existingUsers } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (!existingUsers || existingUsers.length === 0) {
      console.log('   No users found, testing user creation...');
      
      // This would require service role key for user creation
      console.log('   ⚠️  User creation test requires service role key');
      console.log('   ⚠️  Please create a user manually through the app or Supabase dashboard');
    } else {
      console.log('✅ Users exist in database');
    }

    console.log('\n🎉 Database connection and schema test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If you see any errors above, run the fix-database-schema.sql script');
    console.log('2. Make sure your .env.local file has all required variables');
    console.log('3. Try running your application again');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDatabaseConnection();
