import { clearSession } from '@/lib/auth';

export async function POST() {
  try {
    return await clearSession();
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
