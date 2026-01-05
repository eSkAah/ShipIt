import { Language } from '@prisma/client';
import { escapeHtml, sanitizeUrl } from './utils';

export function renderInvitationEmail(
  invitationUrl: string,
  organizationName: string,
  role: string,
  language: Language,
): string {
  const safeOrgName = escapeHtml(organizationName);
  const safeRole = escapeHtml(role);
  const safeUrl = sanitizeUrl(invitationUrl);

  const content =
    language === 'fr'
      ? {
          title: 'Invitation',
          body: `Vous êtes invité à rejoindre ${safeOrgName}`,
          button: 'Accepter',
        }
      : {
          title: 'Invitation',
          body: `You are invited to join ${safeOrgName}`,
          button: 'Accept',
        };

  return `<!DOCTYPE html>
<html><body style="font-family: sans-serif; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
<h1>${content.title}</h1>
<p>${content.body} (${safeRole})</p>
<a href="${safeUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px;">${content.button}</a>
</div></body></html>`;
}
