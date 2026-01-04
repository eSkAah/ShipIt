import { Language } from '@prisma/client';

export function renderResetPasswordEmail(resetUrl: string, language: Language): string {
  const content =
    language === 'fr'
      ? {
          title: 'Réinitialisez votre mot de passe',
          body: 'Cliquez sur le bouton pour créer un nouveau mot de passe.',
          button: 'Réinitialiser',
        }
      : {
          title: 'Reset your password',
          body: 'Click the button to create a new password.',
          button: 'Reset Password',
        };

  return `<!DOCTYPE html>
<html><body style="font-family: sans-serif; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
<h1>${content.title}</h1>
<p>${content.body}</p>
<a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 6px;">${content.button}</a>
<p style="margin-top: 20px; font-size: 12px; color: #666;">${resetUrl}</p>
</div></body></html>`;
}
