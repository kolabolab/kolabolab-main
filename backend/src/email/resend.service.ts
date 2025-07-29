import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendVerificationEmailParams {
  to: string;
  firstName: string;
  verificationToken: string;
  frontendUrl?: string;
}

export interface SendWelcomeEmailParams {
  to: string;
  firstName: string;
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not found. Email sending will be disabled.');
      return;
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('FROM_EMAIL', 'noreply@kolabolab.com');
    this.fromName = this.configService.get<string>('FROM_NAME', 'KolaboLab Team');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    
    this.logger.log('Resend service initialized successfully');
  }

  async sendVerificationEmail({
    to,
    firstName,
    verificationToken,
    frontendUrl
  }: SendVerificationEmailParams): Promise<boolean> {
    if (!this.resend) {
      this.logger.error('Resend not initialized. Cannot send verification email.');
      return false;
    }

    try {
      const verificationUrl = `${frontendUrl || this.frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(to)}`;
      
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [to],
        subject: 'Verify your KolaboLab account',
        html: this.getVerificationEmailTemplate(firstName, verificationUrl),
      });

      if (error) {
        this.logger.error('Failed to send verification email:', error);
        return false;
      }

      this.logger.log(`Verification email sent successfully to ${to}. Email ID: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendWelcomeEmail({ to, firstName }: SendWelcomeEmailParams): Promise<boolean> {
    if (!this.resend) {
      this.logger.error('Resend not initialized. Cannot send welcome email.');
      return false;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [to],
        subject: 'Welcome to KolaboLab! 🎉',
        html: this.getWelcomeEmailTemplate(firstName),
      });

      if (error) {
        this.logger.error('Failed to send welcome email:', error);
        return false;
      }

      this.logger.log(`Welcome email sent successfully to ${to}. Email ID: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
      return false;
    }
  }

  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your KolaboLab Account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 KolaboLab</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            <p>Welcome to KolaboLab! We're excited to have you join our startup collaboration platform.</p>
            <p>To complete your registration and access your dashboard, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify My Email</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This verification link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with KolaboLab, you can safely ignore this email.</p>
            <p>Best regards,<br>The KolaboLab Team</p>
          </div>
          <div class="footer">
            <p>© 2024 KolaboLab. All rights reserved.</p>
            <p>This email was sent to ${to}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to KolaboLab!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f7fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 20px; }
          .feature { margin: 20px 0; padding: 20px; background-color: #f7fafc; border-radius: 8px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to KolaboLab!</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName}!</h2>
            <p>Your email has been verified and your account is now active! Welcome to the KolaboLab community.</p>
            
            <div class="feature">
              <h3>🚀 What you can do now:</h3>
              <ul>
                <li><strong>Create your startup profile</strong> - Showcase your innovative ideas</li>
                <li><strong>Connect with investors</strong> - Find funding for your projects</li>
                <li><strong>Collaborate with entrepreneurs</strong> - Build amazing teams</li>
                <li><strong>Access exclusive events</strong> - Network with industry leaders</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${this.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
            </div>

            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            <p>Happy collaborating!<br>The KolaboLab Team</p>
          </div>
          <div class="footer">
            <p>© 2024 KolaboLab. All rights reserved.</p>
            <p>Follow us on social media for updates and tips!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}