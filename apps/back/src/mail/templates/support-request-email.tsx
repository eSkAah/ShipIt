import { Section, Text, Hr } from '@react-email/components';
import * as React from 'react';
import { render } from '@react-email/render';
import { Language } from '@prisma/client';
import { EmailLayout } from './components/email-layout';
import { escapeHtml } from './utils';

interface SupportRequestEmailProps {
  userName: string;
  userEmail: string;
  organizationName: string;
  subject: string;
  message: string;
  language: Language;
}

export const SupportRequestEmail: React.FC<SupportRequestEmailProps> = ({
  userName,
  userEmail,
  organizationName,
  subject,
  message,
  language,
}) => {
  const safeUserName = escapeHtml(userName);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);
  const safeOrgName = escapeHtml(organizationName);

  const content =
    language === 'fr'
      ? {
          preview: `Nouvelle demande de support: ${safeSubject}`,
          title: 'Nouvelle demande de support',
          fromLabel: 'De',
          emailLabel: 'Email',
          organizationLabel: 'Organisation',
          subjectLabel: 'Sujet',
          messageLabel: 'Message',
        }
      : {
          preview: `New support request: ${safeSubject}`,
          title: 'New Support Request',
          fromLabel: 'From',
          emailLabel: 'Email',
          organizationLabel: 'Organization',
          subjectLabel: 'Subject',
          messageLabel: 'Message',
        };

  return (
    <EmailLayout preview={content.preview} language={language}>
      <Text style={title}>{content.title}</Text>
      <Hr style={divider} />

      <Section style={infoSection}>
        <Text style={labelText}>
          <strong>{content.fromLabel}:</strong> {safeUserName}
        </Text>
        <Text style={labelText}>
          <strong>{content.emailLabel}:</strong> {userEmail}
        </Text>
        <Text style={labelText}>
          <strong>{content.organizationLabel}:</strong> {safeOrgName}
        </Text>
      </Section>

      <Hr style={divider} />

      <Section style={messageSection}>
        <Text style={subjectText}>
          <strong>{content.subjectLabel}:</strong> {safeSubject}
        </Text>
        <Text style={labelText}>
          <strong>{content.messageLabel}:</strong>
        </Text>
        <Text style={messageText}>{safeMessage}</Text>
      </Section>
    </EmailLayout>
  );
};

const title: React.CSSProperties = {
  margin: '0 0 20px',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#18181b',
};

const divider: React.CSSProperties = {
  borderColor: '#eeeeee',
  margin: '20px 0',
};

const infoSection: React.CSSProperties = {
  padding: '10px 0',
};

const labelText: React.CSSProperties = {
  margin: '8px 0',
  fontSize: '15px',
  color: '#333333',
  lineHeight: '1.5',
};

const subjectText: React.CSSProperties = {
  margin: '8px 0 16px',
  fontSize: '16px',
  color: '#18181b',
  lineHeight: '1.5',
};

const messageSection: React.CSSProperties = {
  padding: '10px 0',
};

const messageText: React.CSSProperties = {
  margin: '8px 0',
  fontSize: '15px',
  color: '#444444',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap',
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
};

export async function renderSupportRequestEmailReact(
  userName: string,
  userEmail: string,
  organizationName: string,
  subject: string,
  message: string,
  language: Language,
): Promise<string> {
  return await render(
    <SupportRequestEmail
      userName={userName}
      userEmail={userEmail}
      organizationName={organizationName}
      subject={subject}
      message={message}
      language={language}
    />,
  );
}

export default SupportRequestEmail;
