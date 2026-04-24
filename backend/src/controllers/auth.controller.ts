import { Request, Response } from 'express';
import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
} from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendEmail } from '../config/email';
import { verificationEmail, resetPasswordEmail } from '../utils/emailTemplates';

/** POST /api/v1/auth/register */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password);
  const verifyToken = generateRandomToken();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      verifyToken,
    },
  });

  // Create empty cart for the user
  await prisma.cart.create({ data: { userId: user.id } });

  // Send verification email
  await sendEmail({
    to: email,
    subject: 'Verify your email — TheGreat Store',
    html: verificationEmail(firstName, verifyToken),
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
  });
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.banned) {
    throw ApiError.forbidden('Your account has been suspended');
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    },
  });
});

/** POST /api/v1/auth/logout */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { refreshToken: null },
    });
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

/** POST /api/v1/auth/refresh */
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const decoded = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
});

/** POST /api/v1/auth/forgot-password */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (user) {
    const resetToken = generateRandomToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendEmail({
      to: email,
      subject: 'Reset your password — TheGreat Store',
      html: resetPasswordEmail(user.firstName, resetToken),
    });
  }

  res.json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.',
  });
});

/** POST /api/v1/auth/reset-password */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gt: new Date() },
    },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const hashedPassword = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
      refreshToken: null, // Invalidate all sessions
    },
  });

  res.json({
    success: true,
    message: 'Password reset successful. You can now log in with your new password.',
  });
});

/** GET /api/v1/auth/verify-email?token=... */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    throw ApiError.badRequest('Verification token is required');
  }

  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user) {
    throw ApiError.badRequest('Invalid verification token');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verifyToken: null,
    },
  });

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
});

/** GET /api/v1/auth/me */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({ success: true, data: user });
});
