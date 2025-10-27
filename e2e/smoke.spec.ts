import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads and displays main content', async ({ page }) => {
    await page.goto('/');

    // Should redirect to /home and show the main heading
    await expect(page).toHaveURL('/home');

    // Check for main brand elements
    await expect(page.getByText('Gavith Build')).toBeVisible();
    await expect(page.getByText('Construction Management System')).toBeVisible();

    // Check for main heading
    await expect(page.getByText('Next-Generation Construction Management')).toBeVisible();

    // Check for key buttons
    await expect(page.getByRole('button', { name: /enter the building/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('page has proper title and meta information', async ({ page }) => {
    await page.goto('/');

    // Check page title (Next.js default or custom)
    await expect(page).toHaveTitle(/Gavith Build|Next.js App/);

    // Check that the page loads without errors
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('navigation elements are accessible', async ({ page }) => {
    await page.goto('/');

    // Check header navigation
    await expect(page.getByRole('navigation').first()).toBeVisible();

    // Check for main navigation links
    await expect(page.getByRole('link', { name: /features/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /testimonials/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
  });
});
