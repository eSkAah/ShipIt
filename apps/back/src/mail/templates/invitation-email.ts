import { Language } from '@prisma/client';

export function renderInvitationEmail(
  invitationUrl: string,
  organizationName: string,
  role: string,
  language: Language,
): string {
  const content =
    language === 'fr'
      ? {
          title: 'Invitation',
          body: `Vous êtes invité à rejoindre ${organizationName}`,
          button: 'Accepter',
        }
      : {
          title: 'Invitation',
          body: `You are invited to join ${organizationName}`,
          button: 'Accept',
        };

  return `<!DOCTYPE html>
<html><body style="font-family: sans-serif; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
<h1>${content.title}</h1>
<p>${content.body} (${role})</p>
<a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px;">${content.button}</a>
</div></body></html>`;
}
