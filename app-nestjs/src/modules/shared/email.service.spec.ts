import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockTestAccount = {
    user: 'test@ethereal.email',
    pass: 'testpassword',
    smtp: {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
    },
  };

  const mockTransporter = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock Logger methods
    jest.spyOn(Logger, 'log').mockImplementation(() => {});
    jest.spyOn(Logger, 'error').mockImplementation(() => {});

    // Mock nodemailer methods
    (nodemailer.createTestAccount as jest.Mock).mockResolvedValue(
      mockTestAccount,
    );
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    (nodemailer.getTestMessageUrl as jest.Mock).mockReturnValue(
      'https://ethereal.email/message/test',
    );

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        EMAIL_RESET_PASSWORD_SUBJECT: 'Reset Your Password',
      };
      return config[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create test account successfully', async () => {
      await service.onModuleInit();

      expect(nodemailer.createTestAccount).toHaveBeenCalled();
      expect(Logger.log).toHaveBeenCalledWith(
        `[EmailService] Test account created: ${mockTestAccount.user}`,
      );
      expect(Logger.log).toHaveBeenCalledWith(
        `[EmailService] View emails at: https://ethereal.email/messages`,
      );
    });

    it('should handle errors when creating test account', async () => {
      const error = new Error('Failed to create account');
      (nodemailer.createTestAccount as jest.Mock).mockRejectedValue(error);

      await service.onModuleInit();

      expect(Logger.error).toHaveBeenCalledWith(
        '[EmailService] Failed to create test account:',
        error,
      );
    });
  });

  describe('sendMailResetPassword', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should send password reset email successfully', () => {
      const mailReceiver = 'user@example.com';
      const url = 'https://example.com/reset?token=abc123';

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-message-id' });
      });

      service.sendMailResetPassword(mailReceiver, url);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.to).toBe(mailReceiver);
      expect(sendMailCall.subject).toBe('Reset Your Password');
      expect(sendMailCall.html).toContain(url);
      expect(sendMailCall.html).toContain('Password Reset Request');
    });

    it('should include reset URL in email content', () => {
      const mailReceiver = 'user@example.com';
      const url = 'https://example.com/reset?token=xyz789';

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-message-id' });
      });

      service.sendMailResetPassword(mailReceiver, url);

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.html).toContain(url);
      expect(sendMailCall.html).toContain('Reset Password');
    });

    it('should handle email sending errors', () => {
      const mailReceiver = 'user@example.com';
      const url = 'https://example.com/reset?token=abc123';
      const error = new Error('SMTP error');

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(error, null);
      });

      service.sendMailResetPassword(mailReceiver, url);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should log success when email is sent', (done) => {
      const mailReceiver = 'user@example.com';
      const url = 'https://example.com/reset?token=abc123';
      const logSpy = jest.spyOn(Logger, 'log');

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-message-id' });
        // Check after callback is executed
        setImmediate(() => {
          expect(logSpy).toHaveBeenCalledWith(
            '[EmailService] ✅ Email sent successfully!',
          );
          done();
        });
      });

      service.sendMailResetPassword(mailReceiver, url);
    });

    it('should handle errors when service is not initialized', () => {
      const uninitializedService = new EmailService(configService);
      const mailReceiver = 'user@example.com';
      const url = 'https://example.com/reset?token=abc123';

      expect(() => {
        uninitializedService.sendMailResetPassword(mailReceiver, url);
      }).toThrow();
    });
  });

  describe('sendMail', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should send generic email successfully', () => {
      const mailReceiver = 'user@example.com';
      const mailSubject = 'Welcome to Our Service';
      const content = '<h1>Welcome!</h1><p>Thank you for joining us.</p>';

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-message-id' });
      });

      service.sendMail(mailReceiver, mailSubject, content);

      expect(mockTransporter.sendMail).toHaveBeenCalled();

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.to).toBe(mailReceiver);
      expect(sendMailCall.subject).toBe(mailSubject);
      expect(sendMailCall.html).toBe(content);
    });

    it('should use correct sender for generic emails', () => {
      const mailReceiver = 'user@example.com';
      const mailSubject = 'Test Subject';
      const content = '<p>Test content</p>';

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-message-id' });
      });

      service.sendMail(mailReceiver, mailSubject, content);

      const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(sendMailCall.from).toContain('System');
      expect(sendMailCall.from).toContain(mockTestAccount.user);
    });

    it('should handle email sending errors', () => {
      const mailReceiver = 'user@example.com';
      const mailSubject = 'Test Subject';
      const content = '<p>Test content</p>';
      const error = new Error('SMTP error');

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(error, null);
      });

      service.sendMail(mailReceiver, mailSubject, content);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should log preview URL when email is sent', (done) => {
      const mailReceiver = 'user@example.com';
      const mailSubject = 'Test Subject';
      const content = '<p>Test content</p>';
      const getTestMessageUrlSpy = jest.spyOn(nodemailer, 'getTestMessageUrl');

      mockTransporter.sendMail.mockImplementation((options, callback) => {
        callback(null, { messageId: 'test-message-id' });
        // Check after callback is executed
        setImmediate(() => {
          expect(getTestMessageUrlSpy).toHaveBeenCalled();
          done();
        });
      });

      service.sendMail(mailReceiver, mailSubject, content);
    });

    it('should handle errors when service is not initialized', () => {
      const uninitializedService = new EmailService(configService);
      const mailReceiver = 'user@example.com';
      const mailSubject = 'Test';
      const content = '<p>Test</p>';

      expect(() => {
        uninitializedService.sendMail(mailReceiver, mailSubject, content);
      }).toThrow();
    });
  });
});
