import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, LoginCredentials, SignupData } from '@shipit/shared-types';
import { authService, AuthResponse } from '../services/auth.service';
import {
  organizationsService,
  OrganizationWithMembership,
} from '../services/organizations.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  organizations: OrganizationWithMembership[];
  currentOrganization: OrganizationWithMembership | null;
  setCurrentOrganization: (org: OrganizationWithMembership) => void;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [currentOrganization, setCurrentOrganizationState] =
    useState<OrganizationWithMembership | null>(null);

  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ['session'],
    queryFn: authService.getSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsService.getMyOrganizations,
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (organizations.length > 0 && !currentOrganization) {
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const org = organizations.find((o) => o.id === savedOrgId) || organizations[0];
      setCurrentOrganizationState(org);
      localStorage.setItem('currentOrganizationId', org.id);
    }
  }, [organizations, currentOrganization]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['session'], data);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      queryClient.setQueryData(['session'], data);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      setCurrentOrganizationState(null);
    },
  });

  const setCurrentOrganization = (org: OrganizationWithMembership) => {
    setCurrentOrganizationState(org);
    localStorage.setItem('currentOrganizationId', org.id);
    // Only invalidate organization-scoped queries, not all queries
    queryClient.invalidateQueries({ queryKey: ['organization-data'] });
  };

  const value: AuthContextType = {
    user: session?.user || null,
    isLoading: isSessionLoading,
    isAuthenticated: !!session?.user && !sessionError,
    organizations,
    currentOrganization,
    setCurrentOrganization,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
