import { NextRequest, NextResponse } from 'next/server';
import UserModel from '@/lib/db/models/UserModel';
import { generateToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const normalizedEmail =
      typeof email === 'string' ? email.toLowerCase().trim() : '';

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const isMatch = await UserModel.matchPassword(user, password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const token = generateToken({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: { id: user.id.toString(), username: user.username },
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
