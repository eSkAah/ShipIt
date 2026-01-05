import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OrganizationWithMembership } from '../../services/organizations.service';
import { CreateOrganizationDialog } from './create-organization-dialog';

interface OrganizationSwitcherProps {
  organizations: OrganizationWithMembership[];
  currentOrganization: OrganizationWithMembership | null;
  onSwitch: (org: OrganizationWithMembership) => void;
}

export function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onSwitch,
}: OrganizationSwitcherProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleOrganizationCreated = (newOrg: OrganizationWithMembership) => {
    setShowCreateDialog(false);
    setIsOpen(false);
    onSwitch(newOrg);
    navigate('/settings/organization');
  };

  if (!currentOrganization) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-theme hover:bg-white/5 dark:hover:bg-white/10 transition-all duration-300"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
          {currentOrganization.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium max-w-32 truncate text-foreground">
          {currentOrganization.name}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 text-muted ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 glass-card animate-fade-in z-50">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-muted uppercase">
                {t('common.organizations')}
              </p>
              <div className="space-y-1">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      onSwitch(org);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-input transition-all duration-300 ${
                      org.id === currentOrganization.id
                        ? 'bg-gold-500/10 border border-gold-500/30'
                        : 'hover:bg-white/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-foreground">{org.name}</div>
                        <div className="text-xs text-muted">
                          {t(`settings.team.role.${org.role}`)}
                        </div>
                      </div>
                      {org.id === currentOrganization.id && (
                        <svg
                          className="w-5 h-5 text-gold-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-theme p-2 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateDialog(true);
                }}
                className="w-full text-left px-3 py-2 rounded-input hover:bg-white/5 dark:hover:bg-white/10 transition-all duration-300 flex items-center gap-2 text-muted"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t('settings.organization.createNew')}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings/organization');
                }}
                className="w-full text-left px-3 py-2 rounded-input hover:bg-white/5 dark:hover:bg-white/10 transition-all duration-300 flex items-center gap-2 text-muted"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {t('settings.organization.title')}
              </button>
            </div>
          </div>
        </>
      )}

      <CreateOrganizationDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={handleOrganizationCreated}
      />
    </div>
  );
}
