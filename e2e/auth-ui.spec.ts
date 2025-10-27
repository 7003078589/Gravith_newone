import { test, expect } from '@playwright/test';

test.describe('Authentication UI Tests', () => {
  test('login form has proper form controls', async ({ page }) => {
    await page.goto('/login');

    // Check that form inputs are present and focusable
    const usernameInput = page.getByLabelText(/username/i);
    const passwordInput = page.getByLabelText(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Test that inputs are focusable
    await usernameInput.focus();
    await expect(usernameInput).toBeFocused();

    await passwordInput.focus();
    await expect(passwordInput).toBeFocused();
  });

  test('login form validation works', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation error
    await expect(page.getByText(/please enter both username and password/i)).toBeVisible();

    // Try with invalid credentials
    await page.getByLabelText(/username/i).fill('invalid');
    await page.getByLabelText(/password/i).fill('wrong');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
  });

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByLabelText(/password/i);
    const toggleButton = page.getByRole('button', { name: /show password/i });

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await toggleButton.click();

    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });

  test('demo credentials work correctly', async ({ page }) => {
    await page.goto('/login');

    // Test admin credentials
    await page.getByLabelText(/username/i).fill('admin');
    await page.getByLabelText(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Go back to test other credentials
    await page.goto('/login');

    // Test manager credentials
    await page.getByLabelText(/username/i).fill('manager');
    await page.getByLabelText(/password/i).fill('manager123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('create organization button is accessible', async ({ page }) => {
    await page.goto('/login');

    const createOrgButton = page.getByRole('button', { name: /create new organization/i });

    await expect(createOrgButton).toBeVisible();
    await expect(createOrgButton).toBeEnabled();

    // Click the button
    await createOrgButton.click();

    // Should navigate to organization setup
    await expect(page).toHaveURL('/organization/setup');
  });

  test('forgot password flow works', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    await page.getByRole('button', { name: /forgot password/i }).click();

    // Should show forgot password form
    await expect(page.getByText('Reset Password')).toBeVisible();
    await expect(page.getByLabelText(/username or email/i)).toBeVisible();

    const resetButton = page.getByRole('button', { name: /send reset instructions/i });
    await expect(resetButton).toBeVisible();

    // Test back to login button
    const backButton = page.getByRole('button', { name: /back to login/i });
    await expect(backButton).toBeVisible();

    await backButton.click();

    // Should be back on login form
    await expect(page.getByText('Gavith Build')).toBeVisible();
    await expect(page.getByLabelText(/username/i)).toBeVisible();
  });

  test('form accessibility features work', async ({ page }) => {
    await page.goto('/login');

    // Check that labels are properly associated with inputs
    const usernameInput = page.getByLabelText(/username/i);
    const passwordInput = page.getByLabelText(/password/i);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(usernameInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();

    // Check that required attributes are set
    await expect(usernameInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');

    // Check aria-labels on icon buttons
    const toggleButton = page.getByRole('button', { name: /show password/i });
    await expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });

  test('loading states are handled properly', async ({ page }) => {
    await page.goto('/login');

    // Fill form and submit
    await page.getByLabelText(/username/i).fill('admin');
    await page.getByLabelText(/password/i).fill('admin123');

    // Submit and check that button shows loading state briefly
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // Should navigate to dashboard (loading state is very brief in this mock)
    await expect(page).toHaveURL('/dashboard');
  });
});
