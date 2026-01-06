import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { render } from '@react-email/render';
import { Language } from '@prisma/client';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import { escapeHtml, sanitizeUrl } from './utils';

interface VerificationEmailProps {
  verificationUrl: string;
  language: Language;
}

const getContent = (language: Language) => {
  return language === 'fr'
    ? {
        preview: 'Vérifiez votre adresse email pour activer votre compte ShipIt',
        greeting: 'Bonjour,',
        body: 'Merci de vous être inscrit sur ShipIt ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.',
        button: 'Vérifier mon email',
        expiry: 'Ce lien expirera dans 24 heures.',
        footer:
          "Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.",
        alt: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur',
      }
    : {
        preview: 'Verify your email address to activate your ShipIt account',
        greeting: 'Hello,',
        body: 'Thank you for signing up for ShipIt! To activate your account, please click the button below to verify your email address.',
        button: 'Verify my email',
        expiry: 'This link will expire in 24 hours.',
        footer: "If you didn't create an account, you can safely ignore this email.",
        alt: "If the button doesn't work, copy and paste this link into your browser",
      };
};

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  verificationUrl,
  language,
}) => {
  const safeUrl = sanitizeUrl(verificationUrl);
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
        <span style={urlText}>{escapeHtml(verificationUrl)}</span>
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

export async function renderVerificationEmailReact(
  verificationUrl: string,
  language: Language,
): Promise<string> {
  return await render(<VerificationEmail verificationUrl={verificationUrl} language={language} />);
}

export default VerificationEmail;
