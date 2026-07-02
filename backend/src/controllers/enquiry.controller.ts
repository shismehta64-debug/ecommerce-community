import { Request, Response, NextFunction } from 'express';
import * as enquiryService from '../services/enquiry.service';
import { successResponse } from '../utils/response';

export async function createEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const enquiry = await enquiryService.createEnquiry(req.user!.userId, req.body);
    successResponse(res, enquiry, 'Enquiry sent', 201);
  } catch (error) {
    next(error);
  }
}

export async function getReceivedEnquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const enquiries = await enquiryService.getReceivedEnquiries(req.user!.userId);
    successResponse(res, enquiries);
  } catch (error) {
    next(error);
  }
}

export async function getSentEnquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const enquiries = await enquiryService.getSentEnquiries(req.user!.userId);
    successResponse(res, enquiries);
  } catch (error) {
    next(error);
  }
}
