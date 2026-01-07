import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VerifyEmailPage } from './verify-email';
import { authService } from '../services/auth.service';

// Mock auth service
vi.mock('../services/auth.service', () => ({
  authService: {
    verifyEmail: vi.fn(),
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

describe('VerifyEmailPage', () => {
  let queryClient: QueryClient;

  const renderComponent = (initialRoute = '/verify-email?token=valid-token') => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <VerifyEmailPage />
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

  describe('Loading state', () => {
    it('should show loading state initially when token is provided', () => {
      vi.mocked(authService.verifyEmail).mockImplementation(
        () => new Promise(() => {}), // Never resolves to keep loading state
      );
      renderComponent();

      expect(screen.getByText('auth.verifyEmail.verifying')).toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    it('should show success message after verification', async () => {
      vi.mocked(authService.verifyEmail).mockResolvedValue({ success: true });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('auth.verifyEmail.success')).toBeInTheDocument();
      });
    });

    it('should call verifyEmail with token', async () => {
      vi.mocked(authService.verifyEmail).mockResolvedValue({ success: true });
      renderComponent();

      await waitFor(() => {
        expect(authService.verifyEmail).toHaveBeenCalledWith('valid-token');
      });
    });
  });

  describe('Error state', () => {
    it('should show error message when verification fails', async () => {
      vi.mocked(authService.verifyEmail).mockRejectedValue(new Error('Invalid token'));
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('auth.verifyEmail.error')).toBeInTheDocument();
      });
    });
  });

  describe('No token', () => {
    it('should not call verifyEmail when no token is in URL', () => {
      renderComponent('/verify-email');

      // verifyEmail should not be called when token is empty
      expect(authService.verifyEmail).not.toHaveBeenCalled();
    });
  });
});
