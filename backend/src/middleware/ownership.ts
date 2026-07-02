import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import prisma from '../utils/prisma';

type ResourceFetcher = (req: Request) => Promise<{ ownerId?: string; headOfFamilyUserId?: string } | null>;

/**
 * Creates middleware that checks if the current user owns the resource.
 * The fetcher function retrieves the resource and returns its owner info.
 * Admins bypass the ownership check.
 */
export function checkOwnership(fetcher: ResourceFetcher) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        errorResponse(res, 'UNAUTHORIZED', 'Authentication required', 401);
        return;
      }

      // Admins bypass ownership
      if (req.user.role === 'ADMIN') {
        next();
        return;
      }

      const resource = await fetcher(req);

      if (!resource) {
        errorResponse(res, 'NOT_FOUND', 'Resource not found', 404);
        return;
      }

      const ownerField = resource.ownerId || resource.headOfFamilyUserId;

      if (ownerField !== req.user.userId) {
        errorResponse(res, 'FORBIDDEN', 'You do not have permission to modify this resource', 403);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ─── Pre-built ownership fetchers ────────────────────────

export const businessOwnership = checkOwnership(async (req) => {
  const id = (req.params.businessId || req.params.id) as string;
  return prisma.business.findUnique({ where: { id }, select: { ownerId: true } });
});

export const industryProductOwnership = checkOwnership(async (req) => {
  const product = await prisma.industryProduct.findUnique({
    where: { id: (req.params.productId || req.params.id) as string },
    include: { business: { select: { ownerId: true } } },
  });
  return product ? { ownerId: product.business.ownerId } : null;
});

export const farmerProduceOwnership = checkOwnership(async (req) => {
  return prisma.farmerProduce.findUnique({ where: { id: req.params.id as string }, select: { ownerId: true } });
});

export const womenProductOwnership = checkOwnership(async (req) => {
  return prisma.womenProduct.findUnique({ where: { id: req.params.id as string }, select: { ownerId: true } });
});

export const socialServiceOwnership = checkOwnership(async (req) => {
  return prisma.socialService.findUnique({ where: { id: req.params.id as string }, select: { ownerId: true } });
});

export const familyOwnership = checkOwnership(async (req) => {
  return prisma.family.findUnique({
    where: { id: req.params.id as string },
    select: { headOfFamilyUserId: true },
  });
});

export const familyMemberOwnership = checkOwnership(async (req) => {
  const member = await prisma.familyMember.findUnique({
    where: { id: req.params.memberId as string },
    include: { family: { select: { headOfFamilyUserId: true } } },
  });
  return member ? { headOfFamilyUserId: member.family.headOfFamilyUserId } : null;
});
