import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    // Mock email service for development
    console.log(`Mock Email - To: ${to}, Subject: ${subject}`);
    console.log(`Content: ${content}`);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    await this.sendEmail(
      email,
      'Password Reset Request',
      `Use this token to reset your password: ${resetToken}`
    );
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail(
      email,
      'Welcome to KolaboLab!',
      `Welcome ${name}! Thank you for joining our platform.`
    );
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    await this.sendEmail(
      email,
      'Verify Your Email - KolaboLab',
      `Please verify your email by using this token: ${verificationToken}`
    );
  }
}