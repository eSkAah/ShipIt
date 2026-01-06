import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Settings } from 'lucide-react';
import { ThemeToggle } from '../ui/theme-toggle';

interface UserMenuProps {
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  } | null;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : '?';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
      >
        <span className="hidden sm:block text-sm font-medium text-foreground">
          {user?.firstName} {user?.lastName}
        </span>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-gold-500/30"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-purple-500 flex items-center justify-center ring-2 ring-gold-500/30">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 glass-card rounded-premium shadow-card border border-theme animate-fade-in origin-top-right z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-theme">
            <p className="font-semibold text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile Link */}
            <Link
              to="/settings/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-white/5 dark:hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4 text-muted" />
              {t('nav.profile')}
            </Link>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-foreground">{t('settings.profile.theme')}</span>
              <ThemeToggle />
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-theme py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
