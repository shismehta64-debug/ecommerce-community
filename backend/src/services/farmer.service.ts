import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildMeta } from '../utils/pagination';

export async function listProduce(query: any) {
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
      { cropName: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [produce, total] = await Promise.all([
    prisma.farmerProduce.findMany({
      where,
      include: { owner: { select: { id: true, fullName: true, city: true, phone: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: query.order === 'asc' ? 'asc' : 'desc' },
    }),
    prisma.farmerProduce.count({ where }),
  ]);

  return { data: produce, meta: buildMeta(page, limit, total) };
}

export async function createProduce(ownerId: string, data: any) {
  return prisma.farmerProduce.create({
    data: {
      ...data,
      ownerId,
      harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
    },
    include: { owner: { select: { id: true, fullName: true, city: true } } },
  });
}

export async function getProduceById(id: string) {
  const produce = await prisma.farmerProduce.findUnique({
    where: { id },
    include: { owner: { select: { id: true, fullName: true, city: true, phone: true } } },
  });

  if (!produce) {
    throw new AppError('NOT_FOUND', 'Produce not found', 404);
  }

  return produce;
}

export async function updateProduce(id: string, data: any) {
  if (data.harvestDate) {
    data.harvestDate = new Date(data.harvestDate);
  }

  return prisma.farmerProduce.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, fullName: true, city: true } } },
  });
}

export async function deleteProduce(id: string) {
  await prisma.farmerProduce.delete({ where: { id } });
}
