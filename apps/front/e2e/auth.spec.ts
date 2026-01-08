import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|login|submit/i })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('button', { name: /sign in|login|submit/i }).click();

      // Form should not be submitted, validation should show
      await expect(page).toHaveURL('/login');
    });

    test('should have link to signup page', async ({ page }) => {
      await page.goto('/login');

      const signupLink = page.getByRole('link', { name: /sign up|register|create/i });
      await expect(signupLink).toBeVisible();
      await signupLink.click();

      await expect(page).toHaveURL('/signup');
    });

    test('should have link to forgot password page', async ({ page }) => {
      await page.goto('/login');

      const forgotLink = page.getByRole('link', { name: /forgot|reset/i });
      await expect(forgotLink).toBeVisible();
      await forgotLink.click();

      await expect(page).toHaveURL('/forgot-password');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('invalid@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword123');
      await page.getByRole('button', { name: /sign in|login|submit/i }).click();

      // Wait for error message to appear
      await expect(page.locator('[class*="error"]')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Signup Page', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByLabel(/first name/i)).toBeVisible();
      await expect(page.getByLabel(/last name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|register|create/i })).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/signup');

      const loginLink = page.getByRole('link', { name: /sign in|login/i });
      await expect(loginLink).toBeVisible();
      await loginLink.click();

      await expect(page).toHaveURL('/login');
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.goto('/signup');

      await page.getByLabel(/password/i).fill('weak');

      // Verify password strength indicator is visible
      const strengthIndicator = page
        .locator('[data-testid="password-strength"]')
        .or(page.locator('text=/weak|strong|strength/i'));
      await expect(strengthIndicator).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Forgot Password Page', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send|submit|reset/i })).toBeVisible();
    });

    test('should have link back to login', async ({ page }) => {
      await page.goto('/forgot-password');

      const loginLink = page.getByRole('link', { name: /login|sign in|back/i });
      await expect(loginLink).toBeVisible();
      await loginLink.click();

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Reset Password Page', () => {
    test('should show error without token', async ({ page }) => {
      await page.goto('/reset-password');

      // Should show invalid token error
      await expect(page.locator('text=/invalid|error|token/i')).toBeVisible();
    });

    test('should display reset form with token', async ({ page }) => {
      await page.goto('/reset-password?token=test-token');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });
  });

  test.describe('Email Verification Page', () => {
    test('should show error without token', async ({ page }) => {
      await page.goto('/verify-email');

      // Should show error
      await expect(page.locator('text=/error|invalid/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect unauthenticated user from settings to login', async ({ page }) => {
      await page.goto('/settings/profile');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

test.describe('OAuth Buttons', () => {
  test('should display OAuth buttons on login page', async ({ page }) => {
    await page.goto('/login');

    // Google and Apple OAuth buttons should be visible
    await expect(page.locator('text=/google/i')).toBeVisible();
    await expect(page.locator('text=/apple/i')).toBeVisible();
  });

  test('should display OAuth buttons on signup page', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.locator('text=/google/i')).toBeVisible();
    await expect(page.locator('text=/apple/i')).toBeVisible();
  });
});
