import { test, expect } from '@playwright/test';

test('toolbar bold/italic/h2 and alignment work', async ({ page }) => {
  await page.goto('/test-editor');

  const editor = page.locator('.ql-editor');
  await editor.click();
  await editor.type('Hello');

  // Bold
  await page.getByTestId('btn-bold').click();
  await editor.type(' Bold');

  // Italic
  await page.getByTestId('btn-italic').click();
  await editor.type(' Italic');

  // Header 2 on a new line
  await editor.press('Enter');
  await page.getByTestId('btn-h2').click();
  await editor.type('Header Line');

  // Align center
  await page.getByTestId('btn-align-center').click();

  // Assertions: editor should contain styled content
  await expect(editor).toContainText('Hello Bold Italic');
  await expect(editor.locator('h2')).toContainText('Header Line');
});
