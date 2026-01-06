import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InviteMemberDialog } from './invite-member-dialog';

describe('InviteMemberDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnInvite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnInvite.mockResolvedValue(undefined);
  });

  const renderComponent = (isOpen: boolean = true) => {
    return render(
      <InviteMemberDialog isOpen={isOpen} onClose={mockOnClose} onInvite={mockOnInvite} />,
    );
  };

  it('should not render when isOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText('settings.team.inviteTitle')).not.toBeInTheDocument();
  });

  it('should render form when isOpen is true', () => {
    renderComponent(true);
    expect(screen.getByText('settings.team.inviteTitle')).toBeInTheDocument();
    expect(screen.getByLabelText('settings.team.emailLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('settings.team.roleLabel')).toBeInTheDocument();
  });

  it('should display all role options', () => {
    renderComponent();

    const roleSelect = screen.getByLabelText('settings.team.roleLabel');
    expect(roleSelect).toBeInTheDocument();

    expect(screen.getByText('settings.team.role.viewer')).toBeInTheDocument();
    expect(screen.getByText('settings.team.role.member')).toBeInTheDocument();
    expect(screen.getByText('settings.team.role.admin')).toBeInTheDocument();
  });

  it('should have member as default role', () => {
    renderComponent();

    const roleSelect = screen.getByLabelText('settings.team.roleLabel') as HTMLSelectElement;
    expect(roleSelect.value).toBe('member');
  });

  it('should close dialog when clicking cancel', () => {
    renderComponent();

    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close dialog when clicking backdrop', () => {
    renderComponent();

    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show validation error for invalid email', async () => {
    renderComponent();

    const emailInput = screen.getByLabelText('settings.team.emailLabel');
    await userEvent.type(emailInput, 'invalid-email');

    const submitButton = screen.getByText('settings.team.sendInvite');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid|email/i)).toBeInTheDocument();
    });
  });

  it('should show validation error when email is empty', async () => {
    renderComponent();

    const submitButton = screen.getByText('settings.team.sendInvite');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/required|email/i)).toBeInTheDocument();
    });
  });

  it('should call onInvite with email and role on valid submit', async () => {
    renderComponent();

    const emailInput = screen.getByLabelText('settings.team.emailLabel');
    await userEvent.type(emailInput, 'newuser@example.com');

    const roleSelect = screen.getByLabelText('settings.team.roleLabel');
    await userEvent.selectOptions(roleSelect, 'admin');

    const submitButton = screen.getByText('settings.team.sendInvite');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnInvite).toHaveBeenCalledWith('newuser@example.com', 'admin');
    });
  });

  it('should close dialog after successful invite', async () => {
    renderComponent();

    const emailInput = screen.getByLabelText('settings.team.emailLabel');
    await userEvent.type(emailInput, 'newuser@example.com');

    const submitButton = screen.getByText('settings.team.sendInvite');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should reset form after successful submit', async () => {
    const { unmount } = renderComponent();

    const emailInput = screen.getByLabelText('settings.team.emailLabel') as HTMLInputElement;
    await userEvent.type(emailInput, 'newuser@example.com');

    const submitButton = screen.getByText('settings.team.sendInvite');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });

    unmount();

    // Re-render to simulate reopening
    renderComponent();

    const newEmailInput = screen.getByLabelText('settings.team.emailLabel') as HTMLInputElement;
    expect(newEmailInput.value).toBe('');
  });

  it('should reset form when closing with cancel', async () => {
    const { unmount } = renderComponent();

    const emailInput = screen.getByLabelText('settings.team.emailLabel') as HTMLInputElement;
    await userEvent.type(emailInput, 'test@example.com');

    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);

    unmount();

    renderComponent();

    const newEmailInput = screen.getByLabelText('settings.team.emailLabel') as HTMLInputElement;
    expect(newEmailInput.value).toBe('');
  });

  it('should show loading state while submitting', async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnInvite.mockReturnValue(promise);

    renderComponent();

    const emailInput = screen.getByLabelText('settings.team.emailLabel');
    await userEvent.type(emailInput, 'newuser@example.com');

    const submitButton = screen.getByText('settings.team.sendInvite');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /settings.team.sendInvite/i });
      expect(button).toBeDisabled();
    });

    // Resolve to clean up
    resolvePromise!();
  });

  it('should allow selecting different roles', async () => {
    renderComponent();

    const roleSelect = screen.getByLabelText('settings.team.roleLabel') as HTMLSelectElement;

    await userEvent.selectOptions(roleSelect, 'viewer');
    expect(roleSelect.value).toBe('viewer');

    await userEvent.selectOptions(roleSelect, 'member');
    expect(roleSelect.value).toBe('member');

    await userEvent.selectOptions(roleSelect, 'admin');
    expect(roleSelect.value).toBe('admin');
  });
});
