import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildMeta } from '../utils/pagination';
import { IndustrySegment } from '@prisma/client';

// ─── Segments ────────────────────────────────────────────

export function getSegments() {
  return Object.values(IndustrySegment);
}

// ─── Businesses ──────────────────────────────────────────

export async function listBusinesses(query: any) {
  const { page, limit, skip } = parsePagination(query);

  const where: any = {};

  if (query.segment) {
    where.segment = query.segment;
  }
  if (query.city) {
    where.city = { contains: query.city, mode: 'insensitive' };
  }
  if (query.search) {
    where.OR = [
      { businessName: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: { owner: { select: { id: true, fullName: true, city: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: query.order === 'asc' ? 'asc' : 'desc' },
    }),
    prisma.business.count({ where }),
  ]);

  return { data: businesses, meta: buildMeta(page, limit, total) };
}

export async function createBusiness(ownerId: string, data: any) {
  return prisma.business.create({
    data: { ...data, ownerId },
    include: { owner: { select: { id: true, fullName: true, city: true } } },
  });
}

export async function getBusinessById(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, fullName: true, city: true, phone: true } },
      products: { where: { isActive: true } },
    },
  });

  if (!business) {
    throw new AppError('NOT_FOUND', 'Business not found', 404);
  }

  return business;
}

export async function updateBusiness(id: string, data: any) {
  return prisma.business.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, fullName: true, city: true } } },
  });
}

export async function deleteBusiness(id: string) {
  await prisma.business.delete({ where: { id } });
}

// ─── Products ────────────────────────────────────────────

export async function listProducts(businessId: string) {
  return prisma.industryProduct.findMany({
    where: { businessId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProduct(businessId: string, data: any) {
  // Verify business exists
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) {
    throw new AppError('NOT_FOUND', 'Business not found', 404);
  }

  return prisma.industryProduct.create({
    data: { ...data, businessId },
  });
}

export async function getProductById(id: string) {
  const product = await prisma.industryProduct.findUnique({
    where: { id },
    include: { business: { include: { owner: { select: { id: true, fullName: true } } } } },
  });

  if (!product) {
    throw new AppError('NOT_FOUND', 'Product not found', 404);
  }

  return product;
}

export async function updateProduct(id: string, data: any) {
  return prisma.industryProduct.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string) {
  await prisma.industryProduct.delete({ where: { id } });
}
