/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileSettingsPage } from './profile';
import { usersService } from '../../services/users.service';
import { toast } from 'sonner';

vi.mock('../../services/users.service', () => ({
  usersService: {
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../contexts/theme-context', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  })),
}));

vi.mock('../../components/layouts/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

vi.mock('../../components/ui/avatar-upload', () => ({
  AvatarUpload: ({
    onUpload,
    onDelete,
    isUploading,
    isDeleting,
  }: {
    currentAvatarUrl?: string;
    onUpload: (file: File) => Promise<void>;
    onDelete: () => Promise<void>;
    isUploading: boolean;
    isDeleting: boolean;
  }) => (
    <div data-testid="avatar-upload">
      <button onClick={() => onUpload(new File([''], 'test.jpg'))} disabled={isUploading}>
        Upload
      </button>
      <button onClick={() => onDelete()} disabled={isDeleting}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock('../../components/ui/theme-toggle', () => ({
  ThemeToggle: ({ showLabel }: { showLabel?: boolean }) => (
    <div data-testid="theme-toggle">{showLabel ? 'Theme Toggle with label' : 'Theme Toggle'}</div>
  ),
}));

import { useAuth } from '../../contexts/auth-context';

describe('ProfileSettingsPage', () => {
  let queryClient: QueryClient;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    avatarUrl: null,
    language: 'en',
    theme: 'light',
    notificationsEnabled: true,
  };

  const renderComponent = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProfileSettingsPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      organizations: [],
      currentOrganization: null,
      setCurrentOrganization: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refetchUser: vi.fn(),
    } as any);
  });

  describe('Rendering', () => {
    it('should render profile page with user data', () => {
      renderComponent();

      expect(screen.getByText('settings.profile.title')).toBeInTheDocument();
      expect(screen.getByText('settings.profile.description')).toBeInTheDocument();
    });

    it('should render avatar upload section', () => {
      renderComponent();

      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
    });

    it('should render personal info form', () => {
      renderComponent();

      expect(screen.getByText('settings.profile.personalInfo')).toBeInTheDocument();
      expect(screen.getByLabelText('settings.profile.firstName')).toBeInTheDocument();
      expect(screen.getByLabelText('settings.profile.lastName')).toBeInTheDocument();
      expect(screen.getByLabelText('settings.profile.email')).toBeInTheDocument();
      expect(screen.getByLabelText('settings.profile.phone')).toBeInTheDocument();
    });

    it('should render preferences section', () => {
      renderComponent();

      expect(screen.getByText('settings.profile.preferences')).toBeInTheDocument();
      expect(screen.getByText('settings.profile.language')).toBeInTheDocument();
      expect(screen.getByText('settings.profile.theme')).toBeInTheDocument();
      expect(screen.getByText('settings.profile.notifications')).toBeInTheDocument();
    });

    it('should render theme toggle', () => {
      renderComponent();

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should pre-fill form with user data', () => {
      renderComponent();

      expect(screen.getByLabelText('settings.profile.firstName')).toHaveValue('Test');
      expect(screen.getByLabelText('settings.profile.lastName')).toHaveValue('User');
      expect(screen.getByLabelText('settings.profile.phone')).toHaveValue('+1234567890');
    });

    it('should disable email field', () => {
      renderComponent();

      expect(screen.getByLabelText('settings.profile.email')).toBeDisabled();
    });
  });

  describe('Form submission', () => {
    it('should have save button disabled when form is not dirty', () => {
      renderComponent();

      const saveButton = screen.getByRole('button', { name: 'common.save' });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when form is modified', async () => {
      renderComponent();

      const firstNameInput = screen.getByLabelText('settings.profile.firstName');
      fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: 'common.save' });
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should call updateProfile when form is submitted', async () => {
      vi.mocked(usersService.updateProfile).mockResolvedValue({
        ...mockUser,
        firstName: 'Updated',
      });

      renderComponent();

      const firstNameInput = screen.getByLabelText('settings.profile.firstName');
      fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

      const saveButton = screen.getByRole('button', { name: 'common.save' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(usersService.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Updated',
          }),
        );
      });
    });

    it('should show success toast on successful update', async () => {
      vi.mocked(usersService.updateProfile).mockResolvedValue({
        ...mockUser,
        firstName: 'Updated',
      });

      renderComponent();

      const firstNameInput = screen.getByLabelText('settings.profile.firstName');
      fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

      const saveButton = screen.getByRole('button', { name: 'common.save' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('settings.profile.updateSuccess');
      });
    });

    it('should show error toast on failed update', async () => {
      vi.mocked(usersService.updateProfile).mockRejectedValue(new Error('Update failed'));

      renderComponent();

      const firstNameInput = screen.getByLabelText('settings.profile.firstName');
      fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

      const saveButton = screen.getByRole('button', { name: 'common.save' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('settings.profile.updateError');
      });
    });
  });

  describe('Avatar operations', () => {
    it('should call uploadAvatar when upload button is clicked', async () => {
      vi.mocked(usersService.uploadAvatar).mockResolvedValue({
        avatarUrl: 'https://storage.azure.com/avatar.jpg',
      });

      renderComponent();

      const uploadButton = screen.getByRole('button', { name: 'Upload' });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(usersService.uploadAvatar).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful avatar upload', async () => {
      vi.mocked(usersService.uploadAvatar).mockResolvedValue({
        avatarUrl: 'https://storage.azure.com/avatar.jpg',
      });

      renderComponent();

      const uploadButton = screen.getByRole('button', { name: 'Upload' });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('settings.profile.avatar.uploadSuccess');
      });
    });

    it('should call deleteAvatar when delete button is clicked', async () => {
      vi.mocked(usersService.deleteAvatar).mockResolvedValue(undefined);

      renderComponent();

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(usersService.deleteAvatar).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful avatar delete', async () => {
      vi.mocked(usersService.deleteAvatar).mockResolvedValue(undefined);

      renderComponent();

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('settings.profile.avatar.deleteSuccess');
      });
    });
  });

  describe('Language selection', () => {
    it('should enable save button when language is changed', async () => {
      renderComponent();

      // The Select component should be rendered
      // We'll simulate a language change by looking for the select element
      const languageSelect = screen.getByRole('combobox');
      fireEvent.change(languageSelect, { target: { value: 'fr' } });

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: 'common.save' });
        expect(saveButton).not.toBeDisabled();
      });
    });
  });
});
