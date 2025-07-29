import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@kolabolab.com';
    this.fromName = this.configService.get<string>('FROM_NAME') || 'KolaboLab Team';

    if (apiKey && apiKey !== 're_your_secure_api_key_here') {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized successfully');
    } else {
      this.logger.warn('Resend API key not configured. Email service running in mock mode.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, subject, html, text, from } = options;
    
    const emailFrom = from || `${this.fromName} <${this.fromEmail}>`;

    // Mock mode for development/testing
    if (!this.resend) {
      this.logger.log(`[MOCK EMAIL] To: ${Array.isArray(to) ? to.join(', ') : to}`);
      this.logger.log(`[MOCK EMAIL] Subject: ${subject}`);
      this.logger.log(`[MOCK EMAIL] From: ${emailFrom}`);
      if (text) this.logger.log(`[MOCK EMAIL] Text: ${text}`);
      return { success: true, messageId: 'mock-' + Date.now() };
    }

    try {
      const result = await this.resend.emails.send({
        from: emailFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || text,
        text: text || undefined,
      });

      if (result.error) {
        this.logger.error('Failed to send email:', result.error);
        return { success: false, error: result.error.message };
      }

      this.logger.log(`Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}`);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      this.logger.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, resetUrl?: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://kolabolab.com';
    const resetLink = resetUrl || `${baseUrl}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password for your KolaboLab account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>KolaboLab Team</p>
      </div>
    `;

    const text = `
      Password Reset Request
      
      You requested to reset your password for your KolaboLab account.
      
      Reset your password by visiting: ${resetLink}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't request this reset, please ignore this email.
      
      Best regards,
      KolaboLab Team
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your KolaboLab Password',
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Welcome to KolaboLab! 🚀</h2>
        <p>Hello ${name},</p>
        <p>Welcome to KolaboLab - the revolutionary platform connecting entrepreneurs, collaborators, and investors!</p>
        <p>You're now part of a global community building the future of technology with social impact.</p>
        <h3>What's Next?</h3>
        <ul>
          <li>✨ Complete your profile to get better matches</li>
          <li>🔍 Explore innovative startups looking for collaborators</li>
          <li>🤝 Connect with like-minded entrepreneurs and investors</li>
          <li>🌍 Join our global community of innovators</li>
        </ul>
        <a href="${this.configService.get<string>('FRONTEND_URL') || 'https://kolabolab.com'}/dashboard" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Get Started</a>
        <p>Need help? We're here to support your journey.</p>
        <p>Best regards,<br>KolaboLab Team</p>
      </div>
    `;

    const text = `
      Welcome to KolaboLab! 🚀
      
      Hello ${name},
      
      Welcome to KolaboLab - the revolutionary platform connecting entrepreneurs, collaborators, and investors!
      
      You're now part of a global community building the future of technology with social impact.
      
      What's Next?
      - Complete your profile to get better matches
      - Explore innovative startups looking for collaborators  
      - Connect with like-minded entrepreneurs and investors
      - Join our global community of innovators
      
      Get started: ${this.configService.get<string>('FRONTEND_URL') || 'https://kolabolab.com'}/dashboard
      
      Need help? We're here to support your journey.
      
      Best regards,
      KolaboLab Team
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Welcome to KolaboLab! 🚀',
      html,
      text,
    });
  }

  async sendVerificationEmail(email: string, verificationToken: string, verificationUrl?: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://kolabolab.com';
    const verifyLink = verificationUrl || `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for signing up for KolaboLab! To complete your registration, please verify your email address.</p>
        <a href="${verifyLink}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <p>Best regards,<br>KolaboLab Team</p>
      </div>
    `;

    const text = `
      Verify Your Email Address
      
      Thank you for signing up for KolaboLab! To complete your registration, please verify your email address.
      
      Verify your email by visiting: ${verifyLink}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with us, please ignore this email.
      
      Best regards,
      KolaboLab Team
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Verify Your KolaboLab Account',
      html,
      text,
    });
  }

  // Utility method for sending custom emails
  async sendCustomEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.sendEmail({ to, subject, html, text });
  }

  async sendVerificationEmail(email: string, firstName: string, verificationToken: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://kolabolab.com';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    const html = `
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
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Verify your KolaboLab account',
      html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://kolabolab.com';
    
    const html = `
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
              <a href="${baseUrl}/dashboard" class="button">Go to Dashboard</a>
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

    return await this.sendEmail({
      to: email,
      subject: 'Welcome to KolaboLab! 🎉',
      html,
    });
  }

  // Health check method
  isConfigured(): boolean {
    return this.resend !== null;
  }
}