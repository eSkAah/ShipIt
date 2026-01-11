import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { apiClient } from '../lib/axios';

// Mock axios
vi.mock('../lib/axios', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      baseURL: 'http://localhost:3001',
    },
  },
}));

describe('authService', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    language: 'en',
    theme: 'light',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('signup', () => {
    it('should call API with signup data', async () => {
      const signupData = {
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockUser },
      });

      const result = await authService.signup(signupData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/signup', signupData);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw error on API failure', async () => {
      const signupData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Email already exists'));

      await expect(authService.signup(signupData)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should call API with credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: { user: mockUser } },
      });

      const result = await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw error on invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should call logout API and clear localStorage', async () => {
      localStorage.setItem('currentOrganizationId', 'org-123');
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      // localStorage mock returns undefined when item doesn't exist
      expect(localStorage.getItem('currentOrganizationId')).toBeFalsy();
    });
  });

  describe('getSession', () => {
    it('should return user data when session is valid', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: { user: mockUser } },
      });

      const result = await authService.getSession();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/session');
      expect(result?.user).toEqual(mockUser);
    });

    it('should return null when session is invalid', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Unauthorized'));

      const result = await authService.getSession();

      expect(result).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    it('should call API with token', async () => {
      const token = 'verification-token';
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const result = await authService.verifyEmail(token);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-email', { token });
      expect(result.success).toBe(true);
    });

    it('should throw error on invalid token', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid token'));

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow('Invalid token');
    });
  });

  describe('forgotPassword', () => {
    it('should call API with email', async () => {
      const email = 'test@example.com';
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const result = await authService.forgotPassword(email);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result.success).toBe(true);
    });

    it('should always return success for security', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const result = await authService.forgotPassword('nonexistent@example.com');

      expect(result.success).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should call API with reset data', async () => {
      const resetData = {
        token: 'reset-token',
        password: 'NewPassword123!',
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      const result = await authService.resetPassword(resetData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', resetData);
      expect(result.success).toBe(true);
    });

    it('should throw error on invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'NewPassword123!',
      };

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid reset token'));

      await expect(authService.resetPassword(resetData)).rejects.toThrow('Invalid reset token');
    });
  });

  describe('loginWithGoogle', () => {
    it('should redirect to Google OAuth URL', async () => {
      const originalLocation = window.location;
      // @ts-expect-error - Mocking location
      delete window.location;
      window.location = { href: '' } as Location;

      await authService.loginWithGoogle();

      expect(window.location.href).toBe('http://localhost:3001/auth/oauth/google');

      window.location = originalLocation;
    });
  });

  describe('loginWithApple', () => {
    it('should redirect to Apple OAuth URL', async () => {
      const originalLocation = window.location;
      // @ts-expect-error - Mocking location
      delete window.location;
      window.location = { href: '' } as Location;

      await authService.loginWithApple();

      expect(window.location.href).toBe('http://localhost:3001/auth/oauth/apple');

      window.location = originalLocation;
    });
  });
});
