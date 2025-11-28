import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { authenticate } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    let currentUserId: string | undefined;
    try {
      const user = authenticate(req);
      currentUserId = user?.id;
    } catch {
      // User not authenticated
    }

    const allUsers = await User.find()
      .select('username')
      .sort({ username: 1 });

    let currentUser = null;
    if (currentUserId) {
      currentUser = await User.findById(currentUserId).select('following');
    }

    return NextResponse.json(
      allUsers.map((user) => {
        const isFollowing = currentUser
          ? currentUser.following.some((id: any) => id.toString() === user._id.toString())
          : false;
        
        return {
          id: user._id.toString(),
          username: user.username,
          isFollowing,
        };
      })
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
