import client from './client';
import { FarmerProduce, SuccessResponse, PaginatedResponse, CropCategory, ProduceUnit } from '../types';

export interface ProduceInput {
  cropName: string;
  category: CropCategory;
  pricePerUnit: number;
  unit: ProduceUnit;
  quantityAvailable: number;
  harvestDate: string;
  village: string;
  city: string;
  images?: string[];
  isOrganic: boolean;
}

export async function listProduce(params: Record<string, any>): Promise<PaginatedResponse<FarmerProduce>> {
  const res = await client.get<PaginatedResponse<FarmerProduce>>('/api/farmer/produce', { params });
  return res.data;
}

export async function createProduce(data: ProduceInput): Promise<FarmerProduce> {
  const res = await client.post<SuccessResponse<FarmerProduce>>('/api/farmer/produce', data);
  return res.data.data;
}

export async function getProduce(id: string): Promise<FarmerProduce> {
  const res = await client.get<SuccessResponse<FarmerProduce>>(`/api/farmer/produce/${id}`);
  return res.data.data;
}

export async function updateProduce(id: string, data: Partial<ProduceInput>): Promise<FarmerProduce> {
  const res = await client.put<SuccessResponse<FarmerProduce>>(`/api/farmer/produce/${id}`, data);
  return res.data.data;
}

export async function deleteProduce(id: string): Promise<void> {
  await client.delete(`/api/farmer/produce/${id}`);
}
