import client from './client';
import { CartItem, Order, SuccessResponse, CartItemType } from '../types';

export interface CartInput {
  itemType: CartItemType;
  itemId: string;
  quantity: number;
}

export async function getCart(): Promise<CartItem[]> {
  const res = await client.get<SuccessResponse<CartItem[]>>('/api/cart');
  return res.data.data;
}

export async function addToCart(data: CartInput): Promise<CartItem> {
  const res = await client.post<SuccessResponse<CartItem>>('/api/cart', data);
  return res.data.data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
  const res = await client.put<SuccessResponse<CartItem>>(`/api/cart/${itemId}`, { quantity });
  return res.data.data;
}

export async function removeCartItem(itemId: string): Promise<void> {
  await client.delete(`/api/cart/${itemId}`);
}

export async function checkout(shippingAddress: string): Promise<Order> {
  const res = await client.post<SuccessResponse<Order>>('/api/orders', { shippingAddress });
  return res.data.data;
}

export async function listOrders(): Promise<Order[]> {
  const res = await client.get<SuccessResponse<Order[]>>('/api/orders');
  return res.data.data;
}

export async function getOrder(id: string): Promise<Order> {
  const res = await client.get<SuccessResponse<Order>>(`/api/orders/${id}`);
  return res.data.data;
}
