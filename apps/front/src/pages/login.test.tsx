import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './login';

// Mock auth context
const mockLogin = vi.fn();
vi.mock('../contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
    user: null,
  })),
}));

// Mock auth service
vi.mock('../services/auth.service', () => ({
  authService: {
    loginWithGoogle: vi.fn(),
    loginWithApple: vi.fn(),
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

// Mock react-router navigation
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  let queryClient: QueryClient;

  const renderComponent = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login page with title', () => {
      renderComponent();

      expect(screen.getByText('auth.login.title')).toBeInTheDocument();
      expect(screen.getByText('auth.login.subtitle')).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderComponent();

      expect(screen.getByLabelText('auth.login.email')).toBeInTheDocument();
    });

    it('should render password input field', () => {
      renderComponent();

      expect(screen.getByLabelText('auth.login.password')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: 'auth.login.submit' })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderComponent();

      expect(screen.getByText('auth.login.forgotPassword')).toBeInTheDocument();
    });

    it('should render signup link', () => {
      renderComponent();

      expect(screen.getByText('auth.login.signupLink')).toBeInTheDocument();
    });

    it('should render OAuth buttons', () => {
      renderComponent();

      expect(screen.getByText('auth.login.orContinueWith')).toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('should call login on valid form submission', async () => {
      mockLogin.mockResolvedValue({});
      renderComponent();

      const emailInput = screen.getByLabelText('auth.login.email');
      const passwordInput = screen.getByLabelText('auth.login.password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.login.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!',
        });
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      mockLogin.mockResolvedValue({});
      renderComponent();

      const emailInput = screen.getByLabelText('auth.login.email');
      const passwordInput = screen.getByLabelText('auth.login.password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.login.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should display error message on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      renderComponent();

      const emailInput = screen.getByLabelText('auth.login.email');
      const passwordInput = screen.getByLabelText('auth.login.password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'WrongPassword!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.login.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.login.errors.invalidCredentials')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      renderComponent();

      const emailInput = screen.getByLabelText('auth.login.email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      const submitButton = screen.getByRole('button', { name: 'auth.login.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    it('should disable submit button while submitting', async () => {
      // Make login hang to test loading state
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderComponent();

      const emailInput = screen.getByLabelText('auth.login.email');
      const passwordInput = screen.getByLabelText('auth.login.password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      const submitButton = screen.getByRole('button', { name: 'auth.login.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Navigation links', () => {
    it('should have link to forgot password page', () => {
      renderComponent();

      const forgotPasswordLink = screen.getByText('auth.login.forgotPassword');
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });

    it('should have link to signup page', () => {
      renderComponent();

      const signupLink = screen.getByText('auth.login.signupLink');
      expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
    });
  });
});
