/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { UserMenu } from './user-menu';

vi.mock('../../contexts/theme-context', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  })),
}));

vi.mock('../ui/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

describe('UserMenu', () => {
  const mockUser = {
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: null,
  };

  const mockOnLogout = vi.fn();

  const renderComponent = (user = mockUser) => {
    return render(
      <MemoryRouter>
        <UserMenu user={user} onLogout={mockOnLogout} />
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Avatar display', () => {
    it('should display user initials when no avatar', () => {
      renderComponent();

      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('should display avatar image when avatarUrl is provided', () => {
      const userWithAvatar = {
        ...mockUser,
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      renderComponent(userWithAvatar);

      const avatar = screen.getByAltText('Test User');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should display user name next to avatar', () => {
      renderComponent();

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('Menu toggle', () => {
    it('should not show popover by default', () => {
      renderComponent();

      expect(screen.queryByText('nav.profile')).not.toBeInTheDocument();
      expect(screen.queryByText('nav.logout')).not.toBeInTheDocument();
    });

    it('should show popover when avatar is clicked', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      expect(screen.getByText('nav.profile')).toBeInTheDocument();
      expect(screen.getByText('nav.logout')).toBeInTheDocument();
    });

    it('should hide popover when clicked again', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);
      fireEvent.click(avatarButton);

      expect(screen.queryByText('nav.profile')).not.toBeInTheDocument();
    });
  });

  describe('Popover content', () => {
    it('should display user name in popover header', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      // User name appears twice: in button and in popover header
      const userNames = screen.getAllByText('Test User');
      expect(userNames.length).toBeGreaterThanOrEqual(2);
    });

    it('should display profile link', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      const profileLink = screen.getByText('nav.profile').closest('a');
      expect(profileLink).toHaveAttribute('href', '/settings/profile');
    });

    it('should display theme toggle', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should display theme label', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      expect(screen.getByText('settings.profile.theme')).toBeInTheDocument();
    });

    it('should display logout button', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      expect(screen.getByText('nav.logout')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should close popover when profile link is clicked', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      const profileLink = screen.getByText('nav.profile');
      fireEvent.click(profileLink);

      expect(screen.queryByText('nav.logout')).not.toBeInTheDocument();
    });

    it('should call onLogout and close popover when logout is clicked', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      const logoutButton = screen.getByText('nav.logout');
      fireEvent.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('nav.profile')).not.toBeInTheDocument();
    });
  });

  describe('Click outside', () => {
    it('should close popover when clicking outside', () => {
      renderComponent();

      const avatarButton = screen.getByRole('button');
      fireEvent.click(avatarButton);

      expect(screen.getByText('nav.profile')).toBeInTheDocument();

      // Simulate click outside
      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('nav.profile')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle null user gracefully', () => {
      renderComponent(null as any);

      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should handle user with only first name', () => {
      const userWithOnlyFirstName = {
        firstName: 'Test',
        lastName: '',
        avatarUrl: null,
      };
      renderComponent(userWithOnlyFirstName);

      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });
});
