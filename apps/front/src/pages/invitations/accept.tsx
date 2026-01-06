import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/auth-context';
import { Button } from '../../components/ui/button';
import { invitationsService } from '../../services/invitations.service';

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading, setCurrentOrganization } = useAuth();
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const {
    data: invitation,
    isLoading: isInvitationLoading,
    error: invitationError,
  } = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => invitationsService.getInvitationByToken(token!),
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => invitationsService.acceptInvitation(token!),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setCurrentOrganization({
        ...result.organization,
        role: result.role,
        membershipId: result.membershipId,
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      setAcceptError(error.message);
    },
  });

  const handleAccept = () => {
    setAcceptError(null);
    acceptMutation.mutate();
  };

  if (isAuthLoading || isInvitationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-black/60">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="glass-card p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('invitation.invalid')}</h1>
          <p className="text-black/60 mb-6">{t('invitation.invalidDescription')}</p>
          <Link to="/login">
            <Button variant="primary">{t('common.backToLogin')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="glass-card p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gold-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('invitation.title')}</h1>
          <p className="text-black/60 mb-2">
            {t('invitation.invitedTo', { organization: invitation.organization.name })}
          </p>
          <p className="text-sm text-black/60 mb-6">{t('invitation.loginRequired')}</p>
          <div className="space-y-3">
            <Link to={`/login?redirect=/invitations/${token}/accept`}>
              <Button variant="primary" className="w-full">
                {t('common.login')}
              </Button>
            </Link>
            <Link
              to={`/signup?redirect=/invitations/${token}/accept&email=${encodeURIComponent(invitation.email)}`}
            >
              <Button variant="secondary" className="w-full">
                {t('common.signup')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="glass-card p-8 max-w-md w-full text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">
            {invitation.organization.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-2">{t('invitation.title')}</h1>
        <p className="text-black/60 mb-1">
          {t('invitation.invitedTo', { organization: invitation.organization.name })}
        </p>
        <p className="text-sm text-black/60 mb-6">
          {t('invitation.asRole', { role: t(`settings.team.role.${invitation.role}`) })}
        </p>

        {acceptError && (
          <div className="mb-4 p-3 rounded-input bg-red-50 text-red-600 text-sm">{acceptError}</div>
        )}

        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleAccept}
            isLoading={acceptMutation.isPending}
          >
            {t('invitation.accept')}
          </Button>
          <Link to="/dashboard">
            <Button variant="secondary" className="w-full">
              {t('invitation.decline')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
