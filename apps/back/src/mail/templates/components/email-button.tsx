import { Button } from '@react-email/components';
import * as React from 'react';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export const EmailButton: React.FC<EmailButtonProps> = ({ href, children }) => {
  return (
    <Button style={buttonStyle} href={href}>
      {children}
    </Button>
  );
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 30px',
  backgroundColor: '#18181b',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '16px',
  textAlign: 'center' as const,
};

export default EmailButton;
