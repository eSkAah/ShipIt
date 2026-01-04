import { Language } from '@prisma/client';

export function renderVerificationEmail(verificationUrl: string, language: Language): string {
  const content =
    language === 'fr'
      ? {
          title: 'Vérifiez votre adresse email',
          greeting: 'Bonjour,',
          body: 'Merci de vous être inscrit sur ShipIt ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.',
          button: 'Vérifier mon email',
          footer:
            "Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.",
          expiry: 'Ce lien expirera dans 24 heures.',
          alt: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur',
        }
      : {
          title: 'Verify your email address',
          greeting: 'Hello,',
          body: 'Thank you for signing up for ShipIt! To activate your account, please click the button below to verify your email address.',
          button: 'Verify my email',
          footer: "If you didn't create an account, you can safely ignore this email.",
          expiry: 'This link will expire in 24 hours.',
          alt: "If the button doesn't work, copy and paste this link into your browser",
        };

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; margin: 0; padding: 40px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: #18181b; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">ShipIt</h1>
    </div>
    <div style="padding: 40px 30px;">
      <p style="margin: 0 0 20px; font-size: 16px;">${content.greeting}</p>
      <p style="margin: 0 0 20px; font-size: 16px;">${content.body}</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 30px; background: #18181b; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">${content.button}</a>
      </div>
      <p style="margin: 20px 0 0; font-size: 14px; color: #666;">${content.expiry}</p>
      <p style="margin: 20px 0 0; font-size: 12px; color: #666; word-break: break-all;">
        <small>${content.alt}:</small><br/>
        <small>${verificationUrl}</small>
      </p>
    </div>
    <div style="padding: 30px; text-align: center; font-size: 14px; color: #666; background: #f9fafb;">
      <p style="margin: 0;">${content.footer}</p>
    </div>
  </div>
</body>
</html>`;
}
