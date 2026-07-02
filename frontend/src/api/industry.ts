import client from './client';
import { Business, IndustryProduct, SuccessResponse, PaginatedResponse, IndustrySegment } from '../types';

export interface BusinessInput {
  businessName: string;
  segment: IndustrySegment;
  description: string;
  city: string;
  state: string;
  address: string;
  contactPhone: string;
  whatsappNumber?: string;
  contactEmail?: string;
  logoUrl?: string;
  gstNumber?: string;
}

export interface ProductInput {
  name: string;
  description: string;
  category: string;
  priceRange: string;
  unit: string;
  images?: string[];
  moq?: string;
}

export async function getSegments(): Promise<string[]> {
  const res = await client.get<SuccessResponse<string[]>>('/api/industry/segments');
  return res.data.data;
}

export async function listBusinesses(params: Record<string, any>): Promise<PaginatedResponse<Business>> {
  const res = await client.get<PaginatedResponse<Business>>('/api/industry/businesses', { params });
  return res.data;
}

export async function createBusiness(data: BusinessInput): Promise<Business> {
  const res = await client.post<SuccessResponse<Business>>('/api/industry/businesses', data);
  return res.data.data;
}

export async function getBusiness(businessId: string): Promise<Business> {
  const res = await client.get<SuccessResponse<Business>>(`/api/industry/businesses/${businessId}`);
  return res.data.data;
}

export async function updateBusiness(businessId: string, data: Partial<BusinessInput>): Promise<Business> {
  const res = await client.put<SuccessResponse<Business>>(`/api/industry/businesses/${businessId}`, data);
  return res.data.data;
}

export async function deleteBusiness(businessId: string): Promise<void> {
  await client.delete(`/api/industry/businesses/${businessId}`);
}

export async function listProducts(businessId: string): Promise<IndustryProduct[]> {
  const res = await client.get<SuccessResponse<IndustryProduct[]>>(`/api/industry/businesses/${businessId}/products`);
  return res.data.data;
}

export async function createProduct(businessId: string, data: ProductInput): Promise<IndustryProduct> {
  const res = await client.post<SuccessResponse<IndustryProduct>>(`/api/industry/businesses/${businessId}/products`, data);
  return res.data.data;
}

export async function getProduct(productId: string): Promise<IndustryProduct> {
  const res = await client.get<SuccessResponse<IndustryProduct>>(`/api/industry/products/${productId}`);
  return res.data.data;
}

export async function updateProduct(productId: string, data: Partial<ProductInput>): Promise<IndustryProduct> {
  const res = await client.put<SuccessResponse<IndustryProduct>>(`/api/industry/products/${productId}`, data);
  return res.data.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await client.delete(`/api/industry/products/${productId}`);
}
