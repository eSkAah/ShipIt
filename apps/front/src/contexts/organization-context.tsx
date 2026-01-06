import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { OrganizationWithMembership } from '../services/organizations.service';

interface OrganizationMembership {
  id: string;
  role: 'admin' | 'member' | 'viewer';
  userId: string;
  organizationId: string;
}

interface OrganizationContextType {
  currentOrganization: OrganizationWithMembership | null;
  currentMembership: OrganizationMembership | null;
  organizations: OrganizationWithMembership[];
  setCurrentOrganization: (org: OrganizationWithMembership) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { currentOrganization, organizations, setCurrentOrganization } = useAuth();

  // Create a membership object from the current organization
  const currentMembership: OrganizationMembership | null = currentOrganization
    ? {
        id: currentOrganization.membershipId,
        role: currentOrganization.role,
        userId: '', // Not needed for billing
        organizationId: currentOrganization.id,
      }
    : null;

  const value: OrganizationContextType = {
    currentOrganization,
    currentMembership,
    organizations,
    setCurrentOrganization,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
