const nodemailer = require('nodemailer');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.username;
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(subject, htmlContent) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: htmlContent
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset() {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${this.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${this.url}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>This link is valid for 10 minutes only.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr>
        <p style="color: #999; font-size: 12px;">RBS Construction Team</p>
      </div>
    `;
    await this.send('Your password reset token (valid for 10 min)', html);
  }
}

module.exports = Email;