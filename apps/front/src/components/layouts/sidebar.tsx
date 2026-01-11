import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  User,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { OrganizationWithMembership } from '../../services/organizations.service';
import { ThemeToggle } from '../ui/theme-toggle';
import { cn } from '../../lib/utils';

interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export function Sidebar({ onNavigate, collapsed = false, onCollapsedChange }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, organizations, currentOrganization, setCurrentOrganization } = useAuth();
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('currentOrganizationId');
      navigate('/login');
    }
  };

  const handleNavClick = () => {
    onNavigate?.();
  };

  const handleOrgSwitch = (org: OrganizationWithMembership) => {
    setCurrentOrganization(org);
    setOrgMenuOpen(false);
    onNavigate?.();
  };

  const toggleCollapsed = () => {
    onCollapsedChange?.(!collapsed);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const mainNavItems: NavItem[] = [
    {
      href: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/settings/team',
      label: t('nav.team'),
      icon: Users,
    },
    {
      href: '/settings/organization',
      label: t('nav.organization'),
      icon: Building2,
    },
    {
      href: '/settings/billing',
      label: t('nav.billing'),
      icon: CreditCard,
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-smooth',
        collapsed ? 'w-20' : 'w-72',
      )}
    >
      {/* Header with Logo & Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
        <Link
          to="/dashboard"
          onClick={handleNavClick}
          className={cn(
            'font-bold text-gradient transition-all duration-300',
            collapsed ? 'text-lg' : 'text-2xl',
          )}
        >
          {collapsed ? 'S' : 'ShipIt'}
        </Link>

        {/* Collapse Button - Hidden on mobile */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Organization Switcher */}
      <div className={cn('px-3 py-4', collapsed && 'px-2')}>
        <div className="relative">
          <button
            onClick={() => !collapsed && setOrgMenuOpen(!orgMenuOpen)}
            className={cn(
              'w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200',
              'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800',
              'border border-gray-200 dark:border-gray-800',
              collapsed && 'justify-center p-2',
            )}
          >
            {currentOrganization?.logoUrl ? (
              <img
                src={currentOrganization.logoUrl}
                alt={currentOrganization.name}
                className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-gold-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                {currentOrganization?.name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {currentOrganization?.name || 'Select org'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentOrganization?.role
                      ? t(`settings.team.role.${currentOrganization.role}`)
                      : ''}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    'w-4 h-4 text-gray-400 transition-transform duration-200',
                    orgMenuOpen && 'rotate-90',
                  )}
                />
              </>
            )}
          </button>

          {/* Organization Dropdown */}
          {orgMenuOpen && !collapsed && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOrgMenuOpen(false)} />
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-lg dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] overflow-hidden animate-fade-in">
                <div className="p-2 max-h-48 overflow-y-auto">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrgSwitch(org)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200',
                        org.id === currentOrganization?.id
                          ? 'bg-gold-500/10 dark:bg-gold-500/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                      )}
                    >
                      {org.logoUrl ? (
                        <img
                          src={org.logoUrl}
                          alt={org.name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-gold-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            org.id === currentOrganization?.id
                              ? 'text-gold-600 dark:text-gold-400'
                              : 'text-gray-900 dark:text-white',
                          )}
                        >
                          {org.name}
                        </p>
                      </div>
                      {org.id === currentOrganization?.id && (
                        <div className="w-2 h-2 rounded-full bg-gold-500" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 p-2">
                  <button
                    onClick={() => {
                      setOrgMenuOpen(false);
                      navigate('/settings/organization');
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    {t('settings.organization.createNew')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className={cn('mb-2', collapsed && 'mb-1')}>
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Menu
            </p>
          )}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gold-500/10 dark:bg-gold-500/15 text-gold-600 dark:text-gold-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                  collapsed && 'justify-center px-2',
                )}
                title={collapsed ? item.label : undefined}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold-500 rounded-r-full" />
                )}

                <Icon
                  className={cn(
                    'shrink-0 transition-colors duration-200',
                    active
                      ? 'text-gold-500'
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                    collapsed ? 'w-6 h-6' : 'w-5 h-5',
                  )}
                />

                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {user?.isSuperAdmin && (
          <div
            className={cn(
              'pt-4 border-t border-gray-100 dark:border-gray-800',
              collapsed && 'pt-2',
            )}
          >
            {!collapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wider">
                {t('nav.admin')}
              </p>
            )}
            <Link
              to="/admin"
              onClick={handleNavClick}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                location.pathname.startsWith('/admin')
                  ? 'bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? t('nav.adminPanel') : undefined}
            >
              {location.pathname.startsWith('/admin') && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full" />
              )}

              <Shield
                className={cn(
                  'shrink-0 transition-colors duration-200',
                  location.pathname.startsWith('/admin')
                    ? 'text-purple-500'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                  collapsed ? 'w-6 h-6' : 'w-5 h-5',
                )}
              />

              {!collapsed && <span>{t('nav.adminPanel')}</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom Section - User Profile with Popover */}
      <div className="mt-auto border-t border-gray-100 dark:border-gray-800 p-3" ref={userMenuRef}>
        <div className="relative">
          {/* User Avatar Button */}
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              'w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              userMenuOpen && 'bg-gray-100 dark:bg-gray-800',
              collapsed && 'justify-center p-1.5',
            )}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-700 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gold-400 to-purple-500 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700 shrink-0">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
            )}

            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </button>

          {/* User Menu Popover */}
          {userMenuOpen && (
            <div
              className={cn(
                'absolute bottom-full mb-2 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-lg dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] overflow-hidden animate-fade-in z-50',
                collapsed ? 'left-0 w-56' : 'left-0 right-0',
              )}
            >
              {/* Theme Toggle */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  {t('settings.profile.theme')}
                </p>
                <div className="flex justify-center">
                  <ThemeToggle showLabel />
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  to="/settings/profile"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate?.();
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === '/settings/profile'
                      ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>{t('nav.profile')}</span>
                </Link>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
