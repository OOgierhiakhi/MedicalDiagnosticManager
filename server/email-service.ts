import nodemailer from 'nodemailer';
import { db } from './db';
import { eq } from 'drizzle-orm';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail = 'info@orientmedicaldiagnosis.com';
  private organizationName = 'Orient Medical Diagnostic Centre';

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || this.fromEmail,
        pass: process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: `${this.organizationName} <${this.fromEmail}>`,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        attachments: emailData.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      // Log email activity
      await this.logEmailActivity({
        to: emailData.to,
        subject: emailData.subject,
        status: 'sent',
        messageId: info.messageId,
      });

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Log failed email
      await this.logEmailActivity({
        to: emailData.to,
        subject: emailData.subject,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });

      return false;
    }
  }

  private async logEmailActivity(data: {
    to: string;
    subject: string;
    status: 'sent' | 'failed';
    messageId?: string;
    error?: string;
  }) {
    try {
      await db.execute(`
        INSERT INTO email_logs (recipient, subject, status, message_id, error_message, sent_at)
        VALUES ('${data.to}', '${data.subject}', '${data.status}', 
                ${data.messageId ? `'${data.messageId}'` : 'NULL'}, 
                ${data.error ? `'${data.error}'` : 'NULL'}, NOW())
      `);
    } catch (error) {
      console.error('Failed to log email activity:', error);
    }
  }

  // Appointment confirmation email
  async sendAppointmentConfirmation(patientData: {
    name: string;
    email: string;
    phone: string;
    appointmentDate: string;
    appointmentTime: string;
    services: string[];
    instructions?: string;
  }): Promise<boolean> {
    const template = this.getAppointmentConfirmationTemplate(patientData);
    
    return await this.sendEmail({
      to: patientData.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Test results ready notification
  async sendTestResultsReady(patientData: {
    name: string;
    email: string;
    testNames: string[];
    collectionDate: string;
  }): Promise<boolean> {
    const template = this.getTestResultsTemplate(patientData);
    
    return await this.sendEmail({
      to: patientData.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Payment receipt email
  async sendPaymentReceipt(patientData: {
    name: string;
    email: string;
    invoiceNumber: string;
    amount: number;
    services: string[];
    paymentDate: string;
    paymentMethod: string;
  }): Promise<boolean> {
    const template = this.getPaymentReceiptTemplate(patientData);
    
    return await this.sendEmail({
      to: patientData.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Critical test results notification (to physician)
  async sendCriticalResultAlert(alertData: {
    physicianEmail: string;
    patientName: string;
    testName: string;
    criticalValue: string;
    normalRange: string;
    urgency: 'HIGH' | 'CRITICAL';
  }): Promise<boolean> {
    const template = this.getCriticalResultTemplate(alertData);
    
    return await this.sendEmail({
      to: alertData.physicianEmail,
      cc: ['lab@orientmedicaldiagnosis.com'],
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Internal staff notifications
  async sendStaffNotification(notificationData: {
    recipient: string;
    subject: string;
    message: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    department?: string;
  }): Promise<boolean> {
    const template = this.getStaffNotificationTemplate(notificationData);
    
    return await this.sendEmail({
      to: notificationData.recipient,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Appointment reminder (24 hours before)
  async sendAppointmentReminder(patientData: {
    name: string;
    email: string;
    appointmentDate: string;
    appointmentTime: string;
    services: string[];
    instructions?: string;
  }): Promise<boolean> {
    const template = this.getAppointmentReminderTemplate(patientData);
    
    return await this.sendEmail({
      to: patientData.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Email templates
  private getAppointmentConfirmationTemplate(data: any): EmailTemplate {
    const subject = `Appointment Confirmed - ${this.organizationName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #007bff; font-size: 24px; font-weight: bold; }
          .content { line-height: 1.6; color: #333; }
          .appointment-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${this.organizationName}</div>
          </div>
          
          <div class="content">
            <h2>Appointment Confirmation</h2>
            <p>Dear ${data.name},</p>
            <p>Your appointment has been successfully scheduled. Please find the details below:</p>
            
            <div class="appointment-details">
              <h3>Appointment Details</h3>
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Services:</strong> ${data.services.join(', ')}</p>
              ${data.instructions ? `<p><strong>Special Instructions:</strong> ${data.instructions}</p>` : ''}
            </div>
            
            <p><strong>Important Reminders:</strong></p>
            <ul>
              <li>Please arrive 15 minutes before your scheduled time</li>
              <li>Bring a valid ID and insurance card (if applicable)</li>
              <li>Follow any preparation instructions provided</li>
              <li>Contact us if you need to reschedule or cancel</li>
            </ul>
            
            <p>If you have any questions, please contact us at:</p>
            <p>Phone: +91-22-12345678<br>Email: ${this.fromEmail}</p>
          </div>
          
          <div class="footer">
            <p>${this.organizationName}<br>
            Medical Complex, Healthcare District, Mumbai - 400001<br>
            www.orientmedicaldiagnosis.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Appointment Confirmation - ${this.organizationName}
      
      Dear ${data.name},
      
      Your appointment has been successfully scheduled:
      
      Date: ${data.appointmentDate}
      Time: ${data.appointmentTime}
      Services: ${data.services.join(', ')}
      ${data.instructions ? `Instructions: ${data.instructions}` : ''}
      
      Please arrive 15 minutes early and bring valid ID.
      
      Contact: +91-22-12345678 | ${this.fromEmail}
      
      ${this.organizationName}
      Medical Complex, Healthcare District, Mumbai - 400001
    `;

    return { subject, html, text };
  }

  private getTestResultsTemplate(data: any): EmailTemplate {
    const subject = `Test Results Ready - ${this.organizationName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #28a745; font-size: 24px; font-weight: bold; }
          .content { line-height: 1.6; color: #333; }
          .test-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${this.organizationName}</div>
          </div>
          
          <div class="content">
            <h2>Test Results Available</h2>
            <p>Dear ${data.name},</p>
            <p>Your test results are now ready for collection. Please find the details below:</p>
            
            <div class="test-details">
              <h3>Test Information</h3>
              <p><strong>Tests Completed:</strong> ${data.testNames.join(', ')}</p>
              <p><strong>Collection Date:</strong> ${data.collectionDate}</p>
              <p><strong>Result Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p><strong>Collection Options:</strong></p>
            <ul>
              <li>Visit our center during business hours (8:00 AM - 8:00 PM)</li>
              <li>Download from our patient portal (if registered)</li>
              <li>Authorized representative can collect with proper ID</li>
            </ul>
            
            <p>Please bring your receipt and valid ID for result collection.</p>
            
            <p>For any queries, contact us at:</p>
            <p>Phone: +91-22-12345678<br>Email: ${this.fromEmail}</p>
          </div>
          
          <div class="footer">
            <p>${this.organizationName}<br>
            Medical Complex, Healthcare District, Mumbai - 400001</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Test Results Ready - ${this.organizationName}
      
      Dear ${data.name},
      
      Your test results are ready for collection:
      
      Tests: ${data.testNames.join(', ')}
      Collection Date: ${data.collectionDate}
      Result Date: ${new Date().toLocaleDateString()}
      
      Visit us during business hours (8:00 AM - 8:00 PM) with receipt and ID.
      
      Contact: +91-22-12345678 | ${this.fromEmail}
      
      ${this.organizationName}
    `;

    return { subject, html, text };
  }

  private getPaymentReceiptTemplate(data: any): EmailTemplate {
    const subject = `Payment Receipt #${data.invoiceNumber} - ${this.organizationName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #17a2b8; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #17a2b8; font-size: 24px; font-weight: bold; }
          .content { line-height: 1.6; color: #333; }
          .payment-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .amount { font-size: 24px; color: #28a745; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${this.organizationName}</div>
          </div>
          
          <div class="content">
            <h2>Payment Receipt</h2>
            <p>Dear ${data.name},</p>
            <p>Thank you for your payment. Your transaction has been processed successfully.</p>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
              <p><strong>Amount Paid:</strong> <span class="amount">₹${data.amount.toFixed(2)}</span></p>
              <p><strong>Payment Date:</strong> ${data.paymentDate}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
              <p><strong>Services:</strong> ${data.services.join(', ')}</p>
            </div>
            
            <p>This receipt serves as proof of payment for your medical services.</p>
            <p>Please retain this receipt for your records and insurance claims.</p>
            
            <p>For any queries regarding this payment, contact us at:</p>
            <p>Phone: +91-22-12345678<br>Email: ${this.fromEmail}</p>
          </div>
          
          <div class="footer">
            <p>${this.organizationName}<br>
            Medical Complex, Healthcare District, Mumbai - 400001<br>
            GST Registration: [TO BE CONFIGURED]</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Payment Receipt #${data.invoiceNumber} - ${this.organizationName}
      
      Dear ${data.name},
      
      Payment processed successfully:
      
      Invoice: ${data.invoiceNumber}
      Amount: ₹${data.amount.toFixed(2)}
      Date: ${data.paymentDate}
      Method: ${data.paymentMethod}
      Services: ${data.services.join(', ')}
      
      Please retain for your records.
      
      Contact: +91-22-12345678 | ${this.fromEmail}
      
      ${this.organizationName}
    `;

    return { subject, html, text };
  }

  private getCriticalResultTemplate(data: any): EmailTemplate {
    const subject = `URGENT: Critical Test Result - ${data.patientName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border-left: 5px solid #dc3545; }
          .header { text-align: center; border-bottom: 2px solid #dc3545; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #dc3545; font-size: 24px; font-weight: bold; }
          .content { line-height: 1.6; color: #333; }
          .critical-details { background: #f8d7da; border: 1px solid #dc3545; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .urgent { color: #dc3545; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${this.organizationName}</div>
          </div>
          
          <div class="content">
            <h2 class="urgent">CRITICAL TEST RESULT ALERT</h2>
            <p>A critical test result requires immediate attention:</p>
            
            <div class="critical-details">
              <h3>Critical Result Details</h3>
              <p><strong>Patient:</strong> ${data.patientName}</p>
              <p><strong>Test:</strong> ${data.testName}</p>
              <p><strong>Critical Value:</strong> ${data.criticalValue}</p>
              <p><strong>Normal Range:</strong> ${data.normalRange}</p>
              <p><strong>Urgency Level:</strong> ${data.urgency}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p><strong>Action Required:</strong></p>
            <ul>
              <li>Immediate physician review required</li>
              <li>Contact patient for urgent follow-up</li>
              <li>Document all actions taken</li>
              <li>Consider immediate clinical intervention</li>
            </ul>
            
            <p class="urgent">This result requires immediate attention within 30 minutes of notification.</p>
            
            <p>Laboratory Contact: +91-22-12345678 Ext. 201</p>
          </div>
          
          <div class="footer">
            <p>${this.organizationName} - Laboratory Services<br>
            Medical Complex, Healthcare District, Mumbai - 400001</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      CRITICAL TEST RESULT ALERT - ${this.organizationName}
      
      URGENT: Critical result requires immediate attention
      
      Patient: ${data.patientName}
      Test: ${data.testName}
      Critical Value: ${data.criticalValue}
      Normal Range: ${data.normalRange}
      Urgency: ${data.urgency}
      Time: ${new Date().toLocaleString()}
      
      IMMEDIATE ACTION REQUIRED:
      - Physician review within 30 minutes
      - Contact patient urgently
      - Document all actions
      
      Lab Contact: +91-22-12345678 Ext. 201
      
      ${this.organizationName}
    `;

    return { subject, html, text };
  }

  private getStaffNotificationTemplate(data: any): EmailTemplate {
    const subject = `[${data.priority}] ${data.subject}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #6c757d; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #6c757d; font-size: 24px; font-weight: bold; }
          .content { line-height: 1.6; color: #333; }
          .priority-high { color: #dc3545; font-weight: bold; }
          .priority-urgent { color: #dc3545; font-weight: bold; background: #f8d7da; padding: 5px 10px; border-radius: 3px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${this.organizationName}</div>
          </div>
          
          <div class="content">
            <h2>Staff Notification</h2>
            <p><strong>Priority:</strong> <span class="priority-${data.priority.toLowerCase()}">${data.priority}</span></p>
            ${data.department ? `<p><strong>Department:</strong> ${data.department}</p>` : ''}
            <p><strong>Subject:</strong> ${data.subject}</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Message</h3>
              <p>${data.message}</p>
            </div>
            
            <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
            
            <p>Please acknowledge receipt and take appropriate action as required.</p>
          </div>
          
          <div class="footer">
            <p>${this.organizationName} - Internal Communication<br>
            Medical Complex, Healthcare District, Mumbai - 400001</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Staff Notification - ${this.organizationName}
      
      Priority: ${data.priority}
      ${data.department ? `Department: ${data.department}` : ''}
      Subject: ${data.subject}
      
      Message:
      ${data.message}
      
      Sent: ${new Date().toLocaleString()}
      
      Please acknowledge receipt and take appropriate action.
      
      ${this.organizationName}
    `;

    return { subject, html, text };
  }

  private getAppointmentReminderTemplate(data: any): EmailTemplate {
    const subject = `Appointment Reminder - Tomorrow at ${data.appointmentTime}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #ffc107; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #ffc107; font-size: 24px; font-weight: bold; }
          .content { line-height: 1.6; color: #333; }
          .reminder-details { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${this.organizationName}</div>
          </div>
          
          <div class="content">
            <h2>Appointment Reminder</h2>
            <p>Dear ${data.name},</p>
            <p>This is a friendly reminder about your appointment scheduled for tomorrow.</p>
            
            <div class="reminder-details">
              <h3>Your Appointment</h3>
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Services:</strong> ${data.services.join(', ')}</p>
              ${data.instructions ? `<p><strong>Preparation:</strong> ${data.instructions}</p>` : ''}
            </div>
            
            <p><strong>Important Reminders:</strong></p>
            <ul>
              <li>Arrive 15 minutes before your appointment time</li>
              <li>Bring valid ID and insurance information</li>
              <li>Follow any special preparation instructions</li>
              <li>Confirm your attendance or reschedule if needed</li>
            </ul>
            
            <p>To confirm, cancel, or reschedule, please contact us:</p>
            <p>Phone: +91-22-12345678<br>Email: ${this.fromEmail}</p>
          </div>
          
          <div class="footer">
            <p>${this.organizationName}<br>
            Medical Complex, Healthcare District, Mumbai - 400001</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Appointment Reminder - ${this.organizationName}
      
      Dear ${data.name},
      
      Reminder: Your appointment is scheduled for tomorrow
      
      Date: ${data.appointmentDate}
      Time: ${data.appointmentTime}
      Services: ${data.services.join(', ')}
      ${data.instructions ? `Preparation: ${data.instructions}` : ''}
      
      Please arrive 15 minutes early with valid ID.
      
      To confirm or reschedule: +91-22-12345678
      
      ${this.organizationName}
    `;

    return { subject, html, text };
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      const testEmail = {
        to: this.fromEmail,
        subject: 'Email Configuration Test - Orient Medical ERP',
        html: `
          <h2>Email System Test</h2>
          <p>This is a test email to verify the email configuration for Orient Medical Diagnostic Centre ERP system.</p>
          <p>If you receive this email, the email system is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
        text: `Email System Test - If you receive this email, the email system is working correctly. Timestamp: ${new Date().toISOString()}`
      };

      return await this.sendEmail(testEmail);
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export { EmailService };