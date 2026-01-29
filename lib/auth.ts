import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export interface SessionUser {
  id: string;
  email: string;
}

export async function getSession(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) return null;

  // Demo simple: token es el user.id (en producción usar JWT seguro)
  const user = await prisma.user.findUnique({
    where: { id: token },
    include: { tokenBalance: true },
  });
  if (!user) return null;

  return { id: user.id, email: user.email };
}

export async function createSession(user: { id: string; email: string }): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth-token', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}

export async function clearSession(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth-token');
  return response;
}
