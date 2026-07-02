import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildMeta } from '../utils/pagination';

export async function listServices(query: any) {
  const { page, limit, skip } = parsePagination(query);

  const where: any = { isActive: true };

  if (query.category) {
    where.category = query.category;
  }
  if (query.city) {
    where.city = { contains: query.city, mode: 'insensitive' };
  }
  if (query.search) {
    where.OR = [
      { serviceName: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [services, total] = await Promise.all([
    prisma.socialService.findMany({
      where,
      include: { owner: { select: { id: true, fullName: true, city: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: query.order === 'asc' ? 'asc' : 'desc' },
    }),
    prisma.socialService.count({ where }),
  ]);

  return { data: services, meta: buildMeta(page, limit, total) };
}

export async function createService(ownerId: string, data: any) {
  return prisma.socialService.create({
    data: { ...data, ownerId },
    include: { owner: { select: { id: true, fullName: true, city: true } } },
  });
}

export async function getServiceById(id: string) {
  const service = await prisma.socialService.findUnique({
    where: { id },
    include: { owner: { select: { id: true, fullName: true, city: true, phone: true } } },
  });

  if (!service) {
    throw new AppError('NOT_FOUND', 'Service not found', 404);
  }

  return service;
}

export async function updateService(id: string, data: any) {
  return prisma.socialService.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, fullName: true, city: true } } },
  });
}

export async function deleteService(id: string) {
  await prisma.socialService.delete({ where: { id } });
}
