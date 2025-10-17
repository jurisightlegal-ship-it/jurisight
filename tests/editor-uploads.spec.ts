import { test, expect } from '@playwright/test';

test('inserts image via mocked /api/media/upload', async ({ page }) => {
  await page.route('**/api/media/upload', async route => {
    const body = { data: { url: 'https://cdn.example.com/article-media/images/test.png', path: 'images/test.png' } };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto('/test-editor');
  const editor = page.locator('.ql-editor');
  await editor.click();

  // Trigger upload handler (opens file picker). We will dispatch change with a fake file.
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByTestId('btn-image-upload').click()
  ]);

  await fileChooser.setFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from([0x89]) });

  // Assert image appears in the editor with our mocked URL
  const img = editor.locator('img[src="https://cdn.example.com/article-media/images/test.png"]');
  await expect(img).toBeVisible();
});
