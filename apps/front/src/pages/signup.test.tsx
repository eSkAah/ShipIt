import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignupPage } from './signup';

// Mock auth context
const mockSignup = vi.fn();
vi.mock('../contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({
    signup: mockSignup,
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

describe('SignupPage', () => {
  let queryClient: QueryClient;

  const renderComponent = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SignupPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render signup page with title', () => {
      renderComponent();

      expect(screen.getByText('auth.signup.title')).toBeInTheDocument();
      expect(screen.getByText('auth.signup.subtitle')).toBeInTheDocument();
    });

    it('should render first name input field', () => {
      renderComponent();

      expect(screen.getByLabelText('auth.signup.firstName')).toBeInTheDocument();
    });

    it('should render last name input field', () => {
      renderComponent();

      expect(screen.getByLabelText('auth.signup.lastName')).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderComponent();

      expect(screen.getByLabelText('auth.signup.email')).toBeInTheDocument();
    });

    it('should render password input field', () => {
      renderComponent();

      expect(screen.getByLabelText('auth.signup.password')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: 'auth.signup.submit' })).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderComponent();

      expect(screen.getByText('auth.signup.loginLink')).toBeInTheDocument();
    });

    it('should render OAuth buttons', () => {
      renderComponent();

      expect(screen.getByText('auth.signup.orContinueWith')).toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    const validFormData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should call signup on valid form submission', async () => {
      mockSignup.mockResolvedValue({});
      renderComponent();

      fireEvent.change(screen.getByLabelText('auth.signup.firstName'), {
        target: { value: validFormData.firstName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.lastName'), {
        target: { value: validFormData.lastName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.email'), {
        target: { value: validFormData.email },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.password'), {
        target: { value: validFormData.password },
      });

      const submitButton = screen.getByRole('button', { name: 'auth.signup.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith(validFormData);
      });
    });

    it('should display success message after successful signup', async () => {
      mockSignup.mockResolvedValue({});
      renderComponent();

      fireEvent.change(screen.getByLabelText('auth.signup.firstName'), {
        target: { value: validFormData.firstName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.lastName'), {
        target: { value: validFormData.lastName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.email'), {
        target: { value: validFormData.email },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.password'), {
        target: { value: validFormData.password },
      });

      const submitButton = screen.getByRole('button', { name: 'auth.signup.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.signup.success')).toBeInTheDocument();
      });
    });

    it('should display email exists error', async () => {
      mockSignup.mockRejectedValue(new Error('email already exists'));
      renderComponent();

      fireEvent.change(screen.getByLabelText('auth.signup.firstName'), {
        target: { value: validFormData.firstName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.lastName'), {
        target: { value: validFormData.lastName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.email'), {
        target: { value: validFormData.email },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.password'), {
        target: { value: validFormData.password },
      });

      const submitButton = screen.getByRole('button', { name: 'auth.signup.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.signup.errors.emailExists')).toBeInTheDocument();
      });
    });

    it('should display server error for other errors', async () => {
      mockSignup.mockRejectedValue(new Error('Server error'));
      renderComponent();

      fireEvent.change(screen.getByLabelText('auth.signup.firstName'), {
        target: { value: validFormData.firstName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.lastName'), {
        target: { value: validFormData.lastName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.email'), {
        target: { value: validFormData.email },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.password'), {
        target: { value: validFormData.password },
      });

      const submitButton = screen.getByRole('button', { name: 'auth.signup.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.signup.errors.serverError')).toBeInTheDocument();
      });
    });

    it('should disable submit button while submitting', async () => {
      mockSignup.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      renderComponent();

      fireEvent.change(screen.getByLabelText('auth.signup.firstName'), {
        target: { value: validFormData.firstName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.lastName'), {
        target: { value: validFormData.lastName },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.email'), {
        target: { value: validFormData.email },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.password'), {
        target: { value: validFormData.password },
      });

      const submitButton = screen.getByRole('button', { name: 'auth.signup.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Password strength indicator', () => {
    it('should show password strength indicator when password is entered', () => {
      renderComponent();

      const passwordInput = screen.getByLabelText('auth.signup.password');
      fireEvent.change(passwordInput, { target: { value: 'Weak1!' } });

      // Password strength indicator should show weak/medium/strong label
      expect(
        screen.getByText(/auth\.signup\.passwordStrength\.(weak|medium|strong)/),
      ).toBeInTheDocument();
    });
  });

  describe('Navigation links', () => {
    it('should have link to login page', () => {
      renderComponent();

      const loginLink = screen.getByText('auth.signup.loginLink');
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });
  });

  describe('Success state', () => {
    it('should render login button after successful signup', async () => {
      mockSignup.mockResolvedValue({});
      renderComponent();

      fireEvent.change(screen.getByLabelText('auth.signup.firstName'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.lastName'), {
        target: { value: 'User' },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('auth.signup.password'), {
        target: { value: 'Password123!' },
      });

      const submitButton = screen.getByRole('button', { name: 'auth.signup.submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'auth.login.title' })).toBeInTheDocument();
      });
    });
  });
});
