const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMediaUpload() {
  try {
    console.log('Testing media upload with authentication...');
    
    // Sign in with test credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // Replace with a test user email
      password: 'password123'     // Replace with test user password
    });

    if (authError) {
      console.error('Authentication failed:', authError.message);
      return;
    }

    console.log('Authentication successful:', authData.user.email);
    console.log('Access token available:', !!authData.session?.access_token);

    // Create a test file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const filePath = `test/${authData.user.id}/test-file.txt`;

    // Test upload with authenticated client
    const { error: uploadError } = await supabase.storage
      .from('article-media')
      .upload(filePath, testFile);

    if (uploadError) {
      console.error('Upload failed:', uploadError.message);
    } else {
      console.log('Upload successful!');
      
      // Clean up test file
      await supabase.storage
        .from('article-media')
        .remove([filePath]);
      console.log('Test file cleaned up');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMediaUpload();
