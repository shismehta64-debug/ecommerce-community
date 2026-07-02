import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildMeta } from '../utils/pagination';

// ─── Families ────────────────────────────────────────────

export async function listFamilies(query: any) {
  const { page, limit, skip } = parsePagination(query);

  const where: any = { isPublic: true };

  if (query.city) {
    where.currentCity = { contains: query.city, mode: 'insensitive' };
  }
  if (query.search) {
    where.OR = [
      { familyName: { contains: query.search, mode: 'insensitive' } },
      { nativePlace: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [families, total] = await Promise.all([
    prisma.family.findMany({
      where,
      include: {
        headOfFamily: { select: { id: true, fullName: true } },
        _count: { select: { members: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: query.order === 'asc' ? 'asc' : 'desc' },
    }),
    prisma.family.count({ where }),
  ]);

  return { data: families, meta: buildMeta(page, limit, total) };
}

export async function createFamily(headOfFamilyUserId: string, data: any) {
  return prisma.family.create({
    data: { ...data, headOfFamilyUserId },
    include: {
      headOfFamily: { select: { id: true, fullName: true } },
      members: true,
    },
  });
}

export async function getFamilyById(id: string) {
  const family = await prisma.family.findUnique({
    where: { id },
    include: {
      headOfFamily: { select: { id: true, fullName: true, phone: true, email: true } },
      members: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!family) {
    throw new AppError('NOT_FOUND', 'Family not found', 404);
  }

  return family;
}

export async function updateFamily(id: string, data: any) {
  return prisma.family.update({
    where: { id },
    data,
    include: {
      headOfFamily: { select: { id: true, fullName: true } },
      members: true,
    },
  });
}

export async function deleteFamily(id: string) {
  await prisma.family.delete({ where: { id } });
}

// ─── Family Members ──────────────────────────────────────

export async function addFamilyMember(familyId: string, data: any) {
  // Verify family exists
  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) {
    throw new AppError('NOT_FOUND', 'Family not found', 404);
  }

  return prisma.familyMember.create({
    data: {
      ...data,
      familyId,
      dob: data.dob ? new Date(data.dob) : null,
    },
  });
}

export async function updateFamilyMember(memberId: string, data: any) {
  if (data.dob) {
    data.dob = new Date(data.dob);
  }

  return prisma.familyMember.update({
    where: { id: memberId },
    data,
  });
}

export async function deleteFamilyMember(memberId: string) {
  await prisma.familyMember.delete({ where: { id: memberId } });
}
