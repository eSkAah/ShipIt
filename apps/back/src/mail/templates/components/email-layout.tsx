import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { Language } from '@prisma/client';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview: string;
  language: Language;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ children, preview, language }) => {
  return (
    <Html lang={language}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>ShipIt</Heading>
          </Section>
          <Section style={content}>{children}</Section>
          <Section style={footer}>
            <Text style={footerText}>
              {language === 'fr'
                ? `© ${new Date().getFullYear()} ShipIt. Tous droits réservés.`
                : `© ${new Date().getFullYear()} ShipIt. All rights reserved.`}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main: React.CSSProperties = {
  backgroundColor: '#f4f4f4',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: '40px 0',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const header: React.CSSProperties = {
  backgroundColor: '#18181b',
  padding: '30px',
  textAlign: 'center' as const,
};

const logo: React.CSSProperties = {
  color: '#ffffff',
  margin: 0,
  fontSize: '24px',
  fontWeight: 'bold',
};

const content: React.CSSProperties = {
  padding: '40px 30px',
};

const footer: React.CSSProperties = {
  padding: '30px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

const footerText: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: '#666666',
};

export default EmailLayout;
