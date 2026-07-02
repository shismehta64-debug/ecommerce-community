import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { successResponse } from '../utils/response';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerUser(req.body);
    successResponse(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginUser(req.body);
    successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    successResponse(res, user);
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    successResponse(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response) {
  // JWT is stateless — client-side logout (discard token)
  // This endpoint exists for API contract compliance
  successResponse(res, null, 'Logged out successfully');
}

export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { credential } = req.body;
    const result = await authService.authenticateGoogle(credential);
    successResponse(res, result, 'Google login successful');
  } catch (error) {
    next(error);
  }
}
