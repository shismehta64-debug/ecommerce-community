import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { EnquiryListingType } from '@prisma/client';

/**
 * Resolves sellerId server-side based on listing type and ID.
 * Never trusts sellerId from the client.
 */
async function resolveSellerOwnerId(listingType: EnquiryListingType, listingId: string): Promise<string> {
  if (listingType === 'INDUSTRY_PRODUCT') {
    const product = await prisma.industryProduct.findUnique({
      where: { id: listingId },
      include: { business: { select: { ownerId: true } } },
    });
    if (!product) throw new AppError('NOT_FOUND', 'Industry product not found', 404);
    return product.business.ownerId;
  } else {
    const service = await prisma.socialService.findUnique({
      where: { id: listingId },
      select: { ownerId: true },
    });
    if (!service) throw new AppError('NOT_FOUND', 'Social service not found', 404);
    return service.ownerId;
  }
}

export async function createEnquiry(buyerId: string, data: {
  listingType: EnquiryListingType;
  listingId: string;
  message: string;
  contactPhone: string;
}) {
  const sellerId = await resolveSellerOwnerId(data.listingType as EnquiryListingType, data.listingId);

  // Prevent enquiring on own listing
  if (sellerId === buyerId) {
    throw new AppError('SELF_ENQUIRY', 'You cannot enquire on your own listing', 400);
  }

  return prisma.enquiry.create({
    data: {
      listingType: data.listingType,
      listingId: data.listingId,
      buyerId,
      sellerId,
      message: data.message,
      contactPhone: data.contactPhone,
    },
    include: {
      buyer: { select: { id: true, fullName: true, city: true } },
      seller: { select: { id: true, fullName: true, city: true } },
    },
  });
}

export async function getReceivedEnquiries(userId: string) {
  return prisma.enquiry.findMany({
    where: { sellerId: userId },
    include: {
      buyer: { select: { id: true, fullName: true, city: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSentEnquiries(userId: string) {
  return prisma.enquiry.findMany({
    where: { buyerId: userId },
    include: {
      seller: { select: { id: true, fullName: true, city: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
