import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.FROM_EMAIL || 'noreply@kolabolab.com',
  fromName: process.env.FROM_NAME || 'KolaboLab Team',
  
  // Legacy SMTP configuration (fallback)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'resend',
    password: process.env.SMTP_PASSWORD,
  },
}));