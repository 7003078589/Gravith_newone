import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('can navigate from home to login page', async ({ page }) => {
    await page.goto('/');

    // Click the Sign In button in the header
    await page
      .getByRole('button', { name: /sign in/i })
      .first()
      .click();

    // Should navigate to login page
    await expect(page).toHaveURL('/login');

    // Check that login page elements are present
    await expect(page.getByText('Gavith Build')).toBeVisible();
    await expect(page.getByText('Construction Management System')).toBeVisible();

    // Check for login form elements
    await expect(page.getByLabelText(/username/i)).toBeVisible();
    await expect(page.getByLabelText(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('can navigate using Enter Building button', async ({ page }) => {
    await page.goto('/');

    // Click the main "Enter the Building" button
    await page
      .getByRole('button', { name: /enter the building/i })
      .first()
      .click();

    // Should navigate to login page
    await expect(page).toHaveURL('/login');

    // Verify we're on the login page
    await expect(page.getByText('Gavith Build')).toBeVisible();
  });

  test('can navigate to dashboard with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in demo credentials
    await page.getByLabelText(/username/i).fill('admin');
    await page.getByLabelText(/password/i).fill('admin123');

    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Check for dashboard content
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('navigation links scroll to sections on homepage', async ({ page }) => {
    await page.goto('/');

    // Test Features link
    await page.getByRole('link', { name: /features/i }).click();

    // Should scroll to features section (check for features content)
    await expect(page.getByText('Enterprise-Grade Construction Management')).toBeVisible();

    // Test Pricing link
    await page.getByRole('link', { name: /pricing/i }).click();

    // Should scroll to pricing section
    await expect(page.getByText('Platinum-Tier Investment Plans')).toBeVisible();

    // Test Testimonials link
    await page.getByRole('link', { name: /testimonials/i }).click();

    // Should scroll to testimonials section
    await expect(page.getByText('Elite Industry Partnerships')).toBeVisible();
  });

  test('back button works correctly', async ({ page }) => {
    await page.goto('/');

    // Navigate to login
    await page
      .getByRole('button', { name: /sign in/i })
      .first()
      .click();
    await expect(page).toHaveURL('/login');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/home');

    // Should be back on home page
    await expect(page.getByText('Next-Generation Construction Management')).toBeVisible();
  });
});
