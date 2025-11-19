import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  response.cookies.delete('token');

  return response;
}
