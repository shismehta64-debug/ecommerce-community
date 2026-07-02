import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

const BCRYPT_ROUNDS = 12;

// Omit passwordHash from user responses
function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function registerUser(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  state: string;
}) {
  // Check if email or phone already exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { phone: data.phone }],
    },
  });

  if (existing) {
    throw new AppError('DUPLICATE_USER', 'A user with this email or phone already exists', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      city: data.city,
      state: data.state,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });

  return { token, user: sanitizeUser(user) };
}

export async function loginUser(data: { email?: string; phone?: string; password: string }) {
  const user = await prisma.user.findFirst({
    where: data.email ? { email: data.email } : { phone: data.phone },
  });

  if (!user || !user.passwordHash) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email/phone or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email/phone or password', 401);
  }

  const token = signToken({ userId: user.id, role: user.role });

  return { token, user: sanitizeUser(user) };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  return sanitizeUser(user);
}

export async function updateProfile(userId: string, data: {
  fullName?: string;
  phone?: string;
  city?: string;
  state?: string;
  profilePhotoUrl?: string | null;
}) {
  // If updating phone, check it's not taken
  if (data.phone) {
    const existing = await prisma.user.findFirst({
      where: { phone: data.phone, NOT: { id: userId } },
    });
    if (existing) {
      throw new AppError('DUPLICATE_PHONE', 'This phone number is already in use', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return sanitizeUser(user);
}

// ─── Google OAuth Authentication ────────────────────────
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client();

export async function authenticateGoogle(credential: string) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new AppError('INVALID_GOOGLE_TOKEN', 'Google ID token verification failed', 400);
  }

  if (!payload || !payload.email) {
    throw new AppError('INVALID_GOOGLE_TOKEN', 'Failed to retrieve email from Google token', 400);
  }

  const { email, sub: googleId, name: fullName, picture: profilePhotoUrl } = payload;

  // Find user by googleId or email to auto-link
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId }, { email }],
    },
  });

  if (!user) {
    // Create new account with default location values
    user = await prisma.user.create({
      data: {
        fullName: fullName || 'Community User',
        email,
        googleId,
        profilePhotoUrl,
        city: 'Surat',
        state: 'Gujarat',
      },
    });
  } else if (!user.googleId) {
    // Link googleId to existing user
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, profilePhotoUrl: user.profilePhotoUrl || profilePhotoUrl },
    });
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: sanitizeUser(user) };
}
