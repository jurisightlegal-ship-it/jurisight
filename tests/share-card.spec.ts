import { test, expect } from '@playwright/test';

// Basic coverage for ShareCard UI and interactions
// Assumes dev server runs at baseURL from playwright.config.ts

test.describe('ShareCard', () => {
  test.setTimeout(60000);

  test('renders on article page and interactions work', async ({ page }) => {
    // Go to articles list
    await page.goto('/articles');
    await page.waitForLoadState('networkidle');

    // Navigate to first article
    const firstArticleLink = page.locator('a[href^="/articles/"]').first();
    await firstArticleLink.waitFor({ state: 'visible' });
    await firstArticleLink.click();

    // Wait article page load
    await page.waitForLoadState('networkidle');

    // ShareCard visible
    const shareCard = page.getByTestId('share-card');
    await shareCard.scrollIntoViewIfNeeded();
    await expect(shareCard).toBeVisible();

    // Icons should be visible (sequential reveal triggered when in view)
    await expect(page.getByTestId('share-twitter')).toBeVisible();
    await expect(page.getByTestId('share-facebook')).toBeVisible();
    await expect(page.getByTestId('share-linkedin')).toBeVisible();
    await expect(page.getByTestId('share-whatsapp')).toBeVisible();
    await expect(page.getByTestId('share-copy')).toBeVisible();

    // Clicking Twitter should open a popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByTestId('share-twitter').click()
    ]);
    expect(popup).toBeTruthy();
    expect(popup.url()).toContain('twitter.com');
    await popup.close();

    // Copy link micro-interaction: data-copied toggles
    const copyBtn = page.getByTestId('share-copy');
    await copyBtn.click();
    await expect(copyBtn).toHaveAttribute('data-copied', 'true');
    await page.waitForTimeout(1600);
    await expect(copyBtn).toHaveAttribute('data-copied', 'false');
  });

  test('accessible labels present', async ({ page }) => {
    await page.goto('/articles');
    await page.waitForLoadState('networkidle');

    const firstArticleLink = page.locator('a[href^="/articles/"]').first();
    await firstArticleLink.waitFor({ state: 'visible' });
    await firstArticleLink.click();
    await page.waitForLoadState('networkidle');

    const card = page.getByTestId('share-card');
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();

    // Root card has aria-label
    await expect(page.locator('[aria-label="Share this article"]')).toBeVisible();

    // Buttons have accessible names
    await expect(page.getByRole('button', { name: /Twitter/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Facebook/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /LinkedIn/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /WhatsApp/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy link/i })).toBeVisible();

    // Keyboard interaction opens popup (LinkedIn)
    const linkedinBtn = page.getByTestId('share-linkedin');
    await linkedinBtn.focus();
    const [popup2] = await Promise.all([
      page.waitForEvent('popup'),
      page.keyboard.press('Enter')
    ]);
    expect(popup2.url()).toContain('linkedin.com');
    await popup2.close();
  });
});
