import nodemailer from 'nodemailer';
import env from './env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
});

/** Send an email */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: `"TheGreat Store" <${env.SMTP_USER || 'noreply@thegreat.com'}>`,
      ...options,
    });
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Email send failed:', error);
    // Don't throw in dev — emails may not be configured
    if (env.NODE_ENV === 'production') throw error;
  }
}

export default transporter;
