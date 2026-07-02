import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Checkout: reads current cart, resolves live prices, validates stock,
 * creates Order + OrderItems in a single transaction, decrements stock, clears cart.
 */
export async function checkout(userId: string, shippingAddress: string) {
  // Get all cart items for user
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
  });

  if (cartItems.length === 0) {
    throw new AppError('EMPTY_CART', 'Your cart is empty', 400);
  }

  // Resolve each item's live price and available quantity
  const resolvedItems: Array<{
    cartItem: typeof cartItems[0];
    name: string;
    price: number;
    availableQuantity: number;
  }> = [];

  for (const item of cartItems) {
    if (item.itemType === 'FARMER_PRODUCE') {
      const produce = await prisma.farmerProduce.findUnique({
        where: { id: item.itemId },
      });

      if (!produce || !produce.isActive) {
        throw new AppError(
          'ITEM_UNAVAILABLE',
          `Item "${produce?.cropName || item.itemId}" is no longer available`,
          400
        );
      }

      if (produce.quantityAvailable < item.quantity) {
        throw new AppError(
          'INSUFFICIENT_STOCK',
          `Insufficient stock for "${produce.cropName}": requested ${item.quantity}, available ${produce.quantityAvailable}`,
          400
        );
      }

      resolvedItems.push({
        cartItem: item,
        name: produce.cropName,
        price: produce.pricePerUnit,
        availableQuantity: produce.quantityAvailable,
      });
    } else {
      const product = await prisma.womenProduct.findUnique({
        where: { id: item.itemId },
      });

      if (!product || !product.isActive) {
        throw new AppError(
          'ITEM_UNAVAILABLE',
          `Item "${product?.name || item.itemId}" is no longer available`,
          400
        );
      }

      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          'INSUFFICIENT_STOCK',
          `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stockQuantity}`,
          400
        );
      }

      resolvedItems.push({
        cartItem: item,
        name: product.name,
        price: product.price,
        availableQuantity: product.stockQuantity,
      });
    }
  }

  // Calculate total
  const totalAmount = resolvedItems.reduce(
    (sum, item) => sum + item.price * item.cartItem.quantity,
    0
  );

  // Execute everything in a single transaction
  const order = await prisma.$transaction(async (tx) => {
    // 1. Create the order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress,
        items: {
          create: resolvedItems.map((item) => ({
            itemType: item.cartItem.itemType,
            itemId: item.cartItem.itemId,
            itemNameSnapshot: item.name,
            quantity: item.cartItem.quantity,
            priceAtPurchase: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // 2. Decrement stock for each item
    for (const item of resolvedItems) {
      if (item.cartItem.itemType === 'FARMER_PRODUCE') {
        await tx.farmerProduce.update({
          where: { id: item.cartItem.itemId },
          data: {
            quantityAvailable: {
              decrement: item.cartItem.quantity,
            },
          },
        });
      } else {
        await tx.womenProduct.update({
          where: { id: item.cartItem.itemId },
          data: {
            stockQuantity: {
              decrement: item.cartItem.quantity,
            },
          },
        });
      }
    }

    // 3. Clear the cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  return order;
}

export async function listOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('NOT_FOUND', 'Order not found', 404);
  }

  return order;
}
