const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testBucket() {
  try {
    console.log('Testing bucket access...');
    
    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Check if article-media bucket exists
    const articleMediaBucket = buckets.find(b => b.name === 'article-media');
    
    if (!articleMediaBucket) {
      console.log('article-media bucket does not exist. Creating it...');
      
      const { data, error } = await supabase.storage.createBucket('article-media', {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return;
      }
      
      console.log('Bucket created successfully:', data);
    } else {
      console.log('article-media bucket exists:', articleMediaBucket);
    }
    
    // Test upload permissions
    console.log('Testing upload permissions...');
    
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const testPath = 'test/test-file.txt';
    
    const { error: uploadError } = await supabase.storage
      .from('article-media')
      .upload(testPath, testFile);
    
    if (uploadError) {
      console.error('Upload test failed:', uploadError);
    } else {
      console.log('Upload test successful!');
      
      // Clean up test file
      await supabase.storage
        .from('article-media')
        .remove([testPath]);
      console.log('Test file cleaned up');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBucket();
