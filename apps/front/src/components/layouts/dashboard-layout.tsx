import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/auth-context';
import { OrganizationSwitcher } from '../common/organization-switcher';
import { UserMenu } from '../common/user-menu';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, organizations, currentOrganization, setCurrentOrganization } = useAuth();

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

  const navLinks = [
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/settings/team', label: t('nav.team') },
    { href: '/settings/organization', label: t('nav.organization') },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-theme glass-card rounded-none sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-2xl font-bold text-gradient">
                ShipIt
              </Link>

              <OrganizationSwitcher
                organizations={organizations}
                currentOrganization={currentOrganization}
                onSwitch={setCurrentOrganization}
              />

              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.href
                        ? 'bg-gold-500/10 text-gold-500 dark:text-gold-400'
                        : 'text-muted hover:bg-white/5 dark:hover:bg-white/10 hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
