import { test, expect } from '@playwright/test';

test('RichTextEditor types and reflects HTML', async ({ page }) => {
  await page.goto('/test-editor');

  const editor = page.locator('.ql-editor');
  await editor.click();
  await editor.type('Hello Quill!');

  // Ensure text appears in editor
  await expect(editor).toContainText('Hello Quill!');

  // Ensure HTML reflects content in our debug div (value is also mirrored to data-html)
  const htmlDebug = page.locator('#editor-html');
  await expect
    .poll(async () => await htmlDebug.getAttribute('data-html'), { timeout: 5000 })
    .toContain('Hello Quill!');
});


