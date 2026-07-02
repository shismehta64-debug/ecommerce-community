import client from './client';
import { SuccessResponse } from '../types';

export interface PendingVerification {
  id: string;
  type: 'BUSINESS' | 'USER'; // or other types
  name: string;
  details: string;
}

export async function getPendingVerifications(): Promise<any> {
  const res = await client.get<SuccessResponse<any>>('/api/admin/pending-verifications');
  return res.data.data;
}

export async function verify(type: string, id: string): Promise<any> {
  const res = await client.put<SuccessResponse<any>>(`/api/admin/verify/${type}/${id}`);
  return res.data.data;
}
