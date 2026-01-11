import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Map routes to translation keys
const routeLabels: Record<string, string> = {
  dashboard: 'nav.dashboard',
  settings: 'nav.settings',
  profile: 'nav.profile',
  team: 'nav.team',
  organization: 'nav.organization',
  billing: 'nav.billing',
  admin: 'nav.admin',
  users: 'admin.nav.users',
  organizations: 'admin.nav.organizations',
  logs: 'admin.nav.logs',
};

// Routes that are intermediate (no dedicated page) and should not be clickable
const nonNavigableRoutes = new Set(['settings']);

export function Breadcrumbs() {
  const { t } = useTranslation();
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    const translationKey = routeLabels[segment];
    const label = translationKey ? t(translationKey) : segment;
    const isNonNavigable = nonNavigableRoutes.has(segment);

    breadcrumbs.push({
      label,
      // Don't add href if it's the last segment or if it's a non-navigable route
      href: isLast || isNonNavigable ? undefined : currentPath,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        to="/dashboard"
        className="flex items-center text-muted hover:text-foreground transition-colors duration-300"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-muted" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-muted hover:text-foreground transition-colors duration-300"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
