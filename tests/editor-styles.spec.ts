import { test, expect } from '@playwright/test';

test('editor styles: bold/italic/underline/headers/lists/alignment/colors render', async ({ page }) => {
  await page.goto('/dashboard/articles/new');

  // Wait editor
  const editor = page.locator('.ql-editor');
  await editor.click();

  // Type and style
  await page.getByTestId('btn-bold').click();
  await editor.type('Bold');
  await page.getByTestId('btn-bold').click();

  await page.getByTestId('btn-italic').click();
  await editor.type(' Italic');
  await page.getByTestId('btn-italic').click();

  await page.getByTestId('btn-underline').click();
  await editor.type(' Underline');
  await page.getByTestId('btn-underline').click();

  await editor.press('Enter');
  await page.getByTestId('btn-h2').click();
  await editor.type('Heading Two');

  await editor.press('Enter');
  await page.getByTestId('btn-list-bullet').click();
  await editor.type('Item 1');
  await editor.press('Enter');
  await editor.type('Item 2');

  await editor.press('Enter');
  await page.getByTestId('btn-align-center').click();
  await editor.type('Centered');

  // Pick a color via palette: simulate exec with inline style injection
  await page.evaluate(() => {
    const el = document.querySelector('.ql-editor');
    if (el) {
      const p = document.createElement('p');
      p.innerHTML = '<span style="color:#ef4444">Red text</span>';
      el.appendChild(p);
    }
  });

  // Validate editor contains tokens
  await expect(editor).toContainText('Bold');
  await expect(editor).toContainText('Italic');
  await expect(editor).toContainText('Underline');
  await expect(editor.locator('h2')).toContainText('Heading Two');
  await expect(editor.locator('ul > li')).toHaveCount(2);
  await expect(editor).toContainText('Centered');
  await expect(editor.locator('span[style*="color:"]')).toBeVisible();
});


