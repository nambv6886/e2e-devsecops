import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements OnModuleInit {
  private testAccount: any;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      // Generate test account on module initialization
      this.testAccount = await nodemailer.createTestAccount();
      this.isInitialized = true;
      Logger.log(
        `[EmailService] Test account created: ${this.testAccount.user}`,
      );
      Logger.log(
        `[EmailService] View emails at: https://ethereal.email/messages`,
      );
    } catch (error) {
      Logger.error('[EmailService] Failed to create test account:', error);
    }
  }

  private getMailTransporter() {
    if (!this.isInitialized || !this.testAccount) {
      throw new Error('Email service not initialized. Please wait...');
    }

    return nodemailer.createTransport({
      host: this.testAccount.smtp.host,
      port: this.testAccount.smtp.port,
      secure: this.testAccount.smtp.secure,
      auth: {
        user: this.testAccount.user,
        pass: this.testAccount.pass,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
  }

  public sendMailResetPassword(mailReceiver: string, url: string) {
    const mailOptions = {
      from: `"Password Reset" <${this.testAccount.user}>`,
      to: mailReceiver,
      subject: this.configService.get('EMAIL_RESET_PASSWORD_SUBJECT'),
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 32px;">
            <h2 style="color: #2d3748; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #4a5568;">Hello,</p>
            <p style="color: #4a5568;">
              We received a request to reset your password. Click the button below to reset it:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${url}" style="background: #3182ce; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #718096; font-size: 14px;">
              If you did not request a password reset, please ignore this email.
            </p>
            <p style="color: #4a5568; margin-top: 32px;">Thank you,<br/>The Support Team</p>
          </div>
        </div>
      `,
    };

    this.getMailTransporter().sendMail(mailOptions, (error, info) => {
      if (error) {
        Logger.error(
          '[EmailService] Error sending email:',
          JSON.stringify(error),
        );
      } else {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        Logger.log(`[EmailService] ✅ Email sent successfully!`);
        Logger.log(`[EmailService] 📧 Preview URL: ${previewUrl}`);
      }
    });
  }

  public sendMail(mailReceiver: string, mailSubject: string, content: string) {
    const mailOptions = {
      from: `"System" <${this.testAccount.user}>`,
      to: mailReceiver,
      subject: mailSubject,
      html: content,
    };

    this.getMailTransporter().sendMail(mailOptions, (error, info) => {
      if (error) {
        Logger.error(
          '[EmailService] Error sending email:',
          JSON.stringify(error),
        );
      } else {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        Logger.log(`[EmailService] ✅ Email sent successfully!`);
        Logger.log(`[EmailService] 📧 Preview URL: ${previewUrl}`);
      }
    });
  }
}
