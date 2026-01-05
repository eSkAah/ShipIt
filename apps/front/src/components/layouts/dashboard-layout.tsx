import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { Button } from '../ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, logout, organizations, currentOrganization, setCurrentOrganization } = useAuth();
  const [showOrgMenu, setShowOrgMenu] = useState(false);

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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gradient">ShipIt</h1>

              {currentOrganization && (
                <div className="relative">
                  <button
                    onClick={() => setShowOrgMenu(!showOrgMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    <span className="font-medium">{currentOrganization.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${showOrgMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showOrgMenu && (
                    <div className="absolute top-full mt-2 w-64 glass-card shadow-card animate-fade-in z-10">
                      <div className="p-2 space-y-1">
                        {organizations.map((org) => (
                          <button
                            key={org.id}
                            onClick={() => {
                              setCurrentOrganization(org);
                              setShowOrgMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-input transition-all duration-300 ${
                              org.id === currentOrganization.id
                                ? 'bg-gold-50 text-black font-semibold'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-medium">{org.name}</div>
                            <div className="text-sm text-black/60">{org.membership.role}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-black/60">{user?.email}</p>
              </div>

              <Button variant="ghost" onClick={handleLogout}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
