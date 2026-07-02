import client from './client';
import { SuccessResponse } from '../types';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await client.post<SuccessResponse<{ url: string }>>('/api/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data.data.url;
}
