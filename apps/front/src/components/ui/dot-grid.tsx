import { useTheme } from '../../contexts/theme-context';

interface DotGridProps {
  className?: string;
}

export function DotGrid({ className = '' }: DotGridProps) {
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Precise small dot grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)`
            : `radial-gradient(circle, rgba(124, 58, 237, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 0%, transparent 80%)',
        }}
      />
    </div>
  );
}
