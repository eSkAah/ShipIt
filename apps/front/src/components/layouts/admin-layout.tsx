import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Users, Building2, FileText, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { UserMenu } from '../common/user-menu';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
    { href: '/admin', label: t('admin.nav.overview'), icon: LayoutDashboard },
    { href: '/admin/users', label: t('admin.nav.users'), icon: Users },
    { href: '/admin/organizations', label: t('admin.nav.organizations'), icon: Building2 },
    { href: '/admin/logs', label: t('admin.nav.logs'), icon: FileText },
  ];

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="border-b border-purple-500/30 bg-purple-950/50 dark:bg-purple-950/30 backdrop-blur-accent sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              {/* Logo with Admin Badge */}
              <Link to="/admin" className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">ShipIt</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold">
                  <Shield size={12} />
                  Admin
                </span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'text-white/60 hover:bg-purple-500/10 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Back to Dashboard */}
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {t('admin.nav.backToDashboard')}
              </Link>

              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-purple-500/20 px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-white/60 hover:bg-purple-500/10 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
