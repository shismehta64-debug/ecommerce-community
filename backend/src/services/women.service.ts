import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildMeta } from '../utils/pagination';

export async function listProducts(query: any) {
  const { page, limit, skip } = parsePagination(query);

  const where: any = { isActive: true };

  if (query.category) {
    where.category = query.category;
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.womenProduct.findMany({
      where,
      include: { owner: { select: { id: true, fullName: true, city: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: query.order === 'asc' ? 'asc' : 'desc' },
    }),
    prisma.womenProduct.count({ where }),
  ]);

  return { data: products, meta: buildMeta(page, limit, total) };
}

export async function createProduct(ownerId: string, data: any) {
  return prisma.womenProduct.create({
    data: { ...data, ownerId },
    include: { owner: { select: { id: true, fullName: true, city: true } } },
  });
}

export async function getProductById(id: string) {
  const product = await prisma.womenProduct.findUnique({
    where: { id },
    include: { owner: { select: { id: true, fullName: true, city: true, phone: true } } },
  });

  if (!product) {
    throw new AppError('NOT_FOUND', 'Product not found', 404);
  }

  return product;
}

export async function updateProduct(id: string, data: any) {
  return prisma.womenProduct.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, fullName: true, city: true } } },
  });
}

export async function deleteProduct(id: string) {
  await prisma.womenProduct.delete({ where: { id } });
}
