import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemberList } from './member-list';
import { Member } from '../../services/organizations.service';

vi.mock('./member-card', () => ({
  MemberCard: ({ member, currentUserId }: { member: Member; currentUserId: string }) => (
    <div data-testid={`member-card-${member.userId}`}>
      <span>
        {member.user.firstName} {member.user.lastName}
      </span>
      <span>{member.role}</span>
      {member.userId === currentUserId && <span>(you)</span>}
    </div>
  ),
}));

describe('MemberList', () => {
  const mockMembers: Member[] = [
    {
      id: 'm-1',
      userId: 'user-1',
      role: 'admin',
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        avatarUrl: undefined,
      },
    },
    {
      id: 'm-2',
      userId: 'user-2',
      role: 'member',
      user: {
        id: 'user-2',
        email: 'member@example.com',
        firstName: 'Member',
        lastName: 'User',
        avatarUrl: undefined,
      },
    },
    {
      id: 'm-3',
      userId: 'user-3',
      role: 'viewer',
      user: {
        id: 'user-3',
        email: 'viewer@example.com',
        firstName: 'Viewer',
        lastName: 'User',
        avatarUrl: undefined,
      },
    },
  ];

  const mockOnUpdateRole = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props: Partial<Parameters<typeof MemberList>[0]> = {}) => {
    return render(
      <MemberList
        members={mockMembers}
        currentUserId="user-1"
        currentUserRole="admin"
        onUpdateRole={mockOnUpdateRole}
        onRemove={mockOnRemove}
        {...props}
      />,
    );
  };

  it('should render loading state with skeletons', () => {
    renderComponent({ isLoading: true });

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render empty state when no members', () => {
    renderComponent({ members: [] });

    expect(screen.getByText('settings.team.noMembers')).toBeInTheDocument();
  });

  it('should render all members', () => {
    renderComponent();

    expect(screen.getByTestId('member-card-user-1')).toBeInTheDocument();
    expect(screen.getByTestId('member-card-user-2')).toBeInTheDocument();
    expect(screen.getByTestId('member-card-user-3')).toBeInTheDocument();
  });

  it('should display member names', () => {
    renderComponent();

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Member User')).toBeInTheDocument();
    expect(screen.getByText('Viewer User')).toBeInTheDocument();
  });

  it('should display member roles', () => {
    renderComponent();

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
    expect(screen.getByText('viewer')).toBeInTheDocument();
  });

  it('should indicate current user', () => {
    renderComponent();

    const currentUserCard = screen.getByTestId('member-card-user-1');
    expect(currentUserCard).toHaveTextContent('(you)');
  });

  it('should pass correct props to MemberCard', () => {
    renderComponent();

    // Verify all members are rendered
    expect(screen.getAllByTestId(/member-card-/)).toHaveLength(3);
  });

  it('should handle different current user roles', () => {
    renderComponent({ currentUserRole: 'member' });

    // Component should still render all members
    expect(screen.getAllByTestId(/member-card-/)).toHaveLength(3);
  });

  it('should handle single member', () => {
    renderComponent({ members: [mockMembers[0]] });

    expect(screen.getAllByTestId(/member-card-/)).toHaveLength(1);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });
});
