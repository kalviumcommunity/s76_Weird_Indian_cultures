import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function buildTokenPayload(user: {
  _id: unknown;
  username: string;
  email: string;
}): TokenPayload {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
  };
}
