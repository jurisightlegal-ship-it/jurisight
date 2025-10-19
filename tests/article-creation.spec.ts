import { test, expect } from '@playwright/test';

test('debug article creation buttons', async ({ page }) => {
  // Increase timeout for this test
  test.setTimeout(60000);
  
  // Navigate to the new article page
  console.log('Navigating to /dashboard/articles/new');
  await page.goto('/dashboard/articles/new');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('Page loaded');
  
  // Check if we're on the right page
  const title = await page.title();
  console.log('Page title:', title);
  
  // Try to find and fill the title field
  try {
    const titleInput = page.getByPlaceholder('Enter article title...');
    await titleInput.waitFor({ state: 'visible', timeout: 5000 });
    await titleInput.fill('Test Article');
    console.log('Title filled');
  } catch (error: any) {
    console.log('Could not fill title:', error.message);
  }
  
  // Try to find and fill the content editor
  try {
    const editor = page.locator('.ql-editor');
    await editor.waitFor({ state: 'visible', timeout: 5000 });
    await editor.click();
    await editor.type('Test content for the article.');
    console.log('Content filled');
  } catch (error: any) {
    console.log('Could not fill content:', error.message);
  }
  
  // Try to select a section
  try {
    // Look for any select element
    const sectionSelect = page.locator('select').first();
    await sectionSelect.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get all options
    const options = await sectionSelect.locator('option').all();
    console.log(`Found ${options.length} options in section dropdown`);
    
    // Select the first non-empty option
    for (const option of options) {
      const value = await option.getAttribute('value');
      if (value && value !== '') {
        await sectionSelect.selectOption(value);
        console.log(`Selected section with value: ${value}`);
        break;
      }
    }
  } catch (error: any) {
    console.log('Could not select section:', error.message);
  }
  
  // Wait a bit for state updates
  await page.waitForTimeout(2000);
  
  // Check button states
  try {
    const saveDraftButton = page.getByRole('button', { name: 'Save Draft' });
    const isSaveDraftEnabled = await saveDraftButton.isEnabled();
    const saveDraftDisabledAttr = await saveDraftButton.getAttribute('disabled');
    
    console.log('Save Draft button:');
    console.log('  - Enabled:', isSaveDraftEnabled);
    console.log('  - Disabled attribute:', saveDraftDisabledAttr);
    
    const submitReviewButton = page.getByRole('button', { name: 'Submit for Review' });
    const isSubmitReviewEnabled = await submitReviewButton.isEnabled();
    const submitReviewDisabledAttr = await submitReviewButton.getAttribute('disabled');
    
    console.log('Submit for Review button:');
    console.log('  - Enabled:', isSubmitReviewEnabled);
    console.log('  - Disabled attribute:', submitReviewDisabledAttr);
    
  } catch (error: any) {
    console.log('Could not check button states:', error.message);
  }
  
  console.log('Test completed');
});