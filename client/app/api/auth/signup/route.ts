import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { buildTokenPayload, generateToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

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

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }

    const newUser = new User({
      username,
      email: normalizedEmail,
      password,
    });
    await newUser.save();

    const token = generateToken(buildTokenPayload(newUser));

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: { id: newUser._id.toString(), username: newUser.username },
      },
      { status: 201 }
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
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
