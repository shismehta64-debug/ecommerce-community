import client from './client';
import { User, SuccessResponse } from '../types';

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  city: string;
  state: string;
}

export interface LoginData {
  email?: string;
  phone?: string;
  password?: string;
  // login accept email OR phone as username
  username?: string; 
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export async function register(data: RegisterData): Promise<AuthResponseData> {
  const res = await client.post<SuccessResponse<AuthResponseData>>('/api/auth/register', data);
  return res.data.data;
}

export async function login(data: LoginData): Promise<AuthResponseData> {
  // If the user entered value in email/phone form, we format it as email or phone
  // In schemas/auth.schema.ts: Accept email OR phone. If it contains @, treat as email, else phone.
  const payload: any = { password: data.password };
  if (data.username?.includes('@')) {
    payload.email = data.username;
  } else {
    payload.phone = data.username;
  }
  const res = await client.post<SuccessResponse<AuthResponseData>>('/api/auth/login', payload);
  return res.data.data;
}

export async function getMe(): Promise<User> {
  const res = await client.get<SuccessResponse<User>>('/api/auth/me');
  return res.data.data;
}

export async function updateMe(data: Partial<RegisterData> & { profilePhotoUrl?: string }): Promise<User> {
  const res = await client.put<SuccessResponse<User>>('/api/auth/me', data);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await client.post('/api/auth/logout');
}

export async function loginWithGoogle(credential: string): Promise<AuthResponseData> {
  const res = await client.post<SuccessResponse<AuthResponseData>>('/api/auth/google', { credential });
  return res.data.data;
}
