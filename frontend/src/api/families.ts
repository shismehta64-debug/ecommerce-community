import client from './client';
import { Family, FamilyMember, SuccessResponse, PaginatedResponse, Relation, Gender, MaritalStatus } from '../types';

export interface FamilyInput {
  familyName: string;
  nativePlace: string;
  currentCity: string;
  currentState: string;
  currentAddress: string;
  contactPhone: string;
  contactEmail?: string;
  isPublic: boolean;
}

export interface MemberInput {
  fullName: string;
  relation: Relation;
  gender: Gender;
  dob: string;
  education?: string;
  profession?: string;
  companyName?: string;
  maritalStatus: MaritalStatus;
  photoUrl?: string;
  bio?: string;
}

export async function listFamilies(params: Record<string, any>): Promise<PaginatedResponse<Family>> {
  const res = await client.get<PaginatedResponse<Family>>('/api/families', { params });
  return res.data;
}

export async function createFamily(data: FamilyInput): Promise<Family> {
  const res = await client.post<SuccessResponse<Family>>('/api/families', data);
  return res.data.data;
}

export async function getFamily(id: string): Promise<Family> {
  const res = await client.get<SuccessResponse<Family>>(`/api/families/${id}`);
  return res.data.data;
}

export async function updateFamily(id: string, data: Partial<FamilyInput>): Promise<Family> {
  const res = await client.put<SuccessResponse<Family>>(`/api/families/${id}`, data);
  return res.data.data;
}

export async function deleteFamily(id: string): Promise<void> {
  await client.delete(`/api/families/${id}`);
}

export async function addMember(familyId: string, data: MemberInput): Promise<FamilyMember> {
  const res = await client.post<SuccessResponse<FamilyMember>>(`/api/families/${familyId}/members`, data);
  return res.data.data;
}

export async function updateMember(memberId: string, data: Partial<MemberInput>): Promise<FamilyMember> {
  const res = await client.put<SuccessResponse<FamilyMember>>(`/api/family-members/${memberId}`, data);
  return res.data.data;
}

export async function deleteMember(memberId: string): Promise<void> {
  await client.delete(`/api/family-members/${memberId}`);
}
