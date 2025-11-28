import { NextRequest, NextResponse } from 'next/server';
import UserModel from '@/lib/db/models/UserModel';
import { authenticate } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  try {
    let currentUserId: string | undefined;
    try {
      const user = authenticate(req);
      currentUserId = user?.id;
    } catch {
      // User not authenticated
    }

    const allUsers = await UserModel.findAll();

    const usersWithFollowStatus = await Promise.all(
      allUsers.map(async (user) => {
        const isFollowing = currentUserId
          ? await UserModel.isFollowing(currentUserId, user.id)
          : false;
        
        return {
          id: user.id.toString(),
          username: user.username,
          isFollowing,
        };
      })
    );

    return NextResponse.json(usersWithFollowStatus);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
