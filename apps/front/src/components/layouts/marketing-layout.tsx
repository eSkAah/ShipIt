import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../ui/theme-toggle';
import { DotGrid } from '../ui/dot-grid';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: t('marketing.nav.features') },
    { href: '#pricing', label: t('marketing.nav.pricing') },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <DotGrid />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-gray-200/30 dark:border-gray-800/30">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-black dark:text-white">ShipIt</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-black/60 dark:text-white/60 hover:text-purple-600 dark:hover:text-gold-500 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link
                to="/login"
                className="text-black/80 dark:text-white/80 hover:text-purple-600 dark:hover:text-gold-500 font-medium transition-colors duration-300"
              >
                {t('common.login')}
              </Link>
              <Link to="/signup" className="btn-primary">
                {t('common.signup')}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200/50 dark:border-gray-800/50 animate-fade-in">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-black/60 dark:text-white/60 hover:text-purple-600 dark:hover:text-gold-500 transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
                  <Link
                    to="/login"
                    className="text-center py-2 text-black/80 dark:text-white/80 hover:text-purple-600 dark:hover:text-gold-500 font-medium transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.signup')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/30 dark:border-gray-800/30 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold text-black dark:text-white">ShipIt</span>
              <p className="mt-4 text-black/60 dark:text-white/60 max-w-md">
                {t('marketing.footer.description')}
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-4">
                {t('marketing.footer.product')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-black/60 dark:text-white/60 hover:text-purple-600 dark:hover:text-gold-500 transition-colors duration-300"
                  >
                    {t('marketing.nav.features')}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-black/60 dark:text-white/60 hover:text-purple-600 dark:hover:text-gold-500 transition-colors duration-300"
                  >
                    {t('marketing.nav.pricing')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-4">
                {t('marketing.footer.legal')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-black/60 dark:text-white/60 hover:text-purple-600 dark:hover:text-gold-500 transition-colors duration-300"
                  >
                    {t('marketing.footer.privacy')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-black/60 dark:text-white/60 hover:text-purple-600 dark:hover:text-gold-500 transition-colors duration-300"
                  >
                    {t('marketing.footer.terms')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
            <p className="text-center text-black/40 dark:text-white/40 text-sm">
              {t('marketing.footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
