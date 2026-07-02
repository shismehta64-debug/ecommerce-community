import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getPendingVerifications() {
  const [businesses, users] = await Promise.all([
    prisma.business.findMany({
      where: { isVerified: false },
      include: { owner: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { isVerified: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { businesses, users };
}

export async function verify(type: string, id: string) {
  if (type === 'business') {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) throw new AppError('NOT_FOUND', 'Business not found', 404);

    return prisma.business.update({
      where: { id },
      data: { isVerified: true },
    });
  } else if (type === 'user') {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });

    const { passwordHash, ...rest } = updated;
    return rest;
  } else {
    throw new AppError('INVALID_TYPE', 'Type must be "business" or "user"', 400);
  }
}
