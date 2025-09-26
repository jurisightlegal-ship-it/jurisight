// Fix User Role - Update Jurisight user to ADMIN
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixUserRole() {
  console.log('🔧 Fixing user role for Jurisight user...\n');

  try {
    // Find the Jurisight user
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'jurisightlegaal@gmail.com');

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ User not found with email: jurisightlegaal@gmail.com');
      return;
    }

    const user = users[0];
    console.log(`📋 Current user data:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Active: ${user.is_active}`);

    // Update the role to ADMIN
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'ADMIN',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user role:', updateError.message);
      return;
    }

    console.log('\n✅ User role updated successfully!');
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`   Updated At: ${updatedUser.updated_at}`);

    console.log('\n🔄 Please refresh your browser to see the updated role and additional quick actions.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixUserRole();
