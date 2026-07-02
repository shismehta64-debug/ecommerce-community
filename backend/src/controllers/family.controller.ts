import { Request, Response, NextFunction } from 'express';
import * as familyService from '../services/family.service';
import { successResponse, paginatedResponse } from '../utils/response';

// ─── Families ────────────────────────────────────────────

export async function listFamilies(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await familyService.listFamilies(req.query);
    paginatedResponse(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function createFamily(req: Request, res: Response, next: NextFunction) {
  try {
    const family = await familyService.createFamily(req.user!.userId, req.body);
    successResponse(res, family, 'Family profile created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getFamily(req: Request, res: Response, next: NextFunction) {
  try {
    const family = await familyService.getFamilyById(req.params.id as string);
    successResponse(res, family);
  } catch (error) {
    next(error);
  }
}

export async function updateFamily(req: Request, res: Response, next: NextFunction) {
  try {
    const family = await familyService.updateFamily(req.params.id as string, req.body);
    successResponse(res, family, 'Family profile updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteFamily(req: Request, res: Response, next: NextFunction) {
  try {
    await familyService.deleteFamily(req.params.id as string);
    successResponse(res, null, 'Family profile deleted');
  } catch (error) {
    next(error);
  }
}

// ─── Family Members ──────────────────────────────────────

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await familyService.addFamilyMember(req.params.id as string, req.body);
    successResponse(res, member, 'Family member added', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await familyService.updateFamilyMember(req.params.memberId as string, req.body);
    successResponse(res, member, 'Family member updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteMember(req: Request, res: Response, next: NextFunction) {
  try {
    await familyService.deleteFamilyMember(req.params.memberId as string);
    successResponse(res, null, 'Family member removed');
  } catch (error) {
    next(error);
  }
}
