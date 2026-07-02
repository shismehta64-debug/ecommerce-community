import client from './client';
import { Enquiry, SuccessResponse, EnquiryListingType } from '../types';

export interface EnquiryInput {
  listingType: EnquiryListingType;
  listingId: string;
  message: string;
  contactPhone: string;
}

export async function createEnquiry(data: EnquiryInput): Promise<Enquiry> {
  const res = await client.post<SuccessResponse<Enquiry>>('/api/enquiries', data);
  return res.data.data;
}

export async function getReceivedEnquiries(): Promise<Enquiry[]> {
  const res = await client.get<SuccessResponse<Enquiry[]>>('/api/enquiries/received');
  return res.data.data;
}

export async function getSentEnquiries(): Promise<Enquiry[]> {
  const res = await client.get<SuccessResponse<Enquiry[]>>('/api/enquiries/sent');
  return res.data.data;
}
