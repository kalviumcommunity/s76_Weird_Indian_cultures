import { NextRequest, NextResponse } from 'next/server';
import UserModel from '@/lib/db/models/UserModel';
import { authenticate } from '@/lib/auth/middleware';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const currentUserId = authUser.id;

    // Check if already following
    const isFollowing = await UserModel.isFollowing(currentUserId, userId);

    if (isFollowing) {
      // Unfollow
      await UserModel.unfollow(currentUserId, userId);
      return NextResponse.json({
        message: 'Unfollowed successfully',
        isFollowing: false,
      });
    } else {
      // Follow
      await UserModel.follow(currentUserId, userId);
      return NextResponse.json({
        message: 'Followed successfully',
        isFollowing: true,
      });
    }
  } catch (error: any) {
    console.error('Follow error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
