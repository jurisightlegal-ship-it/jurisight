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

async function testFeaturedImage() {
  try {
    console.log('Testing featured image functionality...');
    
    // First, let's check the current article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, featured_image')
      .eq('id', 1)
      .single();
    
    if (fetchError) {
      console.error('Error fetching article:', fetchError);
      return;
    }
    
    console.log('Current article:', article);
    
    // Upload a test image
    console.log('Uploading test image...');
    const testImagePath = 'images/test-user/test-featured-image.png';
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    // Create a File object with correct MIME type
    const testFile = new File([testImageBuffer], 'test-featured-image.png', { type: 'image/png' });
    
    const { error: uploadError } = await supabase.storage
      .from('article-media')
      .upload(testImagePath, testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }
    
    console.log('Test image uploaded successfully');
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('article-media')
      .getPublicUrl(testImagePath);
    
    console.log('Public URL:', urlData.publicUrl);
    
    // Update the article with the featured image
    const { error: updateError } = await supabase
      .from('articles')
      .update({ featured_image: testImagePath })
      .eq('id', 1);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }
    
    console.log('Article updated with featured image');
    
    // Verify the update
    const { data: updatedArticle, error: verifyError } = await supabase
      .from('articles')
      .select('id, title, featured_image')
      .eq('id', 1)
      .single();
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
      return;
    }
    
    console.log('Updated article:', updatedArticle);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFeaturedImage();
