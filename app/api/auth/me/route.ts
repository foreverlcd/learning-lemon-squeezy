import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSession(req);
    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch full user data with token balance
    const { prisma } = await import('@/lib/prisma');
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { tokenBalance: true },
    });

    if (!fullUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      id: fullUser.id,
      email: fullUser.email,
      tokens: fullUser.tokenBalance?.tokens ?? 0,
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
