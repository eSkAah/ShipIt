import { Section, Text, Hr } from '@react-email/components';
import * as React from 'react';
import { render } from '@react-email/render';
import { EmailLayout } from './components/email-layout';
import { escapeHtml } from './utils';

interface FeedbackEmailProps {
  userEmail: string;
  userName: string;
  feedbackType: string;
  subject: string;
  message: string;
  organizationId?: string;
}

export const FeedbackEmail: React.FC<FeedbackEmailProps> = ({
  userEmail,
  userName,
  feedbackType,
  subject,
  message,
  organizationId,
}) => {
  const safeName = escapeHtml(userName);
  const safeEmail = escapeHtml(userEmail);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);
  const typeLabel = feedbackType === 'bug' ? '🐛 Bug Report' : '❓ Help Request';

  return (
    <EmailLayout preview={`New ${feedbackType}: ${subject}`} language="en">
      <Text style={title}>{typeLabel}</Text>
      <Hr style={divider} />
      <Section style={infoSection}>
        <Text style={labelText}>From:</Text>
        <Text style={valueText}>
          {safeName} ({safeEmail})
        </Text>
        {organizationId && (
          <>
            <Text style={labelText}>Organization ID:</Text>
            <Text style={valueText}>{organizationId}</Text>
          </>
        )}
        <Text style={labelText}>Subject:</Text>
        <Text style={valueText}>{safeSubject}</Text>
      </Section>
      <Hr style={divider} />
      <Section style={messageSection}>
        <Text style={labelText}>Message:</Text>
        <Text style={messageText}>{safeMessage}</Text>
      </Section>
      <Hr style={divider} />
      <Text style={footerNote}>
        This feedback was submitted through the ShipIt platform. Reply directly to {safeEmail} to
        respond.
      </Text>
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
  margin: '8px 0 4px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#666666',
  textTransform: 'uppercase' as const,
};

const valueText: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: '15px',
  color: '#333333',
};

const messageSection: React.CSSProperties = {
  padding: '10px 0',
};

const messageText: React.CSSProperties = {
  margin: '8px 0',
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#333333',
  whiteSpace: 'pre-wrap' as const,
  backgroundColor: '#f9f9f9',
  padding: '16px',
  borderRadius: '8px',
};

const footerNote: React.CSSProperties = {
  margin: '20px 0 0',
  fontSize: '14px',
  color: '#999999',
};

export async function renderFeedbackEmailReact(
  userEmail: string,
  userName: string,
  feedbackType: string,
  subject: string,
  message: string,
  organizationId?: string,
): Promise<string> {
  return await render(
    <FeedbackEmail
      userEmail={userEmail}
      userName={userName}
      feedbackType={feedbackType}
      subject={subject}
      message={message}
      organizationId={organizationId}
    />,
  );
}

export default FeedbackEmail;
