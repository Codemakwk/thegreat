import env from '../config/env';

/** Email verification template */
export function verificationEmail(name: string, token: string): string {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #6366F1; font-size: 28px; margin: 0;">TheGreat Store</h1>
      </div>
      <h2 style="color: #F8FAFC; font-size: 22px;">Verify Your Email</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.6;">Thanks for signing up! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="background: #6366F1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #94A3B8;">If you didn't create an account, you can safely ignore this email.</p>
      <hr style="border: 1px solid #1E293B; margin: 32px 0;" />
      <p style="font-size: 12px; color: #64748B; text-align: center;">© ${new Date().getFullYear()} TheGreat Store. All rights reserved.</p>
    </div>
  `;
}

/** Password reset template */
export function resetPasswordEmail(name: string, token: string): string {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #6366F1; font-size: 28px; margin: 0;">TheGreat Store</h1>
      </div>
      <h2 style="color: #F8FAFC; font-size: 22px;">Reset Your Password</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background: #6366F1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #94A3B8;">This link expires in 1 hour. If you didn't request a password reset, please ignore this email.</p>
      <hr style="border: 1px solid #1E293B; margin: 32px 0;" />
      <p style="font-size: 12px; color: #64748B; text-align: center;">© ${new Date().getFullYear()} TheGreat Store. All rights reserved.</p>
    </div>
  `;
}

/** Order confirmation template */
export function orderConfirmationEmail(
  name: string,
  orderId: string,
  total: number,
  items: { name: string; quantity: number; price: number }[]
): string {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #1E293B; color: #E2E8F0;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #1E293B; color: #94A3B8; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #1E293B; color: #E2E8F0; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #6366F1; font-size: 28px; margin: 0;">TheGreat Store</h1>
      </div>
      <h2 style="color: #F8FAFC; font-size: 22px;">Order Confirmed! 🎉</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.6;">Your order <strong style="color: #6366F1;">#${orderId.slice(0, 8).toUpperCase()}</strong> has been confirmed.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #334155;">
            <th style="padding: 12px; text-align: left; color: #94A3B8; font-weight: 600;">Item</th>
            <th style="padding: 12px; text-align: center; color: #94A3B8; font-weight: 600;">Qty</th>
            <th style="padding: 12px; text-align: right; color: #94A3B8; font-weight: 600;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 16px 12px; font-weight: 700; color: #F8FAFC; font-size: 18px;">Total</td>
            <td style="padding: 16px 12px; font-weight: 700; color: #10B981; font-size: 18px; text-align: right;">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${env.FRONTEND_URL}/orders/${orderId}" style="background: #6366F1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">View Order</a>
      </div>
      <hr style="border: 1px solid #1E293B; margin: 32px 0;" />
      <p style="font-size: 12px; color: #64748B; text-align: center;">© ${new Date().getFullYear()} TheGreat Store. All rights reserved.</p>
    </div>
  `;
}
