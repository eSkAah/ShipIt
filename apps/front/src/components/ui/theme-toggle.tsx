import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/theme-context';

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const themeLabels = {
    light: t('settings.profile.themes.light', 'Light'),
    dark: t('settings.profile.themes.dark', 'Dark'),
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleTheme}
        className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-500 ease-smooth focus:outline-none focus:ring-2 focus:ring-gold-500/50 cursor-pointer"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Track background with gradient */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              theme === 'dark' ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              theme === 'light' ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%)',
            }}
          />
        </div>

        {/* Toggle knob */}
        <div
          className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transform transition-all duration-500 ease-smooth flex items-center justify-center ${
            theme === 'dark' ? 'translate-x-9 bg-gray-900' : 'translate-x-1 bg-white'
          }`}
        >
          {/* Sun icon */}
          <svg
            className={`w-4 h-4 text-gold-500 transition-all duration-300 absolute ${
              theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>

          {/* Moon icon */}
          <svg
            className={`w-4 h-4 text-purple-400 transition-all duration-300 absolute ${
              theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>

        {/* Stars decoration (visible in dark mode) */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            theme === 'dark' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute w-1 h-1 bg-white rounded-full top-2 left-3 animate-pulse" />
          <div
            className="absolute w-0.5 h-0.5 bg-white/70 rounded-full top-4 left-5"
            style={{ animationDelay: '0.5s' }}
          />
        </div>
      </button>
      {showLabel && <span className="text-sm text-foreground">{themeLabels[theme]}</span>}
    </div>
  );
}
