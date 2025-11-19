import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get token from cookie
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) return cookieToken;

  // Try to get token from Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
}

export function authenticate(req: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function requireAuth(req: NextRequest): NextResponse | TokenPayload {
  const user = authenticate(req);
  
  if (!user) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  return user;
}
