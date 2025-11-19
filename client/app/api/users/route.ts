import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    await connectDB();

    const allUsers = await User.find()
      .select('username')
      .sort({ username: 1 });

    return NextResponse.json(
      allUsers.map((user) => ({
        id: user._id.toString(),
        username: user.username,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
