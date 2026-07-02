import client from './client';
import { SocialService, SuccessResponse, PaginatedResponse, ProviderType, SocialServiceCategory } from '../types';

export interface ServiceInput {
  providerType: ProviderType;
  serviceName: string;
  category: SocialServiceCategory;
  description: string;
  schedule: string;
  city: string;
  address: string;
  contactPhone: string;
}

export async function listServices(params: Record<string, any>): Promise<PaginatedResponse<SocialService>> {
  const res = await client.get<PaginatedResponse<SocialService>>('/api/social-work/services', { params });
  return res.data;
}

export async function createService(data: ServiceInput): Promise<SocialService> {
  const res = await client.post<SuccessResponse<SocialService>>('/api/social-work/services', data);
  return res.data.data;
}

export async function getService(id: string): Promise<SocialService> {
  const res = await client.get<SuccessResponse<SocialService>>(`/api/social-work/services/${id}`);
  return res.data.data;
}

export async function updateService(id: string, data: Partial<ServiceInput>): Promise<SocialService> {
  const res = await client.put<SuccessResponse<SocialService>>(`/api/social-work/services/${id}`, data);
  return res.data.data;
}

export async function deleteService(id: string): Promise<void> {
  await client.delete(`/api/social-work/services/${id}`);
}
