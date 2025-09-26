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

async function updateBucket() {
  try {
    console.log('Updating bucket configuration...');
    
    // Update bucket to allow all MIME types
    const { data, error } = await supabase.storage.updateBucket('article-media', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
      // Remove allowedMimeTypes restriction
    });
    
    if (error) {
      console.error('Error updating bucket:', error);
      return;
    }
    
    console.log('Bucket updated successfully:', data);
    
  } catch (error) {
    console.error('Update failed:', error);
  }
}

updateBucket();
