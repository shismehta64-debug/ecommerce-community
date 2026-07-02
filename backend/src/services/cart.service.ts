import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { CartItemType } from '@prisma/client';

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
  });

  // Resolve item details for each cart item
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      let itemDetails: any = null;

      if (item.itemType === 'FARMER_PRODUCE') {
        itemDetails = await prisma.farmerProduce.findUnique({
          where: { id: item.itemId },
          select: {
            id: true,
            cropName: true,
            pricePerUnit: true,
            unit: true,
            quantityAvailable: true,
            images: true,
            owner: { select: { id: true, fullName: true } },
          },
        });
      } else {
        itemDetails = await prisma.womenProduct.findUnique({
          where: { id: item.itemId },
          select: {
            id: true,
            name: true,
            price: true,
            stockQuantity: true,
            images: true,
            owner: { select: { id: true, fullName: true } },
          },
        });
      }

      return {
        ...item,
        itemDetails,
        farmerProduce: item.itemType === 'FARMER_PRODUCE' ? itemDetails : undefined,
        womenProduct: item.itemType === 'WOMEN_PRODUCT' ? itemDetails : undefined,
      };
    })
  );

  return enrichedItems;
}

export async function addToCart(userId: string, data: {
  itemType: CartItemType;
  itemId: string;
  quantity: number;
}) {
  // Verify the item exists and has sufficient stock
  if (data.itemType === 'FARMER_PRODUCE') {
    const produce = await prisma.farmerProduce.findUnique({
      where: { id: data.itemId },
    });
    if (!produce) throw new AppError('NOT_FOUND', 'Produce not found', 404);
    if (!produce.isActive) throw new AppError('ITEM_INACTIVE', 'This item is no longer available', 400);
    if (produce.quantityAvailable < data.quantity) {
      throw new AppError('INSUFFICIENT_STOCK', `Only ${produce.quantityAvailable} ${produce.unit} available`, 400);
    }
  } else {
    const product = await prisma.womenProduct.findUnique({
      where: { id: data.itemId },
    });
    if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404);
    if (!product.isActive) throw new AppError('ITEM_INACTIVE', 'This item is no longer available', 400);
    if (product.stockQuantity < data.quantity) {
      throw new AppError('INSUFFICIENT_STOCK', `Only ${product.stockQuantity} units available`, 400);
    }
  }

  // Upsert: if already in cart, update quantity; otherwise create
  const cartItem = await prisma.cartItem.upsert({
    where: {
      userId_itemType_itemId: {
        userId,
        itemType: data.itemType,
        itemId: data.itemId,
      },
    },
    update: { quantity: data.quantity },
    create: {
      userId,
      itemType: data.itemType,
      itemId: data.itemId,
      quantity: data.quantity,
    },
  });

  return cartItem;
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!cartItem) {
    throw new AppError('NOT_FOUND', 'Cart item not found', 404);
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
}

export async function removeCartItem(userId: string, itemId: string) {
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!cartItem) {
    throw new AppError('NOT_FOUND', 'Cart item not found', 404);
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
}
