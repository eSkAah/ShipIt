import { Section, Text, Hr } from '@react-email/components';
import * as React from 'react';
import { render } from '@react-email/render';
import { Language } from '@prisma/client';
import { EmailLayout } from './components/email-layout';
import { EmailButton } from './components/email-button';
import { escapeHtml, sanitizeUrl } from './utils';

interface InvitationEmailProps {
  invitationUrl: string;
  organizationName: string;
  role: string;
  inviterName?: string;
  language: Language;
}

const getRoleLabel = (role: string, language: Language): string => {
  const roles: Record<string, Record<Language, string>> = {
    admin: { fr: 'Administrateur', en: 'Administrator' },
    member: { fr: 'Membre', en: 'Member' },
    viewer: { fr: 'Lecteur', en: 'Viewer' },
  };
  return roles[role.toLowerCase()]?.[language] || role;
};

const getContent = (
  language: Language,
  safeOrgName: string,
  roleLabel: string,
  inviterName?: string,
) => {
  const inviterText = inviterName ? ` ${inviterName}` : '';

  return language === 'fr'
    ? {
        preview: `Vous êtes invité à rejoindre ${safeOrgName} sur ShipIt`,
        greeting: 'Bonjour,',
        title: 'Vous avez reçu une invitation ! 📬',
        body: inviterName
          ? `${inviterText} vous invite à rejoindre l'organisation "${safeOrgName}" sur ShipIt.`
          : `Vous avez été invité à rejoindre l'organisation "${safeOrgName}" sur ShipIt.`,
        roleInfo: `Vous rejoindrez en tant que : **${roleLabel}**`,
        button: "Accepter l'invitation",
        expiry: 'Cette invitation expirera dans 7 jours.',
        footer:
          'Si vous ne souhaitez pas rejoindre cette organisation, vous pouvez simplement ignorer cet email.',
        alt: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur',
      }
    : {
        preview: `You're invited to join ${safeOrgName} on ShipIt`,
        greeting: 'Hello,',
        title: "You've received an invitation! 📬",
        body: inviterName
          ? `${inviterText} has invited you to join the "${safeOrgName}" organization on ShipIt.`
          : `You have been invited to join the "${safeOrgName}" organization on ShipIt.`,
        roleInfo: `You will join as: **${roleLabel}**`,
        button: 'Accept invitation',
        expiry: 'This invitation will expire in 7 days.',
        footer: "If you don't want to join this organization, you can simply ignore this email.",
        alt: "If the button doesn't work, copy and paste this link into your browser",
      };
};

export const InvitationEmail: React.FC<InvitationEmailProps> = ({
  invitationUrl,
  organizationName,
  role,
  inviterName,
  language,
}) => {
  const safeUrl = sanitizeUrl(invitationUrl);
  const safeOrgName = escapeHtml(organizationName);
  const roleLabel = getRoleLabel(role, language);
  const content = getContent(language, safeOrgName, roleLabel, inviterName);

  return (
    <EmailLayout preview={content.preview} language={language}>
      <Text style={greeting}>{content.greeting}</Text>
      <Text style={title}>{content.title}</Text>
      <Text style={text}>{content.body}</Text>
      <Section style={roleSection}>
        <Text style={roleText}>{content.roleInfo}</Text>
      </Section>
      <Hr style={divider} />
      <Section style={buttonContainer}>
        <EmailButton href={safeUrl}>{content.button}</EmailButton>
      </Section>
      <Text style={expiryText}>{content.expiry}</Text>
      <Text style={altText}>
        <span>{content.alt}:</span>
        <br />
        <span style={urlStyle}>{invitationUrl}</span>
      </Text>
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

const roleSection: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '15px',
  margin: '20px 0',
};

const roleText: React.CSSProperties = {
  margin: 0,
  fontSize: '15px',
  color: '#444444',
  textAlign: 'center' as const,
};

const divider: React.CSSProperties = {
  borderColor: '#eeeeee',
  margin: '20px 0',
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

const urlStyle: React.CSSProperties = {
  color: '#18181b',
};

const footerNote: React.CSSProperties = {
  margin: '30px 0 0',
  fontSize: '14px',
  color: '#999999',
  fontStyle: 'italic',
};

export async function renderInvitationEmailReact(
  invitationUrl: string,
  organizationName: string,
  role: string,
  language: Language,
  inviterName?: string,
): Promise<string> {
  return await render(
    <InvitationEmail
      invitationUrl={invitationUrl}
      organizationName={organizationName}
      role={role}
      inviterName={inviterName}
      language={language}
    />,
  );
}

export default InvitationEmail;
