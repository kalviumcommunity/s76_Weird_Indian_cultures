import { NextRequest, NextResponse } from 'next/server';
import PostModel from '@/lib/db/models/PostModel';
import { authenticate } from '@/lib/auth/middleware';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = authenticate(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = authUser.id;

    // Check if already liked
    const isLiked = await PostModel.hasLiked(userId, id);

    if (isLiked) {
      // Unlike
      await PostModel.unlike(id, userId);
      return NextResponse.json({
        message: 'Post unliked',
        liked: false,
      });
    } else {
      // Like
      await PostModel.like(id, userId);
      return NextResponse.json({
        message: 'Post liked',
        liked: true,
      });
    }
  } catch (error: any) {
    console.error('Like error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
