// Check Users in Supabase Database
// This script will query the users table and display all users

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

async function checkUsers() {
  console.log('🔍 Checking users in your Supabase database...\n');

  try {
    // Query all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('📭 No users found in the database.');
      console.log('\n💡 To create a user, you can:');
      console.log('1. Use the signup flow in your application');
      console.log('2. Create a user manually in the Supabase dashboard');
      console.log('3. Use the Supabase CLI with proper authentication');
      return;
    }

    console.log(`✅ Found ${users.length} user(s) in the database:\n`);

    // Display users in a nice table format
    console.log('┌─────────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ USER ID                                │ NAME                │ EMAIL                    │ ROLE        │ ACTIVE │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────────────┤');

    users.forEach((user, index) => {
      const id = user.id.substring(0, 8) + '...';
      const name = (user.name || 'N/A').substring(0, 18).padEnd(18);
      const email = (user.email || 'N/A').substring(0, 22).padEnd(22);
      const role = (user.role || 'N/A').padEnd(10);
      const active = user.is_active ? '✅ Yes' : '❌ No';
      
      console.log(`│ ${id.padEnd(38)} │ ${name} │ ${email} │ ${role} │ ${active} │`);
    });

    console.log('└─────────────────────────────────────────────────────────────────────────────────────────┘');

    // Show detailed information for each user
    console.log('\n📋 Detailed User Information:\n');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'Not set'}`);
      console.log(`   Email: ${user.email || 'Not set'}`);
      console.log(`   Role: ${user.role || 'Not set'}`);
      console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`   Bio: ${user.bio || 'Not set'}`);
      console.log(`   Image: ${user.image || 'Not set'}`);
      console.log(`   LinkedIn: ${user.linkedin_url || 'Not set'}`);
      console.log(`   Personal Email: ${user.personal_email || 'Not set'}`);
      console.log(`   Created: ${user.created_at || 'Not set'}`);
      console.log(`   Updated: ${user.updated_at || 'Not set'}`);
      console.log('');
    });

    // Show summary statistics
    const activeUsers = users.filter(u => u.is_active).length;
    const contributors = users.filter(u => u.role === 'CONTRIBUTOR').length;
    const editors = users.filter(u => u.role === 'EDITOR').length;
    const admins = users.filter(u => u.role === 'ADMIN').length;

    console.log('📊 Summary Statistics:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Active Users: ${activeUsers}`);
    console.log(`   Contributors: ${contributors}`);
    console.log(`   Editors: ${editors}`);
    console.log(`   Admins: ${admins}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
checkUsers();
