import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ForgotPasswordPage } from './forgot-password';
import { authService } from '../services/auth.service';

// Mock auth service
vi.mock('../services/auth.service', () => ({
  authService: {
    forgotPassword: vi.fn(),
  },
}));

// Mock theme context
vi.mock('../contexts/theme-context', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  })),
}));

describe('ForgotPasswordPage', () => {
  let queryClient: QueryClient;

  const renderComponent = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ForgotPasswordPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render forgot password page with title', () => {
      renderComponent();

      expect(screen.getByText('auth.forgotPassword.title')).toBeInTheDocument();
      expect(screen.getByText('auth.forgotPassword.subtitle')).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderComponent();

      expect(screen.getByLabelText('auth.forgotPassword.email')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderComponent();

      expect(
        screen.getByRole('button', { name: 'auth.forgotPassword.submit' }),
      ).toBeInTheDocument();
    });

    it('should render back to login link', () => {
      renderComponent();

      expect(screen.getByText('auth.forgotPassword.backToLogin')).toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('should call forgotPassword on valid form submission', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValue({ success: true });
      renderComponent();

      const emailInput = screen.getByLabelText('auth.forgotPassword.email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'auth.forgotPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should display success message after sending email', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValue({ success: true });
      renderComponent();

      const emailInput = screen.getByLabelText('auth.forgotPassword.email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'auth.forgotPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.forgotPassword.success')).toBeInTheDocument();
      });
    });

    it('should display error message on failure', async () => {
      vi.mocked(authService.forgotPassword).mockRejectedValue(new Error('Server error'));
      renderComponent();

      const emailInput = screen.getByLabelText('auth.forgotPassword.email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'auth.forgotPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.forgotPassword.errors.serverError')).toBeInTheDocument();
      });
    });

    it('should disable submit button while submitting', async () => {
      vi.mocked(authService.forgotPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      renderComponent();

      const emailInput = screen.getByLabelText('auth.forgotPassword.email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'auth.forgotPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Navigation links', () => {
    it('should have link to login page', () => {
      renderComponent();

      const loginLink = screen.getByText('auth.forgotPassword.backToLogin');
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });
  });

  describe('Success state', () => {
    it('should render back to login button after success', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValue({ success: true });
      renderComponent();

      const emailInput = screen.getByLabelText('auth.forgotPassword.email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: 'auth.forgotPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const backToLoginButton = screen.getByRole('button', {
          name: 'auth.forgotPassword.backToLogin',
        });
        expect(backToLoginButton).toBeInTheDocument();
      });
    });
  });
});
