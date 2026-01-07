import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResetPasswordPage } from './reset-password';
import { authService } from '../services/auth.service';

// Mock auth service
vi.mock('../services/auth.service', () => ({
  authService: {
    resetPassword: vi.fn(),
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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ResetPasswordPage', () => {
  let queryClient: QueryClient;

  const renderComponent = (initialRoute = '/reset-password?token=valid-token') => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <ResetPasswordPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering with valid token', () => {
    it('should render reset password page with title', () => {
      renderComponent();

      expect(screen.getByText('auth.resetPassword.title')).toBeInTheDocument();
      expect(screen.getByText('auth.resetPassword.subtitle')).toBeInTheDocument();
    });

    it('should render password input field', () => {
      renderComponent();

      expect(screen.getByLabelText('auth.resetPassword.password')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: 'auth.resetPassword.submit' })).toBeInTheDocument();
    });
  });

  describe('Rendering without token', () => {
    it('should show error message when no token is provided', () => {
      renderComponent('/reset-password');

      expect(screen.getByText('auth.resetPassword.errors.invalidToken')).toBeInTheDocument();
    });

    it('should show link to forgot password page when no token', () => {
      renderComponent('/reset-password');

      expect(screen.getByRole('button', { name: 'auth.forgotPassword.title' })).toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('should call resetPassword on valid form submission', async () => {
      vi.mocked(authService.resetPassword).mockResolvedValue({ success: true });
      renderComponent();

      const passwordInput = screen.getByLabelText('auth.resetPassword.password');
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.resetPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith({
          token: 'valid-token',
          password: 'NewPassword123!',
        });
      });
    });

    it('should display success message after password reset', async () => {
      vi.mocked(authService.resetPassword).mockResolvedValue({ success: true });
      renderComponent();

      const passwordInput = screen.getByLabelText('auth.resetPassword.password');
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.resetPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.resetPassword.success')).toBeInTheDocument();
      });
    });

    it('should navigate to login after successful reset', async () => {
      vi.mocked(authService.resetPassword).mockResolvedValue({ success: true });
      renderComponent();

      const passwordInput = screen.getByLabelText('auth.resetPassword.password');
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.resetPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.resetPassword.success')).toBeInTheDocument();
      });

      // Advance time for the navigation timeout
      await vi.advanceTimersByTimeAsync(2000);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should display error message on failure', async () => {
      vi.mocked(authService.resetPassword).mockRejectedValue(new Error('Invalid token'));
      renderComponent();

      const passwordInput = screen.getByLabelText('auth.resetPassword.password');
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.resetPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.resetPassword.errors.invalidToken')).toBeInTheDocument();
      });
    });

    it('should disable submit button while submitting', async () => {
      // Use a promise that doesn't resolve to keep the loading state
      vi.mocked(authService.resetPassword).mockImplementation(() => new Promise(() => {}));
      renderComponent();

      const passwordInput = screen.getByLabelText('auth.resetPassword.password');
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.resetPassword.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
