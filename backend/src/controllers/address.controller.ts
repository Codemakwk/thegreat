import { Request, Response } from 'express';
import prisma from '../config/db';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

/** GET /api/v1/addresses — Get all addresses for user */
export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: addresses });
});

/** POST /api/v1/addresses — Create new address */
export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const { label, firstName, lastName, street, city, state, zipCode, country, phone, isDefault } = req.body;

  if (isDefault) {
    // Unset current default
    await prisma.address.updateMany({
      where: { userId: req.user!.userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user!.userId,
      label: label || 'Home',
      firstName,
      lastName,
      street,
      city,
      state,
      zipCode,
      country: country || 'US',
      phone,
      isDefault: !!isDefault,
    },
  });

  res.status(201).json({ success: true, data: address });
});

/** PUT /api/v1/addresses/:id — Update existing address */
export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isDefault, ...rest } = req.body;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!existing) {
    throw ApiError.notFound('Address not found');
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: { ...rest, isDefault: isDefault !== undefined ? isDefault : existing.isDefault },
  });

  res.json({ success: true, data: address });
});

/** DELETE /api/v1/addresses/:id — Delete address */
export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.user!.userId },
  });

  if (!existing) {
    throw ApiError.notFound('Address not found');
  }

  // Prevent deleting if it's the default and there are others?
  // For simplicity, just allow delete.

  await prisma.address.delete({ where: { id } });

  res.json({ success: true, message: 'Address deleted successfully' });
});
