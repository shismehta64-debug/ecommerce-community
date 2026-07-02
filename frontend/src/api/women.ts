import client from './client';
import { WomenProduct, SuccessResponse, PaginatedResponse, WomenProductCategory } from '../types';

export interface WomenProductInput {
  name: string;
  description: string;
  category: WomenProductCategory;
  price: number;
  stockQuantity: number;
  images?: string[];
}

export async function listProducts(params: Record<string, any>): Promise<PaginatedResponse<WomenProduct>> {
  const res = await client.get<PaginatedResponse<WomenProduct>>('/api/women/products', { params });
  return res.data;
}

export async function createProduct(data: WomenProductInput): Promise<WomenProduct> {
  const res = await client.post<SuccessResponse<WomenProduct>>('/api/women/products', data);
  return res.data.data;
}

export async function getProduct(id: string): Promise<WomenProduct> {
  const res = await client.get<SuccessResponse<WomenProduct>>(`/api/women/products/${id}`);
  return res.data.data;
}

export async function updateProduct(id: string, data: Partial<WomenProductInput>): Promise<WomenProduct> {
  const res = await client.put<SuccessResponse<WomenProduct>>(`/api/women/products/${id}`, data);
  return res.data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await client.delete(`/api/women/products/${id}`);
}
