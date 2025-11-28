import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { authenticate } from '@/lib/auth/middleware';
import { sanitizeId, validateObjectId } from '@/lib/utils/validation';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await connectDB();
    const { userId } = await params;
    const targetUserId = sanitizeId(userId);

    if (!validateObjectId(targetUserId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const currentUser = authenticate(req);

    if (!currentUser || !validateObjectId(currentUser.id)) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 });
    }

    const [user, targetUser] = await Promise.all([
      User.findById(currentUser.id),
      User.findById(targetUserId)
    ]);

    if (!user || !targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUser.id);
    const isFollowing = user.following.some((id) => id.toString() === targetUserId);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter((id) => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUser.id);
      await Promise.all([user.save(), targetUser.save()]);
      
      return NextResponse.json({ 
        message: 'Unfollowed', 
        isFollowing: false,
        followersCount: targetUser.followers.length
      });
    } else {
      // Follow
      user.following.push(targetObjectId);
      targetUser.followers.push(currentUserObjectId);
      await Promise.all([user.save(), targetUser.save()]);
      
      return NextResponse.json({ 
        message: 'Followed', 
        isFollowing: true,
        followersCount: targetUser.followers.length
      });
    }
  } catch (error: any) {
    console.error('Follow/Unfollow error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
