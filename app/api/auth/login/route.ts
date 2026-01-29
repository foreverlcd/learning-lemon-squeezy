import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          tokenBalance: {
            create: { tokens: 0 },
          },
        },
      });
    }

    return await createSession({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
