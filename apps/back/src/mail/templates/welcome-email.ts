import { Language } from '@prisma/client';

export function renderWelcomeEmail(firstName: string, language: Language): string {
  const content =
    language === 'fr'
      ? { title: 'Bienvenue!', body: `Bonjour ${firstName}, bienvenue sur ShipIt!` }
      : { title: 'Welcome!', body: `Hello ${firstName}, welcome to ShipIt!` };

  return `<!DOCTYPE html>
<html><body style="font-family: sans-serif; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
<h1>${content.title}</h1>
<p>${content.body}</p>
</div></body></html>`;
}
