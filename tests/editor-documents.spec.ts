import { test, expect } from '@playwright/test';

test('inserts document link via mocked /api/media/upload', async ({ page }) => {
  await page.route('**/api/media/upload', async route => {
    const body = { data: { url: 'https://cdn.example.com/article-media/documents/sample.pdf', path: 'documents/sample.pdf' } };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto('/test-editor');
  const editor = page.locator('.ql-editor');
  await editor.click();

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByTestId('btn-document-upload').click()
  ]);

  await fileChooser.setFiles({ name: 'sample.pdf', mimeType: 'application/pdf', buffer: Buffer.from([0x25, 0x50]) });

  // Assert link appears with filename
  const link = editor.locator('a[href="https://cdn.example.com/article-media/documents/sample.pdf"]');
  await expect(link).toBeVisible();
  await expect(link).toContainText('sample.pdf');
});


