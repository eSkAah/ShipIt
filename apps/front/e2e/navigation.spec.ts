import { test, expect } from '@playwright/test';

test.describe('Landing Page Navigation', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/');

    // Check for main content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have login button/link', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /login|sign in/i }).first();
    await expect(loginLink).toBeVisible();
  });

  test('should have signup button/link', async ({ page }) => {
    await page.goto('/');

    const signupLink = page
      .getByRole('link', { name: /signup|sign up|get started|register/i })
      .first();
    await expect(signupLink).toBeVisible();
  });

  test('should navigate to login from landing', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /login|sign in/i }).first();
    await loginLink.click();

    await expect(page).toHaveURL('/login');
  });

  test('should navigate to signup from landing', async ({ page }) => {
    await page.goto('/');

    const signupLink = page.getByRole('link', { name: /signup|sign up|get started/i }).first();
    await signupLink.click();

    await expect(page).toHaveURL('/signup');
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still be usable
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('login form should be visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login|submit/i })).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('404 Page', () => {
  test('should display 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-12345');

    // Should show 404 page or redirect
    await expect(page.locator('text=/not found|404/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Accessibility', () => {
  test('login page should have proper labels', async ({ page }) => {
    await page.goto('/login');

    // Email input should have proper labeling
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Password input should have proper labeling
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('signup page should have proper labels', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('buttons should be focusable', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.getByRole('button', { name: /sign in|login|submit/i });
    await submitButton.focus();
    await expect(submitButton).toBeFocused();
  });
});

test.describe('Form Interactions', () => {
  test('should allow typing in login form', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should allow typing in signup form', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/password/i).fill('SecurePassword123!');

    await expect(page.getByLabel(/first name/i)).toHaveValue('John');
    await expect(page.getByLabel(/last name/i)).toHaveValue('Doe');
    await expect(page.getByLabel(/email/i)).toHaveValue('john@example.com');
  });

  test('should clear form fields', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('test@example.com');
    await emailInput.clear();

    await expect(emailInput).toHaveValue('');
  });
});
