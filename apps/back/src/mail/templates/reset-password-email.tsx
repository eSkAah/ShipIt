import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { render } from '@react-email/render';
import { Language } from '@prisma/client';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import { sanitizeUrl } from './utils';

interface ResetPasswordEmailProps {
  resetUrl: string;
  language: Language;
}

const getContent = (language: Language) => {
  return language === 'fr'
    ? {
        preview: 'Réinitialisez votre mot de passe ShipIt',
        greeting: 'Bonjour,',
        body: 'Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.',
        button: 'Réinitialiser mon mot de passe',
        expiry: 'Ce lien expirera dans 1 heure.',
        footer:
          "Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe ne sera pas modifié.",
        alt: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur',
      }
    : {
        preview: 'Reset your ShipIt password',
        greeting: 'Hello,',
        body: 'We received a request to reset your password. Click the button below to create a new password.',
        button: 'Reset my password',
        expiry: 'This link will expire in 1 hour.',
        footer:
          "If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.",
        alt: "If the button doesn't work, copy and paste this link into your browser",
      };
};

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ resetUrl, language }) => {
  const safeUrl = sanitizeUrl(resetUrl);
  const content = getContent(language);

  return (
    <EmailLayout preview={content.preview} language={language}>
      <Text style={text}>{content.greeting}</Text>
      <Text style={text}>{content.body}</Text>
      <Section style={buttonContainer}>
        <EmailButton href={safeUrl}>{content.button}</EmailButton>
      </Section>
      <Text style={expiryText}>{content.expiry}</Text>
      <Text style={altText}>
        <span>{content.alt}:</span>
        <br />
        <span style={urlText}>{resetUrl}</span>
      </Text>
      <Text style={footerNote}>{content.footer}</Text>
    </EmailLayout>
  );
};

const text: React.CSSProperties = {
  margin: '0 0 20px',
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const expiryText: React.CSSProperties = {
  margin: '20px 0 0',
  fontSize: '14px',
  color: '#666666',
};

const altText: React.CSSProperties = {
  margin: '20px 0 0',
  fontSize: '12px',
  color: '#666666',
  wordBreak: 'break-all' as const,
};

const urlText: React.CSSProperties = {
  color: '#18181b',
};

const footerNote: React.CSSProperties = {
  margin: '30px 0 0',
  fontSize: '14px',
  color: '#999999',
  fontStyle: 'italic',
};

export async function renderResetPasswordEmailReact(
  resetUrl: string,
  language: Language,
): Promise<string> {
  return await render(<ResetPasswordEmail resetUrl={resetUrl} language={language} />);
}

export default ResetPasswordEmail;
