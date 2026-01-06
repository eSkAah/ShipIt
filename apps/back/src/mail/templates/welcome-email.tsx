import { Section, Text, Hr } from '@react-email/components';
import * as React from 'react';
import { render } from '@react-email/render';
import { Language } from '@prisma/client';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import { escapeHtml } from './utils';

interface WelcomeEmailProps {
  firstName: string;
  language: Language;
  dashboardUrl?: string;
}

const getContent = (language: Language, safeName: string) => {
  return language === 'fr'
    ? {
        preview: `Bienvenue sur ShipIt, ${safeName} !`,
        greeting: `Bonjour ${safeName},`,
        title: 'Bienvenue sur ShipIt ! 🎉',
        body: 'Votre compte a été vérifié avec succès. Vous êtes maintenant prêt à commencer à utiliser ShipIt pour développer votre activité.',
        features: [
          '✅ Créez et gérez vos organisations',
          '✅ Invitez des membres dans votre équipe',
          '✅ Accédez au tableau de bord complet',
        ],
        button: 'Accéder au tableau de bord',
        footer: "Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.",
      }
    : {
        preview: `Welcome to ShipIt, ${safeName}!`,
        greeting: `Hello ${safeName},`,
        title: 'Welcome to ShipIt! 🎉',
        body: 'Your account has been successfully verified. You are now ready to start using ShipIt to grow your business.',
        features: [
          '✅ Create and manage your organizations',
          '✅ Invite team members',
          '✅ Access the complete dashboard',
        ],
        button: 'Go to Dashboard',
        footer: 'If you have any questions, feel free to contact our support team.',
      };
};

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  firstName,
  language,
  dashboardUrl = 'https://app.shipit.com/dashboard',
}) => {
  const safeName = escapeHtml(firstName);
  const content = getContent(language, safeName);

  return (
    <EmailLayout preview={content.preview} language={language}>
      <Text style={greeting}>{content.greeting}</Text>
      <Text style={title}>{content.title}</Text>
      <Text style={text}>{content.body}</Text>
      <Hr style={divider} />
      <Section style={featuresSection}>
        {content.features.map((feature, index) => (
          <Text key={index} style={featureText}>
            {feature}
          </Text>
        ))}
      </Section>
      <Hr style={divider} />
      <Section style={buttonContainer}>
        <EmailButton href={dashboardUrl}>{content.button}</EmailButton>
      </Section>
      <Text style={footerNote}>{content.footer}</Text>
    </EmailLayout>
  );
};

const greeting: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: '16px',
  color: '#333333',
};

const title: React.CSSProperties = {
  margin: '0 0 20px',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#18181b',
};

const text: React.CSSProperties = {
  margin: '0 0 20px',
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333333',
};

const divider: React.CSSProperties = {
  borderColor: '#eeeeee',
  margin: '20px 0',
};

const featuresSection: React.CSSProperties = {
  padding: '10px 0',
};

const featureText: React.CSSProperties = {
  margin: '8px 0',
  fontSize: '15px',
  color: '#444444',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const footerNote: React.CSSProperties = {
  margin: '20px 0 0',
  fontSize: '14px',
  color: '#999999',
};

export async function renderWelcomeEmailReact(
  firstName: string,
  language: Language,
  dashboardUrl?: string,
): Promise<string> {
  return await render(
    <WelcomeEmail firstName={firstName} language={language} dashboardUrl={dashboardUrl} />,
  );
}

export default WelcomeEmail;
