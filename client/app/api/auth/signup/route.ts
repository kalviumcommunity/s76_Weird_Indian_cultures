import { NextRequest, NextResponse } from 'next/server';
import UserModel from '@/lib/db/models/UserModel';
import { buildTokenPayload, generateToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    const normalizedEmail =
      typeof email === 'string' ? email.toLowerCase().trim() : '';

    if (!username || !normalizedEmail || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }

    const newUser = await UserModel.create(username, normalizedEmail, password);

    const token = generateToken({
      id: newUser.id.toString(),
      username: newUser.username,
      email: newUser.email,
    });

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: { id: newUser.id.toString(), username: newUser.username },
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
